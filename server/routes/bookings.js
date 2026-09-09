import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper to generate unique booking code e.g. LNX-8492
function generateBookingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LNX-${num}`;
}

// GET /api/bookings/available-slots
// Query: date (YYYY-MM-DD), duration (in minutes, default 60)
router.get('/available-slots', async (req, res) => {
  try {
    const { date, duration } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ngày cần đặt (YYYY-MM-DD)' });
    }

    // Get salon operating hours
    const [settings] = await pool.query('SELECT open_time, close_time FROM salon_settings WHERE id = 1');
    const openTime = settings[0]?.open_time || '08:30';
    const closeTime = settings[0]?.close_time || '20:30';

    // Parse operating hours to minutes
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const reqDuration = parseInt(duration || '60', 10);

    // Get existing bookings for that date that are not cancelled
    const [existingBookings] = await pool.query(
      `SELECT booking_time, total_duration FROM bookings 
       WHERE booking_date = ? AND status != 'cancelled'`,
      [date]
    );

    // Build time slots every 30 minutes
    const slots = [];
    const maxCapacityPerSlot = 3; // Maximum simultaneous clients per slot

    for (let time = startMinutes; time + reqDuration <= endMinutes; time += 30) {
      const h = Math.floor(time / 60).toString().padStart(2, '0');
      const m = (time % 60).toString().padStart(2, '0');
      const slotTimeStr = `${h}:${m}`;

      // Count overlapping bookings
      const slotEnd = time + reqDuration;
      let activeCount = 0;

      for (const b of existingBookings) {
        const [bH, bM] = b.booking_time.split(':').map(Number);
        const bStart = bH * 60 + bM;
        const bEnd = bStart + b.total_duration;

        // Check overlap
        if (Math.max(time, bStart) < Math.min(slotEnd, bEnd)) {
          activeCount++;
        }
      }

      slots.push({
        time: slotTimeStr,
        available: activeCount < maxCapacityPerSlot,
        remainingSeats: Math.max(0, maxCapacityPerSlot - activeCount)
      });
    }

    res.json({ date, openTime, closeTime, slots });
  } catch (err) {
    console.error('Available slots error:', err);
    res.status(500).json({ message: 'Lỗi khi kiểm tra khung giờ trống' });
  }
});

// POST /api/bookings - Create new appointment
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_name, customer_phone, customer_email, booking_date, booking_time, notes, service_ids } = req.body;

    if (!customer_name || !customer_phone || !booking_date || !booking_time || !service_ids || service_ids.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: Tên, SĐT, Ngày, Giờ và ít nhất 1 dịch vụ' });
    }

    // Fetch details of selected services
    const [selectedServices] = await connection.query(
      `SELECT id, name, price, duration_minutes FROM services WHERE id IN (?) AND is_active = 1`,
      [service_ids]
    );

    if (selectedServices.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Dịch vụ đã chọn không hợp lệ hoặc đã ngưng phục vụ' });
    }

    const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

    const bookingCode = generateBookingCode();

    // Insert booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (booking_code, customer_name, customer_phone, customer_email, booking_date, booking_time, total_duration, total_price, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [bookingCode, customer_name, customer_phone, customer_email || null, booking_date, booking_time, totalDuration, totalPrice, notes || '']
    );

    const bookingId = bookingResult.insertId;

    // Insert pivot booking_services
    for (const s of selectedServices) {
      await connection.query(
        `INSERT INTO booking_services (booking_id, service_id, price) VALUES (?, ?, ?)`,
        [bookingId, s.id, s.price]
      );
    }

    await connection.commit();

    // Fetch complete inserted booking for response
    const [newBooking] = await pool.query(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);

    res.status(201).json({
      message: 'Đặt lịch thành công!',
      booking: {
        ...newBooking[0],
        services: selectedServices
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Không thể xử lý yêu cầu đặt lịch' });
  } finally {
    connection.release();
  }
});

// GET /api/bookings/lookup - Lookup bookings by phone number
router.get('/lookup', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại để tra cứu' });
    }

    const cleanPhone = phone.trim();
    const [bookings] = await pool.query(
      `SELECT b.*, 
              (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') 
               FROM booking_services bs 
               JOIN services s ON bs.service_id = s.id 
               WHERE bs.booking_id = b.id) as service_names
       FROM bookings b
       WHERE b.customer_phone LIKE ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [`%${cleanPhone}%`]
    );

    // Get cancel deadline setting
    const [settings] = await pool.query('SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1');
    const cancelDeadlineHours = settings[0]?.cancel_deadline_hours || 4;

    res.json({ bookings, cancelDeadlineHours });
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ message: 'Lỗi khi tra cứu lịch hẹn' });
  }
});

// PATCH /api/bookings/:id/cancel - Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, phone } = req.body;

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    const booking = rows[0];

    // Verify phone match for customer security
    if (phone && booking.customer_phone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
      return res.status(403).json({ message: 'Số điện thoại không trùng khớp với lịch hẹn' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Lịch hẹn này đã bị hủy trước đó' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Không thể hủy lịch hẹn đã hoàn thành' });
    }

    // Check time deadline (e.g. 4 hours before)
    const [settings] = await pool.query('SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1');
    const deadlineHours = settings[0]?.cancel_deadline_hours || 4;

    const bookingDateTime = new Date(`${booking.booking_date.toISOString().split('T')[0]}T${booking.booking_time}:00`);
    const now = new Date();
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If customer cancels and it's less than deadline hours away
    if (!req.user && diffHours < deadlineHours) {
      return res.status(400).json({
        message: `Quý khách chỉ có thể hủy lịch trước ít nhất ${deadlineHours} tiếng so với giờ hẹn. Vui lòng liên hệ hotline salon để được hỗ trợ!`
      });
    }

    await pool.query(
      `UPDATE bookings SET status = 'cancelled', cancel_reason = ? WHERE id = ?`,
      [reason || 'Khách hàng hủy', id]
    );

    res.json({ message: 'Hủy lịch hẹn thành công' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Không thể hủy lịch hẹn' });
  }
});

// GET /api/bookings - Admin list with search and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, status, search } = req.query;
    let query = `
      SELECT b.*, 
             GROUP_CONCAT(s.name SEPARATOR ', ') as service_names
      FROM bookings b
      LEFT JOIN booking_services bs ON b.id = bs.booking_id
      LEFT JOIN services s ON bs.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND b.booking_date = ?`;
      params.push(date);
    }
    if (status && status !== 'all') {
      query += ` AND b.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.booking_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY b.id ORDER BY b.booking_date DESC, b.booking_time DESC`;

    const [bookings] = await pool.query(query, params);
    res.json({ bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ message: 'Lỗi khi tải lịch hẹn' });
  }
});

// PATCH /api/bookings/:id/status - Admin update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Đã cập nhật trạng thái thành '${status}'` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái' });
  }
});

export default router;
