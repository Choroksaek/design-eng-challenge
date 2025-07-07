'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Loader2, 
  X, 
  Gamepad2, 
  Wifi,
  Volume2,
  Crown,
  ShieldCheck,
  Briefcase,
  Heart,
  Settings,
  Keyboard,
  Palette,
  Type,
  ArrowUp,
  Activity,
  Target,
  Star,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchItem } from '@/types';
import SearchSkeleton from '@/components/ui/SearchSkeleton';
import { toast } from 'sonner';

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  tag?: string;
}

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tag to icon mapping
const tagIconMap: Record<string, React.ElementType> = {
  wireless: Wifi,
  audio: Volume2,
  premium: Crown,
  'noise-canceling': ShieldCheck,
  office: Briefcase,
  ergonomic: Heart,
  comfort: Heart,
  adjustable: Settings,
  gaming: Gamepad2,
  mechanical: Keyboard,
  rgb: Palette,
  typing: Type,
  standing: ArrowUp,
  health: Activity,
  precision: Target,
};

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionItems, setSuggestionItems] = useState<SearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Fetch initial product data for recent searches to work properly
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/search');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSuggestionItems(data.items || []);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Save recent search to localStorage
  const saveRecentSearch = useCallback((query: string, tag?: string) => {
    if (!query.trim() && !tag) return;
    
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      tag
    };
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase() || item.tag !== tag
      );
      const updated = [newSearch, ...filtered].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Navigate to search results
  const navigateToSearch = useCallback((query: string, tag?: string) => {
    if (tag) {
      router.push(`/search?tags=${encodeURIComponent(tag)}`);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
    onClose();
  }, [router, onClose]);

  // Helper function to check if a suggestion is a tag
  const isTag = (suggestion: string): boolean => {
    if (tagIconMap[suggestion.toLowerCase()]) {
      return true;
    }
    
    return suggestionItems.some(item => 
      item.tags.some(tag => tag.toLowerCase() === suggestion.toLowerCase())
    );
  };

  // Helper function to get the appropriate icon for a tag
  const getTagIcon = (tag: string): React.ElementType => {
    return tagIconMap[tag.toLowerCase()] || Star;
  };

  // Create a direct mapping from product titles to images
  const productImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    suggestionItems.forEach(item => {
      if (!item.imageUrl) return;
      
      const imageUrl = item.imageUrl;
      map[item.title.toLowerCase()] = imageUrl;
      
      const words = item.title.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          map[word] = imageUrl;
        }
      });
      
      if (item.title.toLowerCase().includes('headphones')) {
        map['headphones'] = imageUrl;
        map['headphone'] = imageUrl;
      }
      if (item.title.toLowerCase().includes('chair')) {
        map['chair'] = imageUrl;
      }
      if (item.title.toLowerCase().includes('keyboard')) {
        map['keyboard'] = imageUrl;
      }
      if (item.title.toLowerCase().includes('mouse')) {
        map['mouse'] = imageUrl;
      }
      if (item.title.toLowerCase().includes('desk')) {
        map['desk'] = imageUrl;
      }
    });
    return map;
  }, [suggestionItems]);

  // Static fallback mapping for common products
  const staticProductImageMap: Record<string, string> = {
    'premium wireless headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'wireless headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 
    'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'ergonomic office chair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'office chair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'chair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'mechanical keyboard': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    'keyboard': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    'standing desk converter': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    'desk': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    'wireless mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    'mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
  };

  // Helper function to get image for a product title suggestion
  const getSuggestionImage = (suggestion: string): string => {
    const staticMatch = staticProductImageMap[suggestion.toLowerCase()];
    if (staticMatch) {
      return staticMatch;
    }
    
    if (suggestionItems.length === 0) {
      return '';
    }
    
    const directMatch = productImageMap[suggestion.toLowerCase()];
    if (directMatch) {
      return directMatch;
    }
    
    const matchingItem = suggestionItems.find(item => {
      const itemTitle = item.title.toLowerCase();
      const searchTerm = suggestion.toLowerCase();
      
      if (itemTitle === searchTerm) return true;
      if (itemTitle.includes(searchTerm)) return true;
      
      const itemWords = itemTitle.split(' ');
      const suggestionWords = searchTerm.split(' ');
      
      const significantWords = itemWords.filter(word => 
        word.length > 2 && 
        !['the', 'and', 'or', 'for', 'with', 'of', 'in', 'on', 'at', 'to', 'a', 'an'].includes(word)
      );
      
      return significantWords.some(word => 
        suggestionWords.some(suggWord => 
          suggWord.includes(word) || word.includes(suggWord)
        )
      );
    });
    
    if (matchingItem && matchingItem.imageUrl) {
      return matchingItem.imageUrl;
    }
    
    return '';
  };

  // Component to render suggestion icon or image
  const SuggestionIcon: React.FC<{ suggestion: string }> = ({ suggestion }) => {
    if (!suggestion) {
      return (
        <div className="w-10 h-10 rounded-lg mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
      );
    }
    
    if (isTag(suggestion)) {
      const IconComponent = getTagIcon(suggestion);
      return (
        <div className="w-10 h-10 rounded-lg mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-slate-500" />
        </div>
      );
    } else {
      const imageUrl = getSuggestionImage(suggestion);
      
      if (!imageUrl) {
        return (
          <div className="w-10 h-10 rounded-lg mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
        );
    }
      
      return (
        <img 
          src={imageUrl}
          alt={suggestion}
          className="w-10 h-10 rounded-lg mr-3 flex-shrink-0 object-cover"
        />
      );
    }
  };

  // Component specifically for recent search items
  const RecentSearchIcon: React.FC<{ recent: RecentSearch }> = ({ recent }) => {
    const displayText = recent.query || recent.tag || '';
    return <SuggestionIcon suggestion={displayText} />;
  };

  // Handle search
  const handleSearch = useCallback((term: string, tag?: string) => {
    setSearchTerm(term);
    saveRecentSearch(term, tag);
    navigateToSearch(term, tag);
  }, [navigateToSearch, saveRecentSearch]);

  // Handle tag search
  const handleTagSearch = useCallback((tag: string) => {
    setSearchTerm('');
    saveRecentSearch('', tag);
    navigateToSearch('', tag);
  }, [navigateToSearch, saveRecentSearch]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionItems([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSuggestionItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
      setSuggestionItems([]);
      
      // Show a toast notification for network errors
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.name === 'TypeError')) {
        // Only show the toast if we're not in a loading state to avoid spam
        if (!suggestionsLoading) {
          toast.error('Unable to fetch suggestions. Please check your connection.');
        }
      }
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setSuggestionsLoading(false);
  };

  // Fetch suggestions when typing
  useEffect(() => {
    const delayedSuggestionFetch = setTimeout(() => {
      if (searchTerm) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setSuggestionsLoading(false);
        setSuggestionItems([]);
      }
    }, 300);

    if (searchTerm) {
      setSuggestionsLoading(true);
    }

    return () => clearTimeout(delayedSuggestionFetch);
  }, [searchTerm, fetchSuggestions]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && document.activeElement?.id === 'mobile-search-input') {
        if (searchTerm.trim()) {
          handleSearch(searchTerm);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the input when modal opens
      setTimeout(() => {
        document.getElementById('mobile-search-input')?.focus();
      }, 100);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchTerm, handleSearch, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, exit: { duration: 0.01 } }}
            className="fixed inset-0 bg-white/10 backdrop-blur-xs z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.3, y: -20 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.3, y: -20 }}
            transition={{ 
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
              scaleY: { duration: 0.15 },
              exit: { duration: 0.01, ease: "easeIn" }
            }}
            style={{ transformOrigin: 'top' }}
            className="fixed inset-0 z-50 flex flex-col bg-white"
          >
            {/* Header */}
            <div className="flex items-center p-4 border-b border-slate-200 bg-white">
              <button
                onClick={onClose}
                className="p-2 -ml-2 mr-3 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-24 h-12 border rounded-xl focus:outline-none transition-all duration-200 text-sm bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-300"
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {suggestionsLoading && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  )}
                  {searchTerm && !suggestionsLoading && (
                    <button
                      onClick={clearSearch}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                  <div className="flex items-center relative">
                    <motion.div
                      animate={{
                        width: '46px',
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center py-1 px-2 bg-slate-100 rounded-md font-mono text-xs text-slate-500 overflow-hidden"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        Esc
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Search Results */}
              {searchTerm && !suggestionsLoading && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="max-h-96 overflow-y-auto"
                >
                  <div className="p-2">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-xs text-slate-500 px-3 py-2 font-medium"
                    >
                      Suggestions
                    </motion.div>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.02 }}
                        onMouseDown={() => handleSearch(suggestion)}
                        className="w-full text-left px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center"
                      >
                        <SuggestionIcon suggestion={suggestion} />
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Loading suggestions */}
              {searchTerm && suggestionsLoading && <SearchSkeleton />}

              {/* No suggestions found */}
              {searchTerm && !suggestionsLoading && suggestions.length === 0 && (
                <div className="p-6 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No suggestions found</p>
                </div>
              )}

              {/* Recommended Items - shown when not searching */}
              {!searchTerm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 max-h-[500px] overflow-y-auto"
                >
                  {/* Recent Section */}
                  <div className="mb-6" key={`recent-${initialDataLoaded}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-xs text-slate-500 px-3 py-2 font-medium mb-2"
                    >
                      Recent
                    </motion.div>
                    <div className="space-y-1 relative">
                      {recentSearches.length > 0 ? (
                        recentSearches.slice(0, 5).map((recent, index) => (
                          <motion.button
                            key={`${recent.id}-${initialDataLoaded}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.03 }}
                            onMouseDown={() => {
                              if (recent.tag && !recent.query) {
                                handleTagSearch(recent.tag);
                              } else {
                                handleSearch(recent.query || '', recent.tag);
                              }
                            }}
                            className="w-full text-left px-3 py-3 text-sm text-slate-700 rounded-lg transition-colors flex items-center"
                          >
                            <RecentSearchIcon recent={recent} />
                            <span>{recent.query || recent.tag}</span>
                            {recent.tag && recent.query && (
                              <span className="ml-2 text-xs text-slate-400">#{recent.tag}</span>
                            )}
                          </motion.button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-slate-500">
                          No recent searches yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs text-slate-500 px-3 py-2 font-medium mb-2"
                    >
                      Popular Tags
                    </motion.div>
                    <div className="flex flex-wrap gap-2 px-3">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        onMouseDown={() => handleTagSearch('wireless')}
                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Wireless
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onMouseDown={() => handleTagSearch('gaming')}
                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Gaming
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        onMouseDown={() => handleTagSearch('office')}
                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Office
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}