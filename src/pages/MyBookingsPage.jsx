import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Phone, AlertCircle, XCircle, CheckCircle, RefreshCw, AlertTriangle, LogIn, Lock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function MyBookingsPage({ setActiveTab }) {
  const { showToast, settings } = useBooking();
  const { user, loading: authLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Auto-search when user is logged in and has phone
  useEffect(() => {
    if (user && user.phone) {
      setPhone(user.phone);
      // Auto search after setting phone
      searchByPhone(user.phone);
    }
  }, [user]);

  const searchByPhone = async (phoneNumber) => {
    if (!phoneNumber || !phoneNumber.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/lookup?phone=${encodeURIComponent(phoneNumber.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Không thể tra cứu');
      }

      setBookings(data.bookings || []);
      setSearched(true);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại để tra cứu');
      return;
    }
    await searchByPhone(phone);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelModalBooking.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          reason: cancelReason || 'Khách hàng hủy từ web'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể hủy lịch hẹn');
      }

      showToast('Đã hủy lịch hẹn thành công');
      setCancelModalBooking(null);
      setCancelReason('');
      handleSearch(); // Refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-status pending">⏳ Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="badge-status confirmed">✓ Đã xác nhận</span>;
      case 'completed':
        return <span className="badge-status completed">★ Đã hoàn thành</span>;
      case 'cancelled':
        return <span className="badge-status cancelled">✕ Đã hủy</span>;
      default:
        return null;
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container animate-fade-in" style={{ padding: '5rem 1.5rem', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
          <RefreshCw size={40} style={{ color: 'var(--gold-primary)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show login required screen
  if (!user) {
    return (
      <div className="container animate-fade-in" style={{ padding: '5rem 1.5rem', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', border: '1px solid var(--border-gold-bright)' }}>
          <div style={{ 
            width: '70px', height: '70px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, rgba(157,78,221,0.3), rgba(200,170,110,0.3))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem auto' 
          }}>
            <Lock size={32} style={{ color: 'var(--gold-primary)' }} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
            Yêu Cầu Đăng Nhập
          </h2>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Bạn cần <strong style={{ color: 'var(--gold-light)' }}>đăng nhập</strong> hoặc <strong style={{ color: 'var(--gold-light)' }}>tạo tài khoản</strong> để xem và quản lý lịch hẹn đã đặt của mình.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setActiveTab('login')} 
              className="btn-gold" 
              style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogIn size={18} /> Đăng Nhập Ngay
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'rgba(18,8,34,0.6)', border: '1px dashed rgba(157,78,221,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Chưa có tài khoản? Bấm đăng nhập rồi chọn tab <strong style={{ color: 'var(--gold-light)' }}>"ĐĂNG KÝ KHÁCH HÀNG"</strong> để tạo tài khoản mới.
          </div>
        </div>
      </div>
    );
  }

  // User IS logged in - show bookings page
  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
          Quản Lý & Tra Cứu Lịch Hẹn
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Xin chào <strong style={{ color: 'var(--gold-primary)' }}>{user.full_name}</strong>! Nhập số điện thoại đã dùng khi đặt lịch để kiểm tra hoặc hủy lịch hẹn.
        </p>
      </div>

      {/* Phone Lookup Card */}
      <div className="glass-card" style={{ maxWidth: '560px', margin: '0 auto 3rem auto', padding: '1.75rem' }}>
        <form onSubmit={handleSearch}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Số điện thoại khách hàng (*):</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                className="custom-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Nhập SĐT (Ví dụ: 0908123456)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-gold" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />} Tra Cứu Lịch Đã Đặt
          </button>
        </form>
      </div>

      {/* Results List */}
      {searched && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--gold-light)', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Danh Sách Lịch Hẹn ({bookings.length})
          </h2>

          {bookings.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ color: 'var(--gold-primary)', marginBottom: '0.75rem' }} />
              <h3>Không tìm thấy lịch hẹn nào với SĐT "{phone}"</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Vui lòng kiểm tra lại số điện thoại hoặc thực hiện đặt lịch mới.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookings.map(b => (
                <div key={b.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative', borderLeft: '4px solid var(--gold-primary)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #282835', paddingBottom: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--gold-light)', letterSpacing: '1px' }}>
                          {b.booking_code}
                        </span>
                        {renderStatusBadge(b.status)}
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                        Khách hàng: <strong>{b.customer_name}</strong> ({b.customer_phone})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold-primary)', fontSize: '1.2rem', fontWeight: '800' }}>
                        {formatPrice(b.total_price)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {b.total_duration} phút
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ddd' }}>
                      <Calendar size={16} style={{ color: 'var(--gold-primary)' }} />
                      <span>Ngày hẹn: <strong>{b.booking_date?.split('T')[0] || b.booking_date}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ddd' }}>
                      <Clock size={16} style={{ color: 'var(--gold-primary)' }} />
                      <span>Khung giờ: <strong>{b.booking_time}</strong></span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem', background: '#121217', padding: '0.85rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Dịch vụ đặt:</div>
                    <div style={{ color: '#fff', fontWeight: '500' }}>{b.service_names || 'Chăm sóc móng'}</div>
                    {b.notes && (
                      <div style={{ color: 'var(--gold-light)', fontSize: '0.8rem', marginTop: '0.4rem', borderTop: '1px dashed #282835', paddingTop: '0.4rem' }}>
                        Ghi chú: {b.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions for active bookings */}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #282835', paddingTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        * Có thể hủy trước {settings.cancel_deadline_hours || 4} tiếng so với giờ hẹn
                      </div>
                      <button 
                        onClick={() => setCancelModalBooking(b)} 
                        className="btn-danger" 
                        style={{ fontSize: '0.85rem' }}
                      >
                        Hủy Lịch Hẹn Này
                      </button>
                    </div>
                  )}

                  {b.status === 'cancelled' && b.cancel_reason && (
                    <div style={{ fontSize: '0.85rem', color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.85rem', borderRadius: '6px' }}>
                      Lý do hủy: {b.cancel_reason}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', border: '1px solid #ef4444' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={22} style={{ color: '#ef4444' }} /> Xác Nhận Hủy Lịch Hẹn
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Bạn có chắc chắn muốn hủy lịch hẹn <strong>{cancelModalBooking.booking_code}</strong> vào lúc <strong>{cancelModalBooking.booking_time} - {cancelModalBooking.booking_date?.split('T')[0]}</strong>?
            </p>

            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Lý do hủy lịch:</label>
              <textarea
                className="custom-input"
                rows={2}
                placeholder="VD: Có việc bận đột xuất..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setCancelModalBooking(null)} className="btn-dark">
                Trở lại
              </button>
              <button onClick={handleConfirmCancel} className="btn-danger" disabled={cancelling}>
                {cancelling ? 'Đang xử lý...' : 'Xác Nhận Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
