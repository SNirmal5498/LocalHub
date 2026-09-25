import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import { ShoppingBag, ArrowRight, Clock, Store, CheckCircle2 } from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Preparing':
      case 'Ready':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400';
      default:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Track real-time status and view receipts from your favourite local stores
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              No orders yet.
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Explore your neighbourhood bakeries, electronics workshops, and fashion boutiques to place your first order.
            </p>
          </div>
          <Link
            to="/businesses"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors"
          >
            Explore Local Stores
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-neutral-400">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {order.businessName}
                </h3>

                <p className="text-xs text-neutral-500 line-clamp-1">
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800 gap-3">
                <span className="text-base font-bold text-neutral-900 dark:text-white tabular-nums">
                  ${order.totalAmount.toFixed(2)}
                </span>

                <Link
                  to={`/customer/orders/${order._id}`}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-colors flex items-center gap-1.5"
                >
                  Track Order <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
