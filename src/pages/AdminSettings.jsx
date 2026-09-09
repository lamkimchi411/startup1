import React, { useState, useEffect } from 'react';
import { Store, Phone, MapPin, Mail, Clock, Save, Image as ImageIcon, Upload, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function AdminSettings() {
  const { token } = useAuth();
  const { settings, setSettings, showToast } = useBooking();

  // Salon info state
  const [formData, setFormData] = useState({
    salon_name: '',
    address: '',
    phone: '',
    email: '',
    open_time: '08:30',
    close_time: '20:30',
    cancel_deadline_hours: 4,
    notice_banner: ''
  });

  // Homepage content state
  const [homeData, setHomeData] = useState({
    hero_subtitle: 'LUXURY NAILS SPA',
    hero_title: 'Nâng tầm vẻ đẹp đôi tay bạn',
    hero_description: 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.',
    hero_image_url: '',
    working_hours_info: 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
    collection_info: 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
    contact_info: 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
  });

  const [savingSalon, setSavingSalon] = useState(false);
  const [savingHome, setSavingHome] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        salon_name: settings.salon_name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        open_time: settings.open_time || '08:30',
        close_time: settings.close_time || '20:30',
        cancel_deadline_hours: settings.cancel_deadline_hours || 4,
        notice_banner: settings.notice_banner || ''
      });
    }

    // Fetch homepage content
    fetch('/api/settings/homepage')
      .then(res => res.json())
      .then(data => {
        if (data && data.hero_title) {
          setHomeData(data);
        }
      })
      .catch(err => console.error('Fetch homepage data error:', err));
  }, [settings]);

  const handleSalonSubmit = async (e) => {
    e.preventDefault();
    setSavingSalon(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSettings(formData);
      showToast('⚙️ Cấu hình Salon đã được lưu thành công!');
    } catch (err) {
      alert(err.message || 'Không thể lưu cài đặt');
    } finally {
      setSavingSalon(false);
    }
  };

  const handleHomepageSubmit = async (e) => {
    e.preventDefault();
    setSavingHome(true);

    try {
      const res = await fetch('/api/settings/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(homeData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('✨ Nội dung Trang Chủ đã được cập nhật!');
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trang chủ');
    } finally {
      setSavingHome(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await fetch('/api/services/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setHomeData({ ...homeData, hero_image_url: result.url });
      showToast('🖼️ Đã tải ảnh lên thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* SECTION 1: HOMEPAGE CRUD */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={24} style={{ color: 'var(--gold-primary)' }} /> QUẢN LÝ NỘI DUNG & ẢNH TRANG CHỦ (HOMEPAGE CRUD)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Chỉnh sửa Tiêu đề Hero, Mô tả, Ảnh nền Banner và các Thông tin hiển thị ngoài Trang chủ
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-gold-bright)' }}>
          <form onSubmit={handleHomepageSubmit}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Dòng Tiêu Đề Nhỏ (Subtitle):</label>
                <input
                  type="text"
                  className="custom-input"
                  value={homeData.hero_subtitle}
                  onChange={(e) => setHomeData({ ...homeData, hero_subtitle: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tiêu Đề Chính (Hero Title) (*):</label>
                <input
                  type="text"
                  className="custom-input"
                  value={homeData.hero_title}
                  onChange={(e) => setHomeData({ ...homeData, hero_title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Mô Tả Giới Thiệu (Hero Description) (*):</label>
              <textarea
                className="custom-input"
                rows={3}
                value={homeData.hero_description}
                onChange={(e) => setHomeData({ ...homeData, hero_description: e.target.value })}
                required
              />
            </div>

            {/* Image Upload Block */}
            <div className="input-group">
              <label className="input-label">Ảnh Nền / Graphic Trang Chủ (File tải lên không bị mất khi F5):</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Đường dẫn ảnh (/uploads/img-...)"
                  value={homeData.hero_image_url}
                  onChange={(e) => setHomeData({ ...homeData, hero_image_url: e.target.value })}
                  style={{ flex: 1 }}
                />
                
                <label className="btn-outline-gold" style={{ cursor: 'pointer', padding: '0.75rem 1.25rem' }}>
                  <Upload size={16} /> {uploading ? 'Đang tải...' : 'Tải Ảnh Mới'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
              </div>

              {homeData.hero_image_url && (
                <div style={{ marginTop: '0.75rem', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                  <img src={homeData.hero_image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Thông tin Giờ Làm Việc hiển thị ở Trang chủ:</label>
              <input
                type="text"
                className="custom-input"
                value={homeData.working_hours_info}
                onChange={(e) => setHomeData({ ...homeData, working_hours_info: e.target.value })}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '1.75rem' }}>
              <label className="input-label">Mô tả Bộ Sưu Tập:</label>
              <input
                type="text"
                className="custom-input"
                value={homeData.collection_info}
                onChange={(e) => setHomeData({ ...homeData, collection_info: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-gold" style={{ padding: '0.85rem 2rem' }} disabled={savingHome}>
                <Save size={18} /> {savingHome ? 'Đang lưu...' : 'LƯU NỘI DUNG TRANG CHỦ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 2: SALON INFO SETTINGS */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Cấu Hình Thông Tin Tiệm & Ưu Đãi
          </h2>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-gold)' }}>
          <form onSubmit={handleSalonSubmit}>
            <div className="input-group">
              <label className="input-label">Tên Salon (*):</label>
              <div style={{ position: 'relative' }}>
                <Store size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.salon_name}
                  onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Địa chỉ salon (*):</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Hotline (*):</label>
                <input
                  type="text"
                  className="custom-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Banner Khuyến Mãi Đỉnh Trang:</label>
                <input
                  type="text"
                  className="custom-input"
                  value={formData.notice_banner}
                  onChange={(e) => setFormData({ ...formData, notice_banner: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-dark" style={{ padding: '0.85rem 2rem' }} disabled={savingSalon}>
                <Save size={18} /> {savingSalon ? 'Đang lưu...' : 'LƯU THÔNG TIN SALON'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
