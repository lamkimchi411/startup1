import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Sparkles, ChevronRight, Clock, MapPin, Phone, CheckCircle, Scissors } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ services = [], setActiveTab, onOpenBookingModal }) {
  const { settings, toggleServiceSelection, selectedServices } = useBooking();
  const { user } = useAuth();

  const [homepageContent, setHomepageContent] = useState({
    hero_subtitle: 'LUXURY NAILS SPA',
    hero_title: 'Nâng tầm vẻ đẹp đôi tay bạn',
    hero_description: 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.',
    hero_image_url: '',
    working_hours_info: 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
    collection_info: 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
    contact_info: 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
  });

  // Calendar & Booking Step State
  const [selectedDay, setSelectedDay] = useState(null); // null until user selects a date
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const bookingCardRef = useRef(null);

  // Click outside booking card to collapse
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bookingCardRef.current && !bookingCardRef.current.contains(e.target)) {
        setSelectedDay(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then(res => res.json())
      .then(data => {
        if (data && data.hero_title) {
          setHomepageContent(data);
        }
      })
      .catch(err => console.error('Fetch homepage error:', err));
  }, []);

  const handleFinalSubmitBooking = () => {
    // If a service was chosen in dropdown and not yet in selectedServices, select it
    if (selectedServiceId) {
      const found = services.find(s => s.id.toString() === selectedServiceId.toString());
      if (found && !selectedServices.some(s => s.id === found.id)) {
        toggleServiceSelection(found);
      }
    }
    onOpenBookingModal();
  };

  const featuredServices = services.slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* HERO SECTION - 2 COLUMN GRID MATCHING MOCKUP */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'stretch' }}>
            
            {/* LEFT HERO CARD */}
            <div className="glass-card" style={{
              padding: '3.5rem 3rem',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '440px',
              border: '1px solid var(--border-gold-bright)'
            }}>
              {/* Hero Background Image */}
              {homepageContent.hero_image_url && (
                <>
                  <img 
                    src={homepageContent.hero_image_url} 
                    alt="Hero background"
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      objectFit: 'cover',
                      zIndex: 0
                    }}
                  />
                  {/* Dark overlay for text readability */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, rgba(10,4,20,0.88) 0%, rgba(20,8,40,0.75) 50%, rgba(10,4,20,0.65) 100%)',
                    zIndex: 1
                  }}></div>
                </>
              )}

              {/* Background Orb Graphic Accent */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(199, 125, 255, 0.4) 0%, rgba(123, 44, 191, 0.15) 50%, transparent 80%)',
                filter: 'blur(20px)',
                pointerEvents: 'none',
                zIndex: 2
              }}></div>

              <div style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--gold-primary)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                position: 'relative',
                zIndex: 3
              }}>
                {homepageContent.hero_subtitle || 'LUXURY NAILS SPA'}
              </div>

              <h1 style={{
                fontSize: '3rem',
                fontWeight: '700',
                lineHeight: '1.2',
                color: '#ffffff',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-heading)',
                position: 'relative',
                zIndex: 3
              }}>
                {homepageContent.hero_title || 'Nâng tầm vẻ đẹp đôi tay bạn'}
              </h1>

              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-muted)',
                lineHeight: '1.7',
                maxWidth: '520px',
                marginBottom: '2rem',
                position: 'relative',
                zIndex: 3
              }}>
                {homepageContent.hero_description || 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.'}
              </p>
            </div>

            {/* RIGHT QUICK BOOKING CARD WITH CONDITIONAL STEP VISIBILITY */}
            <div ref={bookingCardRef} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-gold)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '1.25rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                  ĐẶT LỊCH HẸN
                </h3>

                {/* Inline Mini Calendar Widget (Step 1) */}
                <div style={{ background: 'rgba(12, 6, 22, 0.7)', padding: '1rem', borderRadius: '12px', border: selectedDay !== null ? '1px solid var(--gold-primary)' : '1px solid rgba(157,78,221,0.2)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                    <span>&lt;</span>
                    <span style={{ fontWeight: '600' }}>Tháng {new Date().getMonth() + 1} 2026</span>
                    <span>&gt;</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.75rem' }}>
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const isSelected = day === selectedDay;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          style={{
                            background: isSelected ? 'var(--gold-gradient)' : 'transparent',
                            color: isSelected ? '#0d041a' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.35rem 0',
                            fontWeight: isSelected ? '700' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CONDITIONAL STEP 2: SHOW TIME SLOTS, SERVICE SELECTOR & SUBMIT BUTTON ONLY IF A DATE IS SELECTED */}
                {selectedDay === null ? (
                  <div style={{ background: 'rgba(157,78,221,0.08)', border: '1px dashed rgba(157,78,221,0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                    📅 Vui lòng bấm chọn <strong>Ngày làm móng</strong> trên lịch ở trên để hiện bước chọn giờ & dịch vụ.
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Selected Date Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(168,85,247,0.15)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>
                        ✔ Đã chọn: <strong style={{ color: 'var(--gold-primary)' }}>Ngày {selectedDay} Tháng {new Date().getMonth() + 1}</strong>
                      </span>
                      <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Đổi ngày
                      </button>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ⏰ CHỌN KHUNG GIỜ LÀM MÓNG:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '5:00 PM'].map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedSlot(time)}
                            className={selectedSlot === time ? 'btn-gold' : 'btn-dark'}
                            style={{ padding: '0.45rem 0.25rem', fontSize: '0.8rem', borderRadius: '6px', textAlign: 'center' }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Service Selector */}
                    <div>
                      <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        💅 CHỌN DỊCH VỤ (TÙY CHỌN):
                      </label>
                      <select
                        className="custom-input"
                        style={{ padding: '0.65rem', fontSize: '0.85rem' }}
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                      >
                        <option value="">-- Tất cả dịch vụ (Chọn sau) --</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({Number(s.price).toLocaleString('vi-VN')}đ)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Final Submit Booking Button */}
                    <button
                      onClick={handleFinalSubmitBooking}
                      className="btn-gold"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--purple-glow)'
                      }}
                    >
                      <Calendar size={18} /> ĐẶT LỊCH HẸN ({selectedSlot})
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED SERVICES SECTION (`DỊCH VỤ NỔI BẬT`) */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>
              DỊCH VỤ NỔI BẬT
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {featuredServices.map((service, idx) => (
              <div 
                key={service.id} 
                className="glass-card glass-card-hover"
                style={{ 
                  padding: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: idx === 2 ? '1px solid var(--gold-primary)' : '1px solid var(--border-gold)',
                  boxShadow: idx === 2 ? 'var(--purple-glow)' : 'none',
                  overflow: 'hidden'
                }}
              >
                {/* Service Image */}
                <div style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={service.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'} 
                    alt={service.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {/* Price badge overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(10, 5, 20, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--gold-light)',
                    border: '1px solid rgba(199,125,255,0.3)'
                  }}>
                    {service.price ? Number(service.price).toLocaleString('vi-VN') : '500,000'}đ
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '0.95rem', fontWeight: '700', color: '#fff', textTransform: 'uppercase', 
                      marginBottom: '0.4rem', fontFamily: 'var(--font-heading)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {service.name}
                    </h3>

                    <p style={{ 
                      fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {service.description}
                    </p>
                  </div>

                  {idx === 2 ? (
                    <button onClick={onOpenBookingModal} className="btn-gold" style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}>
                      ĐẶT NGAY
                    </button>
                  ) : (
                    <button onClick={onOpenBookingModal} className="btn-outline-gold" style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}>
                      Chọn dịch vụ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COLLECTION SECTION */}
      <section id="collection" style={{ padding: '3.5rem 0', background: 'rgba(15,7,26,0.6)', borderTop: '1px solid rgba(157,78,221,0.15)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
              BỘ SƯU TẬP MẪU MÓNG ART 2026
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {homepageContent.collection_info}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop&q=80'
            ].map((img, i) => (
              <div key={i} className="glass-card glass-card-hover" style={{ overflow: 'hidden', height: '220px', borderRadius: '16px' }}>
                <img src={img} alt="Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKING HOURS & CONTACT SECTION */}
      <section id="working-hours" style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--gold-primary)' }}>
                <Clock size={24} />
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>GIỜ LÀM VIỆC</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                {homepageContent.working_hours_info}
              </p>
            </div>

            <div id="contact" className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--gold-primary)' }}>
                <MapPin size={24} />
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>THÔNG TIN LIÊN HỆ</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                {homepageContent.contact_info}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
