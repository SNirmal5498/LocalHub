import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, Order } from '../../types/index.js';
import { ShoppingBag, Phone, MapPin, CheckCircle2, Clock, Truck, Store, X } from 'lucide-react';

export const BusinessOrdersPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    if (!business) return;
    setLoading(true);
    const res = await api.getBusinessOrders(business._id, filter === 'all' ? undefined : filter);
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [business?._id, filter]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success) {
      loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
      }
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Accepted', label: 'Accepted' },
    { id: 'Preparing', label: 'Preparing' },
    { id: 'Ready', label: 'Ready for Pickup' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Order Management Dashboard
        </h1>
        <p className="text-xs text-neutral-500">
          Process customer orders, update kitchen/workshop status, and verify fulfillment details
        </p>
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Fetching store orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <ShoppingBag className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No orders yet.
          </h3>
          <p className="text-xs text-neutral-500">
            Incoming orders from customers will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4 shadow-xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                    #{order.orderNumber}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {order.customerName}
                  </span>
                  <a
                    href={`tel:${order.phone}`}
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3 h-3" /> {order.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-neutral-500">
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Items column */}
                <div className="md:col-span-7 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Items Ordered:
                  </span>
                  <ul className="space-y-1">
                    {order.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>
                          <span className="font-bold text-neutral-900 dark:text-white">{i.quantity}x</span> {i.name}
                        </span>
                        <span className="font-mono tabular-nums">
                          ${(i.price * i.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-[11px] text-neutral-600 dark:text-neutral-400 italic">
                      Notes: "{order.notes}"
                    </div>
                  )}
                </div>

                {/* Fulfillment column */}
                <div className="md:col-span-5 space-y-1.5 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 pt-3 md:pt-0 md:pl-4">
                  <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-semibold">
                    {order.deliveryType === 'delivery' ? (
                      <Truck className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Store className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="capitalize">{order.deliveryType} Fulfillment</span>
                  </div>

                  {order.deliveryAddress ? (
                    <p className="text-neutral-500 text-[11px]">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                  ) : (
                    <p className="text-neutral-500 text-[11px]">
                      Counter pickup by customer
                    </p>
                  )}

                  <div className="pt-2 flex justify-between font-bold text-sm text-neutral-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="tabular-nums">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-end gap-2">
                {order.orderStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Accepted')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                      className="px-3.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.orderStatus === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors"
                  >
                    Mark Preparing
                  </button>
                )}

                {order.orderStatus === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Ready')}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
                  >
                    Mark Ready for Pickup/Delivery
                  </button>
                )}

                {order.orderStatus === 'Ready' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Completed')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    Mark Order Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
