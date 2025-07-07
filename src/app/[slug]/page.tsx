'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TagPageProps {
  params: {
    slug: string;
  };
}

function TagPage({ params }: TagPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page with tag filter
    router.replace(`/search?tags=${encodeURIComponent(params.slug)}`);
  }, [params.slug, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default TagPage; 