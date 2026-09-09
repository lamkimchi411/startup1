import React, { useState } from 'react';
import { Search, Calendar, Filter, Sparkles, ShoppingBag, X, ArrowRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { useBooking } from '../context/BookingContext';

export default function ServicesPage({ services = [], categories = [], onOpenBookingModal }) {
  const { selectedServices, clearSelectedServices } = useBooking();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category_id === parseInt(selectedCategory, 10);
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="badge-gold" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} /> MENU DỊCH VỤ & BẢNG GIÁ NIÊM YẾT
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
          Danh Sách Dịch Vụ Móng & Spa
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
          Quý khách có thể chọn 1 hoặc nhiều dịch vụ cùng lúc để đặt lịch hẹn tiện lợi!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Categories Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'btn-gold' : 'btn-dark'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Tất Cả Dịch Vụ
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={selectedCategory === cat.id.toString() ? 'btn-gold' : 'btn-dark'}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="custom-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.875rem' }}
            placeholder="Tìm tên dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Filter size={48} style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
          <h3>Không tìm thấy dịch vụ phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} onBookDirect={onOpenBookingModal} />
          ))}
        </div>
      )}

      {/* STICKY BOTTOM SELECTION FLOATING BAR (If 1 or more services selected) */}
      {selectedServices.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          width: '90%',
          maxWidth: '750px',
          background: 'rgba(20, 20, 26, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-gold-bright)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '1rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Đã chọn: <strong style={{ color: 'var(--gold-light)' }}>{selectedServices.length} dịch vụ</strong> ({totalDuration} phút)</span>
              <button onClick={clearSelectedServices} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                Xóa tất cả
              </button>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--gold-primary)' }}>
              TỔNG: {formatPrice(totalPrice)}
            </div>
          </div>

          <button onClick={onOpenBookingModal} className="btn-gold" style={{ padding: '0.85rem 1.75rem' }}>
            TIẾN HÀNH ĐẶT LỊCH NGAY <ArrowRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
}
