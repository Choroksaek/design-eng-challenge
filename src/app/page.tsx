'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchItem } from '@/types';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/search');
        const data = await response.json();
        setProducts(data.items || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Disable scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);



  const handleExploreAll = () => {
    router.push('/search');
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

      return (
      <>
        <style jsx global>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-2000px); }
          }
          .marquee {
            display: flex;
            animation: marquee 30s linear infinite;
          }
          .paused {
            animation-play-state: paused;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
        <div className="h-screen bg-white overflow-auto flex flex-col">
        {/* Image Gallery Section */}
        <div className="w-full py-4 overflow-hidden min-h-[350px] md:min-h-[280px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex"
        >
          <div
            className={`marquee space-x-6 flex-shrink-0 ${isHovering ? 'paused' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Triple the products for seamless infinite loop */}
            {[...products, ...products, ...products].map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 group cursor-pointer flex flex-col gap-2"
                onClick={() => router.push(`/search?q=${encodeURIComponent(product.title)}`)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Image Container */}
                <div className="w-72 sm:w-80 h-48 sm:h-56 bg-slate-100 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <span className="text-slate-500 text-sm font-medium">{product.title}</span>
                    </div>
                  )}
                </div>
                
                {/* Text Content Below Image */}
                <div className="mt-2 w-72 sm:w-80 md:w-80 opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 delay-100">
                  {/* Product Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 max-w-full">
                      {product.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Product Name */}
                  <h3 className="text-slate-900 text-lg sm:text-xl font-semibold line-clamp-2 leading-tight">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gap/Spacer */}
      <div className="h-8 sm:h-12 lg:h-10"></div>

      {/* Main Text Contents */}
        <div className='flex flex-col m-4 lg:ml-[45vw] items-start flex-1'>
      {/* Section Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <span className="text-sm text-slate-500 font-medium">Scout Store®</span>
      </motion.div>

      {/* Main Headline */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <h1 className="text-4xl lg:text-[5vw] font-black text-slate-900 leading-tight tracking-tight">
          <div className="overflow-hidden">
            {'THINKING BOLDLY.'.split('').map((char, charIndex) => (
              <motion.span
                key={charIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.9 + charIndex * 0.02,
                  ease: "easeOut"
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>
          <div className="overflow-hidden">
            {'CRAFTING VISUALLY.'.split('').map((char, charIndex) => (
              <motion.span
                key={charIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 1.2 + charIndex * 0.02,
                  ease: "easeOut"
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>
        </h1>
      </motion.div>

      {/* Subheading */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <p className="text-lg md:text-1xl mt-2 text-slate-600 font-medium max-w-3xl">
          Not just items. These are experiences.
        </p>
      </motion.div>

      {/* Explore Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}  
        className="py-2 mt-6"
      >
                  <button
            onClick={handleExploreAll}
            className="group relative px-0 py-2 cursor-pointer bg-transparent text-slate-900 font-semibold text-lg border-b-1 border-slate-900 hover:border-slate-600 transition-colors duration-300"
          >
          Explore All Products
        </button>
      </motion.div>
      </div>
    </div>
    </>
  );
}
