import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const sql = getDb();
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại để tra cứu' });
    }

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

    // Get cancel deadline setting
    const settings = await sql`SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1`;
    const cancelDeadlineHours = settings[0]?.cancel_deadline_hours || 4;

    res.json({ bookings, cancelDeadlineHours });
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ message: 'Lỗi khi tra cứu lịch hẹn' });
  }
}
