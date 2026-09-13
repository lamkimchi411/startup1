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
    const todayStr = new Date().toISOString().split('T')[0];

    // Total bookings count
    const totalRes = await sql`SELECT COUNT(*) as count FROM bookings`;
    const totalBookings = parseInt(totalRes[0].count);

    // Today's bookings count
    const todayRes = await sql`SELECT COUNT(*) as count FROM bookings WHERE booking_date = ${todayStr}`;
    const todayBookings = parseInt(todayRes[0].count);

    // Revenue today (completed bookings)
    const revTodayRes = await sql`
      SELECT COALESCE(SUM(total_price), 0) as revenue FROM bookings
      WHERE booking_date = ${todayStr} AND status = 'completed'
    `;
    const revenueToday = parseFloat(revTodayRes[0].revenue);

    // Total revenue (completed)
    const revTotalRes = await sql`
      SELECT COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE status = 'completed'
    `;
    const revenueTotal = parseFloat(revTotalRes[0].revenue);

    // Count by status
    const statusRes = await sql`SELECT status, COUNT(*) as count FROM bookings GROUP BY status`;
    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    statusRes.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    // Top 5 services
    const topServices = await sql`
      SELECT s.name, COUNT(bs.service_id) as booking_count, COALESCE(SUM(bs.price), 0) as total_revenue
      FROM booking_services bs
      JOIN services s ON bs.service_id = s.id
      GROUP BY bs.service_id, s.name
      ORDER BY booking_count DESC
      LIMIT 5
    `;

    // Recent 5 bookings
    const recentBookings = await sql`
      SELECT b.*, STRING_AGG(s.name, ', ') as service_names
      FROM bookings b
      LEFT JOIN booking_services bs ON b.id = bs.booking_id
      LEFT JOIN services s ON bs.service_id = s.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

    res.json({
      totalBookings,
      todayBookings,
      revenueToday,
      revenueTotal,
      statusCounts,
      topServices,
      recentBookings
    });
  } catch (err) {
    console.error('Fetch stats error:', err);
    res.status(500).json({ message: 'Lỗi tải báo cáo thống kê: ' + err.message });
  }
}
