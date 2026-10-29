import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Shield,
  Store,
  Users,
  ShoppingBag,
  IndianRupee,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  Tag,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  const loadStats = async (range: string) => {
    setLoading(true);
    const res = await api.getAdminAnalytics(range);
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats(timeRange);
  }, [timeRange]);

  const s = stats || {
    totalUsers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0,
    suspendedBusinesses: 0,
    rejectedBusinesses: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalGmv: 0,
    averageOrderValue: 0,
    totalReviews: 0,
    hiddenReviews: 0,
    flaggedReviews: 0,
    roleBreakdown: { customers: 0, owners: 0, admins: 0 },
    categoriesChart: [],
    orderStatusChart: [],
  };

  const CATEGORY_COLORS = ['#0284c7', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Platform SuperAdmin Console</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time platform metrics, merchant store governance, global orders, and category distribution
          </p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400 ml-2" />
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'this_month', label: 'This Month' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  timeRange === tab.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Compiling platform telemetry from database...</p>
        </div>
      ) : (
        <>
          {/* Action Alerts / Pending verification banners */}
          {s.pendingBusinesses > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {s.pendingBusinesses} storefront application{s.pendingBusinesses > 1 ? 's' : ''} awaiting moderation
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Review merchant profiles and documentation before granting public marketplace listing.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/businesses?status=pending"
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-xs"
              >
                Review Applications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GMV */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Gross Merchandise Value</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                {formatCurrency(s.totalGmv)}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-500">
                <span>Avg Order Value:</span>
                <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">
                  {formatCurrency(s.averageOrderValue)}
                </span>
              </div>
            </div>

            {/* Registered Stores */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Registered Stores</span>
                <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                {s.totalBusinesses}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{s.activeBusinesses} Active</span>
                <span className="text-neutral-400">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">{s.pendingBusinesses} Pending</span>
                <span className="text-neutral-400">·</span>
                <span className="text-red-500 font-medium">{s.suspendedBusinesses} Suspended</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Total Orders Placed</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                {s.totalOrders}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-500">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {s.completedOrders} Fulfilled ({s.totalOrders > 0 ? Math.round((s.completedOrders / s.totalOrders) * 100) : 0}%)
                </span>
                <span className="text-neutral-400">{s.pendingOrders} Active</span>
              </div>
            </div>

            {/* Platform Users */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold">Community Accounts</span>
                <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                {s.totalUsers}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-500">
                <span>{s.roleBreakdown?.customers || 0} Customers</span>
                <span className="text-neutral-400">·</span>
                <span>{s.roleBreakdown?.owners || 0} Merchants</span>
                <span className="text-neutral-400">·</span>
                <span>{s.roleBreakdown?.admins || 0} Admins</span>
              </div>
            </div>
          </div>

          {/* Interactive Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-sky-500" />
                    Storefronts by Category
                  </h3>
                  <p className="text-[11px] text-neutral-500">Breakdown of registered merchant specialties</p>
                </div>
                <Link
                  to="/admin/categories"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {s.categoriesChart && s.categoriesChart.length > 0 ? (
                <div className="h-64 flex flex-col justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={s.categoriesChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={3}
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {s.categoriesChart.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <Tag className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    No category distribution available
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mt-1">
                    Store categories will automatically populate this chart as businesses register.
                  </p>
                </div>
              )}
            </div>

            {/* Order Fulfillment Breakdown Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-500" />
                    Order Status Pipeline
                  </h3>
                  <p className="text-[11px] text-neutral-500">Distribution of platform transactions across stages</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
                >
                  View Stream <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {s.orderStatusChart && s.orderStatusChart.some((d: any) => d.count > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={s.orderStatusChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <ShoppingBag className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    No transactions recorded for this period
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mt-1">
                    Orders placed by customers across local merchant stores will populate status counts here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Platform Management Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              to="/admin/businesses"
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-sky-500 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-sky-600 transition-colors">
                    Store Directory
                  </h4>
                  <p className="text-[11px] text-neutral-400">{s.totalBusinesses} Registered</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-sky-600 transition-all" />
            </Link>

            <Link
              to="/admin/users"
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-purple-500 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 transition-colors">
                    User Accounts
                  </h4>
                  <p className="text-[11px] text-neutral-400">{s.totalUsers} Accounts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
            </Link>

            <Link
              to="/admin/orders"
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    Platform Orders
                  </h4>
                  <p className="text-[11px] text-neutral-400">{s.totalOrders} Placed</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
            </Link>

            <Link
              to="/admin/reviews"
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Review Moderation
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {s.totalReviews} Total · {s.hiddenReviews} Moderated
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
