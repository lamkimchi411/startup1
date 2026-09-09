import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle, Eye, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function AdminBookings() {
  const { token } = useAuth();
  const { showToast } = useBooking();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected booking for view detail
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    let url = '/api/bookings?';
    if (filterDate) url += `date=${filterDate}&`;
    if (filterStatus && filterStatus !== 'all') url += `status=${filterStatus}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [filterDate, filterStatus, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast(`Đã cập nhật trạng thái đơn thành '${newStatus}'`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      alert(err.message);
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Lịch Hẹn Đặt Trước
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Theo dõi danh sách khách hàng đặt lịch theo ngày, duyệt đơn và thay đổi trạng thái
          </p>
        </div>

        <button onClick={fetchBookings} className="btn-dark" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1 }}>
          
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Tìm theo tên, SĐT hoặc Mã đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ngày:</span>
            <input
              type="date"
              className="custom-input"
              style={{ width: '160px' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button type="button" onClick={() => setFilterDate('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>
                Xóa ngày
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trạng thái:</span>
            <select
              className="custom-input"
              style={{ width: '160px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả đơn</option>
              <option value="pending">⏳ Chờ xác nhận</option>
              <option value="confirmed">✓ Đã xác nhận</option>
              <option value="completed">★ Đã hoàn thành</option>
              <option value="cancelled">✕ Đã hủy</option>
            </select>
          </div>

          <button type="submit" className="btn-gold" style={{ padding: '0.6rem 1.25rem' }}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #282835', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Mã Hẹn</th>
                  <th style={{ padding: '0.75rem' }}>Khách Hàng</th>
                  <th style={{ padding: '0.75rem' }}>Số Điện Thoại</th>
                  <th style={{ padding: '0.75rem' }}>Ngày & Giờ</th>
                  <th style={{ padding: '0.75rem' }}>Dịch Vụ</th>
                  <th style={{ padding: '0.75rem' }}>Tổng Tiền</th>
                  <th style={{ padding: '0.75rem' }}>Trạng Thái</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không có lịch hẹn nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #1a1a24' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--gold-light)' }}>{b.booking_code}</td>
                      <td style={{ padding: '0.75rem', color: '#fff', fontWeight: '500' }}>{b.customer_name}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--gold-primary)' }}>{b.customer_phone}</td>
                      <td style={{ padding: '0.75rem', color: '#ddd' }}>
                        <div>{b.booking_date?.split('T')[0]}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.booking_time} ({b.total_duration} phút)</div>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.service_names}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--gold-light)' }}>
                        {formatPrice(b.total_price)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {renderStatusBadge(b.status)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button onClick={() => setSelectedBooking(b)} className="btn-dark" style={{ padding: '0.4rem 0.65rem' }} title="Xem chi tiết">
                            <Eye size={16} />
                          </button>

                          {/* Quick action buttons */}
                          {b.status === 'pending' && (
                            <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="btn-gold" style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }} title="Xác nhận lịch">
                              Duyệt
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button onClick={() => handleUpdateStatus(b.id, 'completed')} className="btn-gold" style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', background: '#10b981', color: '#fff' }} title="Đã hoàn thành">
                              Xong
                            </button>
                          )}

                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <button onClick={() => handleUpdateStatus(b.id, 'cancelled')} className="btn-danger" style={{ padding: '0.4rem 0.65rem' }} title="Hủy đơn">
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '580px', padding: '2rem', border: '1px solid var(--border-gold-bright)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #282835', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--gold-light)' }}>
                  Chi Tiết Đơn {selectedBooking.booking_code}
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  {renderStatusBadge(selectedBooking.status)}
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="btn-dark" style={{ padding: '0.4rem 0.8rem' }}>
                Đóng
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Khách hàng:</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{selectedBooking.customer_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Số điện thoại:</div>
                <div style={{ color: 'var(--gold-primary)', fontWeight: '600' }}>{selectedBooking.customer_phone}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Ngày hẹn:</div>
                <div style={{ color: '#fff' }}>{selectedBooking.booking_date?.split('T')[0]}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Khung giờ:</div>
                <div style={{ color: 'var(--gold-light)', fontWeight: '600' }}>{selectedBooking.booking_time} ({selectedBooking.total_duration} phút)</div>
              </div>
            </div>

            <div style={{ background: '#121217', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Danh sách dịch vụ:</div>
              <div style={{ color: '#fff', fontWeight: '500', fontSize: '0.95rem' }}>{selectedBooking.service_names}</div>
            </div>

            {selectedBooking.notes && (
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid var(--border-gold)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: 'var(--gold-light)' }}>Ghi chú từ Khách hàng:</strong>
                <p style={{ color: '#ddd', marginTop: '0.25rem' }}>{selectedBooking.notes}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #282835' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng thanh toán:</div>
                <div style={{ fontSize: '1.4rem', color: 'var(--gold-primary)', fontWeight: '800' }}>
                  {formatPrice(selectedBooking.total_price)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Đã Xác Nhận
                </button>
                <button onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')} className="btn-dark" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#34d399' }}>
                  Hoàn Thành
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
