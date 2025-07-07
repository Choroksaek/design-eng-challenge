'use client';

import { Suspense } from 'react';
import SearchResults from '@/components/SearchResults';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ProductGridSkeleton from '@/components/ui/ProductGridSkeleton';

function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <Suspense fallback={<ProductGridSkeleton />}>
          <SearchResults />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default SearchPage; 