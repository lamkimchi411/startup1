import React, { useState } from 'react';
import { Shield, Lock, User, Phone, Mail, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function LoginPage({ setActiveTab }) {
  const { login } = useAuth();
  const { showToast } = useBooking();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login Form
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(loginUsername, loginPassword);
      if (user.role === 'admin') {
        showToast('🔑 Đăng nhập thành công! Chào mừng Quản Trị Viên.');
        setActiveTab('admin');
      } else {
        showToast(`🌸 Chào mừng khách hàng ${user.full_name} đã quay trở lại!`);
        setActiveTab('home');
      }
    } catch (err) {
      setError(err.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          full_name: regFullName,
          phone: regPhone,
          email: regEmail
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      localStorage.setItem('admin_token', data.token);
      showToast('🎉 Đăng ký tài khoản thành công!');
      window.location.reload(); // Refresh to restore session seamlessly
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', border: '1px solid var(--border-gold-bright)' }}>
        
        {/* Toggle Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(157,78,221,0.2)', marginBottom: '2rem' }}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--gold-primary)' : 'none',
              color: mode === 'login' ? 'var(--gold-primary)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <LogIn size={18} /> ĐĂNG NHẬP
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--gold-primary)' : 'none',
              color: mode === 'register' ? 'var(--gold-primary)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <UserPlus size={18} /> ĐĂNG KÝ KHÁCH HÀNG
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label className="input-label">Tên tài khoản (*):</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Nhập tên tài khoản"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Mật khẩu (*):</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Nhập mật khẩu"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>

            <div style={{ marginTop: '1.5rem', background: 'rgba(18,8,34,0.6)', border: '1px dashed rgba(157,78,221,0.3)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>💡 Tài khoản Admin mặc định:</div>
              <div style={{ color: 'var(--gold-light)', fontWeight: '600', marginTop: '0.2rem' }}>
                Username: <code style={{ background: '#222', padding: '2px 6px', borderRadius: '4px' }}>admin</code> | Pass: <code style={{ background: '#222', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label className="input-label">Họ và Tên (*):</label>
              <input
                type="text"
                className="custom-input"
                placeholder="Nguyễn Văn A"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Số điện thoại (*):</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="0908 123 456"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Tên đăng nhập (*):</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="username_khach"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Mật khẩu (*):</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="custom-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Tạo mật khẩu"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN MỚI'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
