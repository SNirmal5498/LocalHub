import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  Store,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Role state (defaults to business_owner if navigating directly to /business/register)
  const [role, setRole] = useState<'customer' | 'business_owner'>(() => {
    return location.pathname === '/business/register' ? 'business_owner' : 'customer';
  });

  // Strict initial state - NEVER prepopulate with admin or existing credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Validation States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  // Phone validation regex (accepts standard 10-15 digit formats, optional +country code)
  const phoneRegex = /^[+]?[0-9\s\-().]{10,15}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // 1. Full Name
    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    // 2. Email Address
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Phone Number
    const cleanPhone = phone.trim();
    if (role === 'business_owner') {
      if (!cleanPhone) {
        errors.phone = 'Phone number is required for merchant storefront contact.';
      } else if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10-digit mobile number.';
      }
    } else if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid phone number (10-15 digits).';
    }

    // 4. Password
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // 5. Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleChange = (newRole: 'customer' | 'business_owner') => {
    setRole(newRole);
    setApiError(null);
    // Clear phone error if switching to customer and phone was empty
    if (newRole === 'customer' && !phone.trim()) {
      setFieldErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const regRes = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      setLoading(false);

      if (!regRes.success) {
        setApiError(regRes.message || 'Registration failed. Please try again.');
        return;
      }

      // Successful registration:
      // Business owner navigates to store setup flow /business/new
      // Customer navigates to local discovery /businesses
      if (role === 'business_owner') {
        navigate('/business/new');
      } else {
        navigate('/businesses');
      }
    } catch (err: any) {
      setLoading(false);
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-2xl font-black text-neutral-900 dark:text-white hover:opacity-90 transition-opacity focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg px-2"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-lg shadow-xs">
              L
            </span>
            <span>LocalHub</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {role === 'business_owner' ? 'Register Your Storefront' : 'Create Customer Account'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            {role === 'business_owner'
              ? 'Launch your verified digital storefront, accept orders, and connect with neighbourhood patrons'
              : 'Discover artisanal bakeries, repair services, and neighbourhood boutiques near you'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 shadow-xs">
          <button
            type="button"
            onClick={() => handleRoleChange('customer')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
              role === 'customer'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            aria-pressed={role === 'customer'}
          >
            <User className="w-4 h-4" />
            <span>Local Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('business_owner')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
              role === 'business_owner'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            aria-pressed={role === 'business_owner'}
          >
            <Store className="w-4 h-4" />
            <span>Business Owner</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-xl"
        >
          {/* Top API Error Feedback Banner */}
          {apiError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{apiError}</p>
                {apiError.includes('already exists') && (
                  <p className="mt-1 text-[11px]">
                    <Link to="/login" className="font-bold underline hover:text-red-700 dark:hover:text-red-300">
                      Click here to sign in with your existing account →
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 1. Full Name Field */}
          <div>
            <label
              htmlFor="reg-full-name"
              className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                id="reg-full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={loading}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Jane Doe"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                  fieldErrors.name
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          {/* 2. Email Address and Phone Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="jane@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Phone Number {role === 'business_owner' ? <span className="text-red-500">*</span> : <span className="text-neutral-400 font-normal">(Optional)</span>}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  disabled={loading}
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder={role === 'business_owner' ? '+91 98765 43210' : 'Mobile number'}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          {/* 3. Password and Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md focus:outline-hidden"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md focus:outline-hidden"
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>
                  {role === 'business_owner'
                    ? 'Register as Merchant & Setup Store'
                    : 'Create Customer Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-xs text-neutral-500 pt-2">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline focus:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-500 rounded px-1"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
