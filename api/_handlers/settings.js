import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url || '';

  // /api/settings/homepage
  if (url.includes('/homepage')) {
    if (req.method === 'GET') {
      try {
        const sql = getDb();
        const rows = await sql`SELECT * FROM homepage_content WHERE id = 1`;
        if (rows.length === 0) {
          return res.json({
            hero_subtitle: 'LUXURY NAILS SPA',
            hero_title: 'Nâng tầm vẻ đẹp đôi tay bạn',
            hero_description: 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác.',
            hero_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
            working_hours_info: 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
            collection_info: 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
            contact_info: 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
          });
        }
        return res.json(rows[0]);
      } catch (err) {
        console.error('Fetch homepage content error:', err);
        return res.status(500).json({ message: 'Lỗi tải thông tin trang chủ: ' + err.message });
      }
    }

    if (req.method === 'PUT') {
      const user = requireAuth(req, res);
      if (!user) return;

      try {
        const sql = getDb();
        const { hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info } = req.body || {};

        await sql`
          UPDATE homepage_content
          SET hero_subtitle = ${hero_subtitle}, hero_title = ${hero_title},
              hero_description = ${hero_description}, hero_image_url = ${hero_image_url},
              working_hours_info = ${working_hours_info}, collection_info = ${collection_info},
              contact_info = ${contact_info}
          WHERE id = 1
        `;

        return res.json({ message: 'Cập nhật nội dung Trang Chủ thành công' });
      } catch (err) {
        console.error('Update homepage content error:', err);
        return res.status(500).json({ message: 'Không thể cập nhật trang chủ: ' + err.message });
      }
    }
  }

  // GET /api/settings
  if (req.method === 'GET') {
    try {
      const sql = getDb();
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
      return res.status(500).json({ message: 'Lỗi tải thông tin salon: ' + err.message });
    }
  }

  // PUT /api/settings
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const { salon_name, address, phone, email, open_time, close_time, cancel_deadline_hours, notice_banner } = req.body || {};

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
      return res.status(500).json({ message: 'Không thể cập nhật thông tin Salon: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
