import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const clamped = Math.min(5, Math.max(0, rating));
  const fullStars = Math.floor(clamped);
  const hasHalf = clamped - fullStars >= 0.3;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map(index => {
          const isFilled = index <= fullStars;
          const isHalf = index === fullStars + 1 && hasHalf;
          return (
            <Star
              key={index}
              className={`${iconSizes[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-neutral-300 dark:text-neutral-700'
              }`}
            />
          );
        })}
      </div>
      {showText && (
        <span className={`font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 ${textSizes[size]}`}>
          {clamped.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-neutral-500 dark:text-neutral-400 ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
