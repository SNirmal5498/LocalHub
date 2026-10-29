import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Order } from '../../types/index.js';
import {
  ShoppingBag,
  Store,
  User,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  X,
  MapPin,
  Phone,
  Calendar,
  IndianRupee,
  Package,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await api.getAdminOrders({
      q: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      range: dateRange !== 'all' ? dateRange : undefined,
    });
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'Pending':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
      case 'Accepted':
      case 'Preparing':
      case 'Ready':
      case 'Out for Delivery':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'Cancelled':
      case 'Rejected':
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Platform Orders Stream
        </h1>
        <p className="text-xs text-neutral-500">
          Global overview of transaction activity and fulfillment across all verified merchant storefronts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Order #, customer name, or store name..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Date Range Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 shrink-0">Timeframe:</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Accepted', label: 'Accepted' },
            { id: 'Preparing', label: 'Preparing' },
            { id: 'Ready', label: 'Ready' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Querying platform order stream...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3 bg-white dark:bg-neutral-900">
          <ShoppingBag className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No orders match the criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Transactions placed by patrons across local storefronts will stream here in real time.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Merchant Store</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
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

                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      {o.customerName}
                    </td>

                    <td className="py-3 px-4 capitalize text-neutral-500">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-medium">
                        {o.deliveryType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white tabular-nums">
                      {formatCurrency(o.totalAmount)}
                    </td>

                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-neutral-500">
                      {o.paymentMethod}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getStatusBadge(
                          o.orderStatus
                        )}`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="View complete order breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Transaction Details
                </span>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant and Customer Info */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                  Merchant
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrder.businessName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                  Customer
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrder.customerName}
                </span>
                {selectedOrder.phone && (
                  <span className="text-[11px] text-neutral-500 block">
                    Phone: {selectedOrder.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Delivery address if delivery */}
            {selectedOrder.deliveryType === 'delivery' && selectedOrder.deliveryAddress && (
              <div className="text-xs p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Delivery Destination
                </span>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city},{' '}
                  {selectedOrder.deliveryAddress.state} -{' '}
                  {selectedOrder.deliveryAddress.postalCode}
                </p>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Line Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-neutral-100 dark:divide-neutral-800">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs pt-1.5">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>- {formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-neutral-900 dark:text-white pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <span>Total Amount</span>
                <span className="tabular-nums">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Notes if any */}
            {selectedOrder.notes && (
              <div className="text-xs text-neutral-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <strong>Customer Notes:</strong> "{selectedOrder.notes}"
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
