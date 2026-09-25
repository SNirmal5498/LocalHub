export type UserRole = 'customer' | 'owner' | 'business_owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHourDay {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface OpeningHours {
  monday: OpeningHourDay;
  tuesday: OpeningHourDay;
  wednesday: OpeningHourDay;
  thursday: OpeningHourDay;
  friday: OpeningHourDay;
  saturday: OpeningHourDay;
  sunday: OpeningHourDay;
}

export interface Business {
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
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  openingHours: OpeningHours;
  isOpen: boolean;
  status: 'active' | 'suspended' | 'pending';
  rating: number;
  reviewCount: number;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  minOrderAmount?: number;
  createdAt: string;
  updatedAt: string;
  ownerDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Product {
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
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  business: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  category: string;
  isAvailable: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
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
  createdAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  customerName: string;
  business: string;
  businessName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  totalAmount: number;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  phone: string;
  notes?: string;
  paymentMethod: 'cod' | 'pay_at_store';
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  customer: string;
  customerName: string;
  business: string;
  order?: string | null;
  rating: number;
  comment: string;
  ownerResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'offer' | 'message';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  businessCount?: number;
}

export interface BusinessMessage {
  _id: string;
  business: string;
  customer?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
