import React from 'react';
import { Link } from 'react-router-dom';
import { Store, HeartHandshake, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Our Mission & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white leading-tight">
          Empowering Local Shops to Flourish Online
        </h1>
        <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          LocalHub was founded to bridge the digital divide for neighbourhood businesses. Independent bakeries, electronics repair workshops, family tailors, and artisans should not be burdened with costly websites or complex web hosting to connect with their community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Turnkey Digital Presence
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every business owner receives a branded URL, interactive catalog, customizable opening hours, and direct messaging tools out of the box.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Community Centric
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We preserve the personal touch of neighbourhood commerce while offering modern conveniences: local pickup, doorstep delivery, and direct store communication.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Transparent & Fair
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No predatory platform fees, no hidden algorithms burying mom-and-pop shops, and verified authentic customer reviews.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-amber-500 p-8 sm:p-10 text-black text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black">
          Are you a local business owner?
        </h2>
        <p className="text-xs sm:text-sm font-medium max-w-lg mx-auto">
          Set up your digital storefront in less than 5 minutes and start welcoming online orders today.
        </p>
        <Link
          to="/business/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-900 transition-colors shadow-md"
        >
          Create Storefront <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
