import mongoose, { Schema } from 'mongoose';

export interface IFavorite {
  _id: string;
  user: string;
  business: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user: { type: String, required: true, index: true },
  business: { type: String, required: true, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

FavoriteSchema.index({ user: 1, business: 1 }, { unique: true });

export const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
