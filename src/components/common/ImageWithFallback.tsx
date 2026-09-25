import React, { useState } from 'react';
import { Store, ShoppingBag, Wrench, Shirt, Cake, Sparkles } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  category = '',
  aspectRatio = 'auto',
}) => {
  const [error, setError] = useState(false);

  const getCategoryIcon = () => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('bakery') || cat.includes('cake')) {
      return <Cake className="w-8 h-8 text-amber-600/80 dark:text-amber-400/80" />;
    }
    if (cat.includes('repair') || cat.includes('tech') || cat.includes('electronic')) {
      return <Wrench className="w-8 h-8 text-sky-600/80 dark:text-sky-400/80" />;
    }
    if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel')) {
      return <Shirt className="w-8 h-8 text-emerald-600/80 dark:text-emerald-400/80" />;
    }
    if (cat.includes('beauty') || cat.includes('salon')) {
      return <Sparkles className="w-8 h-8 text-rose-600/80 dark:text-rose-400/80" />;
    }
    return <Store className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />;
  };

  if (!src || error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800 select-none ${className}`}
      >
        <div className="p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-xs mb-2">
          {getCategoryIcon()}
        </div>
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 text-center line-clamp-1 px-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
};
