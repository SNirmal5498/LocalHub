import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Store, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner' || user?.role === 'business_owner';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 sm:space-y-16">
      {/* Mission Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Our Mission & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight">
          Empowering Local Shops to Flourish Online
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed text-balance">
          LocalHub bridges the gap between neighbourhood businesses and local customers. We provide independent merchants, artisans, and service specialists with a turnkey digital storefront in a centralized community marketplace, making it simple for shoppers to discover verified local businesses.
        </p>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Turnkey Digital Presence */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Turnkey Digital Presence
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Establish a dedicated digital storefront featuring your product and service catalog, store hours, location details, and driving directions.
          </p>
        </div>

        {/* Card 2: Community Centric */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Community Centric
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Connect neighborhood shoppers with local independent merchants, making it easy to discover nearby stores, browse offerings, and plan visits.
          </p>
        </div>

        {/* Card 3: Transparent & Fair */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Transparent & Fair
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Promote genuine local discovery through verified business information, authentic customer ratings, and transparent operating schedules.
          </p>
        </div>
      </div>

      {/* Business Owner CTA */}
      <div className="rounded-3xl bg-amber-500 p-8 sm:p-10 text-neutral-950 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black">
          Are you a local business owner?
        </h2>
        <p className="text-xs sm:text-sm font-medium max-w-lg mx-auto text-neutral-950/90 leading-relaxed">
          Join our neighborhood directory to showcase your products, publish your business hours, and help nearby customers discover your store.
        </p>
        <Link
          to={isOwner ? '/business/dashboard' : '/business/register'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-900 transition-colors shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950"
        >
          <span>{isOwner ? 'Open Merchant Dashboard' : 'Create Storefront'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
