import mongoose, { Schema } from 'mongoose';

export interface IBusiness {
  _id: string;
  owner: string;
  name: string;
  slug: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  category: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  isOpen?: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  statusReason?: string;
  statusAudit?: Array<{
    status: string;
    reason?: string;
    changedBy: string;
    changedAt: Date;
  }>;
  rating: number;
  reviewCount: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  minOrderAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const defaultDay = () => ({ open: '09:00', close: '18:00', isClosed: false });

const BusinessSchema = new Schema<IBusiness>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  owner: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  tagline: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: 'India' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  openingHours: {
    monday: { type: Object, default: defaultDay },
    tuesday: { type: Object, default: defaultDay },
    wednesday: { type: Object, default: defaultDay },
    thursday: { type: Object, default: defaultDay },
    friday: { type: Object, default: () => ({ open: '09:00', close: '19:00', isClosed: false }) },
    saturday: { type: Object, default: () => ({ open: '10:00', close: '19:00', isClosed: false }) },
    sunday: { type: Object, default: () => ({ open: '10:00', close: '16:00', isClosed: false }) },
  },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'rejected'], default: 'pending', index: true },
  statusReason: { type: String, default: '' },
  statusAudit: [{
    status: { type: String, required: true },
    reason: { type: String, default: '' },
    changedBy: { type: String, default: 'admin' },
    changedAt: { type: Date, default: Date.now },
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deliveryAvailable: { type: Boolean, default: true },
  pickupAvailable: { type: Boolean, default: true },
  minOrderAmount: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Business = mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);
