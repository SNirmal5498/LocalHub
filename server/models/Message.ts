import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id: string;
  business: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  business: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
