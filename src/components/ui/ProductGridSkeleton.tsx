import { motion } from 'framer-motion';

interface ProductGridSkeletonProps {
  showSidebar?: boolean;
  itemCount?: number;
}

interface ProductFilterSkeletonProps {
  itemCount?: number;
  animate?: boolean;
}

export function ProductFilterSkeleton({ itemCount = 6, animate = true }: ProductFilterSkeletonProps) {
  const SkeletonWrapper = animate ? motion.div : 'div';
  const skeletonProps = animate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  } : {};

  return (
    <SkeletonWrapper 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      {...skeletonProps}
    >
      {[...Array(itemCount)].map((_, i) => (
        <div key={i} className="flex flex-col">
          {/* Product Image Skeleton */}
          <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Product Details Skeleton */}
          <div className="flex flex-col px-0 pt-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-4/5"></div>
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </SkeletonWrapper>
  );
}

export default function ProductGridSkeleton({ showSidebar = true, itemCount = 6 }: ProductGridSkeletonProps) {
  return (
    <div className="w-full bg-white h-screen flex overscroll-none">
      {/* Desktop Sidebar Skeleton */}
      {showSidebar && (
        <aside className="hidden lg:block w-80 fixed left-0 top-20 bottom-0 z-30 bg-white border-r border-gray-100 overscroll-none">
          <div className="h-full pt-8 px-6 pb-6 overflow-y-auto overscroll-none flex flex-col">
            {/* Featured Filter Skeleton */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-3 h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="mb-8">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mb-3"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Skeleton */}
            <div className="mb-8">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-12 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-16"></div>
                ))}
              </div>
            </div>

            {/* Price Range Skeleton */}
            <div className="mb-8">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-8 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="self-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-8 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Skeleton */}
      <main className={`flex-1 ${showSidebar ? 'lg:ml-80' : ''} h-screen overflow-y-auto`}>
        <div className="px-6 lg:px-12 pt-24 pb-40 min-h-full">
          {/* Mobile Filter Toggle Skeleton */}
          <div className="lg:hidden mb-6">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
          </div>

          {/* Results Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-9 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-32"></div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <ProductFilterSkeleton itemCount={itemCount} animate={false} />
        </div>
      </main>
    </div>
  );
} 