import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Category } from '../../types/index.js';
import { Store, MapPin, Phone, Mail, Clock, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'cat-1', name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', isActive: true },
  { _id: 'cat-2', name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', isActive: true },
  { _id: 'cat-3', name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', isActive: true },
  { _id: 'cat-4', name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', isActive: true },
  { _id: 'cat-5', name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', isActive: true },
  { _id: 'cat-6', name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', isActive: true },
];

export const BusinessCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Bakery');
  const [customCategory, setCustomCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('California');
  const [postalCode, setPostalCode] = useState('94103');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [openingHours, setOpeningHours] = useState({
    monday: { open: '09:00', close: '18:00', isClosed: false },
    tuesday: { open: '09:00', close: '18:00', isClosed: false },
    wednesday: { open: '09:00', close: '18:00', isClosed: false },
    thursday: { open: '09:00', close: '18:00', isClosed: false },
    friday: { open: '09:00', close: '19:00', isClosed: false },
    saturday: { open: '10:00', close: '19:00', isClosed: false },
    sunday: { open: '10:00', close: '16:00', isClosed: false },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
          if (!category) {
            setCategory(res.data[0].name);
          }
        }
      } catch (err) {
        console.error('Could not fetch categories, using defaults', err);
      }
    }
    loadCategories();
  }, []);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Other' ? customCategory.trim() : category.trim();

    if (!name.trim() || !finalCategory || !phone.trim() || !address.trim()) {
      setError('Store name, category, contact phone, and street address are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createBusiness({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category: finalCategory,
        phone: phone.trim(),
        email: email.trim() || user?.email,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        latitude,
        longitude,
        openingHours,
        logo,
        coverImage,
      });

      if (res.success) {
        if (user && user.role === 'customer') {
          updateUser({ ...user, role: 'owner' });
        }
        navigate('/business/dashboard');
      } else {
        setError(res.message || 'Failed to create business listing.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting store profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
          <Store className="w-3.5 h-3.5" /> Merchant Onboarding
        </div>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white">
          Register Your Storefront
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Create your digital business profile. Once submitted, your store will be submitted for verification and published for local discovery.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            1. Business Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Modern Craft Bakery"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {categories.map(c => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Other">Other / Custom Category...</option>
              </select>
            </div>
          </div>

          {category === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Custom Category Name *
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="e.g. Handmade Leather Goods"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Store Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="e.g. Handcrafted sourdough breads and morning pastries"
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              About / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell your local community about your craft, origin story, and what makes your products special..."
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            2. Contact & Physical Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Public Store Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="store@domain.com"
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Physical Street Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace"
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            3. Store Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Store Logo
              </label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="url"
                    value={logo}
                    onChange={e => setLogo(e.target.value)}
                    placeholder="Image URL or upload"
                    className="w-full p-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <ImageIcon className="w-3 h-3" /> Upload file
                    <input type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Store Cover Banner
              </label>
              <div className="space-y-2">
                {coverImage && (
                  <img src={coverImage} alt="Banner preview" className="w-full h-16 rounded-xl object-cover border" />
                )}
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="Banner Image URL or upload"
                  className="w-full p-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
                <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <ImageIcon className="w-3 h-3" /> Upload file
                  <input type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            4. Operating Schedule
          </h2>

          <div className="space-y-2 text-xs">
            {Object.entries(openingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between gap-4 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="capitalize font-semibold w-24">{day}</span>
                <label className="flex items-center gap-1.5 text-neutral-500">
                  <input
                    type="checkbox"
                    checked={hours.isClosed}
                    onChange={e => handleHourChange(day, 'isClosed', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Closed</span>
                </label>
                {!hours.isClosed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={e => handleHourChange(day, 'open', e.target.value)}
                      className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={e => handleHourChange(day, 'close', e.target.value)}
                      className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-md transition-colors"
          >
            {submitting ? 'Registering Store...' : 'Submit Store Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};
