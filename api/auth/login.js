import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { signToken } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const sql = getDb();
    const { username, password } = req.body;

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

    res.json({
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
    res.status(500).json({ message: 'Lỗi hệ thống máy chủ' });
  }
}
