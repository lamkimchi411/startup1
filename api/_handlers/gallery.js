import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

const starterGallery = [
  ['Sơn Gel Hàn Quốc Cao Cấp', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'],
  ['Úp Móng Thạch Design VIP', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80'],
  ['Hiệu Ứng Mắt Mèo Ombre', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'],
  ['Đắp Bột Khai Thấu Mới 2026', 'https://images.unsplash.com/photo-1607779097040-df63bc536371?w=600&auto=format&fit=crop&q=80']
];

// Existing Neon databases may have been initialized before Gallery was added.
// Create and seed this one missing feature without requiring a manual /api/init call.
async function ensureGallerySchema(sql) {
  const table = await sql`SELECT to_regclass('public.gallery') AS name`;
  if (table[0]?.name) return;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  for (const [title, imageUrl] of starterGallery) {
    await sql`INSERT INTO gallery (title, image_url) VALUES (${title}, ${imageUrl})`;
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  let sql;
  try {
    sql = getDb();
    await ensureGallerySchema(sql);
  } catch (err) {
    console.error('Gallery schema setup error:', err);
    return res.status(500).json({ message: 'Không thể khởi tạo bộ sưu tập. Vui lòng thử lại sau.' });
  }

  const url = req.url || '';
  const match = url.match(/\/gallery\/(\d+)/);
  const rawId = (req.query && req.query.id) || (match ? match[1] : null);
  const id = /^\d+$/.test(String(rawId || '')) ? Number(rawId) : null;

  // PUT /api/gallery/:id - Update item
  if (req.method === 'PUT' && id) {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { title, image_url } = req.body || {};
      if (!image_url) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn ảnh (image_url)' });
      }

      const updated = await sql`
        UPDATE gallery
        SET title = ${title || ''}, image_url = ${image_url}
        WHERE id = ${id}
        RETURNING id
      `;

      if (updated.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy mẫu móng cần cập nhật. Hãy tải lại danh sách rồi thử lại.' });
      }

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
