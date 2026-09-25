import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Business, BusinessMessage } from '../../types/index.js';
import { MessageSquare, Mail, Phone, CheckCircle2, Clock } from 'lucide-react';

export const BusinessMessagesPage: React.FC = () => {
  const { business } = useOutletContext<{ business: Business }>();

  const [messages, setMessages] = useState<BusinessMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    if (!business) return;
    setLoading(true);
    const res = await api.getBusinessMessages(business._id);
    if (res.success && res.data) {
      setMessages(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [business?._id]);

  const handleMarkRead = async (id: string) => {
    await api.markMessageRead(id);
    setMessages(prev => prev.map(m => (m._id === id ? { ...m, isRead: true } : m)));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Customer Inquiries
          </h1>
          <p className="text-xs text-neutral-500">
            Messages and pre-order booking inquiries submitted directly through your storefront
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          {messages.filter(m => !m.isRead).length} unread
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading customer inquiries...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No inquiries yet
          </h3>
          <p className="text-xs text-neutral-500">
            When patrons send questions via your contact form, they will arrive here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`p-5 rounded-2xl border transition-all ${
                !msg.isRead
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    {msg.name}
                  </span>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Mail className="w-3 h-3" /> {msg.email}
                  </a>
                  {msg.phone && (
                    <a
                      href={`tel:${msg.phone}`}
                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 font-medium"
                    >
                      <Phone className="w-3 h-3" /> {msg.phone}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  {!msg.isRead ? (
                    <button
                      onClick={() => handleMarkRead(msg._id)}
                      className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-bold"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Read
                    </span>
                  )}
                </div>
              </div>

              <p className="pt-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
