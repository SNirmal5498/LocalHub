import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Review } from '../../types/index.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import {
  Trash2,
  AlertTriangle,
  ShieldCheck,
  EyeOff,
  Eye,
  Flag,
  Search,
  Filter,
  X,
  Store,
  User,
  MessageSquare,
} from 'lucide-react';

interface ModerationModalState {
  isOpen: boolean;
  review: Review | null;
  action: 'hide' | 'flag' | 'delete' | null;
  reason: string;
  loading: boolean;
  error?: string | null;
}

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Moderation Modal
  const [modalState, setModalState] = useState<ModerationModalState>({
    isOpen: false,
    review: null,
    action: null,
    reason: '',
    loading: false,
    error: null,
  });

  const loadReviews = async () => {
    setLoading(true);
    const res = await api.getAdminReviews({
      q: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      rating: ratingFilter !== 'all' ? ratingFilter : undefined,
    });
    if (res.success && res.data) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter, ratingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const openModal = (review: Review, action: 'hide' | 'flag' | 'delete') => {
    setModalState({
      isOpen: true,
      review,
      action,
      reason:
        action === 'hide'
          ? 'Violates platform community guidelines (inappropriate or off-topic content).'
          : '',
      loading: false,
      error: null,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      review: null,
      action: null,
      reason: '',
      loading: false,
      error: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!modalState.review || !modalState.action) return;

    setModalState(prev => ({ ...prev, loading: true, error: null }));

    if (modalState.action === 'delete') {
      const res = await api.deleteAdminReview(modalState.review._id);
      if (res.success) {
        setReviews(prev => prev.filter(r => r._id !== modalState.review!._id));
        closeModal();
      } else {
        setModalState(prev => ({
          ...prev,
          loading: false,
          error: res.message || 'Failed to delete review.',
        }));
      }
    } else {
      const nextStatus = modalState.action === 'hide' ? 'hidden' : 'flagged';
      const res = await api.moderateAdminReview(
        modalState.review._id,
        nextStatus,
        modalState.reason
      );
      if (res.success && res.data) {
        setReviews(prev =>
          prev.map(r => (r._id === modalState.review!._id ? { ...r, ...res.data } : r))
        );
        closeModal();
      } else {
        setModalState(prev => ({
          ...prev,
          loading: false,
          error: res.message || 'Failed to moderate review.',
        }));
      }
    }
  };

  const handleRestoreReview = async (review: Review) => {
    const res = await api.moderateAdminReview(review._id, 'published', 'Restored by administrator');
    if (res.success && res.data) {
      setReviews(prev => prev.map(r => (r._id === review._id ? { ...r, ...res.data } : r)));
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'hidden':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'flagged':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'published':
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Review Moderation & Trust Governance
        </h1>
        <p className="text-xs text-neutral-500">
          Moderate customer reviews, hide abusive submissions, restore legitimate feedback, and maintain platform ratings
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, store name, or review comment..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Star Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 shrink-0">Rating:</span>
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'published', label: 'Published' },
            { id: 'hidden', label: 'Hidden / Moderated' },
            { id: 'flagged', label: 'Flagged for Review' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Querying customer reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3 bg-white dark:bg-neutral-900">
          <ShieldCheck className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No reviews match the criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query, rating, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const isHidden = review.status === 'hidden';

            return (
              <div
                key={review._id}
                className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all space-y-3 shadow-xs ${
                  isHidden
                    ? 'border-red-200 dark:border-red-950/60 bg-red-50/20'
                    : 'border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {review.customerName}
                    </span>
                    <span className="text-xs text-neutral-400">reviewed</span>
                    <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-neutral-400" />
                      {review.businessName || 'Local Store'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-1 ${getStatusBadge(
                        review.status
                      )}`}
                    >
                      {review.status || 'published'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <RatingStars rating={review.rating} size="sm" showText={false} />
                    <span className="text-[11px] text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50/50 dark:bg-neutral-800/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  {review.comment}
                </p>

                {/* Moderation reason banner if hidden */}
                {isHidden && review.moderationReason && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>
                        <strong>Hidden from public:</strong> {review.moderationReason}
                      </span>
                    </div>
                    {review.moderatedBy && (
                      <span className="text-[10px] text-red-500 shrink-0">
                        by {review.moderatedBy}
                      </span>
                    )}
                  </div>
                )}

                {/* Merchant Response if any */}
                {review.ownerResponse && (
                  <div className="pl-3.5 border-l-2 border-amber-500 text-xs text-neutral-600 dark:text-neutral-400 italic">
                    <strong className="text-neutral-900 dark:text-white not-italic">
                      Merchant Response:
                    </strong>{' '}
                    "{review.ownerResponse}"
                  </div>
                )}

                {/* Moderation Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  {isHidden ? (
                    <button
                      onClick={() => handleRestoreReview(review)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Restore to Public
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openModal(review, 'hide')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Hide Review
                      </button>
                      <button
                        onClick={() => openModal(review, 'flag')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1"
                      >
                        <Flag className="w-3.5 h-3.5" /> Flag
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => openModal(review, 'delete')}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Permanently remove review from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Moderation Modal */}
      {modalState.isOpen && modalState.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white capitalize">
                {modalState.action === 'delete' ? 'Delete Review' : `${modalState.action} Review`}
              </h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {modalState.action === 'delete'
                ? 'Are you sure you want to permanently remove this review? Store rating will be recalculated immediately.'
                : `Specify moderation notes for updating the review from ${modalState.review.customerName}:`}
            </p>

            {modalState.action !== 'delete' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Moderation Reason
                </label>
                <textarea
                  rows={3}
                  value={modalState.reason}
                  onChange={e => setModalState(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Inappropriate language, spam, or unsubstantiated harassment..."
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {modalState.error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {modalState.error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={closeModal}
                disabled={modalState.loading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={modalState.loading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                  modalState.action === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {modalState.loading
                  ? 'Processing...'
                  : modalState.action === 'delete'
                  ? 'Permanently Delete'
                  : 'Apply Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
