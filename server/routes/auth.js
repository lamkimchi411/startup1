import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'luxury_nail_secret_key_2026';

// Middleware to authenticate token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập hệ thống' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Phiên đăng nhập hết hạn' });
    req.user = user;
    next();
  });
}

// POST /api/auth/register (Khách hàng đăng ký)
router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name, phone, email } = req.body;
    if (!username || !password || !full_name || !phone) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên tài khoản, Mật khẩu, Họ tên, SĐT)' });
    }

    // Check duplicate username
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, phone, email, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, phone, email || null, 'customer']
    );

    const newUser = { id: result.insertId, username, full_name, phone, email: email || null, role: 'customer' };
    const payload = { id: newUser.id, username: newUser.username, role: newUser.role, full_name: newUser.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống máy chủ' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, phone: user.phone, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống máy chủ' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, full_name, phone, email, role FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
