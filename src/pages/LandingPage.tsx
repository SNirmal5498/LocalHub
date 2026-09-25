import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Business, Category } from '../types/index.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { RatingStars } from '../components/common/RatingStars.js';
import {
  Search,
  Store,
  ShoppingBag,
  Wrench,
  Shirt,
  Cake,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bizRes, catRes] = await Promise.all([
          api.getBusinesses({ sort: 'rating' }),
          api.getCategories(),
        ]);
        if (bizRes.success && bizRes.data) {
          setFeaturedBusinesses(bizRes.data.slice(0, 3));
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/businesses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/businesses');
    }
  };

  const getCategoryIcon = (iconName?: string, catName?: string) => {
    const icon = iconName || '';
    const name = catName || '';
    if (icon === 'Cake' || name.includes('Food') || name.includes('Bakery')) {
      return <Cake className="w-5 h-5 text-amber-500" />;
    }
    if (icon === 'Wrench' || name.includes('Tech') || name.includes('Repair')) {
      return <Wrench className="w-5 h-5 text-sky-500" />;
    }
    if (icon === 'Shirt' || name.includes('Apparel') || name.includes('Boutique')) {
      return <Shirt className="w-5 h-5 text-emerald-500" />;
    }
    if (icon === 'Sparkles' || name.includes('Beauty') || name.includes('Wellness')) {
      return <Sparkles className="w-5 h-5 text-rose-500" />;
    }
    if (name.includes('Home') || name.includes('Craft')) {
      return <Store className="w-5 h-5 text-violet-500" />;
    }
    if (name.includes('Grocery') || name.includes('Market')) {
      return <ShoppingBag className="w-5 h-5 text-teal-500" />;
    }
    return <Store className="w-5 h-5 text-neutral-500" />;
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Marketplace for Neighbourhood Commerce</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1] text-balance">
            Bring Your Local Business Online
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto text-balance">
            Create your digital storefront, showcase your products and services, connect with local customers, and grow your business — without building or maintaining a separate website.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearch}
            className="pt-2 max-w-xl mx-auto flex items-center bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow-lg focus-within:ring-2 focus-within:ring-amber-500"
          >
            <div className="pl-3 text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bakery cakes, mobile repair, clothes, salons..."
              className="flex-1 px-3 py-2 text-sm bg-transparent border-none text-neutral-900 dark:text-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/businesses"
              className="px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
            >
              Explore Businesses <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/business/register"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-md transition-colors flex items-center gap-2"
            >
              <Store className="w-4 h-4" /> Create Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* Business Categories Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-xs text-neutral-500">
              Find verified independent stores and service artisans
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            All categories <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse flex flex-col items-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(categories.length > 0 ? categories : [
              { _id: 'cat-1', name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', isActive: true },
              { _id: 'cat-2', name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', isActive: true },
              { _id: 'cat-3', name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', isActive: true },
              { _id: 'cat-4', name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', isActive: true },
              { _id: 'cat-5', name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', isActive: true },
              { _id: 'cat-6', name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', isActive: true },
            ]).map(cat => (
              <Link
                key={cat._id}
                to={`/businesses?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500/80 dark:hover:border-amber-500/80 transition-all flex flex-col items-center text-center space-y-2.5 shadow-2xs hover:shadow-xs"
              >
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 transition-colors">
                  {getCategoryIcon(cat.icon, cat.name)}
                </div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Local Stores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Featured Neighbourhood Storefronts
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Handcrafted goods, same-day repairs, and artisanal foods ready for local pickup or delivery
            </p>
          </div>
          <Link
            to="/businesses"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredBusinesses.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
            <Store className="w-10 h-10 mx-auto text-neutral-400" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              No businesses found.
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Be the first local merchant, bakery, or service shop to launch an online storefront in your neighbourhood.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs transition-colors shadow-xs"
              >
                Register Your Business <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBusinesses.map(biz => (
              <div
                key={biz._id}
                className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="relative aspect-16/9 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <ImageWithFallback
                    src={biz.coverImage}
                    alt={biz.name}
                    category={biz.category}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white text-[11px] font-bold shadow-xs">
                    {biz.isOpen ? 'Open Now' : 'Closed'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{biz.category}</span>
                      <RatingStars rating={biz.rating} reviewCount={biz.reviewCount} size="sm" />
                    </div>

                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {biz.name}
                    </h3>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {biz.tagline || biz.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[140px]">{biz.city}, {biz.state}</span>
                    </div>

                    <Link
                      to={`/business/${biz.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-colors"
                    >
                      View Store
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-neutral-100/70 dark:bg-neutral-900/50 py-16 border-y border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              Everything Your Business Needs to Thrive
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              A comprehensive commerce stack tailored specifically for local brick-and-mortar stores and service providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Digital Storefront
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                A custom URL (/business/your-name), operating hours, photo gallery, location map, and full contact details.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Products & Services
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Add catalog items with photos, real-time inventory tracking, promotional discounts, and service bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Live Order Management
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Receive customer orders instantly with pickup and delivery options, step-by-step status transitions, and customer notifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Verified Reviews & Trust
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Collect authentic customer ratings and respond directly to build long-term neighbourhood loyalty.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Business Analytics
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Track gross sales, daily order trends, repeat customers, and popular items with clean visual Recharts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                OpenStreetMap Discovery
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Interactive neighbourhood map locator allowing nearby customers to discover you and get 1-click driving directions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            How LocalHub Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Four simple steps from signup to receiving your first neighbourhood order
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <span className="text-3xl font-black text-amber-500 font-mono">01</span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Create Your Business
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Register in under 2 minutes. Enter your business name, address, hours, and branding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <span className="text-3xl font-black text-amber-500 font-mono">02</span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Add Products & Services
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              List baked goods, apparel, tech repair menus, or salon appointments with pricing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <span className="text-3xl font-black text-amber-500 font-mono">03</span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Share Your Storefront
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Share your direct store link on Instagram, WhatsApp, or Google Business profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <span className="text-3xl font-black text-amber-500 font-mono">04</span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Fulfill Orders & Connect
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Accept orders, update preparation status, and receive ratings from satisfied local patrons.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-neutral-900 dark:bg-neutral-800 text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-balance">
              Ready to take your local business online?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-base leading-relaxed text-balance">
              Join dozens of passionate bakeries, repair technicians, and neighbourhood boutiques thriving on LocalHub today.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/business/register"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-md transition-colors"
              >
                Create Your Business Now
              </Link>
              <Link
                to="/businesses"
                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm transition-colors border border-neutral-700"
              >
                Discover Local Stores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
