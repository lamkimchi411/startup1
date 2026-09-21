import React, { useState, useEffect } from 'react';

export default function HomePage({ services = [], setActiveTab, onOpenBookingModal }) {
  const [homepageContent, setHomepageContent] = useState({
    hero_subtitle: 'LUXURY NAILS SPA',
    hero_title: 'Nâng tầm vẻ đẹp đôi tay bạn',
    hero_description: 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.',
    hero_image_url: '',
    working_hours_info: 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
    collection_info: 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
    contact_info: 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
  });

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then(res => res.json())
      .then(data => {
        if (data && data.hero_title) {
          setHomepageContent(data);
        }
      })
      .catch(err => console.error('Fetch homepage error:', err));

    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryItems(data);
        }
      })
      .catch(err => console.error('Fetch gallery error:', err));
  }, []);

  const handleDaySelect = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const formattedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');

    onOpenBookingModal({ initialDate: formattedDate });
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

            {/* RIGHT QUICK BOOKING CARD */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-gold)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '1.25rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                  ĐẶT LỊCH HẸN
                </h3>

                {/* Inline Mini Calendar Widget (Step 1) */}
                <div style={{ background: 'rgba(12, 6, 22, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(157,78,221,0.2)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                    <span>&lt;</span>
                    <span style={{ fontWeight: '600' }}>Tháng {currentMonth + 1} {currentYear}</span>
                    <span>&gt;</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.75rem' }}>
                    {[...Array(daysInCurrentMonth)].map((_, i) => {
                      const day = i + 1;
                      const isPastDay = new Date(currentYear, currentMonth, day) < new Date(currentYear, currentMonth, currentDate.getDate());
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isPastDay}
                          onClick={() => handleDaySelect(day)}
                          style={{
                            background: 'transparent',
                            color: isPastDay ? '#555' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.35rem 0',
                            fontWeight: '400',
                            cursor: isPastDay ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(157,78,221,0.08)', border: '1px dashed rgba(157,78,221,0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                  📅 Bấm chọn <strong>Ngày làm móng</strong> để mở form đặt lịch riêng và chọn giờ, dịch vụ, thông tin khách hàng.
                </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {(galleryItems.length > 0 ? galleryItems : [
              { id: 1, title: 'Sơn Gel Hàn Quốc Cao Cấp', image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80' },
              { id: 2, title: 'Úp Móng Thạch Design VIP', image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80' },
              { id: 3, title: 'Hiệu Ứng Mắt Mèo Ombre', image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80' },
              { id: 4, title: 'Đắp Bột Khai Thấu Mới 2026', image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop&q=80' }
            ]).map((item, i) => (
              <div 
                key={item.id || i} 
                className="glass-card glass-card-hover" 
                style={{ 
                  overflow: 'hidden', 
                  height: '240px', 
                  borderRadius: '16px', 
                  position: 'relative',
                  padding: 0
                }}
              >
                <img 
                  src={item.image_url} 
                  alt={item.title || 'Collection'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {item.title && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, width: '100%',
                    background: 'linear-gradient(to top, rgba(10,5,20,0.9) 0%, rgba(10,5,20,0.4) 70%, transparent 100%)',
                    padding: '1rem 1.25rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {item.title}
                  </div>
                )}
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
