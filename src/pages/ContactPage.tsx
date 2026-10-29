import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Mail,
  Store,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactPage: React.FC = () => {
  const { user } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Submission & Validation States
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const cleanName = name.trim();
    if (!cleanName) {
      errors.name = 'Please enter your full name.';
    } else if (cleanName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    const cleanSubject = subject.trim();
    if (!cleanSubject) {
      errors.subject = 'Please provide an inquiry subject.';
    } else if (cleanSubject.length < 3) {
      errors.subject = 'Subject must be at least 3 characters.';
    }

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      errors.message = 'Please enter your message.';
    } else if (cleanMessage.length < 10) {
      errors.message = 'Message must be at least 10 characters.';
    } else if (cleanMessage.length > 3000) {
      errors.message = 'Message cannot exceed 3000 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.sendSupportMessage({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setLoading(false);

      if (res.success) {
        setSubmittedSuccess(true);
        setSuccessMessage(
          res.message || 'Thank you! Your message has been received. Our support team will follow up shortly.'
        );
        // Reset form inputs only upon confirmed success
        setName(user?.name || '');
        setEmail(user?.email || '');
        setSubject('');
        setMessage('');
        setFieldErrors({});
      } else {
        // Preserve entered data if submission fails
        setApiError(res.message || 'Unable to send your message. Please check your connection and try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setApiError(err.message || 'A network error occurred while submitting. Please try again.');
    }
  };

  const handleResetForm = () => {
    setSubmittedSuccess(false);
    setApiError(null);
    setFieldErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Contact LocalHub Platform Support
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Have questions about onboarding your business, category listings, or platform features? Reach out to our community support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support Information Card (Stacked on mobile, 5 cols on desktop) */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-7 space-y-6 shadow-xs">
            <h2 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
              Support Channels
            </h2>

            <div className="space-y-5 text-xs text-neutral-600 dark:text-neutral-400">
              {/* Channel 1: Platform Support Email */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Email Inquiries</span>
                  <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">support@localhub.platform</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    For general customer and merchant inquiries
                  </p>
                </div>
              </div>

              {/* Channel 2: Merchant Onboarding Support */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Merchant Assistance</span>
                  <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">Storefront onboarding & verification</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Assistance with catalog setup, hours, and store listings
                  </p>
                </div>
              </div>

              {/* Channel 3: Community Directory */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Community Network</span>
                  <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">LocalHub Neighborhood Commerce</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Connecting independent local stores with neighborhood patrons
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card (7 cols on desktop) */}
        <div className="md:col-span-7">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
            {submittedSuccess ? (
              /* Success State */
              <div
                role="status"
                aria-live="polite"
                className="py-10 text-center space-y-4 animate-fadeIn"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Message Received
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-colors shadow-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Send Another Message</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Top Failure Alert Banner */}
                {apiError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{apiError}</p>
                    </div>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
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
                      placeholder="Jane Doe"
                      className={`w-full p-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                        fieldErrors.name
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p role="alert" className="text-[11px] text-red-500 mt-1 font-medium">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300"
                    >
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
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
                      className={`w-full p-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                        fieldErrors.email
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p role="alert" className="text-[11px] text-red-500 mt-1 font-medium">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300"
                  >
                    Subject / Concern <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    disabled={loading}
                    value={subject}
                    onChange={e => {
                      setSubject(e.target.value);
                      if (fieldErrors.subject) setFieldErrors(prev => ({ ...prev, subject: undefined }));
                    }}
                    placeholder="e.g. Question regarding business onboarding"
                    className={`w-full p-2.5 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                      fieldErrors.subject
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                    }`}
                  />
                  {fieldErrors.subject && (
                    <p role="alert" className="text-[11px] text-red-500 mt-1 font-medium">
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    disabled={loading}
                    value={message}
                    onChange={e => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Describe your inquiry or how we can help you..."
                    className={`w-full p-3 text-xs rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                      fieldErrors.message
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-neutral-200 dark:border-neutral-700 focus:ring-amber-500'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p role="alert" className="text-[11px] text-red-500 mt-1 font-medium">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
