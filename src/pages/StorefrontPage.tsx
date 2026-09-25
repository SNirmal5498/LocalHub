import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Business, Product, Service, Offer, Review } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { MapViewer } from '../components/common/MapViewer.js';
import { ProductCard } from '../components/storefront/ProductCard.js';
import { ServiceCard } from '../components/storefront/ServiceCard.js';
import { OfferCard } from '../components/storefront/OfferCard.js';
import { ReviewItem } from '../components/storefront/ReviewItem.js';
import { WriteReviewModal } from '../components/storefront/WriteReviewModal.js';
import { ContactBusinessModal } from '../components/storefront/ContactBusinessModal.js';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Share2,
  Navigation,
  MessageSquare,
  Check,
  Tag,
  Star,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'services' | 'offers' | 'reviews'>('overview');

  // Interactive Modals
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [prefillMessage, setPrefillMessage] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [favoriteFeedback, setFavoriteFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadStorefront() {
      if (!slug) return;
      setLoading(true);
      try {
        const bizRes = await api.getBusinessBySlug(slug);
        if (bizRes.success && bizRes.data) {
          const biz = bizRes.data;
          setBusiness(biz);

          // Check if favorited
          if (user?.favorites?.includes(biz._id)) {
            setIsFavorited(true);
          }

          // Fetch products, services, offers, reviews in parallel
          const [prodRes, servRes, offRes, revRes] = await Promise.all([
            api.getProductsByBusiness(biz._id),
            api.getServicesByBusiness(biz._id),
            api.getOffersByBusiness(biz._id),
            api.getReviewsByBusiness(biz._id),
          ]);

          if (prodRes.success && prodRes.data) setProducts(prodRes.data);
          if (servRes.success && servRes.data) setServices(servRes.data);
          if (offRes.success && offRes.data) setOffers(offRes.data);
          if (revRes.success && revRes.data) setReviews(revRes.data);
        }
      } catch (err) {
        console.error('Failed to load storefront:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStorefront();
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!business) return;
    if (!user) {
      setFavoriteFeedback('Please sign in to save this business.');
      setTimeout(() => setFavoriteFeedback(null), 3500);
      return;
    }

    if (isFavorited) {
      await api.removeFavorite(business._id);
      setIsFavorited(false);
      setFavoriteFeedback('Removed from favorites');
      setTimeout(() => setFavoriteFeedback(null), 2500);
    } else {
      await api.addFavorite(business._id);
      setIsFavorited(true);
      setFavoriteFeedback('Added to favorites!');
      setTimeout(() => setFavoriteFeedback(null), 2500);
    }
  };

  const copyStoreLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEnquireService = (service: Service) => {
    setPrefillMessage(
      `Hello! I would like to enquire about scheduling the "${service.name}" service ($${service.price.toFixed(2)}, approx. ${service.duration}). Could you let me know available appointment times?`
    );
    setIsContactOpen(true);
  };

  const refreshReviews = async () => {
    if (!business) return;
    const revRes = await api.getReviewsByBusiness(business._id);
    if (revRes.success && revRes.data) {
      setReviews(revRes.data);
    }
    // Also refresh business rating
    const bizRes = await api.getBusinessById(business._id);
    if (bizRes.success && bizRes.data) {
      setBusiness(bizRes.data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500">Opening digital storefront...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Business Storefront Not Found
        </h2>
        <p className="text-xs text-neutral-500">
          The requested store link may have moved or is temporarily unavailable.
        </p>
        <Link
          to="/businesses"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
        >
          Explore All Stores
        </Link>
      </div>
    );
  }

  // Calculate day of week for opening hours highlight
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()] as keyof typeof business.openingHours;

  // Rating breakdown stats
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
        : 0,
  }));

  return (
    <div className="pb-20">
      {/* Cover Image Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full bg-neutral-900 overflow-hidden">
        <ImageWithFallback
          src={business.coverImage}
          alt={business.name}
          category={business.category}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Store Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Logo & Identity */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 shadow-md shrink-0">
                <ImageWithFallback
                  src={business.logo}
                  alt={business.name}
                  category={business.category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {business.category}
                  </span>
                  <span>·</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      business.isOpen
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        business.isOpen ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                    {business.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                  {business.name}
                </h1>

                {business.tagline && (
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
                    {business.tagline}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-500">
                  <RatingStars rating={business.rating} reviewCount={business.reviewCount} size="sm" />
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {business.address}, {business.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              <a
                href={`tel:${business.phone}`}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" /> Call
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-500" /> Directions
              </a>

              <button
                onClick={() => {
                  setPrefillMessage('');
                  setIsContactOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> Contact
              </button>

              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-xl border transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Save to favorites"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={copyStoreLink}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Share digital storefront"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>

              {favoriteFeedback && (
                <div className="w-full sm:w-auto text-center px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold animate-fade-in shadow-sm">
                  {favoriteFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'services', label: `Services (${services.length})` },
              { id: 'offers', label: `Offers (${offers.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: About & Highlights */}
            <div className="lg:col-span-2 space-y-8">
              {/* About description */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-3">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  About {business.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                  {business.description || 'Welcome to our digital storefront. Explore our full menu of artisanal products, certified services, and seasonal promotions.'}
                </p>
              </div>

              {/* Active Offers Preview */}
              {offers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" /> Current Store Specials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {offers.map(off => (
                      <OfferCard key={off._id} offer={off} />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured products preview */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Popular Products
                    </h3>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      View all ({products.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.slice(0, 4).map(prod => (
                      <ProductCard key={prod._id} product={prod} businessName={business.name} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Hours, Location & Contact */}
            <div className="space-y-6">
              {/* Opening Hours Schedule */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Opening Hours
                </h3>

                <div className="space-y-2 text-xs divide-y divide-neutral-100 dark:divide-neutral-800">
                  {Object.entries(business.openingHours || {}).map(([day, hours]) => {
                    const isToday = day === currentDay;
                    return (
                      <div
                        key={day}
                        className={`pt-2 flex items-center justify-between ${
                          isToday ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <span className="capitalize">{day} {isToday && '(Today)'}</span>
                        <span>
                          {hours.isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location & Interactive Map */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" /> Store Location
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {business.address}, {business.city}, {business.state} {business.postalCode}
                </p>

                <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <MapViewer singleBusiness={business} height="220px" zoom={15} />
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Navigation className="w-3.5 h-3.5" /> Open Driving Directions
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Store Products
                </h3>
                <p className="text-xs text-neutral-500">
                  Select items to add to your order bag for local delivery or store pickup
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
                No products available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(prod => (
                  <ProductCard key={prod._id} product={prod} businessName={business.name} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Available Services
              </h3>
              <p className="text-xs text-neutral-500">
                Book diagnostics, repair procedures, appointments, or consultations
              </p>
            </div>

            {services.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
                No services listed for this store.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(serv => (
                  <ServiceCard
                    key={serv._id}
                    service={serv}
                    onEnquire={handleEnquireService}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Store Promotions & Coupons
              </h3>
              <p className="text-xs text-neutral-500">
                Apply coupon codes at checkout to enjoy discounts on your order
              </p>
            </div>

            {offers.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
                No active promotional offers right now. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(off => (
                  <OfferCard key={off._id} offer={off} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Rating Overview & Breakdown Header */}
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-5xl font-black text-neutral-900 dark:text-white tabular-nums">
                    {(business.rating || 0).toFixed(1)}
                  </span>
                  <div className="mt-1">
                    <RatingStars rating={business.rating || 0} size="md" showText={false} />
                  </div>
                  <span className="text-xs text-neutral-500 mt-1 block">
                    {reviews.length} customer reviews
                  </span>
                </div>

                {/* Rating Bar Distribution */}
                <div className="space-y-1.5 w-48 sm:w-64">
                  {ratingCounts.map(rc => (
                    <div key={rc.stars} className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="w-3 tabular-nums">{rc.stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${rc.percentage}%` }}
                        />
                      </div>
                      <span className="w-5 text-right tabular-nums">{rc.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review CTA */}
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Star className="w-4 h-4 fill-black" /> Write a Review
              </button>
            </div>

            {/* Review Items List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
                  No reviews yet.
                </div>
              ) : (
                reviews.map(rev => (
                  <ReviewItem key={rev._id} review={rev} storeName={business.name} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        businessId={business._id}
        businessName={business.name}
        onReviewSubmitted={refreshReviews}
      />

      {/* Contact Business Modal */}
      <ContactBusinessModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        business={business}
        prefillMessage={prefillMessage}
      />
    </div>
  );
};
