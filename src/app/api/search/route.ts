import { NextRequest, NextResponse } from 'next/server';
import { SearchResponse } from '@/types';

// This is the backend API that's already built out for the assessment
// Candidates will call this endpoint from their frontend components

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sortBy = searchParams.get('sortBy') || 'relevance';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const featured = searchParams.get('featured') === 'true';

  // Simulate API delay for realistic loading states
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  // Mock search implementation - in a real app this would query a database
  const mockItems = [
    {
      id: '1',
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life',
      category: 'Electronics',
      tags: ['wireless', 'audio', 'premium', 'noise-canceling'],
      price: 299.99,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      createdAt: '2024-01-15T00:00:00Z',
      featured: true
    },
    {
      id: '2',
      title: 'Ergonomic Office Chair',
      description: 'Comfortable office chair with lumbar support and adjustable height',
      category: 'Furniture',
      tags: ['office', 'ergonomic', 'comfort', 'adjustable'],
      price: 449.99,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      createdAt: '2024-01-14T00:00:00Z',
      featured: false
    },
    {
      id: '3',
      title: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      category: 'Electronics',
      tags: ['gaming', 'mechanical', 'rgb', 'typing'],
      price: 159.99,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
      createdAt: '2024-01-13T00:00:00Z',
      featured: false
    },
    {
      id: '4',
      title: 'Standing Desk Converter',
      description: 'Adjustable desk converter for standing work',
      category: 'Furniture',
      tags: ['office', 'standing', 'adjustable', 'health'],
      price: 199.99,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      createdAt: '2024-01-12T00:00:00Z',
      featured: true
    },
    {
      id: '5',
      title: 'Wireless Mouse',
      description: 'Precision wireless mouse with ergonomic design',
      category: 'Electronics',
      tags: ['wireless', 'ergonomic', 'precision', 'gaming'],
      price: 79.99,
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      createdAt: '2024-01-11T00:00:00Z',
      featured: false
    }
  ];

  // Filter items based on search criteria
  let filteredItems = mockItems.filter(item => {
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = !category || item.category === category;
    const matchesTags = tags.length === 0 || tags.some(tag => item.tags.includes(tag));
    const matchesPrice = (!minPrice || item.price >= parseFloat(minPrice)) &&
                        (!maxPrice || item.price <= parseFloat(maxPrice));
    const matchesFeatured = !featured || item.featured;

    return matchesQuery && matchesCategory && matchesTags && matchesPrice && matchesFeatured;
  });

  // Sort items
  switch (sortBy) {
    case 'price-asc':
      filteredItems.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredItems.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredItems.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default: // relevance
      // Keep original order for relevance
      break;
  }

  // Generate suggestions based on query
  const suggestions = query.length > 0 ? [
    ...mockItems.map(item => item.title),
    ...mockItems.flatMap(item => item.tags)
  ].filter(suggestion => 
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) : [];

  // Generate facets
  const allCategories = [...new Set(mockItems.map(item => item.category))];
  const allTags = [...new Set(mockItems.flatMap(item => item.tags))];
  const allPrices = mockItems.map(item => item.price);

  const response: SearchResponse = {
    items: filteredItems,
    total: filteredItems.length,
    suggestions: [...new Set(suggestions)],
    facets: {
      categories: allCategories.map(cat => ({
        name: cat,
        count: mockItems.filter(item => item.category === cat).length
      })),
      tags: allTags.map(tag => ({
        name: tag,
        count: mockItems.filter(item => item.tags.includes(tag)).length
      })),
      priceRange: {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices)
      }
    }
  };

  return NextResponse.json(response);
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 