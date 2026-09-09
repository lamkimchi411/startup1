import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/settings - Public shop information
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM salon_settings WHERE id = 1');
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
    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ message: 'Lỗi tải thông tin salon' });
  }
});

// PUT /api/settings - Update shop info (Admin)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { salon_name, address, phone, email, open_time, close_time, cancel_deadline_hours, notice_banner } = req.body;

    await pool.query(
      `UPDATE salon_settings 
       SET salon_name = ?, address = ?, phone = ?, email = ?, open_time = ?, close_time = ?, cancel_deadline_hours = ?, notice_banner = ?
       WHERE id = 1`,
      [salon_name, address, phone, email, open_time, close_time, parseInt(cancel_deadline_hours, 10), notice_banner]
    );

    res.json({ message: 'Cập nhật thông tin Salon thành công' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Không thể cập nhật thông tin Salon' });
  }
});

// GET /api/settings/homepage - Get homepage content
router.get('/homepage', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM homepage_content WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        hero_subtitle: 'LUXURY NAILS SPA',
        hero_title: 'Nâng tầm vẻ đẹp đôi tay bạn',
        hero_description: 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.',
        hero_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
        working_hours_info: 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
        collection_info: 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
        contact_info: 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch homepage content error:', err);
    res.status(500).json({ message: 'Lỗi tải thông tin trang chủ' });
  }
});

// PUT /api/settings/homepage - Update homepage content (Admin)
router.put('/homepage', authenticateToken, async (req, res) => {
  try {
    const { hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info } = req.body;

    await pool.query(
      `UPDATE homepage_content 
       SET hero_subtitle = ?, hero_title = ?, hero_description = ?, hero_image_url = ?, working_hours_info = ?, collection_info = ?, contact_info = ?
       WHERE id = 1`,
      [hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info]
    );

    res.json({ message: 'Cập nhật nội dung Trang Chủ thành công' });
  } catch (err) {
    console.error('Update homepage content error:', err);
    res.status(500).json({ message: 'Không thể cập nhật trang chủ' });
  }
});

export default router;
