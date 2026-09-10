import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

function generateBookingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LNX-${num}`;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const sql = getDb();

  // POST /api/bookings - Create new booking
  if (req.method === 'POST') {
    try {
      const { customer_name, customer_phone, customer_email, booking_date, booking_time, notes, service_ids } = req.body;

      if (!customer_name || !customer_phone || !booking_date || !booking_time || !service_ids || service_ids.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: Tên, SĐT, Ngày, Giờ và ít nhất 1 dịch vụ' });
      }

      // Fetch selected services
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

      // Insert booking
      const bookingResult = await sql`
        INSERT INTO bookings (booking_code, customer_name, customer_phone, customer_email, booking_date, booking_time, total_duration, total_price, notes, status)
        VALUES (${bookingCode}, ${customer_name}, ${customer_phone}, ${customer_email || null}, ${booking_date}, ${booking_time}, ${totalDuration}, ${totalPrice}, ${notes || ''}, 'pending')
        RETURNING *
      `;

      const bookingId = bookingResult[0].id;

      // Insert booking_services
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

  // GET /api/bookings - Admin list with search and filters
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { date, status, search } = req.query;
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
