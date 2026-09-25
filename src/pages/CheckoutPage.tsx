import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import {
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, businessId, businessName, subtotal, discount, couponCode, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+1 (415) 555-0165');
  const [street, setStreet] = useState('742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94110');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pay_at_store'>('pay_at_store');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Your shopping bag is empty
        </h2>
        <p className="text-xs text-neutral-500">
          Explore local businesses to add products to your bag before checking out.
        </p>
        <Link
          to="/businesses"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors"
        >
          Explore Local Businesses
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to place an order.');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!businessId) {
      setError('Invalid business session. Please try adding items again.');
      return;
    }

    if (!phone.trim()) {
      setError('A contact phone number is required for fulfillment.');
      return;
    }

    if (deliveryType === 'delivery' && !street.trim()) {
      setError('Please enter a street address for delivery.');
      return;
    }

    setLoading(true);
    setError(null);

    const orderPayload = {
      businessId,
      items: items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
      })),
      deliveryType,
      deliveryAddress:
        deliveryType === 'delivery'
          ? {
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              postalCode: postalCode.trim(),
            }
          : null,
      phone: phone.trim(),
      notes: notes.trim(),
      paymentMethod,
      couponCode: couponCode || null,
    };

    const res = await api.createOrder(orderPayload);
    setLoading(false);

    if (res.success && res.data) {
      clearCart();
      navigate(`/order-success/${res.data._id}`);
    } else {
      setError(res.message || 'Failed to place order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Ordering from: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{businessName}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Delivery, Contact, Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fulfillment Option */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              1. Fulfillment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType('pickup');
                  setPaymentMethod('pay_at_store');
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Store className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                    Store Pickup
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Ready in ~20-30 mins at counter. No wait.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliveryType('delivery');
                  setPaymentMethod('cod');
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                    Local Delivery
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Delivered directly to your door in neighbourhood.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address (if Delivery) */}
          {deliveryType === 'delivery' && (
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Delivery Address
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Street Address & Apartment / Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" /> Contact for Order Updates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Order Notes / Special Requests (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Please ring bell, leave at reception, or dietary notes..."
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-500" /> Payment Preference
            </h3>

            <div className="space-y-2">
              {deliveryType === 'delivery' ? (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Pay cash or contactless card when your order arrives.
                    </span>
                  </div>
                </label>
              ) : (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'pay_at_store'}
                    onChange={() => setPaymentMethod('pay_at_store')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      Pay at Store Counter
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Pay with cash, debit card, Apple Pay, or Google Pay upon pickup.
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Total */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Order Summary
            </h3>

            {/* Item list */}
            <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1">
              {items.map(({ product, quantity }) => {
                const price =
                  product.discountPrice !== null && product.discountPrice !== undefined
                    ? product.discountPrice
                    : product.price;
                return (
                  <div key={product._id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={product.images?.[0]}
                        alt={product.name}
                        category={product.category}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400">
                          Qty: {quantity} × ${price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums shrink-0">
                      ${(price * quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon ({couponCode})
                  </span>
                  <span className="font-medium tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Fulfillment Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span>Total Due</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Processing Order...'
              ) : (
                <>
                  Place Order <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Direct local fulfillment · Instant merchant confirmation</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
