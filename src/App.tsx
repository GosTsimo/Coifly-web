import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client/home" element={<HomeClientPage />} />
        <Route path="/client/bookings" element={<MyBookingsPage />} />
        <Route path="/salon/:slug" element={<SalonDetailPage />} />
        <Route path="/salon/:slug/booking" element={<BookingScreenPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
