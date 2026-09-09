import React from 'react';
import { Sparkles, Calendar, Search, Shield, Phone, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenBookingModal }) {
  const { selectedServices, settings } = useBooking();
  const { user, logout } = useAuth();

  const scrollToSection = (id) => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 5, 18, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-gold)' }}>
      {/* Top Bar Banner */}
      {settings.notice_banner && (
        <div style={{ background: 'var(--gold-gradient)', color: '#0d041a', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', padding: '0.4rem 1rem' }}>
          {settings.notice_banner}
        </div>
      )}

      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d041a', fontWeight: 'bold' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700' }}>
              LUXURY
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px', background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Luxury Nails Spa
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('home')}
            style={{ background: 'none', border: 'none', color: activeTab === 'home' ? 'var(--gold-primary)' : 'var(--text-main)', fontWeight: activeTab === 'home' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Trang Chủ
          </button>

          <button 
            onClick={() => scrollToSection('collection')}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            BỘ SƯU TẬP
          </button>

          <button 
            onClick={() => scrollToSection('working-hours')}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            GIỜ LÀM VIỆC
          </button>

          <button 
            onClick={() => scrollToSection('contact')}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            LIÊN HỆ
          </button>

          <button 
            onClick={() => setActiveTab('services')}
            style={{ background: 'none', border: 'none', color: activeTab === 'services' ? 'var(--gold-primary)' : 'var(--text-main)', fontWeight: activeTab === 'services' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            DỊCH VỤ
          </button>

          <button 
            onClick={() => setActiveTab('my-bookings')}
            style={{ background: 'none', border: 'none', color: activeTab === 'my-bookings' ? 'var(--gold-primary)' : 'var(--text-main)', fontWeight: activeTab === 'my-bookings' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase' }}
          >
            <Search size={15} /> Lịch Đã Đặt
          </button>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Chào, <strong style={{ color: 'var(--gold-primary)' }}>{user.full_name}</strong> {user.role === 'admin' ? '(Admin)' : ''}
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="btn-outline-gold"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                >
                  <Shield size={14} /> Admin Panel
                </button>
              )}
              <button onClick={logout} className="btn-dark" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('login')} 
                className="btn-gold"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => setActiveTab('login')} 
                className="btn-dark"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Đăng ký
              </button>
            </>
          )}

          <button onClick={onOpenBookingModal} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Calendar size={16} />
            {selectedServices.length > 0 && (
              <span style={{ background: '#0d041a', color: 'var(--gold-primary)', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedServices.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
