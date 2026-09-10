import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { signToken } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const sql = getDb();
    const { username, password, full_name, phone, email } = req.body;

    if (!username || !password || !full_name || !phone) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên tài khoản, Mật khẩu, Họ tên, SĐT)'
      });
    }

    // Check duplicate username
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

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống máy chủ' });
  }
}
