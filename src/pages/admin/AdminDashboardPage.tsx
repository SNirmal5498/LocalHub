import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Shield, Store, Users, ShoppingBag, DollarSign, Star, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    async function loadStats() {
      const res = await api.getAdminAnalytics();
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Compiling platform telemetry...</p>
      </div>
    );
  }

  const s = stats || {
    totalUsers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    suspendedBusinesses: 0,
    totalOrders: 0,
    totalGmv: 0,
    totalReviews: 0,
    categoriesChart: [],
  };

  const COLORS = ['#f59e0b', '#0284c7', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Platform SuperAdmin Console
        </h1>
        <p className="text-xs text-neutral-500">
          Global network health, merchant volume, platform orders, and user directory
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Gross Platform GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            ${s.totalGmv.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Across all stores
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Registered Stores</span>
            <Store className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {s.totalBusinesses}
          </div>
          <span className="text-[11px] text-neutral-400">
            {s.activeBusinesses} active · {s.suspendedBusinesses} suspended
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {s.totalOrders}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {s.completedOrders} fulfilled
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Platform Users</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
            {s.totalUsers}
          </div>
          <span className="text-[11px] text-neutral-400">
            {s.roleBreakdown?.customers || 0} customers · {s.roleBreakdown?.owners || 0} merchants
          </span>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Store Distribution by Category
          </h3>
          <p className="text-xs text-neutral-500">Merchant breakdown across retail and service sectors</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.categoriesChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
