import React, { useState } from 'react';
import { Offer } from '../../types/index.js';
import { Tag, Copy, Check, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [copied, setCopied] = useState(false);
  const { applyCoupon, setIsCartOpen } = useCart();

  const handleCopy = () => {
    if (!offer.couponCode) return;
    navigator.clipboard.writeText(offer.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!offer.couponCode) return;
    await applyCoupon(offer.couponCode);
    setIsCartOpen(true);
  };

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {offer.discountType === 'percentage'
              ? `${offer.discountValue}% Off`
              : `$${offer.discountValue} Flat Discount`}
          </span>

          {offer.couponCode && (
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
                {offer.couponCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 hover:text-amber-600 dark:hover:text-amber-400 text-neutral-400 transition-colors"
                title="Copy coupon code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
          {offer.title}
        </h4>

        {offer.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
            {offer.description}
          </p>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-neutral-500">
        <div>
          {offer.minimumOrder ? (
            <span>Min. Order ${offer.minimumOrder.toFixed(2)}</span>
          ) : (
            <span>No minimum order</span>
          )}
        </div>

        {offer.couponCode && (
          <button
            onClick={handleApply}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Apply to Order
          </button>
        )}
      </div>
    </div>
  );
};
