import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [settings, setSettings] = useState({
    salon_name: 'LUXURY NAILS & SPA',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0908 123 456',
    email: 'contact@luxurynails.vn',
    open_time: '08:30',
    close_time: '20:30',
    cancel_deadline_hours: 4,
    notice_banner: '✨ Giảm ngay 20% cho quý khách đặt lịch trước qua Website!'
  });
  const [notification, setNotification] = useState(null);

  // Fetch shop settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.salon_name) setSettings(data);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const clearSelectedServices = () => setSelectedServices([]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedServices,
        toggleServiceSelection,
        clearSelectedServices,
        settings,
        setSettings,
        notification,
        showToast
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
