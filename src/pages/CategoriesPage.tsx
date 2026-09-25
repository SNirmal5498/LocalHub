import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Category } from '../types/index.js';
import {
  Store,
  Cake,
  Wrench,
  Shirt,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Search,
  Layers,
  ChevronRight,
  PlusCircle,
  Tag,
  Hammer,
  Scissors,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_TAGS: Record<string, string[]> = {
  'Food & Bakery': ['Fresh Sourdough', 'Custom Cakes', 'Artisan Coffee', 'Gluten-Free Pastries'],
  'Tech & Repairs': ['Screen Repair', 'Laptop Tune-Up', 'Battery Replacement', 'Data Recovery'],
  'Apparel & Boutique': ['Bespoke Tailoring', 'Handmade Jewelry', 'Sustainable Denim', 'Local Designers'],
  'Beauty & Wellness': ['Hair Styling', 'Barber Cuts', 'Skincare Therapies', 'Nail Artistry'],
  'Home & Crafts': ['Handcrafted Furniture', 'Ceramic Pottery', 'Floral Arrangements', 'Woodwork'],
  'Grocery & Artisanal': ['Organic Pantry', 'Local Raw Honey', 'Farm Spices', 'Artisanal Cheeses'],
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Food & Bakery': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-500/60',
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  },
  'Tech & Repairs': {
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'hover:border-sky-500/60',
    badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
  },
  'Apparel & Boutique': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-500/60',
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  },
  'Beauty & Wellness': {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'hover:border-rose-500/60',
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
  },
  'Home & Crafts': {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'hover:border-violet-500/60',
    badge: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300',
  },
  'Grocery & Artisanal': {
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'hover:border-teal-500/60',
    badge: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300',
  },
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const getCategoryIcon = (iconName?: string, catName?: string) => {
    const icon = iconName || '';
    const name = catName || '';
    if (icon === 'Cake' || name.includes('Food') || name.includes('Bakery')) {
      return <Cake className="w-6 h-6" />;
    }
    if (icon === 'Wrench' || name.includes('Tech') || name.includes('Repair')) {
      return <Wrench className="w-6 h-6" />;
    }
    if (icon === 'Shirt' || name.includes('Apparel') || name.includes('Boutique')) {
      return <Shirt className="w-6 h-6" />;
    }
    if (icon === 'Sparkles' || name.includes('Beauty') || name.includes('Wellness')) {
      return <Sparkles className="w-6 h-6" />;
    }
    if (name.includes('Home') || name.includes('Craft')) {
      return <Hammer className="w-6 h-6" />;
    }
    if (name.includes('Grocery') || name.includes('Market')) {
      return <ShoppingBag className="w-6 h-6" />;
    }
    return <Store className="w-6 h-6" />;
  };

  const filteredCategories = categories.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (CATEGORY_TAGS[c.name] && CATEGORY_TAGS[c.name].some(t => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Local Commerce Taxonomy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          Browse by Category
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed text-balance">
          Discover verified independent shops, local repair artisans, gourmet bakeries, and neighbourhood boutiques offering genuine craftsmanship.
        </p>

        {/* Live Filter Bar */}
        <div className="pt-4 max-w-md mx-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories (e.g. bakery, repairs, boutique)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-8 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 space-y-3">
          <Tag className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No categories matching "{search}"
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try a different term or clear your search to browse all categories.
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(cat => {
            const colors = CATEGORY_COLORS[cat.name] || {
              bg: 'bg-neutral-500/10 dark:bg-neutral-500/20',
              text: 'text-neutral-700 dark:text-neutral-300',
              border: 'hover:border-neutral-400',
              badge: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
            };
            const tags = CATEGORY_TAGS[cat.name] || ['Local Store', 'Verified Quality', 'Direct Pickup', 'Neighbourhood'];

            return (
              <div
                key={cat._id}
                className={`group flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 ${colors.border} transition-all duration-200 shadow-xs hover:shadow-md`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className={`p-3.5 rounded-2xl ${colors.bg} ${colors.text} shrink-0`}>
                      {getCategoryIcon(cat.icon, cat.name)}
                    </div>
                    {typeof cat.businessCount === 'number' && (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
                        {cat.businessCount === 1 ? '1 Store' : `${cat.businessCount} Stores`}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                      {cat.description || 'Verified local businesses and skilled specialists in your local community.'}
                    </p>
                  </div>

                  {/* Sample Offerings Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag, idx) => (
                      <Link
                        key={idx}
                        to={`/businesses?category=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(tag)}`}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-6 mt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                  <Link
                    to={`/businesses?category=${encodeURIComponent(cat.name)}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-white text-neutral-900 hover:text-white dark:text-neutral-100 dark:hover:text-neutral-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Business Owner Onboarding Callout */}
      <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <CheckCircle2 className="w-4 h-4" /> Own a local shop or service business?
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            Get listed in our local directory today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
            Create your digital storefront in minutes, accept pickup and delivery orders, showcase services, and reach neighbourhood patrons.
          </p>
        </div>
        <Link
          to="/business/register"
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors shrink-0 flex items-center gap-2"
        >
          <Store className="w-4 h-4" /> Create Storefront Free
        </Link>
      </div>
    </div>
  );
};
