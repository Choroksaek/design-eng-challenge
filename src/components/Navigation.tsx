'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import MobileSearchModal from './MobileSearchModal';

export default function Navigation() {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTagSearch = (tag: string) => {
    // Check if we're already on the search page
    if (window.location.pathname === '/search') {
      // Update URL without navigation to avoid page reload
      const url = new URL(window.location.href);
      url.searchParams.set('tags', tag);
      window.history.pushState({}, '', url.toString());
      
      // Dispatch a custom event to notify SearchResults component
      window.dispatchEvent(new CustomEvent('urlChanged'));
    } else {
      // Navigate to search page if not already there
      router.push(`/search?tags=${encodeURIComponent(tag)}`);
    }
  };



  const handleSearchFocus = (focused: boolean) => {
    setIsSearchFocused(focused);
  };

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

    return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, exit: { duration: 0.01 } }}
            className="fixed inset-0 bg-white/10 backdrop-blur-xs z-40"
            onClick={() => {
              setIsSearchFocused(false);
              // Trigger blur on search input
              document.getElementById('search-input')?.blur();
            }}
          />
        )}
      </AnimatePresence>

      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center h-20 pt-4">
            {/* Left: Logo + Nav Items */}
            <div className="flex-1 flex items-center space-x-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <img 
                  src="/images/ScoutLogo.png" 
                  alt="Scout Logo" 
                  className="w-40 h-12 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push('/')}
                />
              </motion.div>

              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => {
                    if (window.location.pathname === '/search') {
                      // Clear all filters by updating URL without navigation
                      const url = new URL(window.location.origin + '/search');
                      window.history.pushState({}, '', url.toString());
                      window.dispatchEvent(new CustomEvent('urlChanged'));
                    } else {
                      router.push('/search');
                    }
                  }}
                  className="text-slate-600 cursor-pointer hover:text-slate-900 font-medium transition-colors"
                >
                  All Products
                </button>
                <button 
                  onClick={() => handleTagSearch('wireless')}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Wireless
                </button>
                <button 
                  onClick={() => handleTagSearch('gaming')}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Gaming
                </button>
                <button 
                  onClick={() => handleTagSearch('office')}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Office
                </button>
              </div>
            </div>

                      {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center">
            {!isMobile && (
              <SearchBar onFocusChange={handleSearchFocus} />
            )}
          </div>

            {/* Right: Icons */}
            <div className="flex-1 flex items-center justify-end space-x-4">
              {isMobile && (
                <button 
                  onClick={openMobileSearch}
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>
                    </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <MobileSearchModal 
        isOpen={isMobileSearchOpen} 
        onClose={closeMobileSearch} 
      />
    </>
  );
} 