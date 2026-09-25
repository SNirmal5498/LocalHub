import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, Order, Review } from '../../types/index.js';
import {
  DollarSign,
  ShoppingBag,
  Star,
  Users,
  Eye,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const BusinessDashboardPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!business) return;
    try {
      const [anaRes, ordRes, revRes] = await Promise.all([
        api.getBusinessAnalytics(business._id),
        api.getBusinessOrders(business._id),
        api.getReviewsByBusiness(business._id),
      ]);

      if (anaRes.success && anaRes.data) setAnalytics(anaRes.data);
      if (ordRes.success && ordRes.data) setRecentOrders(ordRes.data.slice(0, 5));
      if (revRes.success && revRes.data) setRecentReviews(revRes.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?._id]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Loading merchant dashboard metrics...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    rating: 0,
    reviewCount: 0,
    storeViews: 0,
    totalProducts: 0,
    totalCustomers: 0,
  };

  const trends = analytics?.dailyTrends || [];
  const popular = analytics?.popularProducts || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time performance metrics and live order stream for {business.name}
          </p>
        </div>

        <Link
          to="/business/products"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          + Add New Product
        </Link>
      </div>

      {/* Review pending notification banner */}
      {business.status === 'pending' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Storefront Under Review
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your business application is currently pending platform administrator verification. You can continue adding products and setting up your store profile. Once verified and approved by the platform administrator, your storefront will be published for discovery by customers.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            ${summary.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Completed orders
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.totalOrders}
          </div>
          <span className="text-[10px] text-neutral-400">All-time count</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Store Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.rating.toFixed(1)}
          </div>
          <span className="text-[10px] text-neutral-400">
            From {summary.reviewCount} reviews
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Store Views</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.storeViews}
          </div>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
            Local discovery
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Active Catalog</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.totalProducts}
          </div>
          <span className="text-[10px] text-neutral-400">Products & items</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Customers</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.totalCustomers}
          </div>
          <span className="text-[10px] text-neutral-400">Unique patrons</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue & Orders Trend (7 Days) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Orders & Revenue Over Time
              </h3>
              <p className="text-xs text-neutral-500">Daily sales performance</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === 'revenue' ? [`$${Number(value).toFixed(2)}`, 'Revenue'] : [value, 'Orders']
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Products Bar */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Top Selling Items
            </h3>
            <p className="text-xs text-neutral-500">By quantity sold</p>
          </div>

          <div className="space-y-3 pt-2">
            {popular.length === 0 ? (
              <p className="text-xs text-neutral-500 py-8 text-center">
                New sales will populate top items here.
              </p>
            ) : (
              popular.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="truncate max-w-[170px]">
                    <span className="font-semibold text-neutral-900 dark:text-white truncate block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {item.quantity} orders
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section with 1-click status actions */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-neutral-500">
              Update preparation and fulfillment status directly
            </p>
          </div>
          <Link
            to="/business/orders"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            View all orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No incoming orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-semibold">
                <tr>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 font-mono font-semibold text-neutral-900 dark:text-white">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        {order.customerName}
                      </span>
                      <span className="text-[11px] text-neutral-400">{order.phone}</span>
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 capitalize text-neutral-700 dark:text-neutral-300">
                      {order.deliveryType}
                    </td>
                    <td className="py-3 font-bold text-neutral-900 dark:text-white tabular-nums">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          order.orderStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : order.orderStatus === 'Pending'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      {order.orderStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Accepted')}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                            className="px-2.5 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.orderStatus === 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                          className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-semibold text-[11px]"
                        >
                          Mark Preparing
                        </button>
                      )}

                      {order.orderStatus === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Ready')}
                          className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px]"
                        >
                          Mark Ready
                        </button>
                      )}

                      {order.orderStatus === 'Ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Completed')}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
