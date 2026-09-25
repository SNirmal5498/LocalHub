import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business } from '../../types/index.js';
import { Store, ShieldCheck, ShieldAlert, ExternalLink, MapPin } from 'lucide-react';

export const AdminBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBusinesses = async () => {
    setLoading(true);
    const res = await api.getAdminBusinesses();
    if (res.success && res.data) {
      setBusinesses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleSetStatus = async (biz: Business, nextStatus: 'active' | 'suspended' | 'pending') => {
    const res = await api.updateBusinessStatus(biz._id, nextStatus);
    if (res.success) {
      setBusinesses(prev =>
        prev.map(b => (b._id === biz._id ? { ...b, status: nextStatus as any } : b))
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Manage Businesses
        </h1>
        <p className="text-xs text-neutral-500">
          Supervise store registrations, approve pending merchants, and toggle active/suspended status
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading merchant directory...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <Store className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No businesses found.
          </h3>
          <p className="text-xs text-neutral-500">
            Registered business owner applications will appear here for administrator verification.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Store Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Owner Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {businesses.map(biz => (
                  <tr key={biz._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{biz.name}</span>
                        <Link
                          to={`/business/${biz.slug}`}
                          target="_blank"
                          className="text-neutral-400 hover:text-sky-500"
                          title="View live storefront"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        /business/{biz.slug}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {biz.category}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                        {biz.ownerDetails?.name || 'Owner'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {biz.ownerDetails?.email || biz.email}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-500">
                      {biz.city}, {biz.state}
                    </td>

                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white tabular-nums">
                      ★ {(biz.rating || 0).toFixed(1)} ({biz.reviewCount || 0})
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          biz.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : biz.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        {biz.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {biz.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSetStatus(biz, 'active')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-xs transition-colors"
                          >
                            Approve Store
                          </button>
                          <button
                            onClick={() => handleSetStatus(biz, 'suspended')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSetStatus(biz, biz.status === 'active' ? 'suspended' : 'active')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            biz.status === 'active'
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {biz.status === 'active' ? 'Suspend Store' : 'Reactivate Store'}
                        </button>
                      )}
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
