import { getDb } from '../../_lib/db.js';
import { cors } from '../../_lib/cors.js';
import { requireAuth } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const sql = getDb();
    const { id } = req.query;

    await sql`UPDATE services SET is_active = NOT is_active WHERE id = ${id}`;
    return res.json({ message: 'Đã thay đổi trạng thái dịch vụ' });
  } catch (err) {
    console.error('Toggle service error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
}
