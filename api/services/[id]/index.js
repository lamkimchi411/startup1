import { getDb } from '../../_lib/db.js';
import { cors } from '../../_lib/cors.js';
import { requireAuth } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const sql = getDb();
  const { id } = req.query;

  // PUT /api/services/:id - Update service
  if (req.method === 'PUT') {
    try {
      const { name, category_id, description, price, duration_minutes, image_url, is_active } = req.body;

      await sql`
        UPDATE services
        SET name = ${name}, category_id = ${category_id || null}, description = ${description},
            price = ${parseFloat(price)}, duration_minutes = ${parseInt(duration_minutes, 10)},
            image_url = ${image_url}, is_active = ${Boolean(is_active)}
        WHERE id = ${id}
      `;

      return res.json({ message: 'Cập nhật dịch vụ thành công' });
    } catch (err) {
      console.error('Update service error:', err);
      return res.status(500).json({ message: 'Không thể cập nhật dịch vụ' });
    }
  }

  // DELETE /api/services/:id - Delete service
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM services WHERE id = ${id}`;
      return res.json({ message: 'Đã xóa dịch vụ' });
    } catch (err) {
      console.error('Delete service error:', err);
      return res.status(500).json({ message: 'Không thể xóa dịch vụ' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
