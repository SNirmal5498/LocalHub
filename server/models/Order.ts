import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  customerName: string;
  business: string;
  businessName: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  totalAmount: number;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
  phone: string;
  notes?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Completed' | 'Cancelled' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  business: { type: String, required: true, index: true },
  businessName: { type: String, required: true },
  items: [{
    product: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: '' },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  totalAmount: { type: Number, required: true },
  deliveryType: { type: String, enum: ['delivery', 'pickup'], default: 'pickup' },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
  },
  phone: { type: String, default: '' },
  notes: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending',
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
