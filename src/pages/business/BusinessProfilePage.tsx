import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business } from '../../types/index.js';
import { Store, MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { isValidCoordinate, isSanFranciscoPlaceholder } from '../../utils/location.js';

export const BusinessProfilePage: React.FC = () => {
  const { business, setBusiness } = useOutletContext<{
    business: Business;
    setBusiness: (b: Business) => void;
  }>();

  const [name, setName] = useState(business.name || '');
  const [tagline, setTagline] = useState(business.tagline || '');
  const [description, setDescription] = useState(business.description || '');
  const [category, setCategory] = useState(business.category || 'Food & Bakery');
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [address, setAddress] = useState(business.address || '');
  const [city, setCity] = useState(business.city || '');
  const [state, setState] = useState(business.state || '');
  const [postalCode, setPostalCode] = useState(business.postalCode || '');
  const [country, setCountry] = useState(business.country || 'India');
  const [latitude, setLatitude] = useState<number | null>(
    isValidCoordinate(business.latitude, business.longitude) &&
    !isSanFranciscoPlaceholder(business.latitude, business.longitude, business.city)
      ? business.latitude!
      : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    isValidCoordinate(business.latitude, business.longitude) &&
    !isSanFranciscoPlaceholder(business.latitude, business.longitude, business.city)
      ? business.longitude!
      : null
  );
  const [geocodeStatus, setGeocodeStatus] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isOpen, setIsOpen] = useState(business.isOpen !== false);
  const [logo, setLogo] = useState(business.logo || '');
  const [coverImage, setCoverImage] = useState(business.coverImage || '');
  const [openingHours, setOpeningHours] = useState(business.openingHours || {});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHourChange = (day: string, field: 'open' | 'close' | 'isClosed', value: any) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...(prev as any)[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await api.updateBusiness(business._id, {
      name,
      tagline,
      description,
      category,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
      country,
      latitude: latitude !== null ? latitude : undefined,
      longitude: longitude !== null ? longitude : undefined,
      isOpen,
      logo,
      coverImage,
      openingHours,
    });

    setSaving(false);

    if (res.success && res.data) {
      setBusiness(res.data);
      setMessage({ text: 'Business profile updated successfully!', error: false });
    } else {
      setMessage({ text: res.message || 'Failed to update profile.', error: true });
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Store Profile & Information
        </h1>
        <p className="text-xs text-neutral-500">
          This information is displayed live to customers on your public storefront URL: /business/{business.slug}
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
        {/* Core Identity */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" /> Identity & Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Food & Bakery">Food & Bakery</option>
                <option value="Electronics & Repair">Electronics & Repair</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Beauty & Salon">Beauty & Salon</option>
                <option value="Grocery & Organic">Grocery & Organic</option>
                <option value="Home & Furniture">Home & Furniture</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Short Tagline / Catchphrase
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="e.g. Artisanal sourdough, viennoiserie & custom celebration cakes"
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              About Description / Story
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Store Logo
              </label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={logo}
                    onChange={e => setLogo(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className="w-full p-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors">
                      <ImageIcon className="w-3 h-3 text-amber-500" />
                      <span>Upload from device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFile}
                        className="hidden"
                      />
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => setLogo('')}
                        className="text-[11px] text-neutral-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Cover Banner
              </label>
              <div className="space-y-2">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-20 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className="w-full p-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors">
                      <ImageIcon className="w-3 h-3 text-amber-500" />
                      <span>Upload banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFile}
                        className="hidden"
                      />
                    </label>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-[11px] text-neutral-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" /> Location & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  setGeocodeStatus(null);
                }}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setGeocodeStatus(null);
                }}
                placeholder="e.g. Coimbatore"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={e => {
                  setState(e.target.value);
                  setGeocodeStatus(null);
                }}
                placeholder="e.g. Tamil Nadu"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={e => {
                  setPostalCode(e.target.value);
                  setGeocodeStatus(null);
                }}
                placeholder="e.g. 641 001"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={e => {
                  setCountry(e.target.value);
                  setGeocodeStatus(null);
                }}
                placeholder="e.g. India"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Location Verification Action */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={async () => {
                if (!city.trim()) {
                  setGeocodeStatus('Please specify at least a city to locate.');
                  return;
                }
                setIsGeocoding(true);
                setGeocodeStatus(null);
                try {
                  const res = await api.geocodeLocation({
                    address: address.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    postalCode: postalCode.trim(),
                    country: country.trim() || 'India',
                  });
                  if (res.success && res.data) {
                    setLatitude(res.data.latitude);
                    setLongitude(res.data.longitude);
                    setGeocodeStatus(`✓ Verified on Map: [${res.data.latitude}, ${res.data.longitude}]`);
                  } else {
                    setGeocodeStatus('Location will resolve automatically when saving.');
                  }
                } catch {
                  setGeocodeStatus('Coordinates will be resolved automatically on save.');
                } finally {
                  setIsGeocoding(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isGeocoding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{isGeocoding ? 'Locating...' : 'Update Map Coordinates'}</span>
            </button>
            {geocodeStatus ? (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {geocodeStatus}
              </span>
            ) : latitude && longitude ? (
              <span className="text-[11px] text-neutral-500">
                Current Pin: [{latitude.toFixed(4)}, {longitude.toFixed(4)}]
              </span>
            ) : null}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Weekly Opening Hours
            </h3>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={e => setIsOpen(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Store Currently Open</span>
            </label>
          </div>

          <div className="space-y-2.5">
            {days.map(day => {
              const dayConfig = (openingHours as any)[day] || { open: '09:00', close: '18:00', isClosed: false };
              return (
                <div key={day} className="flex items-center gap-3 text-xs">
                  <span className="w-24 capitalize font-semibold text-neutral-700 dark:text-neutral-300">
                    {day}
                  </span>

                  <label className="flex items-center gap-1.5 text-neutral-500">
                    <input
                      type="checkbox"
                      checked={dayConfig.isClosed}
                      onChange={e => handleHourChange(day, 'isClosed', e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Closed</span>
                  </label>

                  {!dayConfig.isClosed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayConfig.open}
                        onChange={e => handleHourChange(day, 'open', e.target.value)}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={dayConfig.close}
                        onChange={e => handleHourChange(day, 'close', e.target.value)}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
