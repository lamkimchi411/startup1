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
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
    res.json({ message: `Đã cập nhật trạng thái thành '${status}'` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái' });
  }
}
