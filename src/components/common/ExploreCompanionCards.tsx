import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types/index.js';
import { Store, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import { getCategoryIcon } from './BusinessCard.js';

interface MerchantPromoCardProps {
  city?: string;
}

export const MerchantPromoCard: React.FC<MerchantPromoCardProps> = ({ city }) => {
  return (
    <div className="flex flex-col h-full rounded-2xl border-2 border-dashed border-amber-500/40 dark:border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-neutral-50 to-white dark:from-amber-500/5 dark:via-neutral-900/60 dark:to-neutral-900 p-6 justify-between text-left transition-all duration-300 hover:border-amber-500 shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-500/20">
            For Merchants
          </span>
        </div>

        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Run a Store in {city || 'Your City'}?
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
            Reach local customers with your own verified storefront. Publish menus, manage orders, and run promotional deals with zero commission.
          </p>
        </div>

        <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Turnkey online storefront & catalog</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Real-time local customer orders</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Interactive map pin & driving directions</span>
          </li>
        </ul>
      </div>

      <div className="pt-6">
        <Link
          to="/business/register"
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Register Storefront Free</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

interface CategoryQuickNavCardProps {
  categories: Category[];
  onSelectCategory: (name: string) => void;
}

export const CategoryQuickNavCard: React.FC<CategoryQuickNavCardProps> = ({
  categories,
  onSelectCategory,
}) => {
  const displayCats = categories.slice(0, 5);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 justify-between shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-amber-500 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <Link
            to="/categories"
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Explore More Categories
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
            Discover verified independent specialists across everyday categories in your neighborhood.
          </p>
        </div>

        <div className="space-y-1.5 pt-1">
          {displayCats.map(cat => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <Link
          to="/categories"
          className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span>Open Full Taxonomy Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
