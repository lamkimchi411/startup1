import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth, verifyToken } from '../_lib/auth.js';

function generateBookingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LNX-${num}`;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const sql = getDb();
  const url = req.url || '';

  // GET /api/bookings/available-slots
  if (url.includes('/available-slots')) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
    try {
      const { date, duration } = req.query || {};
      if (!date) return res.status(400).json({ message: 'Vui lòng cung cấp ngày cần đặt (YYYY-MM-DD)' });

      const settings = await sql`SELECT open_time, close_time FROM salon_settings WHERE id = 1`;
      const openTime = settings[0]?.open_time || '08:30';
      const closeTime = settings[0]?.close_time || '20:30';

      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);
      const startMinutes = openH * 60 + openM;
      const endMinutes = closeH * 60 + closeM;
      const reqDuration = parseInt(duration || '60', 10);

      const existingBookings = await sql`
        SELECT booking_time, total_duration FROM bookings
        WHERE booking_date = ${date} AND status != 'cancelled'
      `;

      const slots = [];
      const maxCapacityPerSlot = 3;

      for (let time = startMinutes; time + reqDuration <= endMinutes; time += 30) {
        const h = Math.floor(time / 60).toString().padStart(2, '0');
        const m = (time % 60).toString().padStart(2, '0');
        const slotTimeStr = `${h}:${m}`;
        const slotEnd = time + reqDuration;
        let activeCount = 0;

        for (const b of existingBookings) {
          const [bH, bM] = b.booking_time.split(':').map(Number);
          const bStart = bH * 60 + bM;
          const bEnd = bStart + b.total_duration;
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

      return res.json({ date, openTime, closeTime, slots });
    } catch (err) {
      console.error('Available slots error:', err);
      return res.status(500).json({ message: 'Lỗi khi kiểm tra khung giờ trống' });
    }
  }

  // GET /api/bookings/lookup
  if (url.includes('/lookup')) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
    try {
      const { phone } = req.query || {};
      if (!phone) return res.status(400).json({ message: 'Vui lòng nhập số điện thoại để tra cứu' });

      const cleanPhone = phone.trim();
      const bookings = await sql`
        SELECT b.*,
               (SELECT STRING_AGG(s.name, ', ')
                FROM booking_services bs
                JOIN services s ON bs.service_id = s.id
                WHERE bs.booking_id = b.id) as service_names
        FROM bookings b
        WHERE b.customer_phone LIKE ${'%' + cleanPhone + '%'}
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `;

      const settings = await sql`SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1`;
      const cancelDeadlineHours = settings[0]?.cancel_deadline_hours || 4;

      return res.json({ bookings, cancelDeadlineHours });
    } catch (err) {
      console.error('Lookup error:', err);
      return res.status(500).json({ message: 'Lỗi khi tra cứu lịch hẹn' });
    }
  }

  // PATCH /api/bookings/:id/cancel
  if (url.includes('/cancel')) {
    if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });
    try {
      const match = url.match(/\/bookings\/(\d+)\/cancel/);
      const id = (req.query && req.query.id) || (match ? match[1] : null);
      const { reason, phone } = req.body || {};

      if (!id) return res.status(400).json({ message: 'Thiếu ID lịch hẹn' });

      const rows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

      const booking = rows[0];
      if (phone && booking.customer_phone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
        return res.status(403).json({ message: 'Số điện thoại không trùng khớp với lịch hẹn' });
      }
      if (booking.status === 'cancelled') return res.status(400).json({ message: 'Lịch hẹn này đã bị hủy trước đó' });
      if (booking.status === 'completed') return res.status(400).json({ message: 'Không thể hủy lịch hẹn đã hoàn thành' });

      const settings = await sql`SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1`;
      const deadlineHours = settings[0]?.cancel_deadline_hours || 4;

      const dateStr = typeof booking.booking_date === 'string'
        ? booking.booking_date.split('T')[0]
        : booking.booking_date.toISOString().split('T')[0];

      const bookingDateTime = new Date(`${dateStr}T${booking.booking_time}:00`);
      const now = new Date();
      const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      const currentUser = verifyToken(req);
      if (!currentUser && diffHours < deadlineHours) {
        return res.status(400).json({
          message: `Quý khách chỉ có thể hủy lịch trước ít nhất ${deadlineHours} tiếng so với giờ hẹn. Vui lòng liên hệ hotline salon để được hỗ trợ!`
        });
      }

      await sql`
        UPDATE bookings SET status = 'cancelled', cancel_reason = ${reason || 'Khách hàng hủy'}
        WHERE id = ${id}
      `;

      return res.json({ message: 'Hủy lịch hẹn thành công' });
    } catch (err) {
      console.error('Cancel booking error:', err);
      return res.status(500).json({ message: 'Không thể hủy lịch hẹn' });
    }
  }

  // PATCH /api/bookings/:id/status
  if (url.includes('/status')) {
    if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const match = url.match(/\/bookings\/(\d+)\/status/);
      const id = (req.query && req.query.id) || (match ? match[1] : null);
      const { status } = req.body || {};
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

      if (!id || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái hoặc ID không hợp lệ' });
      }

      await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
      return res.json({ message: `Đã cập nhật trạng thái thành '${status}'` });
    } catch (err) {
      console.error('Update status error:', err);
      return res.status(500).json({ message: 'Không thể cập nhật trạng thái' });
    }
  }

  // POST /api/bookings - Create new booking
  if (req.method === 'POST') {
    try {
      const { customer_name, customer_phone, customer_email, booking_date, booking_time, notes, service_ids } = req.body || {};
      if (!customer_name || !customer_phone || !booking_date || !booking_time || !service_ids || service_ids.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: Tên, SĐT, Ngày, Giờ và ít nhất 1 dịch vụ' });
      }

      const selectedServices = await sql`
        SELECT id, name, price, duration_minutes FROM services
        WHERE id = ANY(${service_ids}::int[]) AND is_active = true
      `;
      if (selectedServices.length === 0) {
        return res.status(400).json({ message: 'Dịch vụ đã chọn không hợp lệ hoặc đã ngưng phục vụ' });
      }

      const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
      const bookingCode = generateBookingCode();

      const bookingResult = await sql`
        INSERT INTO bookings (booking_code, customer_name, customer_phone, customer_email, booking_date, booking_time, total_duration, total_price, notes, status)
        VALUES (${bookingCode}, ${customer_name}, ${customer_phone}, ${customer_email || null}, ${booking_date}, ${booking_time}, ${totalDuration}, ${totalPrice}, ${notes || ''}, 'pending')
        RETURNING *
      `;

      const bookingId = bookingResult[0].id;
      for (const s of selectedServices) {
        await sql`
          INSERT INTO booking_services (booking_id, service_id, price)
          VALUES (${bookingId}, ${s.id}, ${parseFloat(s.price)})
        `;
      }

      return res.status(201).json({
        message: 'Đặt lịch thành công!',
        booking: {
          ...bookingResult[0],
          services: selectedServices
        }
      });
    } catch (err) {
      console.error('Create booking error:', err);
      return res.status(500).json({ message: 'Không thể xử lý yêu cầu đặt lịch' });
    }
  }

  // GET /api/bookings - Admin list
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { date, status, search } = req.query || {};
      let query = `
        SELECT b.*,
               STRING_AGG(s.name, ', ') as service_names
        FROM bookings b
        LEFT JOIN booking_services bs ON b.id = bs.booking_id
        LEFT JOIN services s ON bs.service_id = s.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (date) {
        query += ` AND b.booking_date = $${paramIndex++}`;
        params.push(date);
      }
      if (status && status !== 'all') {
        query += ` AND b.status = $${paramIndex++}`;
        params.push(status);
      }
      if (search) {
        query += ` AND (b.customer_name ILIKE $${paramIndex} OR b.customer_phone ILIKE $${paramIndex} OR b.booking_code ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` GROUP BY b.id ORDER BY b.booking_date DESC, b.booking_time DESC`;

      const bookings = await sql(query, params);
      return res.json({ bookings });
    } catch (err) {
      console.error('Fetch bookings error:', err);
      return res.status(500).json({ message: 'Lỗi khi tải lịch hẹn' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
