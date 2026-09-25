import mongoose, { Schema } from 'mongoose';

export interface IAnalyticsEvent {
  _id: string;
  business: string;
  eventType: 'storefront_view' | 'product_view' | 'service_view' | 'cart_add' | 'checkout_completed';
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, required: true, index: true },
  eventType: {
    type: String,
    enum: ['storefront_view', 'product_view', 'service_view', 'cart_add', 'checkout_completed'],
    required: true,
    index: true,
  },
  metadata: { type: Object, default: {} },
  ip: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
