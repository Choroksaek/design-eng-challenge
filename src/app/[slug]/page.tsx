'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function TagPage({ params }: TagPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle async params in Next.js 15
    params.then((resolvedParams) => {
      router.replace(`/search?tags=${encodeURIComponent(resolvedParams.slug)}`);
    });
  }, [params, router]);

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