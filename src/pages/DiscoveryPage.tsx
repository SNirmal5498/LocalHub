import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Business, Category } from '../types/index.js';
import { BusinessCard, getCategoryIcon } from '../components/common/BusinessCard.js';
import { BusinessCardSkeleton } from '../components/common/BusinessCardSkeleton.js';
import { MerchantPromoCard, CategoryQuickNavCard } from '../components/common/ExploreCompanionCards.js';
import { MapViewer } from '../components/common/MapViewer.js';
import {
  calculateDistanceKm,
  getUserCurrentLocation,
} from '../utils/location.js';
import {
  Search,
  MapPin,
  Clock,
  Grid,
  Map as MapIcon,
  Compass,
  Loader2,
  X,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Store,
  Star,
  Info,
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary data states
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controlled search input (live input state)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Filter states derived from URL searchParams
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All Categories';
  const minRating = searchParams.get('minRating') || '';
  const openNow = searchParams.get('openNow') === 'true';
  const sort = searchParams.get('sort') || 'rating';

  // View mode (grid vs map)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Customer geolocation state for nearby discovery
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sync search input when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  // Load category taxonomy once on mount
  useEffect(() => {
    let isCancelled = false;
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (!isCancelled && res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        } else if (!isCancelled) {
          // Graceful fallback taxonomy if database is seeding
          setCategories([
            { _id: 'cat-1', name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', isActive: true },
            { _id: 'cat-2', name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', isActive: true },
            { _id: 'cat-3', name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', isActive: true },
            { _id: 'cat-4', name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', isActive: true },
            { _id: 'cat-5', name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', isActive: true },
            { _id: 'cat-6', name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', isActive: true },
          ]);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load categories', err);
        }
      }
    }
    loadCategories();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch businesses whenever search/filter query parameters change
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: Record<string, any> = {};
    if (query.trim()) params.q = query.trim();
    if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
    if (minRating) params.minRating = minRating;
    if (openNow) params.openNow = 'true';
    if (sort && sort !== 'distance') params.sort = sort;

    try {
      const res = await api.getBusinesses(params);
      if (res.success && res.data) {
        setBusinesses(res.data);
      } else {
        setError(res.message || 'Unable to retrieve businesses. Please check your connection.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while fetching businesses.');
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, minRating, openNow, sort]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Update a single filter in the URL without overriding other active filters
  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || (key === 'category' && value === 'All Categories')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  // Search form submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('q', searchInput.trim() || null);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchInput('');
    updateFilter('q', null);
  };

  // Category switch handler
  const handleCategoryChange = (catName: string) => {
    updateFilter('category', catName === 'All Categories' ? null : catName);
  };

  // Geolocation Near Me toggle
  const handleLocateMe = async () => {
    if (locating) return;
    setLocationError(null);

    if (userCoords) {
      // Toggle off
      setUserCoords(null);
      if (sort === 'distance') {
        updateFilter('sort', 'rating');
      }
      return;
    }

    setLocating(true);
    const coords = await getUserCurrentLocation(5000);
    setLocating(false);

    if (coords) {
      setUserCoords(coords);
      updateFilter('sort', 'distance');
    } else {
      setLocationError(
        'Location access was unavailable or denied. You can still discover businesses by category or search.'
      );
    }
  };

  // Reset all active filters to default
  const handleResetAllFilters = () => {
    setSearchInput('');
    setUserCoords(null);
    setLocationError(null);
    setSearchParams(new URLSearchParams());
  };

  // Sorted list of businesses (calculates client-side distance when Near Me is active)
  const displayedBusinesses = useMemo(() => {
    const list = [...businesses];
    if (sort === 'distance' && userCoords) {
      list.sort((a, b) => {
        const distA =
          a.latitude && a.longitude
            ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude)
            : 999999;
        const distB =
          b.latitude && b.longitude
            ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude)
            : 999999;
        return distA - distB;
      });
    }
    return list;
  }, [businesses, sort, userCoords]);

  // Primary detected city for context
  const primaryCity = useMemo(() => {
    if (businesses.length > 0 && businesses[0].city) {
      return businesses[0].city;
    }
    return 'Your City';
  }, [businesses]);

  // Check if any filter is currently active
  const hasActiveFilters = Boolean(
    query.trim() ||
    selectedCategory !== 'All Categories' ||
    minRating ||
    openNow ||
    userCoords ||
    (sort && sort !== 'rating')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header & Discovery Hero */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Verified Local Marketplace</span>
            {primaryCity && primaryCity !== 'Your City' && (
              <>
                <span className="text-amber-400 dark:text-amber-500">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {primaryCity}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Explore Local Businesses
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Discover verified artisanal bakeries, certified repair workshops, independent boutiques, and neighbourhood specialists.
          </p>
        </div>

        {/* View Mode Toggle & Directory Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-xs"
          >
            <Store className="w-3.5 h-3.5 text-amber-500" />
            <span>All Categories</span>
          </Link>

          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Interactive Map View"
              aria-label="Map view"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Search & Controls Bar */}
      <section className="space-y-4">
        {/* Search Input Row with Combined Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by store name, bakery, mobile repairs, clothes, Coimbatore..."
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
              aria-label="Search businesses"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  title="Clear search input"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-amber-500 hover:text-neutral-950 dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Buttons & Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* Near Me Location Toggle */}
            <button
              type="button"
              onClick={handleLocateMe}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                userCoords
                  ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
              title={userCoords ? 'GPS Active (Click to reset)' : 'Find businesses near current location'}
              aria-label={userCoords ? 'Near Me Active (Tap to clear)' : 'Filter by distance Near Me'}
            >
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className={`w-3.5 h-3.5 ${userCoords ? 'text-white' : 'text-amber-500'}`} />
              )}
              <span>{locating ? 'Locating...' : userCoords ? 'Near Me (Active)' : 'Near Me'}</span>
            </button>

            {/* Open Now Toggle */}
            <button
              type="button"
              onClick={() => updateFilter('openNow', openNow ? null : 'true')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                openNow
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
              aria-label="Filter stores open right now"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Now</span>
            </button>

            {/* Minimum Rating Selector */}
            <select
              value={minRating}
              onChange={e => updateFilter('minRating', e.target.value || null)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
              aria-label="Filter by minimum rating"
            >
              <option value="">Any Rating</option>
              <option value="4.0">★ 4.0 & above</option>
              <option value="4.5">★ 4.5 & above</option>
              <option value="4.8">★ 4.8 & above</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
              aria-label="Sort businesses"
            >
              <option value="rating">Sort: Top Rated</option>
              {userCoords && <option value="distance">Sort: Nearest to Me</option>}
              <option value="reviews">Sort: Most Reviews</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Location Error Notice (if geolocation denied or failed) */}
        {locationError && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="p-1 rounded-md text-amber-700 hover:text-amber-950 dark:hover:text-white"
              aria-label="Dismiss location message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryChange('All Categories')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'All Categories'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-500" />
            <span>All Categories</span>
          </button>

          {categories.map(c => {
            const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => handleCategoryChange(c.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {getCategoryIcon(c.name)}
                <span>{c.name}</span>
              </button>
            );
          })}

          <Link
            to="/categories"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 shrink-0 ml-auto"
          >
            <span>All Categories Directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 3. Active Filters Chips & Results Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Results Count Text */}
          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            {loading ? (
              <span>Discovering verified stores...</span>
            ) : (
              <span>
                Showing <strong>{displayedBusinesses.length}</strong>{' '}
                {displayedBusinesses.length === 1 ? 'business' : 'businesses'}
                {primaryCity && primaryCity !== 'Your City' ? ` in ${primaryCity}` : ''}
              </span>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-400 mr-1">Filtered by:</span>

              {query.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                  <span>Search: &ldquo;{query}&rdquo;</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-0.5 hover:text-red-500"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'All Categories' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  <span>{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('All Categories')}
                    className="p-0.5 hover:text-red-500"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {openNow && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Open Now</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('openNow', null)}
                    className="p-0.5 hover:text-red-500"
                    aria-label="Remove Open Now filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span>★ {minRating}+</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('minRating', null)}
                    className="p-0.5 hover:text-red-500"
                    aria-label="Remove rating filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {userCoords && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <Compass className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Near Me</span>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="p-0.5 hover:text-red-500"
                    aria-label="Remove GPS location filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Reset All Filters Button */}
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline px-1.5 py-0.5 ml-1 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Main Results Presentation */}
      {loading ? (
        /* Skeletons Loading Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
        </div>
      ) : error ? (
        /* Error State with Retry */
        <div className="py-16 text-center space-y-4 rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 p-8 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Unable to Load Local Businesses
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBusinesses}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold inline-flex items-center gap-2 hover:bg-amber-500 hover:text-neutral-950 dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : displayedBusinesses.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-5 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 p-8 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              No matching businesses found
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any verified local stores matching your current search or filters
              {selectedCategory !== 'All Categories' ? ` in ${selectedCategory}` : ''}.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-xs hover:bg-amber-500 hover:text-neutral-950 transition-colors"
            >
              Reset All Filters
            </button>
            <Link
              to="/categories"
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:border-neutral-400 transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        /* Interactive Map View */
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md">
            <MapViewer businesses={displayedBusinesses} height="600px" />
          </div>
          <p className="text-xs text-neutral-500 text-center">
            Click any pin marker on the map to view business hours and open its digital storefront.
          </p>
        </div>
      ) : (
        /* Responsive Business Cards Grid (Desktop 3 cols, Tablet 2 cols, Mobile 1 col) */
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real Business Cards */}
            {displayedBusinesses.map(biz => (
              <BusinessCard
                key={biz._id}
                business={biz}
                userCoords={userCoords}
              />
            ))}

            {/* Layout Adaptation: When 1 or 2 businesses exist, fill remaining 3-col space gracefully */}
            {displayedBusinesses.length === 1 && (
              <>
                <CategoryQuickNavCard
                  categories={categories}
                  onSelectCategory={handleCategoryChange}
                />
                <MerchantPromoCard city={primaryCity} />
              </>
            )}

            {displayedBusinesses.length === 2 && (
              <MerchantPromoCard city={primaryCity} />
            )}
          </div>

          {/* Bottom Merchant Invitation Banner (when 3+ businesses exist) */}
          {displayedBusinesses.length >= 3 && (
            <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 dark:from-amber-500/10 dark:via-neutral-900 dark:to-neutral-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                  Are you a local business owner in {primaryCity}?
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl">
                  Launch your verified digital storefront on LocalHub today. Zero setup fees, integrated orders, and direct neighbourhood exposure.
                </p>
              </div>
              <Link
                to="/business/register"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>List Your Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
