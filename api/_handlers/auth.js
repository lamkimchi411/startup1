import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { signToken, requireAuth } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url || '';

  // GET /api/auth/me
  if (url.includes('/me')) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const rows = await sql`SELECT id, username, full_name, phone, email, role FROM users WHERE id = ${user.id}`;
      if (rows.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      return res.json({ user: rows[0] });
    } catch (err) {
      console.error('Auth me error:', err);
      return res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
  }

  // POST /api/auth/register
  if (url.includes('/register')) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    try {
      const sql = getDb();
      const { username, password, full_name, phone, email } = req.body || {};

      if (!username || !password || !full_name || !phone) {
        return res.status(400).json({
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên tài khoản, Mật khẩu, Họ tên, SĐT)'
        });
      }

      const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (username, password, full_name, phone, email, role)
        VALUES (${username}, ${hashedPassword}, ${full_name}, ${phone}, ${email || null}, 'customer')
        RETURNING id
      `;

      const newUser = {
        id: result[0].id,
        username,
        full_name,
        phone,
        email: email || null,
        role: 'customer'
      };

      const payload = { id: newUser.id, username: newUser.username, role: newUser.role, full_name: newUser.full_name };
      const token = signToken(payload);

      return res.status(201).json({
        message: 'Đăng ký tài khoản thành công',
        token,
        user: newUser
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Lỗi hệ thống máy chủ: ' + err.message });
    }
  }

  // POST /api/auth/login
  if (url.includes('/login') || req.method === 'POST') {
    try {
      const sql = getDb();
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
      }

      const rows = await sql`SELECT * FROM users WHERE username = ${username}`;
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
      const token = signToken(payload);

      return res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Lỗi hệ thống máy chủ: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
