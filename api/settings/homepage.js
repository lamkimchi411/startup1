import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const sql = getDb();

  // GET /api/settings/homepage - Get homepage content
  if (req.method === 'GET') {
    try {
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
      return res.status(500).json({ message: 'Lỗi tải thông tin trang chủ' });
    }
  }

  // PUT /api/settings/homepage - Update homepage content (Admin)
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info } = req.body;

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
      return res.status(500).json({ message: 'Không thể cập nhật trang chủ' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
