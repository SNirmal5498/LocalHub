import mongoose, { Schema } from 'mongoose';

export interface IProduct {
  _id: string;
  business: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  images: string[];
  stock: number;
  isAvailable: boolean;
  sku?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  category: { type: String, default: 'General' },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  sku: { type: String, default: '' },
  tags: [{ type: String }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
