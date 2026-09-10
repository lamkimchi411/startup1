import { getDb } from '../../_lib/db.js';
import { cors } from '../../_lib/cors.js';
import { verifyToken } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const sql = getDb();
    const { id } = req.query;
    const { reason, phone } = req.body;

    const rows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
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

    // Check time deadline
    const settings = await sql`SELECT cancel_deadline_hours FROM salon_settings WHERE id = 1`;
    const deadlineHours = settings[0]?.cancel_deadline_hours || 4;

    // Format the booking date properly
    const dateStr = typeof booking.booking_date === 'string'
      ? booking.booking_date.split('T')[0]
      : booking.booking_date.toISOString().split('T')[0];

    const bookingDateTime = new Date(`${dateStr}T${booking.booking_time}:00`);
    const now = new Date();
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If customer cancels and it's less than deadline hours away
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

    res.json({ message: 'Hủy lịch hẹn thành công' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Không thể hủy lịch hẹn' });
  }
}
