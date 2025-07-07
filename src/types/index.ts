export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price?: number;
  rating?: number;
  imageUrl?: string;
  createdAt: string;
  featured?: boolean;
}

export interface SearchFilters {
  query: string;
  category?: string;
  tags: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  featured?: boolean;
}

export interface SearchResponse {
  items: SearchItem[];
  total: number;
  suggestions: string[];
  facets: {
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchItem[];
  loading: boolean;
  error: string | null;
  suggestions: string[];
  facets: SearchResponse['facets'];
} 