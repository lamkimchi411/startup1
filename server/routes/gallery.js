import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/gallery - Fetch all gallery items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Fetch gallery error:', err);
    res.status(500).json({ message: 'Lỗi tải danh sách bộ sưu tập' });
  }
});

// POST /api/gallery - Create new gallery item (Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, image_url } = req.body || {};
    if (!image_url) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn ảnh (image_url)' });
    }

    const [result] = await pool.query(
      'INSERT INTO gallery (title, image_url) VALUES (?, ?)',
      [title || '', image_url]
    );

    res.status(201).json({
      message: 'Thêm mẫu móng bộ sưu tập thành công',
      item: { id: result.insertId, title, image_url }
    });
  } catch (err) {
    console.error('Create gallery error:', err);
    res.status(500).json({ message: 'Không thể thêm mẫu móng vào bộ sưu tập' });
  }
});

// PUT /api/gallery/:id - Update gallery item (Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url } = req.body || {};

    if (!image_url) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn ảnh (image_url)' });
    }

    await pool.query(
      'UPDATE gallery SET title = ?, image_url = ? WHERE id = ?',
      [title || '', image_url, id]
    );

    res.json({ message: 'Cập nhật mẫu móng thành công' });
  } catch (err) {
    console.error('Update gallery error:', err);
    res.status(500).json({ message: 'Không thể cập nhật mẫu móng' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa mẫu móng khỏi bộ sưu tập' });
  } catch (err) {
    console.error('Delete gallery error:', err);
    res.status(500).json({ message: 'Không thể xóa mẫu móng' });
  }
});

export default router;
