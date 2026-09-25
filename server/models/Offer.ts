import mongoose, { Schema } from 'mongoose';

export interface IOffer {
  _id: string;
  business: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  couponCode?: string;
  startDate?: string;
  endDate?: string;
  minimumOrder?: number;
  maximumDiscount?: number | null;
  applicableProducts?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  couponCode: { type: String, uppercase: true, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: { type: Number, default: null },
  applicableProducts: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Offer = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
