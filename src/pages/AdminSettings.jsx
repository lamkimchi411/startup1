import React, { useState, useEffect } from 'react';
import { Store, Phone, MapPin, Mail, Clock, Save, Image as ImageIcon, Upload, Layout, Plus, Trash2, Edit3, X, Sparkles } from 'lucide-react';
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

  // Gallery CRUD state
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryFormData, setGalleryFormData] = useState({ title: '', image_url: '' });
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);
  const [savingGalleryItem, setSavingGalleryItem] = useState(false);

  const [savingSalon, setSavingSalon] = useState(false);
  const [savingHome, setSavingHome] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchGallery = () => {
    setLoadingGallery(true);
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGalleryItems(data);
        }
      })
      .catch(err => console.error('Fetch gallery error:', err))
      .finally(() => setLoadingGallery(false));
  };

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

    // Fetch gallery items
    fetchGallery();
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

  // GALLERY CRUD HANDLERS
  const handleOpenAddGalleryModal = () => {
    setEditingGalleryItem(null);
    setGalleryFormData({ title: '', image_url: '' });
    setShowGalleryModal(true);
  };

  const handleOpenEditGalleryModal = (item) => {
    setEditingGalleryItem(item);
    setGalleryFormData({ title: item.title || '', image_url: item.image_url || '' });
    setShowGalleryModal(true);
  };

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingGalleryImg(true);
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

      setGalleryFormData(prev => ({ ...prev, image_url: result.url }));
      showToast('🖼️ Đã tải ảnh mẫu móng lên thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi tải ảnh');
    } finally {
      setUploadingGalleryImg(false);
    }
  };

  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();
    if (!galleryFormData.image_url) {
      alert('Vui lòng chọn hoặc nhập đường dẫn ảnh');
      return;
    }

    setSavingGalleryItem(true);
    try {
      const isEdit = Boolean(editingGalleryItem);
      const endpoint = isEdit ? `/api/gallery/${editingGalleryItem.id}` : '/api/gallery';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(galleryFormData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      showToast(isEdit ? '✏️ Đã cập nhật mẫu móng!' : '✨ Đã thêm mẫu móng mới vào Bộ sưu tập!');
      setShowGalleryModal(false);
      fetchGallery();
    } catch (err) {
      alert(err.message || 'Lỗi lưu mẫu móng');
    } finally {
      setSavingGalleryItem(false);
    }
  };

  const handleDeleteGalleryItem = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu móng "${title || 'này'}" khỏi Bộ sưu tập?`)) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      showToast('🗑️ Đã xóa mẫu móng khỏi Bộ sưu tập');
      fetchGallery();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa mẫu móng');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* SECTION 1: HOMEPAGE CRUD */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={24} style={{ color: 'var(--gold-primary)' }} /> QUẢN LÝ NỘI DUNG & BANNER TRANG CHỦ
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
              <label className="input-label">Ảnh Nền Banner Trang Chủ:</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Đường dẫn ảnh (https://...)"
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
                <div style={{ marginTop: '0.75rem', width: '140px', height: '85px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
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
              <label className="input-label">Mô tả Tiêu đề Bộ Sưu Tập:</label>
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

      {/* SECTION 2: HOMEPAGE GALLERY COLLECTION CRUD */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} style={{ color: 'var(--gold-primary)' }} /> BỘ SƯU TẬP MẪU MÓNG NỔI BẬT (GALLERY CRUD)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Quản lý danh sách các mẫu móng nghệ thuật hiển thị trong mục "Bộ Sưu Tập" ngoài Trang chủ
            </p>
          </div>

          <button onClick={handleOpenAddGalleryModal} className="btn-gold" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Thêm Mẫu Móng Mới
          </button>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-gold)' }}>
          {loadingGallery ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải danh sách bộ sưu tập...</div>
          ) : galleryItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Chưa có mẫu móng nào trong bộ sưu tập. Hãy bấm <strong>"Thêm Mẫu Móng Mới"</strong> để tạo!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {galleryItems.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    background: 'rgba(15, 7, 26, 0.7)',
                    borderRadius: '12px',
                    border: '1px solid rgba(157, 78, 221, 0.3)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={item.image_url} 
                      alt={item.title || 'Mẫu móng'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title || 'Mẫu Móng Art'}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button 
                        onClick={() => handleOpenEditGalleryModal(item)} 
                        className="btn-outline-gold" 
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <Edit3 size={13} /> Sửa
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)} 
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: SALON INFO SETTINGS */}
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

      {/* GALLERY ADD / EDIT MODAL */}
      {showGalleryModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="glass-card animate-scale-up" 
            style={{ 
              width: '100%', 
              maxWidth: '520px', 
              padding: '2rem', 
              border: '1px solid var(--border-gold-bright)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowGalleryModal(false)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1rem',
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} style={{ color: 'var(--gold-primary)' }} />
              {editingGalleryItem ? 'CHỈNH SỬA MẪU MÓNG BỘ SƯU TẬP' : 'THÊM MẪU MÓNG MỚI VÀO BỘ SƯU TẬP'}
            </h3>

            <form onSubmit={handleSaveGalleryItem}>
              <div className="input-group">
                <label className="input-label">Tên Mẫu Móng / Thiết Kế (Tùy chọn):</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Ví dụ: Sơn Gel Hàn Quốc Đính Đá VIP"
                  value={galleryFormData.title}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Hình Ảnh Mẫu Móng (*):</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Nhập link ảnh (https://...) hoặc tải file lên bên dưới"
                    value={galleryFormData.image_url}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, image_url: e.target.value })}
                    style={{ flex: 1 }}
                    required
                  />

                  <label className="btn-outline-gold" style={{ cursor: 'pointer', padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    <Upload size={14} /> {uploadingGalleryImg ? 'Đang tải...' : 'Tải Ảnh Mới'}
                    <input type="file" accept="image/*" onChange={handleGalleryFileUpload} style={{ display: 'none' }} disabled={uploadingGalleryImg} />
                  </label>
                </div>

                {galleryFormData.image_url && (
                  <div style={{ marginTop: '0.85rem', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                    <img src={galleryFormData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" onClick={() => setShowGalleryModal(false)} className="btn-dark" style={{ padding: '0.75rem 1.25rem' }}>
                  Hủy
                </button>
                <button type="submit" className="btn-gold" style={{ padding: '0.75rem 1.75rem' }} disabled={savingGalleryItem}>
                  <Save size={16} /> {savingGalleryItem ? 'Đang lưu...' : (editingGalleryItem ? 'LƯU CẬP NHẬT' : 'THÊM MẪU MÓNG')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
