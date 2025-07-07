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
  Star
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

interface SearchBarProps {
  onFocusChange?: (focused: boolean) => void;
}

export default function SearchBar({ onFocusChange }: SearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredRecentItem, setHoveredRecentItem] = useState<string | null>(null);
  
  // Suppress unused variable warning - showSuggestions is used for state management
  void showSuggestions;
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
      router.push(`/${tag}`);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  }, [router]);

  // Helper function to check if a suggestion is a tag
  const isTag = (suggestion: string): boolean => {
    // Check against our known tag mapping first
    if (tagIconMap[suggestion.toLowerCase()]) {
      return true;
    }
    
    // Then check suggestion items
    return suggestionItems.some(item => 
      item.tags.some(tag => tag.toLowerCase() === suggestion.toLowerCase())
    );
  };

  // Helper function to get the appropriate icon for a tag
  const getTagIcon = (tag: string): React.ElementType => {
    return tagIconMap[tag.toLowerCase()] || Star;
  };

  // Create a direct mapping from product titles to images for better reliability
  const productImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    suggestionItems.forEach(item => {
      if (!item.imageUrl) return; // Skip items without images
      
      const imageUrl = item.imageUrl; // Now TypeScript knows it's not undefined
      
      // Add exact title
      map[item.title.toLowerCase()] = imageUrl;
      
      // Add variations and keywords
      const words = item.title.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          map[word] = imageUrl;
        }
      });
      
      // Add specific mappings for common searches
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

  // Static fallback mapping for common products (from API route data)
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
    // Try static mapping first (works even when data isn't loaded)
    const staticMatch = staticProductImageMap[suggestion.toLowerCase()];
    if (staticMatch) {
      return staticMatch;
    }
    
    if (suggestionItems.length === 0) {
      // For unknown searches, return null to use search icon instead of placeholder
      return '';
    }
    
    // Try direct mapping from loaded data
    const directMatch = productImageMap[suggestion.toLowerCase()];
    if (directMatch) {
      return directMatch;
    }
    
    // Try multiple matching strategies
    const matchingItem = suggestionItems.find(item => {
      const itemTitle = item.title.toLowerCase();
      const searchTerm = suggestion.toLowerCase();
      
      // Exact match
      if (itemTitle === searchTerm) return true;
      
      // Contains match
      if (itemTitle.includes(searchTerm)) return true;
      
      // Reverse contains match (suggestion contains item title words)
      const itemWords = itemTitle.split(' ');
      const suggestionWords = searchTerm.split(' ');
      
      // Check if any significant words match
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
    
    // For unknown searches, return empty string to use search icon
    return '';
  };

  // Component to render suggestion icon or image
  const SuggestionIcon: React.FC<{ suggestion: string }> = ({ suggestion }) => {
    if (!suggestion) {
      return (
        <div className="w-8 h-8 rounded mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
      );
    }
    
    if (isTag(suggestion)) {
      const IconComponent = getTagIcon(suggestion);
      return (
        <div className="w-8 h-8 rounded mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-slate-500" />
        </div>
      );
    } else {
      const imageUrl = getSuggestionImage(suggestion);
      
      // If no image URL, show search icon
      if (!imageUrl) {
        return (
          <div className="w-8 h-8 rounded mr-3 flex-shrink-0 bg-slate-100 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
        );
    }
      
      return (
        <img 
          src={imageUrl}
          alt={suggestion}
          className="w-8 h-8 rounded mr-3 flex-shrink-0 object-cover"
        />
      );
    }
  };

  // Component specifically for recent search items
  const RecentSearchIcon: React.FC<{ recent: RecentSearch }> = ({ recent }) => {
    // Just use the same logic as suggestions - get the display text and use SuggestionIcon
    const displayText = recent.query || recent.tag || '';
    return <SuggestionIcon suggestion={displayText} />;
  };

  // Handle search - just navigate, don't manage results
  const handleSearch = useCallback((term: string, tag?: string) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    saveRecentSearch(term, tag);
    navigateToSearch(term, tag);
  }, [navigateToSearch, saveRecentSearch]);

  // Handle tag search - just navigate
  const handleTagSearch = useCallback((tag: string) => {
    setSearchTerm('');
    setShowSuggestions(false);
    saveRecentSearch('', tag);
    navigateToSearch('', tag);
  }, [navigateToSearch, saveRecentSearch]);

  // Fetch suggestions only (not search results)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      setSuggestionItems([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSuggestionItems(data.items || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
      setSuggestionItems([]);
      setShowSuggestions(false);
      
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
    setShowSuggestions(false);
    setSuggestions([]);
    setSuggestionsLoading(false);
    // Keep suggestionItems intact so recent searches can display icons/images
    // Don't navigate away - just clear the search input
  };

  // Notify parent component of focus state changes
  useEffect(() => {
    onFocusChange?.(isSearchFocused);
  }, [isSearchFocused, onFocusChange]);

  // Fetch suggestions when typing
  useEffect(() => {
    const delayedSuggestionFetch = setTimeout(() => {
      if (searchTerm && isSearchFocused) {
        fetchSuggestions(searchTerm);
      } else if (!searchTerm) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSuggestionsLoading(false);
        setSuggestionItems([]);
      }
    }, 300);

    if (searchTerm && isSearchFocused) {
      setSuggestionsLoading(true);
    }

    return () => clearTimeout(delayedSuggestionFetch);
  }, [searchTerm, isSearchFocused, fetchSuggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          document.getElementById('search-input')?.focus();
        }
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        document.getElementById('search-input')?.blur();
      }
      if (e.key === 'Enter' && document.activeElement?.id === 'search-input') {
        if (searchTerm.trim()) {
          handleSearch(searchTerm);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, handleSearch]);

  return (
    <div className="relative w-full max-w-lg z-50">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
        <input
          id="search-input"
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onFocus={() => {
            setIsSearchFocused(true);
            if (suggestions.length > 0 || !searchTerm) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsSearchFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
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
          <div className="hidden sm:flex items-center relative">
            <motion.div
              animate={{
                width: isSearchFocused ? '46px' : '22px',
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-1 px-2 bg-slate-100 rounded-md font-mono text-xs text-slate-500 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!isSearchFocused ? (
                  <motion.span
                    key="slash"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, exit: { duration: 0.01 } }}
                  >
                    /
                  </motion.span>
                ) : (
                  <motion.span
                    key="esc"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, exit: { duration: 0.01 } }}
                  >
                    Esc
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Search Dropdown - positioned below the search bar */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.3, y: -20 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.3, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                scaleY: { duration: 0.25 },
                exit: { duration: 0.01, ease: "easeIn" }
              }}
              style={{ transformOrigin: 'top' }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
            >
              {/* Search Results - only show if not loading and has suggestions */}
              {searchTerm && !suggestionsLoading && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="max-h-96 overflow-y-auto"
                >
                  <div className="p-2">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs text-slate-500 px-3 py-2 font-medium"
                    >
                      Suggestions
                    </motion.div>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + index * 0.04 }}
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

              {/* Loading suggestions - show when typing and loading */}
              {searchTerm && suggestionsLoading && <SearchSkeleton />}

              {/* No suggestions found - only show if not loading and no suggestions */}
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
                  transition={{ delay: 0.15 }}
                  className="p-4 max-h-[500px] overflow-y-auto"
                >
                  {/* Recent Section */}
                  <div className="mb-6" key={`recent-${initialDataLoaded}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
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
                            transition={{ delay: 0.25 + index * 0.05 }}
                            onMouseDown={() => {
                              if (recent.tag && !recent.query) {
                                // Pure tag search
                                handleTagSearch(recent.tag);
                              } else {
                                // Query search (with optional tag)
                                handleSearch(recent.query || '', recent.tag);
                              }
                            }}
                            onMouseEnter={() => setHoveredRecentItem(recent.id)}
                        onMouseLeave={() => setHoveredRecentItem(null)}
                        className="w-full text-left px-3 py-3 text-sm text-slate-700 rounded-lg transition-colors flex items-center relative"
                      >
                            {hoveredRecentItem === recent.id && (
                          <motion.div
                            layoutId="recent-hover-bg"
                            className="absolute inset-0 bg-slate-50 rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              layout: { duration: 0.2, ease: "easeOut" },
                              opacity: { duration: 0.01 }
                            }}
                          />
                        )}
                        <div className="relative z-10 flex items-center">
                          <RecentSearchIcon recent={recent} />
                          <span>{recent.query || recent.tag}</span>
                          {recent.tag && recent.query && (
                            <span className="ml-2 text-xs text-slate-400">#{recent.tag}</span>
                          )}
                        </div>
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
                      transition={{ delay: 0.4 }}
                      className="text-xs text-slate-500 px-3 py-2 font-medium mb-2"
                    >
                      Popular Tags
                    </motion.div>
                    <div className="flex flex-wrap gap-2 px-3">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        onMouseDown={() => handleTagSearch('wireless')}
                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Wireless
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onMouseDown={() => handleTagSearch('gaming')}
                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                      >
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Gaming
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
} 