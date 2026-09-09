import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Power, RefreshCw, X, Sparkles, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function AdminServices({ onServicesUpdated }) {
  const { token } = useAuth();
  const { showToast } = useBooking();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service Edit / Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '1',
    description: '',
    price: '',
    duration_minutes: '45',
    image_url: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const fetchServicesData = () => {
    setLoading(true);
    fetch('/api/services?all=true')
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id?.toString() || '1',
      description: '',
      price: '150000',
      duration_minutes: '45',
      image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category_id: service.category_id ? service.category_id.toString() : '1',
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      image_url: service.image_url || '',
      is_active: service.is_active === 1
    });
    setModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration_minutes) {
      alert('Vui lòng nhập tên, giá và thời gian dịch vụ');
      return;
    }

    setSaving(true);
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể lưu dịch vụ');

      showToast(editingService ? 'Đã cập nhật dịch vụ' : 'Đã thêm dịch vụ mới');
      setModalOpen(false);
      fetchServicesData();
      if (onServicesUpdated) onServicesUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`/api/services/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Đã thay đổi trạng thái bật/tắt dịch vụ');
        fetchServicesData();
        if (onServicesUpdated) onServicesUpdated();
      }
    } catch (err) {
      alert('Lỗi thao tác');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Đã xóa dịch vụ');
        fetchServicesData();
        if (onServicesUpdated) onServicesUpdated();
      }
    } catch (err) {
      alert('Không thể xóa dịch vụ');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Danh Sách Dịch Vụ
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Thêm, sửa, xóa dịch vụ, điều chỉnh giá, thời gian làm và bật/tắt trạng thái hiển thị
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-gold">
          <Plus size={18} /> Thêm Dịch Vụ Mới
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
          <p>Đang tải danh sách dịch vụ...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #282835', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Hình Ảnh</th>
                  <th style={{ padding: '0.75rem' }}>Tên Dịch Vụ</th>
                  <th style={{ padding: '0.75rem' }}>Danh Mục</th>
                  <th style={{ padding: '0.75rem' }}>Giá Tiền</th>
                  <th style={{ padding: '0.75rem' }}>Thời Gian</th>
                  <th style={{ padding: '0.75rem' }}>Trạng Thái</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1a1a24' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <img 
                        src={s.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100&auto=format&fit=crop&q=80'} 
                        alt={s.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{s.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge-gold">{s.category_name || 'Khác'}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--gold-light)' }}>
                      {formatPrice(s.price)}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#ddd' }}>
                      {s.duration_minutes} phút
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        onClick={() => handleToggleActive(s.id)}
                        style={{
                          background: s.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: s.is_active ? '#34d399' : '#f87171',
                          border: s.is_active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '20px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Power size={12} /> {s.is_active ? 'Đang hoạt động' : 'Đã ẩn'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(s)} className="btn-dark" style={{ padding: '0.4rem 0.65rem' }} title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="btn-danger" style={{ padding: '0.4rem 0.65rem' }} title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SERVICE MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', border: '1px solid var(--border-gold-bright)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="input-group">
                <label className="input-label">Tên dịch vụ (*):</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="VD: Sơn Gel Mắt Mèo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Danh mục (*):</label>
                <select
                  className="custom-input"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Giá tiền (VNĐ) (*):</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="250000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Thời gian thực hiện (Phút) (*):</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="45"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Mô tả dịch vụ:</label>
                <textarea
                  className="custom-input"
                  rows={2}
                  placeholder="Mô tả các bước chăm sóc hoặc chất liệu sơn..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Hình ảnh mẫu (URL hoặc tải file lên trực tiếp):</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="https://... hoặc /uploads/img-..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <label className="btn-outline-gold" style={{ cursor: 'pointer', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    Tải Ảnh
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const data = new FormData();
                        data.append('image', file);
                        try {
                          const res = await fetch('/api/services/upload', {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: data
                          });
                          const result = await res.json();
                          if (res.ok) {
                            setFormData({ ...formData, image_url: result.url });
                            showToast('🖼️ Đã tải ảnh dịch vụ lên!');
                          }
                        } catch (err) {
                          alert('Lỗi tải ảnh');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary)' }}
                />
                <label htmlFor="is_active_check" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Hiển thị dịch vụ này trên trang đặt lịch của Khách hàng
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-dark">
                  Hủy
                </button>
                <button type="submit" className="btn-gold" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Dịch Vụ'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
