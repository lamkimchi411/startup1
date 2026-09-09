import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import NotificationToast from './components/NotificationToast';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminBookings from './pages/AdminBookings';
import AdminSettings from './pages/AdminSettings';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState('dashboard'); // dashboard, users, services, bookings, settings
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Wrap setActiveTab to trigger data refresh when navigating to home
  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setRefreshKey(prev => prev + 1);
      fetchPublicServices();
    }
  };

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user, loading: authLoading } = useAuth();

  // Auto-redirect admin to dashboard when session is restored or after login
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin' && (activeTab === 'home' || activeTab === 'login')) {
      setActiveTab('admin');
    }
  }, [user, authLoading]);

  const fetchPublicServices = () => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error('Services fetch error:', err));
  };

  useEffect(() => {
    fetchPublicServices();
  }, []);

  const renderAdminView = () => {
    switch (adminSubTab) {
      case 'dashboard':
        return <AdminDashboard onNavigateTab={(tab) => setAdminSubTab(tab.replace('admin-', ''))} onServicesUpdated={fetchPublicServices} />;
      case 'users':
        return <AdminUsers />;
      case 'services':
        return <AdminServices onServicesUpdated={fetchPublicServices} />;
      case 'bookings':
        return <AdminBookings />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  // If in Admin mode and logged in as Admin, render dedicated AdminLayout
  if (activeTab === 'admin') {
    // While checking auth, show loading state instead of flashing login page
    if (authLoading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid rgba(157,78,221,0.2)', borderTopColor: 'var(--gold-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Đang xác thực phiên đăng nhập...</p>
          </div>
        </div>
      );
    }

    if (!user || user.role !== 'admin') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar 
            activeTab={activeTab} 
            setActiveTab={handleSetActiveTab} 
            onOpenBookingModal={() => setIsBookingModalOpen(true)} 
          />
          <main style={{ flex: 1 }}>
            <LoginPage setActiveTab={setActiveTab} />
          </main>
          <Footer />
          <NotificationToast />
        </div>
      );
    }

    return (
      <AdminLayout
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        onReturnHome={() => handleSetActiveTab('home')}
      >
        {renderAdminView()}
        <NotificationToast />
      </AdminLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab} 
        onOpenBookingModal={() => setIsBookingModalOpen(true)} 
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage 
            key={refreshKey}
            services={services} 
            setActiveTab={handleSetActiveTab} 
            onOpenBookingModal={() => setIsBookingModalOpen(true)} 
          />
        )}

        {activeTab === 'services' && (
          <ServicesPage 
            key={refreshKey}
            services={services} 
            categories={categories} 
            onOpenBookingModal={() => setIsBookingModalOpen(true)} 
          />
        )}

        {activeTab === 'my-bookings' && <MyBookingsPage setActiveTab={handleSetActiveTab} />}

        {activeTab === 'login' && <LoginPage setActiveTab={handleSetActiveTab} />}
      </main>

      <Footer />

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        allServices={services} 
      />

      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </AuthProvider>
  );
}
