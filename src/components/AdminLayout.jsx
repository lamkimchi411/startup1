import React from 'react';
import { LayoutDashboard, Users, Scissors, Calendar, Settings, Shield, Home, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Báo cáo tổng quan', icon: LayoutDashboard },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'settings', label: 'Cài đặt salon', icon: Settings },
  { id: 'services', label: 'Dịch vụ', icon: Scissors },
  { id: 'bookings', label: 'Lịch hẹn', icon: Calendar },
];

export default function AdminLayout({ adminSubTab, setAdminSubTab, onReturnHome, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-admin-mesh font-sans text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1720px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#100a19]/75 px-4 py-6 backdrop-blur-2xl lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3 px-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f6dfa7] via-[#d9a85b] to-[#9d4edd] text-[#170c20] shadow-glow"><Sparkles size={20} /></span>
              <div><p className="text-[10px] font-bold tracking-[0.22em] text-[#d7bc83]">ADMIN STUDIO</p><p className="font-display text-[15px] font-bold tracking-wide text-white">Luxury Nails</p></div>
            </div>
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/60">Quản trị</p>
            <nav className="space-y-1.5">
              {navItems.map(({ id, label, icon: Icon }) => {
                const active = adminSubTab === id;
                return <button key={id} onClick={() => setAdminSubTab(id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? 'bg-gradient-to-r from-[#f0d28e] to-[#c77dff] font-bold text-[#160c20] shadow-glow' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Icon size={18} strokeWidth={active ? 2.5 : 1.8} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#251132]" />}</button>;
              })}
            </nav>
          </div>
          <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-200/55">Đang đăng nhập</p><p className="mt-1 truncate text-sm font-semibold text-[#f8e5b8]">{user?.full_name || user?.username}</p></div>
            <button onClick={onReturnHome} className="flex w-full items-center gap-2 rounded-xl border border-[#e7c778]/30 px-3 py-2.5 text-sm font-semibold text-[#f2d68f] transition hover:bg-[#e7c778]/10"><Home size={16} />Trang chủ</button>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-400/10"><LogOut size={16} />Đăng xuất</button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-8 xl:px-10">
          <div className="mb-5 flex items-center justify-between lg:hidden"><div className="flex items-center gap-2 font-display text-lg font-bold"><Shield className="text-[#f1d58d]" size={19} />Luxury Nails</div><button onClick={logout} className="rounded-lg border border-white/10 p-2 text-rose-300"><LogOut size={17} /></button></div>
          {children}
        </main>
      </div>
    </div>
  );
}
