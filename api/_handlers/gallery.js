import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url || '';
  const match = url.match(/\/gallery\/(\d+)/);
  const id = (req.query && req.query.id) || (match ? match[1] : null);

  // PUT /api/gallery/:id - Update item
  if (req.method === 'PUT' && id) {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const { title, image_url } = req.body || {};
      if (!image_url) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn ảnh (image_url)' });
      }

      await sql`
        UPDATE gallery
        SET title = ${title || ''}, image_url = ${image_url}
        WHERE id = ${id}
      `;

      return res.json({ message: 'Cập nhật mẫu móng thành công' });
    } catch (err) {
      console.error('Update gallery item error:', err);
      return res.status(500).json({ message: 'Không thể cập nhật mẫu móng: ' + err.message });
    }
  }

  // DELETE /api/gallery/:id - Delete item
  if (req.method === 'DELETE' && id) {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      await sql`DELETE FROM gallery WHERE id = ${id}`;
      return res.json({ message: 'Đã xóa mẫu móng khỏi bộ sưu tập' });
    } catch (err) {
      console.error('Delete gallery item error:', err);
      return res.status(500).json({ message: 'Không thể xóa mẫu móng: ' + err.message });
    }
  }

  // GET /api/gallery - Fetch all gallery items
  if (req.method === 'GET') {
    try {
      const sql = getDb();
      const rows = await sql`SELECT * FROM gallery ORDER BY id ASC`;
      return res.json(rows);
    } catch (err) {
      console.error('Fetch gallery error:', err);
      return res.status(500).json({ message: 'Lỗi tải danh sách bộ sưu tập: ' + err.message });
    }
  }

  // POST /api/gallery - Create gallery item
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const { title, image_url } = req.body || {};
      if (!image_url) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn ảnh (image_url)' });
      }

      const result = await sql`
        INSERT INTO gallery (title, image_url)
        VALUES (${title || ''}, ${image_url})
        RETURNING id
      `;

      return res.status(201).json({
        message: 'Thêm mẫu móng bộ sưu tập thành công',
        item: { id: result[0].id, title, image_url }
      });
    } catch (err) {
      console.error('Create gallery item error:', err);
      return res.status(500).json({ message: 'Không thể thêm mẫu móng vào bộ sưu tập: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
