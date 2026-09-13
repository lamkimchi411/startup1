import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url || '';

  // PATCH /api/services/:id/toggle
  if (url.includes('/toggle')) {
    if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const match = url.match(/\/services\/(\d+)\/toggle/);
      const id = (req.query && req.query.id) || (match ? match[1] : null);
      if (!id) return res.status(400).json({ message: 'Thiếu ID dịch vụ' });

      await sql`UPDATE services SET is_active = NOT is_active WHERE id = ${id}`;
      return res.json({ message: 'Đã thay đổi trạng thái dịch vụ' });
    } catch (err) {
      console.error('Toggle service error:', err);
      return res.status(500).json({ message: 'Lỗi cập nhật trạng thái: ' + err.message });
    }
  }

  // PUT /api/services/:id - Update service
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const match = url.match(/\/services\/(\d+)/);
      const id = (req.query && req.query.id) || (match ? match[1] : null);
      const { name, category_id, description, price, duration_minutes, image_url, is_active } = req.body || {};

      if (!id) return res.status(400).json({ message: 'Thiếu ID dịch vụ' });

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
      return res.status(500).json({ message: 'Không thể cập nhật dịch vụ: ' + err.message });
    }
  }

  // DELETE /api/services/:id - Delete service
  if (req.method === 'DELETE') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const match = url.match(/\/services\/(\d+)/);
      const id = (req.query && req.query.id) || (match ? match[1] : null);
      if (!id) return res.status(400).json({ message: 'Thiếu ID dịch vụ' });

      await sql`DELETE FROM services WHERE id = ${id}`;
      return res.json({ message: 'Đã xóa dịch vụ' });
    } catch (err) {
      console.error('Delete service error:', err);
      return res.status(500).json({ message: 'Không thể xóa dịch vụ: ' + err.message });
    }
  }

  // GET /api/services - List services
  if (req.method === 'GET') {
    try {
      const sql = getDb();
      const includeInactive = req.query && req.query.all === 'true';
      let services, categories;

      if (includeInactive) {
        services = await sql`
          SELECT s.*, c.name as category_name
          FROM services s
          LEFT JOIN categories c ON s.category_id = c.id
          ORDER BY s.category_id ASC, s.id ASC
        `;
      } else {
        services = await sql`
          SELECT s.*, c.name as category_name
          FROM services s
          LEFT JOIN categories c ON s.category_id = c.id
          WHERE s.is_active = true
          ORDER BY s.category_id ASC, s.id ASC
        `;
      }

      categories = await sql`SELECT * FROM categories ORDER BY id ASC`;
      return res.json({ services, categories });
    } catch (err) {
      console.error('Fetch services error:', err);
      return res.status(500).json({ message: 'Lỗi khi tải danh sách dịch vụ: ' + err.message });
    }
  }

  // POST /api/services - Create service (Admin)
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const sql = getDb();
      const { name, category_id, description, price, duration_minutes, image_url, is_active } = req.body || {};
      if (!name || !price || !duration_minutes) {
        return res.status(400).json({ message: 'Vui lòng điền tên dịch vụ, giá và thời gian' });
      }

      const defaultImage = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80';
      const result = await sql`
        INSERT INTO services (name, category_id, description, price, duration_minutes, image_url, is_active)
        VALUES (${name}, ${category_id || null}, ${description || ''}, ${parseFloat(price)}, ${parseInt(duration_minutes, 10)}, ${image_url || defaultImage}, ${is_active !== undefined ? Boolean(is_active) : true})
        RETURNING id
      `;

      return res.status(201).json({ message: 'Thêm dịch vụ thành công', serviceId: result[0].id });
    } catch (err) {
      console.error('Create service error:', err);
      return res.status(500).json({ message: 'Không thể thêm dịch vụ: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
