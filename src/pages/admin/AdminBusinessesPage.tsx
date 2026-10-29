import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, Category } from '../../types/index.js';
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  MapPin,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  History,
  Info,
  Phone,
  Mail,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';

interface ActionModalState {
  isOpen: boolean;
  business: Business | null;
  action: 'approve' | 'reject' | 'suspend' | 'reactivate' | null;
  reason: string;
  error?: string | null;
  loading: boolean;
}

export const AdminBusinessesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Audit history modal
  const [auditModalBiz, setAuditModalBiz] = useState<Business | null>(null);

  // Action Confirmation Modal
  const [modalState, setModalState] = useState<ActionModalState>({
    isOpen: false,
    business: null,
    action: null,
    reason: '',
    error: null,
    loading: false,
  });

  const loadData = async () => {
    setLoading(true);
    const [bizRes, catRes] = await Promise.all([
      api.getAdminBusinesses({
        q: searchTerm || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }),
      api.getCategories(true),
    ]);

    if (bizRes.success && bizRes.data) {
      setBusinesses(bizRes.data);
    }
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openActionModal = (
    business: Business,
    action: 'approve' | 'reject' | 'suspend' | 'reactivate'
  ) => {
    setModalState({
      isOpen: true,
      business,
      action,
      reason: '',
      error: null,
      loading: false,
    });
  };

  const closeActionModal = () => {
    setModalState({
      isOpen: false,
      business: null,
      action: null,
      reason: '',
      error: null,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!modalState.business || !modalState.action) return;

    // Validate reason if rejecting or suspending
    if (['reject', 'suspend'].includes(modalState.action)) {
      if (!modalState.reason.trim() || modalState.reason.trim().length < 3) {
        setModalState(prev => ({
          ...prev,
          error: 'Please provide a clear reason (minimum 3 characters) for this action.',
        }));
        return;
      }
    }

    setModalState(prev => ({ ...prev, loading: true, error: null }));

    const nextStatus =
      modalState.action === 'approve' || modalState.action === 'reactivate'
        ? 'active'
        : modalState.action === 'reject'
        ? 'rejected'
        : 'suspended';

    const res = await api.updateBusinessStatus(
      modalState.business._id,
      nextStatus,
      modalState.reason.trim()
    );

    if (res.success && res.data) {
      setBusinesses(prev =>
        prev.map(b => (b._id === modalState.business!._id ? { ...b, ...res.data } : b))
      );
      closeActionModal();
    } else {
      setModalState(prev => ({
        ...prev,
        loading: false,
        error: res.message || 'Failed to update store status.',
      }));
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'rejected':
        return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700';
      case 'suspended':
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Manage Businesses & Storefronts
        </h1>
        <p className="text-xs text-neutral-500">
          Supervise store registrations, approve pending merchant applications, and audit status changes
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by store name, owner, city, or email..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {[
            { id: 'all', label: 'All Stores' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'active', label: 'Active & Approved' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setSearchParams(tab.id === 'all' ? {} : { status: tab.id });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Querying store directory...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3 bg-white dark:bg-neutral-900">
          <Store className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No businesses match the criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query, status tab, or category filter to discover merchant storefronts.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Store Profile</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Orders & GMV</th>
                  <th className="py-3 px-4">Status & Reason</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {businesses.map(biz => (
                  <tr key={biz._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    {/* Store Profile */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{biz.name}</span>
                        <Link
                          to={`/business/${biz.slug}`}
                          target="_blank"
                          className="text-neutral-400 hover:text-sky-500"
                          title="View live storefront in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono block">
                        /business/{biz.slug}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Joined {new Date(biz.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-medium text-[11px]">
                        {biz.category}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        {biz.ownerDetails?.name || 'Store Owner'}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        {biz.ownerDetails?.email || biz.email}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        {biz.ownerDetails?.phone || biz.phone || '—'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>
                          {biz.city}, {biz.state}
                        </span>
                      </div>
                    </td>

                    {/* Orders & GMV */}
                    <td className="py-3 px-4 tabular-nums">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(biz.totalRevenue || 0)}
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {biz.orderCount || 0} order{biz.orderCount !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Status & Reason */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadge(
                            biz.status
                          )}`}
                        >
                          {biz.status}
                        </span>

                        {biz.statusReason && (
                          <p
                            className="text-[11px] text-neutral-500 max-w-[180px] truncate"
                            title={biz.statusReason}
                          >
                            Reason: {biz.statusReason}
                          </p>
                        )}

                        {biz.statusAudit && biz.statusAudit.length > 0 && (
                          <button
                            onClick={() => setAuditModalBiz(biz)}
                            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <History className="w-3 h-3" /> Audit log ({biz.statusAudit.length})
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {biz.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(biz, 'approve')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => openActionModal(biz, 'reject')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 dark:bg-neutral-800 dark:hover:bg-red-950/40 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {biz.status === 'active' && (
                          <button
                            onClick={() => openActionModal(biz, 'suspend')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 transition-colors"
                          >
                            Suspend Store
                          </button>
                        )}

                        {(biz.status === 'suspended' || biz.status === 'rejected') && (
                          <button
                            onClick={() => openActionModal(biz, 'reactivate')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Reason Modal */}
      {modalState.isOpen && modalState.business && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white capitalize">
                {modalState.action} Storefront
              </h3>
              <button onClick={closeActionModal} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to {modalState.action}{' '}
              <strong className="text-neutral-900 dark:text-white">
                "{modalState.business.name}"
              </strong>
              ?
              {modalState.action === 'approve' &&
                ' This will publish the storefront immediately to customer discovery.'}
              {modalState.action === 'suspend' &&
                ' This will temporarily hide the storefront from customer discovery until reactivated.'}
              {modalState.action === 'reject' &&
                ' This will decline the registration and prevent public storefront listing.'}
              {modalState.action === 'reactivate' &&
                ' This will restore the store to active status and make it visible again to customers.'}
            </p>

            {/* Mandatory Reason for Reject or Suspend */}
            {['reject', 'suspend'].includes(modalState.action || '') && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Moderation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={modalState.reason}
                  onChange={e => setModalState(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={`Explain why this storefront is being ${
                    modalState.action === 'reject' ? 'rejected' : 'suspended'
                  }...`}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[10px] text-neutral-400">
                  This reason will be recorded in the audit trail and sent to the merchant.
                </span>
              </div>
            )}

            {modalState.error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {modalState.error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={modalState.loading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={modalState.loading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                  modalState.action === 'reject' || modalState.action === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {modalState.loading ? 'Updating...' : `Confirm ${modalState.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Drawer / Modal */}
      {auditModalBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  Status Audit Log
                </h3>
                <p className="text-xs text-neutral-500">{auditModalBiz.name}</p>
              </div>
              <button onClick={() => setAuditModalBiz(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {auditModalBiz.statusAudit?.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadge(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.reason && (
                    <p className="text-neutral-700 dark:text-neutral-300">
                      <strong className="text-neutral-900 dark:text-white">Reason:</strong>{' '}
                      {entry.reason}
                    </p>
                  )}
                  <p className="text-[10px] text-neutral-400">
                    Moderated by: {entry.changedBy || 'Administrator'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setAuditModalBiz(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
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
