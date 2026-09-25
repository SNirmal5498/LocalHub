import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, Offer } from '../../types/index.js';
import { Tag, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export const BusinessOffersPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [couponCode, setCouponCode] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('30');
  const [maximumDiscount, setMaximumDiscount] = useState('25');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = async () => {
    if (!business) return;
    setLoading(true);
    const res = await api.getOffersByBusiness(business._id);
    if (res.success && res.data) {
      setOffers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, [business?._id]);

  const openAddModal = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('15');
    setCouponCode('');
    setMinimumOrder('25');
    setMaximumDiscount('20');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !discountValue) {
      setError('Title and discount value are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      businessId: business._id,
      title,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
      minimumOrder: parseFloat(minimumOrder) || 0,
      maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
    };

    let res;
    if (editingOffer) {
      res = await api.updateOffer(editingOffer._id, payload);
    } else {
      res = await api.createOffer(payload);
    }

    setSaving(false);

    if (res.success) {
      setModalOpen(false);
      loadOffers();
    } else {
      setError(res.message || 'Failed to save offer.');
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteOffer(id);
    setOffers(prev => prev.filter(o => o._id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Offers & Coupons
          </h1>
          <p className="text-xs text-neutral-500">
            Create promotional discount codes to attract local customers and increase average order volume
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading promotional offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Tag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              No active offers
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Create a promotional coupon (e.g. "WELCOME10" or "FALL15") to showcase on your storefront.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            + Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(off => (
            <div
              key={off._id}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                    {off.couponCode || 'PROMO'}
                  </span>

                  <button
                    onClick={() => handleDelete(off._id)}
                    className="p-1 hover:text-red-500 text-neutral-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {off.title}
                </h3>

                {off.description && (
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {off.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {off.discountType === 'percentage'
                    ? `${off.discountValue}% Discount`
                    : `$${off.discountValue} Flat Off`}
                </span>
                <span>Min Order ${off.minimumOrder || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Create Promotional Offer
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {error && (
              <div className="my-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Offer Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Morning Special"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Coupon Code (Uppercase)
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  className="w-full p-2.5 text-xs font-mono uppercase rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Minimum Order ($)
                  </label>
                  <input
                    type="number"
                    value={minimumOrder}
                    onChange={e => setMinimumOrder(e.target.value)}
                    placeholder="30"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Maximum Discount ($)
                  </label>
                  <input
                    type="number"
                    value={maximumDiscount}
                    onChange={e => setMaximumDiscount(e.target.value)}
                    placeholder="25"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
