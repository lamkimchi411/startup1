import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const sql = getDb();
    const { date, duration } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ngày cần đặt (YYYY-MM-DD)' });
    }

    // Get salon operating hours
    const settings = await sql`SELECT open_time, close_time FROM salon_settings WHERE id = 1`;
    const openTime = settings[0]?.open_time || '08:30';
    const closeTime = settings[0]?.close_time || '20:30';

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const reqDuration = parseInt(duration || '60', 10);

    // Get existing bookings for that date (not cancelled)
    const existingBookings = await sql`
      SELECT booking_time, total_duration FROM bookings
      WHERE booking_date = ${date} AND status != 'cancelled'
    `;

    // Build time slots every 30 minutes
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

    res.json({ date, openTime, closeTime, slots });
  } catch (err) {
    console.error('Available slots error:', err);
    res.status(500).json({ message: 'Lỗi khi kiểm tra khung giờ trống' });
  }
}
