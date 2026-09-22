import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Eye, EyeOff, Check, X, Shield, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const { showToast } = useBooking();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Currently editing user ID (or 'new' for adding user)
  const [editingId, setEditingId] = useState(null);

  // Edit/Add Form State
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsersList(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStartAdd = () => {
    setEditingId('new');
    setFormData({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer'
    });
    setShowPassword(false);
  };

  const handleStartEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      full_name: u.full_name || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '', // leave empty unless changing
      role: u.role || 'customer'
    });
    setShowPassword(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.username) {
      alert('Vui lòng nhập họ tên và tên đăng nhập');
      return;
    }
    if (editingId === 'new' && !formData.password) {
      alert('Vui lòng nhập mật khẩu cho tài khoản mới');
      return;
    }

    setSaving(true);
    try {
      const isNew = editingId === 'new';
      const url = isNew ? '/api/users' : `/api/users/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Máy chủ phản hồi không hợp lệ (HTTP ${res.status}). Vui lòng thử lại.`);
      }
      if (!res.ok) throw new Error(data.message || 'Lỗi thao tác');

      showToast(isNew ? '✨ Tạo người dùng mới thành công!' : '✔ Cập nhật thông tin thành công!');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('User save error:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Máy chủ phản hồi không hợp lệ (HTTP ${res.status}). Vui lòng thử lại.`);
      }
      if (!res.ok) throw new Error(data.message || 'Không thể xóa');

      showToast('🗑️ Đã xóa người dùng thành công');
      fetchUsers();
    } catch (err) {
      console.error('User delete error:', err);
      alert(err.message);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} style={{ color: 'var(--gold-primary)' }} /> QUẢN LÝ NGƯỜI DÙNG
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Xem danh sách, phân quyền Admin/Khách hàng, chỉnh sửa thông tin hoặc xóa tài khoản
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '2.2rem', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.85rem', width: '220px' }}
              placeholder="Tìm theo tên, SĐT, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={handleStartAdd} className="btn-gold" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
            <UserPlus size={16} /> Thêm Người Dùng
          </button>
        </div>
      </div>

      {/* NEW USER CREATION CARD */}
      {editingId === 'new' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid var(--border-gold-bright)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--gold-primary)', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '1px' }}>
            THÊM NGƯỜI DÙNG MỚI
          </div>

          <form onSubmit={handleSaveUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Họ và Tên (*)"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Tên đăng nhập (*)"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <input
                  type="email"
                  className="custom-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="custom-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Mật khẩu (*)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <select
                  className="custom-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-gold" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }} disabled={saving}>
                {saving ? 'Đang tạo...' : 'TẠO TÀI KHOẢN'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-dark" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                HỦY
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USER LIST CARDS MATCHING EXACT USER SCREENSHOT */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
          <p>Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredUsers.map((u) => {
            const isEditing = editingId === u.id;

            return (
              <div
                key={u.id}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  border: isEditing ? '1px solid var(--border-gold-bright)' : '1px solid var(--border-gold)',
                  boxShadow: isEditing ? 'var(--purple-glow)' : 'var(--shadow-card)'
                }}
              >
                {/* Header User Card Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isEditing ? '1.5rem' : '0' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '0.2rem' }}>
                      {u.full_name || 'Chưa cập nhật tên'}
                    </h2>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      @{u.username} | {u.email || 'Chưa có email'} | {u.phone || 'Chưa có SĐT'}
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: u.role === 'admin' ? 'var(--gold-primary)' : '#c084fc' }}>
                      VAI TRÒ: {u.role === 'admin' ? 'ADMIN' : 'KHÁCH HÀNG'}
                    </div>
                  </div>

                  {/* Top Right Action Buttons (SỬA / XÓA) matching screenshot */}
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleStartEdit(u)}
                        style={{
                          background: '#f0c27b',
                          color: '#0d041a',
                          border: 'none',
                          padding: '0.45rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SỬA
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        style={{
                          background: 'transparent',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '0.45rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        XÓA
                      </button>
                    </div>
                  )}
                </div>

                {/* EXPANDABLE EDIT FORM MATCHING EXACT SCREENSHOT */}
                {isEditing && (
                  <div style={{ borderTop: '1px dashed rgba(157,78,221,0.3)', paddingTop: '1.25rem', marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--gold-primary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>
                      CẬP NHẬT THÔNG TIN
                    </div>

                    <form onSubmit={handleSaveUser}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <input
                            type="text"
                            className="custom-input"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <input
                            type="text"
                            className="custom-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <input
                            type="email"
                            className="custom-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <input
                            type="text"
                            className="custom-input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="custom-input"
                            style={{ paddingRight: '2.5rem' }}
                            placeholder="Mật khẩu mới (Để trống nếu không đổi)"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <select
                            className="custom-input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          >
                            <option value="customer">Khách hàng</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="submit"
                          className="btn-gold"
                          style={{ padding: '0.55rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}
                          disabled={saving}
                        >
                          {saving ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn-dark"
                          style={{ padding: '0.55rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}
                        >
                          HỦY
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
