import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, Review } from '../../types/index.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import { MessageSquare, CornerDownRight, CheckCircle2, Star } from 'lucide-react';

export const BusinessReviewsPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    if (!business) return;
    setLoading(true);
    const res = await api.getReviewsByBusiness(business._id);
    if (res.success && res.data) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [business?._id]);

  const handlePostResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    const res = await api.respondToReview(reviewId, responseText.trim());
    setSubmitting(false);

    if (res.success && res.data) {
      setReviews(prev =>
        prev.map(r => (r._id === reviewId ? { ...r, ownerResponse: responseText.trim() } : r))
      );
      setRespondingTo(null);
      setResponseText('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-neutral-500">
            View customer feedback and post verified responses from the store owner
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-bold text-neutral-900 dark:text-white">
            {(business.rating || 0).toFixed(1)}
          </span>
          <span className="text-neutral-400">({reviews.length} reviews)</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <Star className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No reviews yet.
          </h3>
          <p className="text-xs text-neutral-500">
            Reviews left by customers on your public storefront will appear here.
          </p>
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
                    {review.order && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Verified Order
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <RatingStars rating={review.rating} size="sm" showText={false} />
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {review.comment}
              </p>

              {/* Owner Response */}
              {review.ownerResponse ? (
                <div className="p-3 pl-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border-l-2 border-amber-500 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-amber-500" /> Your Response:
                    </span>
                    <button
                      onClick={() => {
                        setRespondingTo(review._id);
                        setResponseText(review.ownerResponse || '');
                      }}
                      className="text-[11px] text-neutral-400 hover:text-amber-500"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
                    {review.ownerResponse}
                  </p>
                </div>
              ) : respondingTo === review._id ? (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Write a polite response to this customer..."
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRespondingTo(null)}
                      className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePostResponse(review._id)}
                      disabled={submitting}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-600"
                    >
                      {submitting ? 'Posting...' : 'Post Response'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setRespondingTo(review._id);
                      setResponseText('');
                    }}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Respond to Customer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
