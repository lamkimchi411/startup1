import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const sql = getDb();

  // GET /api/settings - Public shop information
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM salon_settings WHERE id = 1`;
      if (rows.length === 0) {
        return res.json({
          salon_name: 'LUXURY NAILS & SPA',
          address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
          phone: '0908 123 456',
          email: 'contact@luxurynails.vn',
          open_time: '08:30',
          close_time: '20:30',
          cancel_deadline_hours: 4,
          notice_banner: '✨ Giảm ngay 20% cho quý khách đặt lịch trước qua Website!'
        });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error('Fetch settings error:', err);
      return res.status(500).json({ message: 'Lỗi tải thông tin salon' });
    }
  }

  // PUT /api/settings - Update shop info (Admin)
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { salon_name, address, phone, email, open_time, close_time, cancel_deadline_hours, notice_banner } = req.body;

      await sql`
        UPDATE salon_settings
        SET salon_name = ${salon_name}, address = ${address}, phone = ${phone}, email = ${email},
            open_time = ${open_time}, close_time = ${close_time},
            cancel_deadline_hours = ${parseInt(cancel_deadline_hours, 10)},
            notice_banner = ${notice_banner}
        WHERE id = 1
      `;

      return res.json({ message: 'Cập nhật thông tin Salon thành công' });
    } catch (err) {
      console.error('Update settings error:', err);
      return res.status(500).json({ message: 'Không thể cập nhật thông tin Salon' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
