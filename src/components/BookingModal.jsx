import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, CheckCircle2, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function BookingModal({ isOpen, onClose, allServices = [], initialDate }) {
  const { selectedServices, toggleServiceSelection, clearSelectedServices, showToast } = useBooking();

  const [step, setStep] = useState(1); // 1: Select services & info, 2: Select Date/Time & Customer Info, 3: Review & Submit, 4: Success confirmation
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  // A date chosen from the quick calendar is carried into this separate booking form.
  useEffect(() => {
    if (isOpen && initialDate) {
      setSelectedDate(initialDate);
      setSelectedSlot('');
    }
  }, [isOpen, initialDate]);

  // Fetch available slots when date or duration changes
  useEffect(() => {
    if (isOpen && selectedDate) {
      setLoadingSlots(true);
      fetch(`/api/bookings/available-slots?date=${selectedDate}&duration=${totalDuration || 60}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data.slots || []);
          setLoadingSlots(false);
        })
        .catch(err => {
          console.error('Slots error:', err);
          setLoadingSlots(false);
        });
    }
  }, [isOpen, selectedDate, totalDuration]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedServices.length === 0) {
        alert('Vui lòng chọn ít nhất 1 dịch vụ');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        alert('Vui lòng chọn khung giờ hẹn còn trống');
        return;
      }
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Vui lòng nhập họ tên và số điện thoại của quý khách');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          booking_date: selectedDate,
          booking_time: selectedSlot,
          notes: notes,
          service_ids: selectedServices.map(s => s.id)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể đặt lịch');
      }

      setSuccessBooking(data.booking);
      setStep(4);
      clearSelectedServices();
      showToast(`🎉 Đặt lịch thành công! Mã đơn: ${data.booking.booking_code}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const resetForm = () => {
    setStep(1);
    setSuccessBooking(null);
    setSelectedSlot('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', border: '1px solid var(--border-gold-bright)' }}>
        
        {/* Close button */}
        <button 
          onClick={resetForm}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#22222d', border: '1px solid #333', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} /> LUXURY BOOKING EXPERIENCE
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {step === 4 ? 'Xác Nhận Đặt Lịch Thành Công' : 'Đặt Lịch Hẹn Dịch Vụ Móng'}
          </h2>
        </div>

        {/* Progress Bar Steps (if not success screen) */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 1 ? 'var(--gold-primary)' : 'var(--text-muted)' }}>
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 1 ? 'var(--gold-primary)' : '#252530', color: step >= 1 ? '#000' : '#888', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Chọn dịch vụ</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: step >= 2 ? 'var(--gold-primary)' : '#333' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 2 ? 'var(--gold-primary)' : 'var(--text-muted)' }}>
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 2 ? 'var(--gold-primary)' : '#252530', color: step >= 2 ? '#000' : '#888', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Ngày & Thông tin</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: step >= 3 ? 'var(--gold-primary)' : '#333' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 3 ? 'var(--gold-primary)' : 'var(--text-muted)' }}>
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 3 ? 'var(--gold-primary)' : '#252530', color: step >= 3 ? '#000' : '#888', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Xác nhận</span>
            </div>
          </div>
        )}

        {/* STEP 1: Select / Review Services */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-light)', marginBottom: '1rem' }}>
              Dịch vụ đã chọn ({selectedServices.length}):
            </h3>

            {selectedServices.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #333', borderRadius: '12px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <AlertCircle size={32} style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }} />
                <p>Bạn chưa chọn dịch vụ nào. Hãy chọn ít nhất 1 dịch vụ bên dưới hoặc từ danh sách dịch vụ!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {selectedServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#121217', border: '1px solid #282835', borderRadius: '10px' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{s.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {s.duration_minutes} phút
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: 'var(--gold-light)', fontWeight: '700' }}>{formatPrice(s.price)}</span>
                      <button onClick={() => toggleServiceSelection(s)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add other available services */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Thêm dịch vụ khác vào lịch hẹn:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {allServices.filter(s => !selectedServices.some(sel => sel.id === s.id)).map(s => (
                  <div 
                    key={s.id}
                    onClick={() => toggleServiceSelection(s)}
                    style={{ padding: '0.6rem 0.85rem', background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}
                  >
                    <span style={{ color: '#ddd' }}>{s.name}</span>
                    <span style={{ color: 'var(--gold-primary)', fontWeight: '600' }}>+{formatPrice(s.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212, 175, 55, 0.1)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-gold)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng thời gian ước tính:</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{totalDuration} phút</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng chi phí:</div>
                <div style={{ color: 'var(--gold-light)', fontSize: '1.3rem', fontWeight: '800' }}>{formatPrice(totalPrice)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNextStep} className="btn-gold" disabled={selectedServices.length === 0}>
                Tiếp Theo: Chọn Giờ & Thông Tin <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Date & Time Slot & Customer Info */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Date & Time Selection */}
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--gold-light)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={18} /> Chọn Ngày & Khung Giờ
                </h3>

                <div className="input-group">
                  <label className="input-label">Ngày hẹn:</label>
                  <input 
                    type="date"
                    className="custom-input"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Khung giờ còn trống ({totalDuration} phút):</label>
                  {loadingSlots ? (
                    <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang kiểm tra khung giờ...</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                      {availableSlots.map(slot => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          style={{
                            padding: '0.6rem 0.4rem',
                            borderRadius: '8px',
                            border: selectedSlot === slot.time ? '1px solid var(--gold-primary)' : '1px solid #2a2a38',
                            background: selectedSlot === slot.time ? 'var(--gold-gradient)' : slot.available ? '#1a1a24' : '#121217',
                            color: selectedSlot === slot.time ? '#000' : slot.available ? '#fff' : '#555',
                            fontWeight: selectedSlot === slot.time ? '700' : '400',
                            fontSize: '0.85rem',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info Form */}
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--gold-light)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} /> Thông Tin Khách Hàng
                </h3>

                <div className="input-group">
                  <label className="input-label">Họ và tên (*):</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    placeholder="Nguyễn Văn A" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Số điện thoại (*):</label>
                  <input 
                    type="tel" 
                    className="custom-input" 
                    placeholder="0908 123 456" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email (để nhận thông báo):</label>
                  <input 
                    type="email" 
                    className="custom-input" 
                    placeholder="khachhang@gmail.com" 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Ghi chú (Mẫu nail, kĩ thuật viên yêu thích...):</label>
                  <textarea 
                    className="custom-input" 
                    rows={2} 
                    placeholder="VD: Muốn đính đá màu hồng pastel, nhờ kĩ thuật viên tư vấn phom..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn-dark">
                <ArrowLeft size={18} /> Quay lại
              </button>
              <button onClick={handleNextStep} className="btn-gold">
                Xem lại & Xác nhận <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Final Confirmation */}
        {step === 3 && (
          <div>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-gold)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                XÁC NHẬN THÔNG TIN ĐẶT LỊCH
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #2a2a38', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span> <strong style={{ color: '#fff' }}>{customerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span> <strong style={{ color: 'var(--gold-light)' }}>{customerPhone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ngày hẹn:</span> <strong style={{ color: '#fff' }}>{selectedDate}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Khung giờ:</span> <strong style={{ color: 'var(--gold-light)' }}>{selectedSlot}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Các dịch vụ đã chọn:</div>
                {selectedServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ddd', padding: '0.25rem 0' }}>
                    <span>• {s.name} ({s.duration_minutes} phút)</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(s.price)}</span>
                  </div>
                ))}
              </div>

              {notes && (
                <div style={{ background: '#121217', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <strong>Ghi chú:</strong> {notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #333' }}>
                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>TỔNG THANH TOÁN DỰ KIẾN:</span>
                <span style={{ fontSize: '1.4rem', color: 'var(--gold-primary)', fontWeight: '800' }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn-dark">
                <ArrowLeft size={18} /> Chỉnh sửa
              </button>
              <button onClick={handleSubmitBooking} className="btn-gold" disabled={submitting}>
                {submitting ? 'Đang tạo lịch hẹn...' : 'XÁC NHẬN ĐẶT LỊCH'} <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation screen */}
        {step === 4 && successBooking && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              ĐẶT LỊCH THÀNH CÔNG!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Cảm ơn <strong>{successBooking.customer_name}</strong> đã lựa chọn dịch vụ của Luxury Nails & Spa!
            </p>

            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid var(--gold-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #333', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã Lịch Hẹn:</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '1px' }}>{successBooking.booking_code}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Ngày hẹn:</span> <strong>{successBooking.booking_date}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Giờ hẹn:</span> <strong>{successBooking.booking_time}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> <strong>{successBooking.customer_phone}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Tổng tiền:</span> <strong style={{ color: 'var(--gold-primary)' }}>{formatPrice(successBooking.total_price)}</strong></div>
              </div>
            </div>

            {/* Notification simulated status */}
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '0.85rem', color: '#60a5fa', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> Thông báo SMS / Zalo nhắc lịch đã được tự động gửi đến SĐT {successBooking.customer_phone}!
            </div>

            <button onClick={resetForm} className="btn-gold" style={{ width: '100%' }}>
              Hoàn Tất & Về Trang Chủ
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
