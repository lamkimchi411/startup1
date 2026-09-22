import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calendar, CheckCircle2, DollarSign, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminReportCharts from '../components/AdminReportCharts';

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
const statusText = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
const statusStyles = { pending: 'border-amber-300/20 bg-amber-300/10 text-amber-200', confirmed: 'border-blue-300/20 bg-blue-300/10 text-blue-200', completed: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200', cancelled: 'border-rose-300/20 bg-rose-300/10 text-rose-200' };

function MetricCard({ label, value, note, icon: Icon, accent }) {
  return <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full blur-2xl ${accent}`} />
    <div className="relative flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-violet-200/65">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-white xl:text-[1.7rem]">{value}</p><p className="mt-1.5 text-xs text-slate-400">{note}</p></div><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-[#f1d58d]"><Icon size={20} /></span></div>
  </article>;
}

export default function AdminDashboard({ onNavigateTab }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, [token]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#efd792]/30 bg-[#efd792]/10 text-[#f1d58d]"><RefreshCw className="animate-spin" size={24} /></span><p className="text-sm text-violet-100/65">Đang chuẩn bị báo cáo của bạn...</p></div></div>;

  return <div className="animate-fade-in mx-auto max-w-7xl">
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e5c878]">Luxury Nails · Workspace</p><h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Báo cáo tổng quan</h1><p className="mt-2 text-sm text-slate-400">Nắm nhanh tình hình vận hành salon và các lịch hẹn mới nhất.</p></div>
      <button onClick={fetchStats} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#efd792]/25 bg-[#efd792]/10 px-4 py-2.5 text-sm font-semibold text-[#f7dfa0] transition hover:border-[#efd792]/50 hover:bg-[#efd792]/20"><RefreshCw size={16} />Cập nhật dữ liệu</button>
    </header>

    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Doanh thu hôm nay" value={formatMoney(stats?.revenueToday)} note="Đơn đã hoàn thành hôm nay" icon={DollarSign} accent="bg-emerald-400/20" />
      <MetricCard label="Lịch hẹn hôm nay" value={`${stats?.todayBookings || 0} lịch`} note="Tổng lượt khách đặt hôm nay" icon={Calendar} accent="bg-[#eac96b]/20" />
      <MetricCard label="Tổng doanh thu" value={formatMoney(stats?.revenueTotal)} note="Từ tất cả đơn đã hoàn thành" icon={TrendingUp} accent="bg-violet-400/20" />
      <MetricCard label="Tổng lịch hẹn" value={`${stats?.totalBookings || 0} lượt`} note="Kể từ khi bắt đầu hoạt động" icon={Users} accent="bg-sky-400/20" />
    </section>

    <AdminReportCharts stats={stats} />

    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-card backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-lg font-bold text-white">Lịch hẹn mới đặt</h2><p className="mt-1 text-xs text-slate-400">Các yêu cầu gần nhất cần được theo dõi.</p></div><button onClick={() => onNavigateTab('admin-bookings')} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[#f3d69d] transition hover:text-white sm:self-auto">Xem tất cả <ArrowUpRight size={16} /></button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/[0.035] text-[11px] font-bold uppercase tracking-[0.1em] text-violet-100/55"><tr><th className="px-5 py-3.5">Mã hẹn</th><th className="px-5 py-3.5">Khách hàng</th><th className="px-5 py-3.5">Thời gian</th><th className="px-5 py-3.5">Dịch vụ</th><th className="px-5 py-3.5">Thanh toán</th><th className="px-5 py-3.5">Trạng thái</th></tr></thead><tbody className="divide-y divide-white/[0.07]">{stats?.recentBookings?.length ? stats.recentBookings.map(b => <tr key={b.id} className="transition hover:bg-white/[0.035]"><td className="px-5 py-4 font-semibold text-[#f3d69d]">{b.booking_code}</td><td className="px-5 py-4"><p className="font-medium text-white">{b.customer_name}</p><p className="mt-0.5 text-xs text-slate-500">{b.customer_phone}</p></td><td className="px-5 py-4 text-slate-300"><p>{b.booking_date?.split('T')[0]}</p><p className="mt-0.5 text-xs text-slate-500">{b.booking_time}</p></td><td className="max-w-[220px] truncate px-5 py-4 text-slate-400">{b.service_names || 'Chưa chọn'}</td><td className="px-5 py-4 font-semibold text-white">{formatMoney(b.total_price)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[b.status] || statusStyles.pending}`}>{statusText[b.status] || b.status}</span></td></tr>) : <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400"><CheckCircle2 className="mx-auto mb-3 text-violet-300/50" />Chưa có lịch hẹn nào.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}
