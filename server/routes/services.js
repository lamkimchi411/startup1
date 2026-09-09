import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Multer Disk Storage setup
const uploadsFolder = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// POST /api/services/upload - Upload file (Admin)
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh để tải lên' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'Tải ảnh thành công', url: imageUrl });
});

// GET /api/services - Get list of active services (or all for admin)
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    let query = `
      SELECT s.*, c.name as category_name 
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    if (!includeInactive) {
      query += ' WHERE s.is_active = 1';
    }
    query += ' ORDER BY s.category_id ASC, s.id ASC';

    const [services] = await pool.query(query);
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');

    res.json({ services, categories });
  } catch (err) {
    console.error('Fetch services error:', err);
    res.status(500).json({ message: 'Lỗi khi tải danh sách dịch vụ' });
  }
});

// POST /api/services - Create service (Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category_id, description, price, duration_minutes, image_url, is_active } = req.body;
    if (!name || !price || !duration_minutes) {
      return res.status(400).json({ message: 'Vui lòng điền tên dịch vụ, giá và thời gian' });
    }

    const [result] = await pool.query(
      `INSERT INTO services (name, category_id, description, price, duration_minutes, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category_id || null,
        description || '',
        parseFloat(price),
        parseInt(duration_minutes, 10),
        image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      ]
    );

    res.status(201).json({ message: 'Thêm dịch vụ thành công', serviceId: result.insertId });
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ message: 'Không thể thêm dịch vụ' });
  }
});

// PUT /api/services/:id - Update service (Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, description, price, duration_minutes, image_url, is_active } = req.body;

    await pool.query(
      `UPDATE services 
       SET name = ?, category_id = ?, description = ?, price = ?, duration_minutes = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        category_id || null,
        description,
        parseFloat(price),
        parseInt(duration_minutes, 10),
        image_url,
        is_active ? 1 : 0,
        id
      ]
    );

    res.json({ message: 'Cập nhật dịch vụ thành công' });
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ message: 'Không thể cập nhật dịch vụ' });
  }
});

// PATCH /api/services/:id/toggle - Toggle active status (Admin)
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE services SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ message: 'Đã thay đổi trạng thái dịch vụ' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
});

// DELETE /api/services/:id - Delete service (Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa dịch vụ' });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xóa dịch vụ' });
  }
});

export default router;
