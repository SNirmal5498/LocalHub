import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Business, Category } from '../types/index.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { MapViewer } from '../components/common/MapViewer.js';
import {
  Search,
  MapPin,
  Clock,
  Filter,
  SlidersHorizontal,
  Grid,
  Map as MapIcon,
  Navigation,
  Tag,
  Check,
  ExternalLink,
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [openNow, setOpenNow] = useState(searchParams.get('openNow') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Keep state synchronized whenever URL search parameters change
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'All Categories');
    const q = searchParams.get('q');
    setQuery(q || '');
    const rating = searchParams.get('minRating');
    setMinRating(rating || '');
    const open = searchParams.get('openNow') === 'true';
    setOpenNow(open);
    const s = searchParams.get('sort');
    setSort(s || 'rating');
  }, [searchParams]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          // Graceful fallback categories if database is initializing
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
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      const params: Record<string, any> = {};
      if (query.trim()) params.q = query.trim();
      if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (minRating) params.minRating = minRating;
      if (openNow) params.openNow = 'true';
      if (sort) params.sort = sort;

      const res = await api.getBusinesses(params);
      if (res.success && res.data) {
        setBusinesses(res.data);
      }
      setLoading(false);
    }

    fetchBusinesses();
  }, [query, selectedCategory, minRating, openNow, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (query.trim()) nextParams.set('q', query.trim());
    else nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    const nextParams = new URLSearchParams(searchParams);
    if (catName !== 'All Categories') nextParams.set('category', catName);
    else nextParams.delete('category');
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            Discover Local Businesses
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Explore verified bakeries, repair services, apparel shops, and neighbourhood artisans
          </p>
        </div>

        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by store name, sourdough, screen repair, denim jacket..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </form>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Open Now toggle */}
            <button
              onClick={() => setOpenNow(!openNow)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                openNow
                  ? 'bg-amber-500 text-black border-amber-500 font-bold'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Open Now
            </button>

            {/* Rating selector */}
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Any Rating</option>
              <option value="4.0">★ 4.0 & above</option>
              <option value="4.5">★ 4.5 & above</option>
              <option value="4.8">★ 4.8 & above</option>
            </select>

            {/* Sort selector */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="reviews">Sort: Most Reviews</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>

            {/* Grid vs Map Toggle */}
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 transition-colors ${
                  viewMode === 'map'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('All Categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All Categories'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => handleCategoryChange(c.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {c.name}
            </button>
          ))}
          <Link
            to="/categories"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1"
          >
            All Categories Directory →
          </Link>
        </div>

        {/* Active Category Filter Tag Banner */}
        {selectedCategory !== 'All Categories' && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Category filter: <strong>{selectedCategory}</strong></span>
            </span>
            <button
              onClick={() => handleCategoryChange('All Categories')}
              className="text-amber-700 dark:text-amber-300 hover:text-black dark:hover:text-white font-semibold underline text-[11px]"
            >
              Clear Category Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Results Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-500">Discovering local businesses...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              No businesses found.
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              Try adjusting your search query, selecting another category, or clearing filters.
            </p>
          </div>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('All Categories');
              setMinRating('');
              setOpenNow(false);
              setSearchParams(new URLSearchParams());
            }}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        /* Map View */
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md">
            <MapViewer businesses={businesses} height="560px" />
          </div>
          <p className="text-xs text-neutral-500 text-center">
            Click any pin marker to view business hours and open its digital storefront.
          </p>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map(biz => (
            <div
              key={biz._id}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
            >
              {/* Cover Image */}
              <div className="relative aspect-16/9 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <ImageWithFallback
                  src={biz.coverImage}
                  alt={biz.name}
                  category={biz.category}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Status indicator */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      biz.isOpen ? 'bg-emerald-500' : 'bg-neutral-400'
                    }`}
                  />
                  <span>{biz.isOpen ? 'Open Now' : 'Closed'}</span>
                </div>
              </div>

              {/* Business Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-medium">{biz.category}</span>
                    <RatingStars rating={biz.rating} reviewCount={biz.reviewCount} size="sm" />
                  </div>

                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {biz.name}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {biz.tagline || biz.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{biz.address}, {biz.city}</span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/business/${biz.slug}`}
                      className="w-full py-2 text-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-colors"
                    >
                      View Storefront
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
