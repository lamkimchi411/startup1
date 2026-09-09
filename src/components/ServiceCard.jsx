import React from 'react';
import { Clock, Check, Plus, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ServiceCard({ service, onBookDirect }) {
  const { selectedServices, toggleServiceSelection } = useBooking();
  const isSelected = selectedServices.some(s => s.id === service.id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Service Image Header */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
        <img 
          src={service.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'} 
          alt={service.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span className="badge-gold">
            {service.category_name || 'Nail Art'}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '60px', background: 'linear-gradient(to top, rgba(24,24,31,1), transparent)' }}></div>
      </div>

      {/* Service Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '600' }}>
            {service.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            {service.description}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderTop: '1px border-solid #282835', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Clock size={15} style={{ color: 'var(--gold-primary)' }} />
              <span>{service.duration_minutes} phút</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--gold-light)' }}>
              {formatPrice(service.price)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
            <button
              onClick={() => toggleServiceSelection(service)}
              className={isSelected ? 'btn-gold' : 'btn-outline-gold'}
              style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            >
              {isSelected ? (
                <>
                  <Check size={16} /> Đã chọn
                </>
              ) : (
                <>
                  <Plus size={16} /> Chọn dịch vụ
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (!isSelected) toggleServiceSelection(service);
                if (onBookDirect) onBookDirect();
              }}
              title="Đặt ngay dịch vụ này"
              className="btn-dark"
              style={{ padding: '0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
