import mongoose, { Schema } from 'mongoose';

export interface IService {
  _id: string;
  business: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  category: string;
  isAvailable: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  duration: { type: String, default: '30 mins' },
  category: { type: String, default: 'Standard' },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
