import mongoose, { Schema } from 'mongoose';

export interface IReview {
  _id: string;
  customer: string;
  customerName: string;
  business: string;
  order?: string | null;
  rating: number;
  comment: string;
  ownerResponse?: string | {
    text: string;
    respondedAt?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  customer: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  business: { type: String, required: true, index: true },
  order: { type: String, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  ownerResponse: {
    type: Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
