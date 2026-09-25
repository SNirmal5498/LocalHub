import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Business } from '../../types/index.js';
import {
  LayoutDashboard,
  Store,
  Package,
  Wrench,
  Tag,
  ShoppingBag,
  Star,
  BarChart3,
  MessageSquare,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export const BusinessDashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchOwnerBusiness() {
      try {
        const res = await api.getMyBusiness();
        if (res.success && res.data) {
          setBusiness(res.data);
        } else {
          // If owner doesn't have a business yet, redirect to create business form
          if (location.pathname !== '/business/new') {
            navigate('/business/new');
          }
        }
      } catch (err) {
        console.error('Error fetching owner business:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOwnerBusiness();
  }, [location.pathname, navigate]);

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/business/dashboard' },
    { label: 'Store Profile', icon: Store, path: '/business/profile' },
    { label: 'Products', icon: Package, path: '/business/products' },
    { label: 'Services', icon: Wrench, path: '/business/services' },
    { label: 'Offers & Coupons', icon: Tag, path: '/business/offers' },
    { label: 'Orders', icon: ShoppingBag, path: '/business/orders' },
    { label: 'Customer Reviews', icon: Star, path: '/business/reviews' },
    { label: 'Analytics', icon: BarChart3, path: '/business/analytics' },
    { label: 'Inquiries', icon: MessageSquare, path: '/business/messages' },
    { label: 'Settings', icon: Settings, path: '/business/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 flex flex-col">
      {/* Top Bar for Business Portal */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 h-16 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/business/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm shadow-xs">
              L
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm hidden sm:inline">
              Merchant Portal
            </span>
          </Link>

          {business && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-500 pl-3 border-l border-neutral-200 dark:border-neutral-700">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {business.name}
              </span>
              <span>·</span>
              <span className="capitalize">{business.category}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {business && (
            <Link
              to={`/business/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <Link
            to="/customer/orders"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hidden sm:inline"
          >
            Customer View
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-200 z-20 ${
            sidebarCollapsed ? 'w-18' : 'w-64'
          }`}
        >
          {/* Business mini card */}
          {business && !sidebarCollapsed && (
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 m-2 text-amber-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {business.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">★ {(business.rating || 0).toFixed(1)} ({business.reviewCount || 0})</p>
              </div>
            </div>
          )}

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-white dark:bg-neutral-900 h-full p-4 flex flex-col z-50">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Store Navigation
                </span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold'
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {business?.status === 'pending' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-base">⏳</span>
                <div>
                  <p className="font-bold">Store Registration Under Review</p>
                  <p className="text-[11px] opacity-90">Your digital storefront is currently pending administrator verification. Once approved, it will automatically appear in public neighbourhood search.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shrink-0">Pending Approval</span>
            </div>
          )}
          {business?.status === 'suspended' && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-xs">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-bold">Store Listing Suspended</p>
                <p className="text-[11px] opacity-90">This storefront has been suspended by the platform administrator. Contact support to resolve issues and reactivate.</p>
              </div>
            </div>
          )}
          <Outlet context={{ business, setBusiness }} />
        </main>
      </div>
    </div>
  );
};
