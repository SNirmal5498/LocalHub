import mongoose, { Schema } from 'mongoose';

export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  relatedId: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
