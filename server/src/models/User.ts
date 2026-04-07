import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  avatar: string;
  isActive: boolean;
  role: string;
  createdAt: Date;
  dailyMessageCount: number;
  dailyMessageDate: Date;
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'parent' },
  createdAt: { type: Date, default: Date.now },
  dailyMessageCount: { type: Number, default: 0 },
  dailyMessageDate: { type: Date, default: () => new Date() },
});

export default mongoose.model<IUser>('User', UserSchema);
