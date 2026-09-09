import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/users - List all users (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
    }

    if (!pool) {
      return res.status(503).json({ message: 'Database chưa sẵn sàng, vui lòng thử lại' });
    }

    const [users] = await pool.query(
      'SELECT id, username, full_name, email, phone, role, created_at FROM users ORDER BY id DESC'
    );
    res.json({ users });
  } catch (err) {
    console.error('Fetch users error:', err.message, err.code, err.sqlMessage);
    res.status(500).json({ message: 'Lỗi khi tải danh sách người dùng: ' + (err.sqlMessage || err.message) });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
    }

    const { username, password, full_name, email, phone, role } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ message: 'Vui lòng điền tên tài khoản, mật khẩu và họ tên' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tên tài khoản này đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, email || null, phone || null, role || 'customer']
    );

    res.status(201).json({ message: 'Tạo người dùng thành công', userId: result.insertId });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Không thể tạo người dùng' });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
    }

    const { id } = req.params;
    const { username, password, full_name, email, phone, role } = req.body;

    // Check duplicate username if username changed
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tên tài khoản này đã được người khác sử dụng' });
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username = ?, password = ?, full_name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
        [username, hashedPassword, full_name, email || null, phone || null, role, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
        [username, full_name, email || null, phone || null, role, id]
      );
    }

    res.json({ message: 'Cập nhật thông tin người dùng thành công' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Không thể cập nhật người dùng' });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
    }

    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản đang đăng nhập' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Không thể xóa người dùng' });
  }
});

export default router;
