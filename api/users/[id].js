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
  const { id } = req.query;

  // PUT /api/users/:id - Update user
  if (req.method === 'PUT') {
    try {
      const { username, password, full_name, email, phone, role } = req.body;

      // Check duplicate username
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

  // DELETE /api/users/:id - Delete user
  if (req.method === 'DELETE') {
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

  return res.status(405).json({ message: 'Method not allowed' });
}
