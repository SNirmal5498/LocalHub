import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'customer' | 'owner' | 'business_owner' | 'admin';
  profileImage?: string;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'owner', 'business_owner', 'admin'], default: 'customer' },
  profileImage: { type: String, default: '' },
  favorites: [{ type: String }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
