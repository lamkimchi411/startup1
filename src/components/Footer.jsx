import React from 'react';
import { MapPin, Phone, Clock, Mail, Sparkles, Heart } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function Footer() {
  const { settings } = useBooking();

  return (
    <footer style={{ background: '#09090c', borderTop: '1px solid var(--border-gold)', padding: '4rem 0 2rem 0', marginTop: '4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Sparkles size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                {settings.salon_name}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', leading: '1.6' }}>
              Không gian làm đẹp móng cao cấp chuẩn 5 sao. Nơi trải nghiệm sự tỉ mỉ, thư thái và đẳng cấp dành cho vẻ đẹp của bạn.
            </p>
            <div className="badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} /> Phục vụ chuyên nghiệp & Tận tâm
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Thông Tin Liên Hệ
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>{settings.address}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span style={{ color: '#fff', fontWeight: '600' }}>{settings.phone}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Giờ Mở Cửa
            </h3>
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Thứ 2 – Chủ Nhật:</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: '600' }}>{settings.open_time} - {settings.close_time}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed #333', paddingTop: '0.5rem' }}>
                * Nhận lịch hẹn cuối cùng trước 1 tiếng so với giờ đóng cửa
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1a1a24', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div>© 2026 {settings.salon_name}. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with <Heart size={14} style={{ color: '#ef4444' }} /> for luxury nails experience
          </div>
        </div>
      </div>
    </footer>
  );
}
