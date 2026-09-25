import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback.js';

export const CartDrawer: React.FC = () => {
  const {
    items,
    businessName,
    itemCount,
    subtotal,
    discount,
    couponCode,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (res.success) {
      setCouponMsg({ text: res.message || 'Coupon applied!', error: false });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message || 'Invalid coupon', error: true });
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl flex flex-col border-l border-neutral-200 dark:border-neutral-800">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Shopping Bag
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {itemCount}
                </span>
              </h2>
              {businessName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Ordering from: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{businessName}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore fresh bakery items, tech services, and sustainable fashion from local shops.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/businesses');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs shadow-xs transition-colors"
                >
                  Explore Local Stores
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const price =
                  product.discountPrice !== null && product.discountPrice !== undefined
                    ? product.discountPrice
                    : product.price;

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60"
                  >
                    <ImageWithFallback
                      src={product.images?.[0]}
                      alt={product.name}
                      category={product.category}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                          ${price.toFixed(2)}
                        </span>
                        {product.discountPrice !== null && product.discountPrice !== undefined && (
                          <span className="text-xs text-neutral-400 line-through tabular-nums">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
                          <button
                            onClick={() => updateQuantity(product._id, quantity - 1)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, quantity + 1)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              {/* Coupon form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. SAVE10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Apply
                  </button>
                </div>

                {couponCode && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Applied {couponCode} (-${discount.toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-neutral-600 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponMsg && !couponCode && (
                  <p className={`text-xs flex items-center gap-1 ${couponMsg.error ? 'text-red-500' : 'text-emerald-600'}`}>
                    <AlertCircle className="w-3 h-3" /> {couponMsg.text}
                  </p>
                )}
              </form>

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="tabular-nums font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Local Store Pickup / Delivery</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span>Estimated Total</span>
                  <span className="tabular-nums text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                  <button
                    onClick={clearCart}
                    className="hover:text-red-500 transition-colors"
                  >
                    Clear Bag
                  </button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
