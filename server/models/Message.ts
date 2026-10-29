import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id: string;
  business?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type?: 'business_inquiry' | 'platform_support';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, default: 'platform', index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  subject: { type: String, default: 'General Inquiry', trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['business_inquiry', 'platform_support'], default: 'business_inquiry' },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
