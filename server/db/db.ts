import { connectMongo, calculateIsOpenNow } from './mongo.js';
import { User, IUser } from '../models/User.js';
import { Business, IBusiness } from '../models/Business.js';
import { Category, ICategory } from '../models/Category.js';
import { Product, IProduct } from '../models/Product.js';
import { Service, IService } from '../models/Service.js';
import { Offer, IOffer } from '../models/Offer.js';
import { Order, IOrder } from '../models/Order.js';
import { Review, IReview } from '../models/Review.js';
import { Message, IMessage } from '../models/Message.js';
import { Notification, INotification } from '../models/Notification.js';
import { Favorite, IFavorite } from '../models/Favorite.js';
import { AnalyticsEvent, IAnalyticsEvent } from '../models/AnalyticsEvent.js';

export {
  connectMongo,
  calculateIsOpenNow,
  User,
  Business,
  Category,
  Product,
  Service,
  Offer,
  Order,
  Review,
  Favorite,
  Message,
  Message as BusinessMessage,
  Notification,
  AnalyticsEvent,
  AnalyticsEvent as Event,
};

export type {
  IUser,
  IBusiness,
  ICategory,
  IProduct,
  IService,
  IOffer,
  IOrder,
  IReview,
  IFavorite,
  IMessage,
  INotification,
  IAnalyticsEvent,
};
