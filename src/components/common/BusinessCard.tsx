import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Business } from '../../types/index.js';
import { RatingStars } from './RatingStars.js';
import { ImageWithFallback } from './ImageWithFallback.js';
import {
  openDrivingDirections,
  calculateDistanceKm,
  formatDistance,
} from '../../utils/location.js';
import {
  MapPin,
  Navigation,
  ArrowRight,
  Sparkles,
  Store,
  Cake,
  Wrench,
  Shirt,
  Truck,
  ShoppingBag,
} from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  userCoords?: { latitude: number; longitude: number } | null;
}

export function isPlaceholder(val?: string | null): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return true;
  if (/^[-_\s.]+$/.test(trimmed)) return true;
  if (['n/a', 'na', 'none', 'null', 'undefined', 'placeholder'].includes(trimmed)) return true;
  return false;
}

export function getSafeDescription(biz: Business): string {
  if (biz.tagline && !isPlaceholder(biz.tagline)) {
    return biz.tagline.trim();
  }
  if (biz.description && !isPlaceholder(biz.description)) {
    return biz.description.trim();
  }
  const city = biz.city?.trim() || 'your neighborhood';
  const category = biz.category?.trim() || 'local business';
  return `Verified independent ${category.toLowerCase()} merchant offering quality products and personalized services in ${city}.`;
}

export function getSafeAddress(biz: Business): string {
  const parts: string[] = [];
  if (biz.address && !isPlaceholder(biz.address)) {
    parts.push(biz.address.trim());
  }
  if (biz.city && !isPlaceholder(biz.city)) {
    parts.push(biz.city.trim());
  } else if (parts.length === 0) {
    parts.push('Local Storefront');
  }
  return parts.join(', ');
}

export const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('bakery') || cat.includes('cake')) {
    return <Cake className="w-3.5 h-3.5 text-amber-500" />;
  }
  if (cat.includes('tech') || cat.includes('repair') || cat.includes('phone') || cat.includes('electronic')) {
    return <Wrench className="w-3.5 h-3.5 text-sky-500" />;
  }
  if (cat.includes('apparel') || cat.includes('boutique') || cat.includes('fashion') || cat.includes('cloth')) {
    return <Shirt className="w-3.5 h-3.5 text-emerald-500" />;
  }
  if (cat.includes('beauty') || cat.includes('wellness') || cat.includes('salon')) {
    return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
  }
  return <Store className="w-3.5 h-3.5 text-amber-500" />;
};

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  userCoords,
}) => {
  const navigate = useNavigate();

  const distanceKm =
    userCoords && business.latitude && business.longitude
      ? calculateDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          business.latitude,
          business.longitude
        )
      : null;

  const safeDescription = getSafeDescription(business);
  const safeAddress = getSafeAddress(business);
  const hasReviews = (business.reviewCount || 0) > 0 && (business.rating || 0) > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid re-navigating if user clicked an explicit link or button inside the card
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    navigate(`/business/${business.slug}`);
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrivingDirections(business);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-amber-500/80"
      aria-label={`Storefront: ${business.name}`}
    >
      {/* 1. Cover Image with Ratio & Badge Overlays */}
      <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <ImageWithFallback
          src={business.coverImage}
          alt={`${business.name} storefront`}
          category={business.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient scrim for top & bottom badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

        {/* Category Pill (Top-Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm border border-black/5 dark:border-white/10">
          {getCategoryIcon(business.category)}
          <span className="truncate max-w-[130px]">{business.category || 'Local Business'}</span>
        </div>

        {/* Open Now / Closed Status Pill (Top-Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md text-[11px] font-bold shadow-sm border border-black/5 dark:border-white/10">
          {business.isOpen ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">Open Now</span>
            </>
          ) : (
            <>
              <span className="inline-flex rounded-full h-2 w-2 bg-neutral-400" />
              <span className="text-neutral-600 dark:text-neutral-400">Closed</span>
            </>
          )}
        </div>

        {/* Distance Badge (Bottom-Right, when Near Me is active) */}
        {distanceKm !== null && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-950/85 backdrop-blur-md text-white text-[11px] font-semibold shadow-sm border border-white/10">
            <Navigation className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{formatDistance(distanceKm)}</span>
          </div>
        )}
      </div>

      {/* 2. Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Top Info */}
        <div className="space-y-2.5">
          {/* Store Name & Ratings Row */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/business/${business.slug}`}
                className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-500 transition-colors line-clamp-1 focus:outline-hidden"
              >
                {business.name}
              </Link>
            </div>

            {/* Ratings or New Merchant Badge */}
            <div className="mt-1 flex items-center gap-2">
              {hasReviews ? (
                <RatingStars
                  rating={business.rating}
                  reviewCount={business.reviewCount}
                  size="sm"
                />
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-500/20">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>New to LocalHub</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed min-h-[32px]">
            {safeDescription}
          </p>

          {/* Service & Delivery Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {business.deliveryAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium">
                <Truck className="w-3 h-3 text-emerald-500" />
                Delivery Available
              </span>
            )}
            {business.pickupAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium">
                <ShoppingBag className="w-3 h-3 text-amber-500" />
                Store Pickup
              </span>
            )}
            {business.minOrderAmount && business.minOrderAmount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium">
                Min. ₹{business.minOrderAmount}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions & Address */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
          {/* Address & Directions */}
          <div className="flex items-center justify-between text-xs text-neutral-500 gap-2">
            <div
              className="flex items-center gap-1.5 truncate max-w-[190px] sm:max-w-[210px]"
              title={safeAddress}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate text-neutral-600 dark:text-neutral-400 text-xs">
                {safeAddress}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDirectionsClick}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 hover:underline cursor-pointer shrink-0 transition-colors focus:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-500 rounded px-1"
              aria-label={`Get driving directions to ${business.name}`}
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </button>
          </div>

          {/* Primary View Storefront Button */}
          <Link
            to={`/business/${business.slug}`}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-neutral-950 dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-all duration-200 shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span>View Storefront</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};
