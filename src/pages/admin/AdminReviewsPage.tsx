import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Review } from '../../types/index.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const res = await api.getAdminReviews();
    if (res.success && res.data) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await api.deleteAdminReview(id);
    if (res.success) {
      setReviews(prev => prev.filter(r => r._id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Review Moderation
        </h1>
        <p className="text-xs text-neutral-500">
          Moderate customer reviews and take action on reported spam or abusive content
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <ShieldCheck className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No reviews yet.
          </h3>
          <p className="text-xs text-neutral-500">Customer reviews for local stores will appear here for platform moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review._id}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {review.customerName}
                    </span>
                    <span className="text-xs text-neutral-400">
                      reviewed store ({review.business})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <RatingStars rating={review.rating} size="sm" showText={false} />
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Remove review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {review.comment}
              </p>

              {review.ownerResponse && (
                <div className="pl-4 border-l-2 border-amber-500 text-xs text-neutral-500 italic">
                  Merchant response: "{review.ownerResponse}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
