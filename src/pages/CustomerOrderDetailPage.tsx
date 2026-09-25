import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import { WriteReviewModal } from '../components/storefront/WriteReviewModal.js';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Store,
  MapPin,
  Phone,
  AlertTriangle,
  Star,
  XCircle,
} from 'lucide-react';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      try {
        const res = await api.getOrderById(id);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setShowCancelModal(false);
    setCancelling(true);
    setCancelError(null);

    const res = await api.updateOrderStatus(order._id, 'Cancelled');
    setCancelling(false);

    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setCancelError(res.message || 'Could not cancel order.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Loading order tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Order not found</h2>
        <Link to="/customer/orders" className="text-xs font-semibold text-amber-500 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const timelineSteps = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
  const currentStepIndex = timelineSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>

        <span className="font-mono text-xs font-bold text-neutral-400">
          ORDER #{order.orderNumber}
        </span>
      </div>

      {cancelError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Main Status Timeline Card */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-neutral-500">Live Order Status</span>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">
              {order.orderStatus}
            </h2>
          </div>

          {/* Action buttons based on status */}
          <div className="flex items-center gap-2">
            {order.orderStatus === 'Pending' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            {order.orderStatus === 'Completed' && (
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-black" /> Write a Review
              </button>
            )}
          </div>
        </div>

        {/* Timeline Visualization */}
        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Rejected' ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  style={{ width: `${Math.max(12, ((currentStepIndex + 1) / timelineSteps.length) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                />
              </div>

              <div className="flex justify-between text-xs font-semibold text-neutral-400">
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
        ) : (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>This order was {order.orderStatus.toLowerCase()}.</span>
          </div>
        )}
      </div>

      {/* Grid: Store Info + Itemized Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Items */}
        <div className="md:col-span-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Ordered Items
          </h3>

          <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-neutral-500">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Coupon ({order.couponCode})</span>
                <span className="tabular-nums font-semibold">-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Fulfillment</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
            </div>

            <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Total Paid / Due</span>
              <span className="tabular-nums">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Fulfillment & Store details */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-500" /> Store Information
            </h3>

            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <p className="font-bold text-neutral-900 dark:text-white text-sm">
                {order.businessName}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" /> Contact Store: {order.phone}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Fulfillment Method: <span className="capitalize text-amber-500">{order.deliveryType}</span>
            </h3>

            {order.deliveryAddress ? (
              <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <p className="font-medium text-neutral-900 dark:text-white">Delivery Address:</p>
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Pickup directly at store counter. Show your order ID #{order.orderNumber}.
              </p>
            )}

            {order.notes && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
                <span className="font-semibold block">Notes:</span>
                <p className="italic">"{order.notes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal if customer wants to write review */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        businessId={order.business}
        businessName={order.businessName}
        orderId={order._id}
        onReviewSubmitted={() => {
          setReviewSubmittedSuccess(true);
          setTimeout(() => setReviewSubmittedSuccess(false), 5000);
        }}
      />

      {/* Review Success Toast */}
      {reviewSubmittedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Thank you! Your verified review has been published.</span>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Cancel Order
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to cancel this pending order? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
