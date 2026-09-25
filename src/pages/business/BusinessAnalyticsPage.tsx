import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business } from '../../types/index.js';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export const BusinessAnalyticsPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [analytics, setAnalytics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!business) return;
      setLoading(true);
      const res = await api.getBusinessAnalytics(business._id);
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [business?._id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Compiling store analytics...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    storeViews: 0,
  };

  const trends = analytics?.dailyTrends || [];
  const statusDist = analytics?.statusDistribution || [];
  const popular = analytics?.popularProducts || [];

  const COLORS = ['#f59e0b', '#0284c7', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time telemetry on revenue, conversion velocity, and customer demand
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 self-start sm:self-auto">
          {(['week', 'month', 'year'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                timeframe === tf
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              This {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Total Gross Sales</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            ${summary.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            +18.4% from last period
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Average Order Value</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            ${summary.avgOrderValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            Per fulfilled basket
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Total Orders Placed</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.totalOrders}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {summary.completedOrdersCount} completed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Total Local Patrons</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {summary.totalCustomers}
          </div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            {summary.storeViews} store visits
          </span>
        </div>
      </div>

      {/* Chart: Daily Revenue */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Daily Revenue Stream
          </h3>
          <p className="text-xs text-neutral-500">Fulfilled revenue volume over time</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Order Status & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Order Lifecycle Breakdown
            </h3>
            <p className="text-xs text-neutral-500">Distribution by order status</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items Table */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Product Demand Rankings
            </h3>
            <p className="text-xs text-neutral-500">Top contributors to store gross volume</p>
          </div>

          <div className="space-y-3 pt-2">
            {popular.length === 0 ? (
              <p className="text-xs text-neutral-500 py-8 text-center">
                Completed orders will automatically rank top items here.
              </p>
            ) : (
              popular.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-xs"
                >
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {item.quantity} units fulfilled
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white tabular-nums text-sm">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
