import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const sql = getDb();
    const rows = await sql`SELECT id, username, full_name, phone, email, role FROM users WHERE id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}
