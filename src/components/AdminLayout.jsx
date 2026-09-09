import React from 'react';
import { LayoutDashboard, Users, Scissors, Calendar, Settings, Shield, Home, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ adminSubTab, setAdminSubTab, onReturnHome, children }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Báo cáo Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Quản lý Người dùng', icon: Users },
    { id: 'settings', label: 'Cài đặt Trang chủ & Tiệm', icon: Settings },
    { id: 'services', label: 'Quản lý Dịch vụ', icon: Scissors },
    { id: 'bookings', label: 'Quản lý Lịch hẹn', icon: Calendar },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside style={{
        width: '260px',
        background: 'rgba(18, 8, 34, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-gold)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div>
          {/* Admin Header Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(157,78,221,0.2)', marginBottom: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d041a', fontWeight: 'bold' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
                ADMIN PANEL
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                Luxury Nails Spa
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminSubTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--gold-gradient)' : 'transparent',
                    color: isActive ? '#0d041a' : 'var(--text-main)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ borderTop: '1px solid rgba(157,78,221,0.2)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* User Badge */}
          <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Admin: <strong style={{ color: 'var(--gold-primary)' }}>{user?.full_name || user?.username}</strong>
          </div>

          {/* Submit Return to Homepage Button */}
          <button
            onClick={onReturnHome}
            className="btn-outline-gold"
            style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem', justifyContent: 'flex-start' }}
          >
            <Home size={16} /> Quay về Trang chủ
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="btn-dark"
            style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
}
