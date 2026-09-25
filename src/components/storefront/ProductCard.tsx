import React, { useState } from 'react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { ImageWithFallback } from '../common/ImageWithFallback.js';
import { Plus, Check, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  businessName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, businessName }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const price =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  const handleAdd = () => {
    if (!product.isAvailable) return;
    const res = addToCart(product, 1, businessName);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      {/* Product Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <ImageWithFallback
          src={product.images?.[0]}
          alt={product.name}
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {product.discountPrice !== null && product.discountPrice !== undefined && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 text-[11px] font-bold shadow-xs">
            Save ${(product.price - product.discountPrice).toFixed(0)}
          </div>
        )}

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white text-xs font-bold px-3 py-1 rounded-md bg-neutral-900/90 border border-white/20">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean unboxed text */}
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
            <span>{product.category}</span>
            {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Only {product.stock} left
                </span>
              </>
            )}
          </div>

          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-amber-500 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              ${price.toFixed(2)}
            </span>
            {product.discountPrice !== null && product.discountPrice !== undefined && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.isAvailable}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : product.isAvailable
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
