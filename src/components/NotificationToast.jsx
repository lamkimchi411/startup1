import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function NotificationToast() {
  const { notification } = useBooking();

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 2000,
      background: 'rgba(20, 20, 26, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-gold-bright)',
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      color: '#fff',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      maxWidth: '400px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ color: 'var(--gold-primary)' }}>
        <Sparkles size={22} />
      </div>
      <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
        {notification.message}
      </div>
    </div>
  );
}
