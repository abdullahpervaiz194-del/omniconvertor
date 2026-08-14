import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PricingPage } from './pages/PricingPage';
import { AdminPage } from './pages/AdminPage';
import { ConverterPage } from './pages/ConverterPage';
import { CONVERTERS } from './config/converters';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProModal } from './components/auth/ProModal';
import { HistoryDrawer } from './components/auth/HistoryDrawer';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'images' || hash === 'image') return 'image';
    if (hash === 'documents' || hash === 'document' || hash === 'docs') return 'document';
    if (hash === 'multimedia' || hash === 'media' || hash === 'video' || hash === 'audio') return 'multimedia';
    return 'all';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'images' || hash === 'image') setSelectedCategory('image');
      else if (hash === 'documents' || hash === 'document' || hash === 'docs') setSelectedCategory('document');
      else if (hash === 'multimedia' || hash === 'media' || hash === 'video' || hash === 'audio') setSelectedCategory('multimedia');
      else if (path === '/') setSelectedCategory('all');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    if (route.startsWith('/#') || route.startsWith('#')) {
      const hashKey = route.replace('/#', '').replace('#', '').toLowerCase();
      let cat = 'all';
      if (hashKey === 'images' || hashKey === 'image') cat = 'image';
      else if (hashKey === 'documents' || hashKey === 'document' || hashKey === 'docs') cat = 'document';
      else if (hashKey === 'multimedia' || hashKey === 'media' || hashKey === 'video' || hashKey === 'audio') cat = 'multimedia';

      setSelectedCategory(cat);
      window.history.pushState({}, '', `/#${hashKey}`);
      setCurrentRoute('/');

      setTimeout(() => {
        const elem = document.getElementById(hashKey) || document.getElementById('converter-tools-section');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (route === '/') {
      setSelectedCategory('all');
      window.history.pushState({}, '', '/');
      setCurrentRoute('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      window.history.pushState({}, '', '/');
    } else if (category === 'image') {
      window.history.pushState({}, '', '/#images');
    } else if (category === 'document') {
      window.history.pushState({}, '', '/#documents');
    } else if (category === 'multimedia') {
      window.history.pushState({}, '', '/#multimedia');
    }
  };

  // Find converter matching current route
  const activeConverter = CONVERTERS.find(c => c.route === currentRoute);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Universal Top Header */}
      <Header 
        currentRoute={currentRoute} 
        selectedCategory={selectedCategory} 
        navigate={navigate} 
        onSelectCategory={handleCategoryChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentRoute === '/privacy' ? (
          <PrivacyPage navigate={navigate} />
        ) : currentRoute === '/pricing' ? (
          <PricingPage navigate={navigate} />
        ) : currentRoute === '/admin' ? (
          <AdminPage navigate={navigate} />
        ) : activeConverter ? (
          <ConverterPage config={activeConverter} navigate={navigate} />
        ) : (
          <HomePage 
            navigate={navigate} 
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer navigate={navigate} onSelectCategory={handleCategoryChange} />

      {/* Global Modals & Drawers */}
      <AuthModal />
      <ProModal />
      <HistoryDrawer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

