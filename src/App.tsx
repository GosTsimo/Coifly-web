import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/Navigation';
import Hero from './sections/Hero';
import Features from './sections/Features';
import ForClients from './sections/ForClients';
import ForBarbers from './sections/ForBarbers';
import ForSalons from './sections/ForSalons';
import ForInvestors from './sections/ForInvestors';
import AppScreens from './sections/AppScreens';
import Download from './sections/Download';
import Footer from './components/Footer';
import SalonDetailPage from './pages/SalonDetailPage';
import BookingScreenPage from './pages/BookingScreenPage';
import LoginPage from './pages/LoginPage';
import HomeClientPage from './pages/HomeClientPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ClientSalonSearchPage from './pages/ClientSalonSearchPage';
import { AdminLayout } from './components/dashboard/AdminLayout';
import DashboardPage from './app/dashboard/page';
import UsersPage from './app/users/page';
import BarbersPage from './app/barbers/page';
import SalonsPage from './app/salons/page';
import BookingsPage from './app/bookings/page';
import ReviewsPage from './app/reviews/page';
import TicketsPage from './app/tickets/page';
import DevicesPage from './app/devices/page';
import AnalyticsPage from './app/analytics/page';
import SystemPage from './app/system/page';
import AuditPage from './app/audit/page';
import SettingsPage from './app/settings/page';

const queryClient = new QueryClient();

function HomePage() {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <ForClients />
        <ForBarbers />
        <ForSalons />
        <AppScreens />
        <ForInvestors />
        <Download />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/client/home" element={<HomeClientPage />} />
          <Route path="/client/salons" element={<ClientSalonSearchPage />} />
          <Route path="/client/bookings" element={<MyBookingsPage />} />
          <Route path="/salon/:slug" element={<SalonDetailPage />} />
          <Route path="/salon/:slug/booking" element={<BookingScreenPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="barbers" element={<BarbersPage />} />
            <Route path="salons" element={<SalonsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
