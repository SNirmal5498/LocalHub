import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Business } from '../types/index.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { Heart, Trash2, ArrowRight, MapPin } from 'lucide-react';

export const CustomerFavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.getFavorites();
        if (res.success && res.data) {
          setFavorites(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const handleRemove = async (businessId: string) => {
    await api.removeFavorite(businessId);
    setFavorites(prev => prev.filter(b => b._id !== businessId));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          My Saved Stores
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Your bookmarked local bakeries, workshops, and neighbourhood artisans
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading your favorite stores...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              No saved stores yet
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Click the heart icon on any storefront to save it here for fast access and re-orders.
            </p>
          </div>
          <Link
            to="/businesses"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors"
          >
            Explore Local Businesses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(biz => (
            <div
              key={biz._id}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
            >
              <div className="relative aspect-16/9 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <ImageWithFallback
                  src={biz.coverImage}
                  alt={biz.name}
                  category={biz.category}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemove(biz._id)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 text-rose-500 hover:text-rose-600 shadow-xs transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{biz.category}</span>
                    <RatingStars rating={biz.rating} reviewCount={biz.reviewCount} size="sm" />
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{biz.address}, {biz.city}</span>
                  </p>
                </div>

                <Link
                  to={`/business/${biz.slug}`}
                  className="w-full py-2 text-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-colors"
                >
                  View Storefront
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
