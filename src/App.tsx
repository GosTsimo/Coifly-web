import { useEffect } from 'react';
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

function App() {
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Features Section */}
        <Features />
        
        {/* For Clients Section */}
        <ForClients />
        
        {/* For Barbers Section */}
        <ForBarbers />
        
        {/* For Salons Section */}
        <ForSalons />
        
        {/* App Screens Section */}
        <AppScreens />
        
        {/* For Investors Section */}
        <ForInvestors />
        
        {/* Download Section */}
        <Download />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
