import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/stats - Admin Dashboard overview stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Total bookings count
    const [totalRes] = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = totalRes[0].count;

    // Today's bookings count
    const [todayRes] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE booking_date = ?', [todayStr]);
    const todayBookings = todayRes[0].count;

    // Revenue today (completed bookings)
    const [revTodayRes] = await pool.query(
      `SELECT SUM(total_price) as revenue FROM bookings WHERE booking_date = ? AND status = 'completed'`,
      [todayStr]
    );
    const revenueToday = parseFloat(revTodayRes[0].revenue || 0);

    // Total Revenue overall (completed)
    const [revTotalRes] = await pool.query(
      `SELECT SUM(total_price) as revenue FROM bookings WHERE status = 'completed'`
    );
    const revenueTotal = parseFloat(revTotalRes[0].revenue || 0);

    // Count by status
    const [statusRes] = await pool.query(
      `SELECT status, COUNT(*) as count FROM bookings GROUP BY status`
    );
    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    statusRes.forEach(row => {
      statusCounts[row.status] = row.count;
    });

    // Top 5 Services
    const [topServices] = await pool.query(
      `SELECT s.name, COUNT(bs.service_id) as booking_count, SUM(bs.price) as total_revenue
       FROM booking_services bs
       JOIN services s ON bs.service_id = s.id
       GROUP BY bs.service_id, s.name
       ORDER BY booking_count DESC
       LIMIT 5`
    );

    // Recent 5 Bookings
    const [recentBookings] = await pool.query(
      `SELECT b.*, GROUP_CONCAT(s.name SEPARATOR ', ') as service_names
       FROM bookings b
       LEFT JOIN booking_services bs ON b.id = bs.booking_id
       LEFT JOIN services s ON bs.service_id = s.id
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT 5`
    );

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
    res.status(500).json({ message: 'Lỗi tải báo cáo thống kê' });
  }
});

export default router;
