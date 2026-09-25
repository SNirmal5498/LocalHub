import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link
              to="/"
              className="text-lg font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5"
            >
              <span className="w-6 h-6 rounded-md bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm">
                L
              </span>
              <span>LocalHub</span>
            </Link>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Empowering local bakeries, independent repair workshops, apparel boutiques, and neighbourhood artisans with turnkey digital storefronts.
            </p>
            <div className="flex items-center gap-2 pt-2 text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified local business directory</span>
            </div>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Discover Local
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/businesses?category=Food%20%26%20Bakery" className="hover:text-amber-500 transition-colors">
                  Food & Bakery
                </Link>
              </li>
              <li>
                <Link to="/businesses?category=Tech%20%26%20Repairs" className="hover:text-amber-500 transition-colors">
                  Tech & Repairs
                </Link>
              </li>
              <li>
                <Link to="/businesses?category=Apparel%20%26%20Boutique" className="hover:text-amber-500 transition-colors">
                  Apparel & Boutique
                </Link>
              </li>
              <li>
                <Link to="/businesses?category=Beauty%20%26%20Wellness" className="hover:text-amber-500 transition-colors">
                  Beauty & Wellness
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline transition-colors flex items-center gap-1">
                  All Categories Directory →
                </Link>
              </li>
              <li>
                <Link to="/businesses?openNow=true" className="hover:text-amber-500 transition-colors">
                  Open Now Near Me
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Owners */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              For Business Owners
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/business/register" className="hover:text-amber-500 transition-colors">
                  Create Your Digital Storefront
                </Link>
              </li>
              <li>
                <Link to="/business/dashboard" className="hover:text-amber-500 transition-colors">
                  Merchant Dashboard & Orders
                </Link>
              </li>
              <li>
                <Link to="/business/products" className="hover:text-amber-500 transition-colors">
                  Inventory & Stock Management
                </Link>
              </li>
              <li>
                <Link to="/business/analytics" className="hover:text-amber-500 transition-colors">
                  Performance & Revenue Analytics
                </Link>
              </li>
              <li>
                <Link to="/business/offers" className="hover:text-amber-500 transition-colors">
                  Promotions & Coupon Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Platform & Community
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition-colors">
                  Support & Contact
                </Link>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> San Francisco, CA
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> support@localhub.platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} LocalHub Inc. All rights reserved. Connecting communities with neighbourhood commerce.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Active
            </span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
