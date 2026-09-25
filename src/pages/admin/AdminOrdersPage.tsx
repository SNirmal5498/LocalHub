import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Order } from '../../types/index.js';
import { ShoppingBag, Store, User, Clock, CheckCircle2 } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const res = await api.getAdminOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Platform Orders Stream
        </h1>
        <p className="text-xs text-neutral-500">
          Global overview of transaction activity across all verified merchant storefronts
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading platform orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No orders yet.
          </h3>
          <p className="text-xs text-neutral-500">
            Platform transaction events will appear here once customers place orders.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      #{o.orderNumber}
                    </td>

                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      {o.businessName}
                    </td>

                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {o.customerName}
                    </td>

                    <td className="py-3 px-4 capitalize text-neutral-500">
                      {o.deliveryType}
                    </td>

                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white tabular-nums">
                      ${o.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-neutral-500">
                      {o.paymentMethod}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          o.orderStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : o.orderStatus === 'Pending'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-neutral-400">
                      {new Date(o.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
