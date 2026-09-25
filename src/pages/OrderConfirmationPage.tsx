import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import { CheckCircle2, ShoppingBag, Clock, Store, ArrowRight, MapPin, Phone } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const res = await api.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Retrieving order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Order Not Found</h2>
        <Link to="/customer/orders" className="text-xs font-semibold text-amber-500 underline">
          View My Orders
        </Link>
      </div>
    );
  }

  const timelineSteps = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
  const currentStepIndex = timelineSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Thank you, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{order.customerName}</span>. Your order has been dispatched directly to <span className="font-semibold text-neutral-800 dark:text-neutral-200">{order.businessName}</span>.
        </p>
      </div>

      {/* Status Timeline */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-xs text-neutral-400 font-mono">ORDER #{order.orderNumber}</span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Status: <span className="text-amber-500">{order.orderStatus}</span>
            </h3>
          </div>
          <span className="text-xs text-neutral-500">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              style={{ width: `${Math.max(10, ((currentStepIndex + 1) / timelineSteps.length) * 100)}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
            />
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-neutral-500">
            {timelineSteps.map((step, idx) => (
              <span
                key={step}
                className={idx <= currentStepIndex ? 'text-amber-500 font-bold' : ''}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Receipt */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
          Itemized Receipt
        </h3>

        <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {item.name}
                </span>
                <span className="text-neutral-500 block">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </span>
              </div>
              <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs text-neutral-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">
              ${order.subtotal.toFixed(2)}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Coupon Discount ({order.couponCode})</span>
              <span className="tabular-nums font-semibold">-${order.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Fulfillment Type</span>
            <span className="font-semibold text-neutral-900 dark:text-white capitalize">
              {order.deliveryType}
            </span>
          </div>

          {order.deliveryAddress && (
            <div className="flex justify-between">
              <span>Delivery Address</span>
              <span className="font-medium text-neutral-900 dark:text-white text-right max-w-xs truncate">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>Total Amount</span>
            <span className="tabular-nums">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to={`/customer/orders/${order._id}`}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
        >
          Track Live Status <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/businesses"
          className="px-6 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
