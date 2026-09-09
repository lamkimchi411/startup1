import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, TrendingUp, CheckCircle, Clock, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigateTab }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
        <p>Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Báo Cáo Tổng Quan Salon
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Thống kê doanh thu, lịch hẹn và tình hình hoạt động tiệm móng
          </p>
        </div>

        <button onClick={fetchStats} className="btn-dark" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Cập nhật dữ liệu
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Metric 1: Today Revenue */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Doanh Thu Hôm Nay</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
            {formatPrice(stats?.revenueToday)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Đã hoàn thành trong ngày
          </div>
        </div>

        {/* Metric 2: Today Bookings */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--gold-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lịch Hẹn Hôm Nay</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gold-light)' }}>
            {stats?.todayBookings || 0} lịch
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Tổng lượt khách đặt hôm nay
          </div>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng Doanh Thu</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
            {formatPrice(stats?.revenueTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Từ tất cả đơn đã hoàn thành
          </div>
        </div>

        {/* Metric 4: Total Bookings */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng Lịch Hẹn Hệ Thống</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
            {stats?.totalBookings || 0} lượt
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Tổng số lượt khách đã tạo
          </div>
        </div>

      </div>

      {/* Grid Status Counts & Top Services */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Status distribution */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Trạng Thái Lịch Hẹn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#121217', borderRadius: '8px' }}>
              <span className="badge-status pending">⏳ Chờ xác nhận</span>
              <strong style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{stats?.statusCounts?.pending || 0} đơn</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#121217', borderRadius: '8px' }}>
              <span className="badge-status confirmed">✓ Đã xác nhận</span>
              <strong style={{ color: '#60a5fa', fontSize: '1.1rem' }}>{stats?.statusCounts?.confirmed || 0} đơn</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#121217', borderRadius: '8px' }}>
              <span className="badge-status completed">★ Đã hoàn thành</span>
              <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>{stats?.statusCounts?.completed || 0} đơn</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#121217', borderRadius: '8px' }}>
              <span className="badge-status cancelled">✕ Đã hủy</span>
              <strong style={{ color: '#f87171', fontSize: '1.1rem' }}>{stats?.statusCounts?.cancelled || 0} đơn</strong>
            </div>
          </div>
        </div>

        {/* Top 5 Services */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Top Dịch Vụ Được Ưa Chuộng Nhất
          </h3>
          {stats?.topServices?.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              Chưa có dữ liệu đặt lịch
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.topServices?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#121217', borderRadius: '8px', borderLeft: '3px solid var(--gold-primary)' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.booking_count} lượt đặt</div>
                  </div>
                  <div style={{ color: 'var(--gold-light)', fontWeight: '700' }}>
                    {formatPrice(item.total_revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent Bookings table summary */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Lịch Hẹn Mới Đặt Gần Đây
          </h3>
          <button onClick={() => onNavigateTab('admin-bookings')} className="btn-outline-gold" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            Xem Tất Cả Lịch Hẹn
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #282835', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Mã Hẹn</th>
                <th style={{ padding: '0.75rem' }}>Khách Hàng</th>
                <th style={{ padding: '0.75rem' }}>SĐT</th>
                <th style={{ padding: '0.75rem' }}>Thời Gian Hẹn</th>
                <th style={{ padding: '0.75rem' }}>Dịch Vụ</th>
                <th style={{ padding: '0.75rem' }}>Tổng Tiền</th>
                <th style={{ padding: '0.75rem' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #1a1a24' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--gold-light)' }}>{b.booking_code}</td>
                  <td style={{ padding: '0.75rem', color: '#fff' }}>{b.customer_name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_phone}</td>
                  <td style={{ padding: '0.75rem', color: '#ddd' }}>{b.booking_date?.split('T')[0]} ({b.booking_time})</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.service_names}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>{formatPrice(b.total_price)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge-status ${b.status}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
