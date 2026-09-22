import React from 'react';
import { BarChart3, CalendarDays, PieChart, TrendingUp } from 'lucide-react';

const palette = {
  pending: '#fbbf24',
  confirmed: '#60a5fa',
  completed: '#34d399',
  cancelled: '#fb7185'
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

const shortDate = (date) => new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
  .format(new Date(`${date}T00:00:00`))
  .replace('Th ', 'T');

function ChartCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="glass-card" style={{ padding: '1.4rem', minWidth: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 10, background: 'rgba(212,175,55,0.13)', color: 'var(--gold-primary)' }}>
          <Icon size={18} />
        </span>
        <div>
          <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.08rem', margin: 0 }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TrendChart({ data }) {
  const values = data.map(item => Number(item.bookings || 0));
  const max = Math.max(...values, 1);
  const width = 560;
  const height = 220;
  const padding = { top: 20, right: 16, bottom: 35, left: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => {
    const x = padding.left + (chartWidth * index) / Math.max(data.length - 1, 1);
    const y = padding.top + chartHeight - (Number(item.bookings || 0) / max) * chartHeight;
    return { ...item, x, y };
  });
  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const area = `${padding.left},${padding.top + chartHeight} ${line} ${padding.left + chartWidth},${padding.top + chartHeight}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ đường số lịch hẹn 7 ngày qua" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      {[0, 0.5, 1].map(level => {
        const y = padding.top + chartHeight * level;
        return <line key={level} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.09)" strokeDasharray="4 5" />;
      })}
      <polygon points={area} fill="url(#trend-fill)" />
      <polyline points={line} fill="none" stroke="#d4af37" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} r="5" fill="#101016" stroke="#f9dfa0" strokeWidth="2.5"><title>{`${shortDate(point.date)}: ${point.bookings} lịch hẹn`}</title></circle>
          <text x={point.x} y={height - 10} textAnchor="middle" fill="#9292a0" fontSize="11">{shortDate(point.date)}</text>
          {(index === 0 || index === points.length - 1 || point.bookings > 0) && <text x={point.x} y={point.y - 12} textAnchor="middle" fill="#f8e4a5" fontSize="11" fontWeight="700">{point.bookings}</text>}
        </g>
      ))}
      <defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#d4af37" stopOpacity="0.32" /><stop offset="1" stopColor="#d4af37" stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
}

function StatusDonut({ statusCounts }) {
  const entries = Object.keys(statusLabels).map(key => ({ key, value: Number(statusCounts?.[key] || 0) }));
  const total = entries.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(145px, 0.85fr) minmax(160px, 1.15fr)', alignItems: 'center', gap: '0.8rem' }}>
      <div style={{ position: 'relative', maxWidth: 180, width: '100%', justifySelf: 'center' }}>
        <svg viewBox="0 0 120 120" role="img" aria-label="Phân bố trạng thái lịch hẹn" style={{ width: '100%', display: 'block', transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="15" />
          {total > 0 && entries.map(item => {
            const length = (item.value / total) * circumference;
            const segment = <circle key={item.key} cx="60" cy="60" r={radius} fill="none" stroke={palette[item.key]} strokeWidth="15" strokeDasharray={`${Math.max(length - 3, 0)} ${circumference - Math.max(length - 3, 0)}`} strokeDashoffset={-cursor} strokeLinecap="round"><title>{`${statusLabels[item.key]}: ${item.value} đơn`}</title></circle>;
            cursor += length;
            return segment;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div><strong style={{ display: 'block', color: '#fff', fontSize: '1.45rem' }}>{total}</strong><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TỔNG ĐƠN</span></div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '0.62rem' }}>
        {entries.map(item => <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.82rem' }}><span style={{ color: '#d5d5df', display: 'flex', gap: '0.42rem', alignItems: 'center' }}><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: palette[item.key] }} />{statusLabels[item.key]}</span><strong style={{ color: palette[item.key] }}>{item.value}</strong></div>)}
      </div>
    </div>
  );
}

function ServiceBars({ services }) {
  const highest = Math.max(...services.map(item => Number(item.booking_count || 0)), 1);
  if (!services.length) return <div style={{ minHeight: 170, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có dữ liệu dịch vụ.</div>;
  return <div style={{ display: 'grid', gap: '0.95rem' }}>{services.map((item, index) => {
    const percent = (Number(item.booking_count || 0) / highest) * 100;
    return <div key={`${item.name}-${index}`}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem', marginBottom: '0.38rem' }}><span style={{ color: '#e7e7ee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span><strong style={{ color: 'var(--gold-light)', whiteSpace: 'nowrap' }}>{item.booking_count} lượt</strong></div><div style={{ height: 9, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}><div style={{ height: '100%', width: `${percent}%`, minWidth: item.booking_count ? 8 : 0, borderRadius: 99, background: 'linear-gradient(90deg, #9d4edd, #e8c768)' }} /></div></div>;
  })}</div>;
}

export default function AdminReportCharts({ stats }) {
  const trend = stats?.dailyTrend || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 0.9fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <ChartCard icon={TrendingUp} title="Xu hướng lịch hẹn" subtitle="Số lịch được tạo trong 7 ngày gần nhất"><TrendChart data={trend} /><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><CalendarDays size={14} /> Cập nhật theo ngày hẹn</div></ChartCard>
      <ChartCard icon={PieChart} title="Tỷ lệ trạng thái" subtitle="Toàn bộ lịch hẹn trong hệ thống"><StatusDonut statusCounts={stats?.statusCounts} /></ChartCard>
      <div style={{ gridColumn: '1 / -1' }}><ChartCard icon={BarChart3} title="Dịch vụ được đặt nhiều" subtitle="So sánh số lượt đặt của 5 dịch vụ dẫn đầu"><ServiceBars services={stats?.topServices || []} /></ChartCard></div>
    </div>
  );
}
