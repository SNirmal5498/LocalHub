import React from 'react';
import { Review } from '../../types/index.js';
import { RatingStars } from '../common/RatingStars.js';
import { CheckCircle2, MessageSquare, CornerDownRight } from 'lucide-react';

interface ReviewItemProps {
  review: Review;
  storeName?: string;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review, storeName = 'Store Owner' }) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {review.customerName}
            </span>
            {review.order && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Verified Customer
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-400">{formattedDate}</span>
        </div>

        <RatingStars rating={review.rating} size="sm" showText={false} />
      </div>

      {/* Review Comment */}
      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        {review.comment}
      </p>

      {/* Merchant Response */}
      {review.ownerResponse && (
        <div className="pt-2 pl-4 border-l-2 border-amber-500 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-r-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
            <span>Response from {storeName}</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
            {typeof review.ownerResponse === 'object' && review.ownerResponse !== null
              ? (review.ownerResponse as any).text || JSON.stringify(review.ownerResponse)
              : String(review.ownerResponse)}
          </p>
        </div>
      )}
    </div>
  );
};
