import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business } from '../../types/index.js';
import { Settings, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const BusinessSettingsPage: React.FC = () => {
  const { business, setBusiness } = useOutletContext<{
    business: Business;
    setBusiness: (b: Business) => void;
  }>();

  const [minOrderAmount, setMinOrderAmount] = useState(String(business.minOrderAmount || '15'));
  const [deliveryAvailable, setDeliveryAvailable] = useState(business.deliveryAvailable !== false);
  const [pickupAvailable, setPickupAvailable] = useState(business.pickupAvailable !== false);
  const [isOpen, setIsOpen] = useState(business.isOpen !== false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await api.updateBusiness(business._id, {
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      deliveryAvailable,
      pickupAvailable,
      isOpen,
    });

    setSaving(false);

    if (res.success && res.data) {
      setBusiness(res.data);
      setMessage({ text: 'Store settings saved successfully!', error: false });
    } else {
      setMessage({ text: res.message || 'Failed to save settings.', error: true });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Store Settings & Preferences
        </h1>
        <p className="text-xs text-neutral-500">
          Configure fulfillment methods, order thresholds, and operational flags
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.error
              ? 'bg-red-50 text-red-600 dark:bg-red-950/30'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
          }`}
        >
          {message.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Operational Flags
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                  Storefront Accepting Orders
                </span>
                <span className="text-[11px] text-neutral-500">
                  When enabled, patrons can browse and place orders online.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isOpen}
                onChange={e => setIsOpen(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                  In-Store Pickup Option
                </span>
                <span className="text-[11px] text-neutral-500">
                  Allow patrons to collect items directly from your shop counter.
                </span>
              </div>
              <input
                type="checkbox"
                checked={pickupAvailable}
                onChange={e => setPickupAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                  Neighbourhood Local Delivery
                </span>
                <span className="text-[11px] text-neutral-500">
                  Offer direct doorstep delivery to addresses in your city.
                </span>
              </div>
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={e => setDeliveryAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Minimum Order Subtotal ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={minOrderAmount}
              onChange={e => setMinOrderAmount(e.target.value)}
              className="w-48 p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Orders below this subtotal will prompt customers to add more items.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
