import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
  }

  const sql = getDb();
  const url = req.url || '';
  const match = url.match(/\/users\/(\d+)/);
  const id = (req.query && req.query.id) || (match ? match[1] : null);

  // PUT /api/users/:id
  if (req.method === 'PUT' && id) {
    try {
      const { username, password, full_name, email, phone, role } = req.body || {};

      const existing = await sql`SELECT id FROM users WHERE username = ${username} AND id != ${id}`;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Tên tài khoản này đã được người khác sử dụng' });
      }

      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`
          UPDATE users SET username = ${username}, password = ${hashedPassword},
                 full_name = ${full_name}, email = ${email || null},
                 phone = ${phone || null}, role = ${role}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE users SET username = ${username}, full_name = ${full_name},
                 email = ${email || null}, phone = ${phone || null}, role = ${role}
          WHERE id = ${id}
        `;
      }

      return res.json({ message: 'Cập nhật thông tin người dùng thành công' });
    } catch (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Không thể cập nhật người dùng' });
    }
  }

  // DELETE /api/users/:id
  if (req.method === 'DELETE' && id) {
    try {
      if (parseInt(id, 10) === user.id) {
        return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản đang đăng nhập' });
      }

      await sql`DELETE FROM users WHERE id = ${id}`;
      return res.json({ message: 'Đã xóa người dùng thành công' });
    } catch (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ message: 'Không thể xóa người dùng' });
    }
  }

  // GET /api/users
  if (req.method === 'GET') {
    try {
      const users = await sql`
        SELECT id, username, full_name, email, phone, role, created_at
        FROM users ORDER BY id DESC
      `;
      return res.json({ users });
    } catch (err) {
      console.error('Fetch users error:', err);
      return res.status(500).json({ message: 'Lỗi khi tải danh sách người dùng' });
    }
  }

  // POST /api/users
  if (req.method === 'POST') {
    try {
      const { username, password, full_name, email, phone, role } = req.body || {};
      if (!username || !password || !full_name) {
        return res.status(400).json({ message: 'Vui lòng điền tên tài khoản, mật khẩu và họ tên' });
      }

      const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Tên tài khoản này đã tồn tại' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (username, password, full_name, email, phone, role)
        VALUES (${username}, ${hashedPassword}, ${full_name}, ${email || null}, ${phone || null}, ${role || 'customer'})
        RETURNING id
      `;

      return res.status(201).json({ message: 'Tạo người dùng thành công', userId: result[0].id });
    } catch (err) {
      console.error('Create user error:', err);
      return res.status(500).json({ message: 'Không thể tạo người dùng' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
