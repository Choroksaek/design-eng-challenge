'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { SearchResponse, SearchFilters } from '@/types';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import ProductGridSkeleton, { ProductFilterSkeleton } from '@/components/ui/ProductGridSkeleton';
import ErrorState from '@/components/ui/ErrorState';

// Mechanical Clock-style Animated Number Component
const AnimatedNumber = ({ value, className = "" }: { value: number; className?: string }) => {
  const valueStr = value.toString();
  
  return (
    <div className={`inline-flex ${className}`}>
      {valueStr.split('').map((digit, index) => (
        <div key={index} className="relative overflow-hidden inline-block h-9 w-6">
          <motion.div
            animate={{ 
              y: -parseInt(digit) * 36 // 36px per digit (h-9 = 36px)
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut"
            }}
            className="absolute top-0 left-0 w-full"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div
                key={num}
                className="h-9 w-6 flex items-center justify-center text-3xl font-medium"
              >
                {num}
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default function SearchResults() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
    sortBy: 'relevance',
    priceRange: { min: 50, max: 500 },
    featured: false
  });

  // Temporary mobile filter state (for Apply button functionality)
  const [tempMobileFilters, setTempMobileFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
    sortBy: 'relevance',
    priceRange: { min: 50, max: 500 },
    featured: false
  });

  // Add abort controller to cancel inflight requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Ref for sort dropdown to handle click outside
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  // Local state for debounced slider
  const [sliderValue, setSliderValue] = useState<[number, number]>([50, 500]);
  
  // Mobile temporary slider state
  const [tempMobileSliderValue, setTempMobileSliderValue] = useState<[number, number]>([50, 500]);

  // Update price range from API facets when available
  useEffect(() => {
    if (searchResults?.facets?.priceRange && filters.priceRange) {
      const { min, max } = searchResults.facets.priceRange;
      // Only update if we haven't set custom values yet
      if (filters.priceRange.min === 50 && filters.priceRange.max === 500) {
        setFilters(prev => ({ ...prev, priceRange: { min, max } }));
        setSliderValue([min, max]);
      }
    }
  }, [searchResults?.facets?.priceRange, filters.priceRange]);

  // Available categories and tags from the API facets
  const categories = searchResults?.facets?.categories?.map(cat => cat.name) || [];
  const availableTags = searchResults?.facets?.tags?.map(tag => tag.name) || [];
  const sortOptions: Array<{ value: SearchFilters['sortBy']; label: string }> = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Initialize filters from URL parameters on mount and when URL changes
  useEffect(() => {
    const updateFiltersFromURL = () => {
      if (pathname === '/search') {
        const urlParams = new URLSearchParams(window.location.search);
        const tagsParam = urlParams.get('tags') || '';
        const queryParam = urlParams.get('q') || '';
        
        // If no URL parameters, reset all filters to defaults
        if (!urlParams.toString()) {
          setFilters(prev => {
            // Only update if actually different to prevent unnecessary re-renders
            if (prev.query === '' && prev.tags.length === 0 && prev.category === '' && 
                !prev.featured && prev.sortBy === 'relevance') {
              return prev;
            }
            return {
              query: '',
              category: '',
              tags: [],
              sortBy: 'relevance',
              priceRange: { min: 50, max: 500 },
              featured: false
            };
          });
        } else {
          // Update only the URL-controlled filters
          setFilters(prev => ({
            ...prev,
            tags: tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : [],
            query: queryParam
          }));
        }
      } else if (pathname !== '/') {
        // Handle legacy tag routes like /wireless, /gaming, etc.
        const tag = pathname.slice(1); // Remove leading slash
        if (tag) {
          setFilters(prev => ({
            ...prev,
            tags: [tag],
            query: ''
          }));
        }
      }
    };

    // Initial load
    updateFiltersFromURL();

    // Listen for URL changes without page reload
    const handleUrlChange = () => {
      updateFiltersFromURL();
    };

    window.addEventListener('urlChanged', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('urlChanged', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [pathname]);

  // Define handler functions first
  const handlePriceRangeChange = useCallback((min?: number, max?: number) => {
    setIsFiltering(true);
    setShowSkeleton(true);
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: min ?? prev.priceRange?.min ?? 0,
        max: max ?? prev.priceRange?.max ?? 1000
      }
    }));
  }, []);

  // Sync sliderValue with filters.priceRange on mount and when filters change externally
  useEffect(() => {
    setSliderValue([
      filters.priceRange?.min ?? 50,
      filters.priceRange?.max ?? 500
    ]);
  }, [filters.priceRange?.min, filters.priceRange?.max]);

  // Debounce updating the filter state when sliderValue changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        filters.priceRange?.min !== sliderValue[0] ||
        filters.priceRange?.max !== sliderValue[1]
      ) {
        handlePriceRangeChange(sliderValue[0], sliderValue[1]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [sliderValue, filters.priceRange?.min, filters.priceRange?.max, handlePriceRangeChange]);

  // Perform search based on URL parameters with debouncing
  useEffect(() => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce to prevent rapid multiple API calls
    const debounceTimer = setTimeout(() => {
      const performSearch = async () => {
        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setIsSearching(true);
        setSearchError(null);
        
        try {
          const params = new URLSearchParams();
          
          // Collect all tags from different sources
          const allTags: string[] = [];
          
          // Handle different page types
          if (pathname === '/search') {
            // Search page - can have text query and/or tag filters
            const query = searchParams.get('q') || '';
            const tagsParam = searchParams.get('tags') || '';
            
            if (query) params.append('query', query);
            if (tagsParam) allTags.push(...tagsParam.split(',').map(tag => tag.trim()));
            
            // Only add filter tags if there's no fresh search query in URL
            // This ensures fresh searches don't inherit previous tag context
            if (!query && filters.tags.length > 0) {
              allTags.push(...filters.tags);
            }
          } else if (pathname !== '/') {
            // Legacy tag search page (keeping for backwards compatibility)
            const tag = pathname.slice(1); // Remove leading slash
            if (tag) allTags.push(tag);
          }
          
          // Add filters to params
          if (filters.category) params.append('category', filters.category);
          if (allTags.length > 0) params.append('tags', [...new Set(allTags)].join(','));
          if (filters.sortBy && filters.sortBy !== 'relevance') params.append('sortBy', filters.sortBy);
          
          // Only add price range if it's different from the default range
          const defaultMinPrice = 50;
          const defaultMaxPrice = 500;
          if (filters.priceRange?.min && filters.priceRange.min > defaultMinPrice) {
            params.append('minPrice', filters.priceRange.min.toString());
          }
          if (filters.priceRange?.max && filters.priceRange.max < defaultMaxPrice) {
            params.append('maxPrice', filters.priceRange.max.toString());
          }
          
          if (filters.featured) params.append('featured', 'true');
          
          const response = await fetch(`/api/search?${params}`, {
            signal: abortController.signal
          });
          
          // Check if request was aborted
          if (abortController.signal.aborted) {
            return;
          }
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: SearchResponse = await response.json();
          
          // Double-check abort status before setting results
          if (!abortController.signal.aborted) {
            setSearchResults(data);
          }
        } catch (error) {
          // Don't handle abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          
          console.error('Search failed:', error);
          setSearchResults(null);
          
          // Set user-friendly error message
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
              setSearchError('Unable to connect to the server. Please check your internet connection and try again.');
            } else if (error.message.includes('500')) {
              setSearchError('Server error occurred. Please try again later.');
            } else {
              setSearchError('Search failed. Please try again.');
            }
          } else {
            setSearchError('An unexpected error occurred. Please try again.');
          }
        } finally {
          // Only update state if this request wasn't aborted
          if (!abortController.signal.aborted) {
            setIsSearching(false);
            
            // Smooth skeleton transition - shorter delay and immediate feedback
            if (isFiltering) {
              // Immediately hide skeleton, then clear filtering state after animation
              setShowSkeleton(false);
              setTimeout(() => {
                setIsFiltering(false);
              }, 50); // Just long enough for the fade-out animation
            }
            
            // Mark initial load as complete
            if (isInitialLoad) {
              setIsInitialLoad(false);
            }
          }
        }
      };

      performSearch();
    }, isFiltering ? 150 : 300); // Shorter debounce for filtering, longer for initial searches

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [pathname, searchParams, filters, isFiltering, isInitialLoad]);

  // Handle click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSortDropdown]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setIsFiltering(true);
    setShowSkeleton(true);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCategoryToggle = (category: string) => {
    setIsFiltering(true);
    setShowSkeleton(true);
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleTagToggle = (tag: string) => {
    setIsFiltering(true);
    setShowSkeleton(true);
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Mobile-specific handlers for temporary state
  const handleMobileFilterChange = (newFilters: Partial<SearchFilters>) => {
    setTempMobileFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleMobileCategoryToggle = (category: string) => {
    setTempMobileFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleMobileTagToggle = (tag: string) => {
    setTempMobileFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Apply mobile filters
  const applyMobileFilters = () => {
    setIsFiltering(true);
    setShowSkeleton(true);
    setFilters(tempMobileFilters);
    setShowMobileFilters(false);
  };

  // Sync temporary filters when modal opens
  const openMobileFilters = () => {
    setTempMobileFilters(filters);
    setTempMobileSliderValue([
      filters.priceRange?.min ?? 50,
      filters.priceRange?.max ?? 500
    ]);
    setShowMobileFilters(true);
  };

  // Update temp mobile price range when slider changes
  const handleTempMobileSliderChange = (value: [number, number]) => {
    setTempMobileSliderValue(value);
    setTempMobileFilters(prev => ({
      ...prev,
      priceRange: { min: value[0], max: value[1] }
    }));
  };

  // Check if any filters are active (including search query and URL parameters)
  const hasActiveFilters = useMemo(() => {
    // Check local filter state
    const hasSearchQuery = Boolean(filters.query);
    const hasCategory = Boolean(filters.category);
    const hasTags = filters.tags.length > 0;
    const hasFeatured = filters.featured;
    // Note: sortBy is NOT included as it's a display preference, not a filter
    
    // Check URL parameters for active filters
    const urlQuery = searchParams.get('q') || '';
    const urlTags = searchParams.get('tags') || '';
    const hasUrlQuery = Boolean(urlQuery);
    const hasUrlTags = Boolean(urlTags);
    
    // Check for legacy tag routes (like /wireless, /gaming)
    const hasLegacyTag = pathname !== '/' && pathname !== '/search';
    
    // Use API facets for price range comparison, fallback to defaults
    const apiMinPrice = searchResults?.facets?.priceRange?.min ?? 50;
    const apiMaxPrice = searchResults?.facets?.priceRange?.max ?? 500;
    const hasCustomMinPrice = (filters.priceRange?.min ?? apiMinPrice) > apiMinPrice;
    const hasCustomMaxPrice = (filters.priceRange?.max ?? apiMaxPrice) < apiMaxPrice;
    
    return hasSearchQuery || hasCategory || hasTags || hasFeatured || 
           hasCustomMinPrice || hasCustomMaxPrice || hasUrlQuery || hasUrlTags || hasLegacyTag;
  }, [filters, searchParams, pathname, searchResults?.facets?.priceRange]);

  const clearFilters = useCallback(() => {
    // Only proceed if there are actually filters to clear
    if (hasActiveFilters) {
      // Cancel any pending search to avoid race conditions
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Don't show skeleton for clear filters - just smooth content transition
      // This prevents jarring jumps when going from few items to many items
      
      // Navigate and update state in one smooth operation
      if (pathname === '/search') {
        // Clear URL parameters to show all items
        const url = new URL(window.location.origin + '/search');
        window.history.pushState({}, '', url.toString());
        
        // Update filters immediately without waiting for URL change
        setFilters({
          query: '',
          category: '',
          tags: [],
          sortBy: 'relevance',
          priceRange: { min: 50, max: 500 },
          featured: false
        });
        
        // Reset slider to match
        setSliderValue([50, 500]);
      } else {
        // If on a tag page, navigate to search page to show all items
        router.push('/search');
      }
    } else {
      // If no active filters, just ensure we're on a clean search page
      if (pathname !== '/search' || window.location.search) {
        // Navigate to clean search page if we're not already there
        router.push('/search');
      }
    }
  }, [hasActiveFilters, pathname, router]);

  const handleProductClick = (item: { title: string; id: string }) => {
    const url = `/search?q=${encodeURIComponent(item.title)}`;
    router.push(url);
  };

  const showAddToBagToast = (itemTitle: string) => {
    toast.success(`${itemTitle} added to bag successfully!`);
  };

  const retrySearch = () => {
    setSearchError(null);
    // Trigger a new search by re-running the effect
    const performSearch = async () => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const params = new URLSearchParams();
        
        // Collect all tags from different sources
        const allTags: string[] = [];
        
        // Handle different page types
        if (pathname === '/search') {
          // Search page - can have text query and/or tag filters
          const query = searchParams.get('q') || '';
          const tagsParam = searchParams.get('tags') || '';
          
          if (query) params.append('query', query);
          if (tagsParam) allTags.push(...tagsParam.split(',').map(tag => tag.trim()));
          
          // Only add filter tags if there's no fresh search query in URL
          // This ensures fresh searches don't inherit previous tag context
          if (!query && filters.tags.length > 0) {
            allTags.push(...filters.tags);
          }
        } else if (pathname !== '/') {
          // Legacy tag search page (keeping for backwards compatibility)
          const tag = pathname.slice(1); // Remove leading slash
          if (tag) allTags.push(tag);
        }
        
        // Add filters to params
        if (filters.category) params.append('category', filters.category);
        if (allTags.length > 0) params.append('tags', [...new Set(allTags)].join(','));
        if (filters.sortBy && filters.sortBy !== 'relevance') params.append('sortBy', filters.sortBy);
        
        // Only add price range if it's different from the default range
        const defaultMinPrice = 50;
        const defaultMaxPrice = 500;
        if (filters.priceRange?.min && filters.priceRange.min > defaultMinPrice) {
          params.append('minPrice', filters.priceRange.min.toString());
        }
        if (filters.priceRange?.max && filters.priceRange.max < defaultMaxPrice) {
          params.append('maxPrice', filters.priceRange.max.toString());
        }
        
        if (filters.featured) params.append('featured', 'true');
        
        const response = await fetch(`/api/search?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SearchResponse = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults(null);
        
        // Set user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            setSearchError('Unable to connect to the server. Please check your internet connection and try again.');
          } else if (error.message.includes('500')) {
            setSearchError('Server error occurred. Please try again later.');
          } else {
            setSearchError('Search failed. Please try again.');
          }
        } else {
          setSearchError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  };

  // Loading state - Simple skeleton without exit animations
  if (isSearching && !searchResults) {
    return <ProductGridSkeleton />;
  }

  // Error state - Show error message with retry option
  if (searchError && !isSearching) {
    return (
      <div className="w-full bg-white h-screen flex overscroll-none">
        <aside className="hidden lg:block w-80 fixed left-0 top-20 bottom-0 z-30 bg-white border-r border-gray-100" />
        <main className="flex-1 lg:ml-80 h-screen overflow-y-auto">
          <div className="px-6 lg:px-12 pt-24 pb-40 min-h-full flex items-center justify-center">
            <ErrorState 
              error={searchError.includes('connection') || searchError.includes('internet') ? 'network' : 'search'}
              message={searchError}
              onRetry={retrySearch}
            />
          </div>
        </main>
      </div>
    );
  }

  // Handle case where searchResults is null
  const resultsToDisplay = searchResults || { items: [], total: 0 };

  return (
    <div className="w-full bg-white h-screen flex overscroll-none">
      {/* Desktop Sidebar Filters - Fixed */}
      <aside className="hidden lg:block w-80 fixed left-0 top-20 bottom-0 z-30 bg-white border-r border-gray-100 overscroll-none" style={{ overscrollBehavior: 'none' }}>
        <div className="h-full pt-8 px-6 pb-6 overflow-y-auto overscroll-none flex flex-col" style={{ 
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        }}>
             
             {/* Featured Filter Switch */}
             <motion.div 
               className="mb-8"
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
             >
               <label className="flex items-center cursor-pointer">
                 <div
                   onClick={() => handleFilterChange({ featured: !filters.featured })}
                   className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                     filters.featured ? 'bg-gray-900' : 'bg-gray-300'
                   }`}
                 >
                   <div
                     className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200 shadow-md ${
                       filters.featured ? 'left-6' : 'left-0.5'
                     }`}
                   />
                 </div>
                 <span className="font-semibold text-sm ml-3">Featured items only</span>
               </label>
             </motion.div>

                            {/* Categories */}
             <motion.div 
               className="mb-8"
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
             >
               <div className="font-semibold mb-3">Categories</div>
               <div className="flex flex-col gap-2">
                 <label className="flex items-center cursor-pointer">
                   <input
                     type="radio"
                     name="category"
                     checked={!filters.category}
                     onChange={() => handleCategoryToggle('')}
                     className="mr-2 accent-gray-900"
                   />
                   <span className="text-sm">All</span>
                 </label>
                 {categories.map((category) => (
                   <label key={category} className="flex items-center cursor-pointer">
                     <input
                       type="radio"
                       name="category"
                       checked={filters.category === category}
                       onChange={() => handleCategoryToggle(category)}
                       className="mr-2 accent-gray-900"
                     />
                     <span className="text-sm">{category}</span>
                   </label>
                 ))}
               </div>
             </motion.div>

                               {/* Tag Search and Filter */}
             <motion.div 
               className="mb-8"
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
             >
               <div className="font-semibold mb-3">Tags</div>
               
               {/* Search Input */}
               <div className="mb-4 relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Search tags..."
                   value={tagSearchQuery}
                   className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl outline-none text-sm bg-slate-50 text-slate-900 transition-all duration-200 focus:bg-white focus:border-slate-300 hover:bg-white hover:border-slate-300"
                   onChange={(e) => setTagSearchQuery(e.target.value)}
                 />
               </div>

               {/* Tag List */}
               <div className="flex flex-wrap gap-2">
                 {/* Selected tags first (with cancel icon) - filtered by search */}
                 {filters.tags
                   .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                   .map((tag) => (
                     <button
                       key={`selected-${tag}`}
                       onClick={() => handleTagToggle(tag)}
                       className="flex items-center bg-gray-900 text-white border-none rounded-full px-3 py-1.5 text-sm cursor-pointer gap-1.5"
                     >
                       {tag}
                       <span className="text-base leading-none">&times;</span>
                     </button>
                   ))}
                 
                 {/* Unselected tags - filtered by search */}
                 {filteredTags
                   .filter(tag => !filters.tags.includes(tag))
                   .map((tag) => (
                     <button
                       key={`unselected-${tag}`}
                       onClick={() => handleTagToggle(tag)}
                       className="bg-gray-100 text-black border-none rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200 hover:bg-gray-200"
                     >
                       {tag}
                     </button>
                   ))}
              </div>
            </motion.div>

                               {/* Price Range Slider */}
             <motion.div 
               className="mb-8"
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
             >
               <div className="font-semibold mb-3">Price Range</div>
               <div className="mb-4">
                 <Slider
                   min={50}
                   max={500}
                   step={50}
                   value={sliderValue}
                   onValueChange={value => setSliderValue(value as [number, number])}
                   className="w-full h-6 flex items-center"
                 />
                 <style>{`.slider-track, .slider > .slider-track { height: 4px !important; }`}</style>
               </div>
               <div className="flex gap-3">
                 <div className="flex-1">
                   <div className="text-xs text-gray-500 mb-1">Min</div>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">$</span>
                     <input
                       type="number"
                       min={50}
                       max={sliderValue[1]}
                       value={sliderValue[0]}
                       onChange={(e) => setSliderValue([Number(e.target.value) || 50, sliderValue[1]])}
                       className="w-full py-2.5 px-3 pl-6 rounded-xl border border-gray-200 text-sm bg-gray-50"
                       placeholder="50"
                     />
                   </div>
                 </div>
                 <div className="self-center font-semibold text-gray-400">-</div>
                 <div className="flex-1">
                   <div className="text-xs text-gray-500 mb-1">Max</div>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">$</span>
                     <input
                       type="number"
                       min={sliderValue[0]}
                       max={500}
                       value={sliderValue[1]}
                       onChange={(e) => setSliderValue([sliderValue[0], Number(e.target.value) || 500])}
                       className="w-full py-2.5 px-3 pl-6 rounded-xl border border-gray-200 text-sm bg-gray-50"
                       placeholder="500"
                     />
                   </div>
                 </div>
               </div>
             </motion.div>

            
          </div>
        </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 h-screen overflow-y-auto overscroll-none" style={{ overscrollBehavior: 'none' }}>
        <div className="px-6 lg:px-12 pt-8 lg:pt-20 pb-40 min-h-full">  
          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 bg-white"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="pt-8 px-6 pb-6 overflow-y-auto overscroll-none flex flex-col" style={{ 
                    overscrollBehavior: 'none',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y'
                  }}>
                       
                    {/* Featured Filter Switch */}
                    <div className="mb-8">
                      <label className="flex items-center cursor-pointer">
                        <div
                          onClick={() => handleMobileFilterChange({ featured: !tempMobileFilters.featured })}
                          className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                            tempMobileFilters.featured ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200 shadow-md ${
                              tempMobileFilters.featured ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </div>
                        <span className="font-semibold text-sm ml-3">Featured items only</span>
                      </label>
                    </div>

                    {/* Categories */}
                    <div className="mb-8">
                      <div className="font-semibold mb-3">Categories</div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="category-mobile"
                            checked={!tempMobileFilters.category}
                            onChange={() => handleMobileCategoryToggle('')}
                            className="mr-2 accent-gray-900"
                          />
                          <span className="text-sm">All</span>
                        </label>
                        {categories.map((category) => (
                          <label key={category} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="category-mobile"
                              checked={tempMobileFilters.category === category}
                              onChange={() => handleMobileCategoryToggle(category)}
                              className="mr-2 accent-gray-900"
                            />
                            <span className="text-sm">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tag Search and Filter */}
                    <div className="mb-8">
                      <div className="font-semibold mb-3">Tags</div>
                      
                      {/* Search Input */}
                      <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search tags..."
                          value={tagSearchQuery}
                          className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl outline-none text-sm bg-slate-50 text-slate-900 transition-all duration-200 focus:bg-white focus:border-slate-300 hover:bg-white hover:border-slate-300"
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* Tag List */}
                      <div className="flex flex-wrap gap-2">
                        {/* Selected tags first (with cancel icon) - filtered by search */}
                        {tempMobileFilters.tags
                          .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                          .map((tag) => (
                            <button
                              key={`selected-${tag}`}
                              onClick={() => handleMobileTagToggle(tag)}
                              className="flex items-center bg-gray-900 text-white border-none rounded-full px-3 py-1.5 text-sm cursor-pointer gap-1.5"
                            >
                              {tag}
                              <span className="text-base leading-none">&times;</span>
                            </button>
                          ))}
                        
                        {/* Unselected tags - filtered by search */}
                        {filteredTags
                          .filter(tag => !tempMobileFilters.tags.includes(tag))
                          .map((tag) => (
                            <button
                              key={`unselected-${tag}`}
                              onClick={() => handleMobileTagToggle(tag)}
                              className="bg-gray-100 text-black border-none rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200 hover:bg-gray-200"
                            >
                              {tag}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Price Range Slider */}
                    <div className="mb-8">
                      <div className="font-semibold mb-3">Price Range</div>
                      <div className="mb-4">
                        <Slider
                          min={50}
                          max={500}
                          step={50}
                          value={tempMobileSliderValue}
                          onValueChange={value => handleTempMobileSliderChange(value as [number, number])}
                          className="w-full h-6 flex items-center"
                        />
                        <style>{`.slider-track, .slider > .slider-track { height: 4px !important; }`}</style>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Min</div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              min={50}
                              max={tempMobileSliderValue[1]}
                              value={tempMobileSliderValue[0]}
                              onChange={(e) => handleTempMobileSliderChange([Number(e.target.value) || 50, tempMobileSliderValue[1]])}
                              className="w-full py-2.5 px-3 pl-6 rounded-xl border border-gray-200 text-sm bg-gray-50"
                              placeholder="50"
                            />
                          </div>
                        </div>
                        <div className="self-center font-semibold text-gray-400">-</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Max</div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              min={tempMobileSliderValue[0]}
                              max={500}
                              value={tempMobileSliderValue[1]}
                              onChange={(e) => handleTempMobileSliderChange([tempMobileSliderValue[0], Number(e.target.value) || 500])}
                              className="w-full py-2.5 px-3 pl-6 rounded-xl border border-gray-200 text-sm bg-gray-50"
                              placeholder="500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowMobileFilters(false)}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyMobileFilters}
                          className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Header */}
          <div className="mb-6">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-baseline gap-4">
                <h3 className="text-3xl font-medium text-gray-900 mb-0 flex items-center gap-2">
                  <AnimatedNumber value={resultsToDisplay.total} />
                  <span>{resultsToDisplay.total === 1 ? 'result' : 'results'}</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative z-40">
                  <button
                    onFocus={() => setShowSortDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSortDropdown(false), 200);
                    }}
                    className={`flex items-center gap-2 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 ${
                      showSortDropdown 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>{sortOptions.find(opt => opt.value === filters.sortBy)?.label || 'Sort by'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Sort Dropdown - positioned below the button */}
                  <AnimatePresence>
                    {showSortDropdown && (
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
                        className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-48"
                      >
                        {sortOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.04 }}
                            onMouseDown={() => {
                              handleFilterChange({ sortBy: option.value });
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                              filters.sortBy === option.value 
                                ? 'text-slate-900 bg-slate-50 font-medium' 
                                : 'text-slate-700'
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* First Row: Results Count and Sort */}
                             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-3xl font-medium text-gray-900 flex items-baseline gap-2 -mb-1">
                   <span>{resultsToDisplay.total}</span>
                   <span>{resultsToDisplay.total === 1 ? 'result' : 'results'}</span>
                 </h3>
                
                {/* Sort Dropdown */}
                <div className="relative z-40" ref={sortDropdownRef}>
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`flex items-center gap-2 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 touch-manipulation ${
                      showSortDropdown 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>{sortOptions.find(opt => opt.value === filters.sortBy)?.label || 'Sort by'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Sort Dropdown - positioned below the button */}
                  <AnimatePresence>
                    {showSortDropdown && (
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
                        className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-48"
                      >
                        {sortOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.04 }}
                            onClick={() => {
                              handleFilterChange({ sortBy: option.value });
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-50 active:bg-slate-100 touch-manipulation ${
                              filters.sortBy === option.value 
                                ? 'text-slate-900 bg-slate-50 font-medium' 
                                : 'text-slate-700'
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Second Row: Filter and Reset Filter */}
              <div className="flex items-center justify-between mb-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={openMobileFilters}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                  <Filter className="w-4 h-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(filters.category ? 1 : 0) + filters.tags.length + (filters.featured ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Reset Filter Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {isFiltering && hasActiveFilters ? (
            // Show skeleton with fast fade in/out transition when filtering (only if there are active filters)
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showSkeleton ? 1 : 0 }}
              transition={{ 
                duration: showSkeleton ? 0.15 : 0.1, // Faster fade in, even faster fade out
                ease: "easeInOut"
              }}
            >
              <ProductFilterSkeleton animate={false} />
            </motion.div>
          ) : (
            // Show actual results with appropriate animation
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
            >
              {resultsToDisplay.items.length === 0 ? (
                // No results message
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-6 text-center max-w-md">
                    Try adjusting your search terms or filters to find what you&apos;re looking for
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                resultsToDisplay.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="flex flex-col cursor-pointer group"
                  onClick={() => handleProductClick(item)}
                  initial={{ 
                    opacity: 0,
                    y: isInitialLoad ? 80 : 20,  // More dramatic upward movement
                    filter: isInitialLoad ? 'blur(8px)' : 'blur(0px)',  // Stronger blur effect
                    scale: isInitialLoad ? 0.9 : 1  // Slight scale effect on initial load
                  }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    scale: 1
                  }}
                  transition={{
                    duration: isInitialLoad ? 0.8 : 0.3,  // Even longer for more impact
                    delay: isInitialLoad ? index * 0.05 : 0,  // 50ms delay per card for faster stagger
                    ease: [0.25, 0.46, 0.45, 0.94],
                    filter: { duration: isInitialLoad ? 0.6 : 0 },  // Longer blur transition
                    scale: { duration: isInitialLoad ? 0.8 : 0 }  // Scale transition timing
                  }}
                >
                {/* Product Image: 4:5 cropped */}
                <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden rounded-lg">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Tags overlay from top */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Use item tags if available, otherwise create some relevant tags
                        const itemTags = item.tags || [];
                        const fallbackTags = [];
                        
                        // Add some relevant tags based on product type
                        if (item.title.toLowerCase().includes('wireless')) fallbackTags.push('wireless');
                        if (item.title.toLowerCase().includes('premium')) fallbackTags.push('premium');
                        if (item.title.toLowerCase().includes('mouse')) fallbackTags.push('precision');
                        if (item.title.toLowerCase().includes('headphones')) fallbackTags.push('audio');
                        if (item.title.toLowerCase().includes('gaming')) fallbackTags.push('gaming');
                        if (item.title.toLowerCase().includes('office')) fallbackTags.push('office');
                        if (item.title.toLowerCase().includes('ergonomic')) fallbackTags.push('ergonomic');
                        
                        const displayTags = itemTags.length > 0 ? itemTags : fallbackTags;
                        
                        return displayTags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-black/10 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-full transform translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                            style={{
                              transitionDelay: `${tagIndex * 75}ms`
                            }}
                          >
                            {tag}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Add to bag overlay from bottom */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm text-white text-center py-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer group/add-to-bag"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering product click
                      showAddToBagToast(item.title);
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 pointer-events-none">
                      <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover/add-to-bag:rotate-12 group-hover/add-to-bag:scale-105" />
                      <span className="font-medium text-base tracking-wide">QUICK ADD TO BAG</span>
                    </div>
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="flex flex-col px-0 pt-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center text-sm text-gray-700 gap-3">
                    <span className="font-bold text-lg text-gray-900">${item.price}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <Star className="w-4 h-4 text-yellow-400 fill-current inline-block" />
                      {item.rating}
                    </span>
                  </div>
                </div>
              </motion.div>
            )))}
          </motion.div>
          )}
        </div>
      </main>
    </div>
  );
} 