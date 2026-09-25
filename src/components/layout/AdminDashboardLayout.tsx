import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Shield,
  Users,
  Store,
  ShoppingBag,
  Star,
  Tags,
  BarChart,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';

export const AdminDashboardLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNav = [
    { label: 'Platform Overview', icon: BarChart, path: '/admin/dashboard' },
    { label: 'Manage Businesses', icon: Store, path: '/admin/businesses' },
    { label: 'Manage Users', icon: Users, path: '/admin/users' },
    { label: 'Platform Orders', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Review Moderation', icon: Star, path: '/admin/reviews' },
    { label: 'Categories', icon: Tags, path: '/admin/categories' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 flex flex-col">
      {/* Top Bar */}
      <header className="bg-neutral-900 text-white px-4 sm:px-6 h-16 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
              <Shield className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm tracking-wide">
              LocalHub Platform SuperAdmin
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
        </Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            System Administration
          </div>
          {adminNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-white dark:bg-neutral-900 h-full p-4 flex flex-col z-50">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
                <span className="font-bold text-sm">Admin Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <nav className="space-y-1">
                {adminNav.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-sky-600 text-white font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
