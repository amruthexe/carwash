import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer' | 'worker';
  googleId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { 
      type: String, 
      enum: ['admin', 'customer', 'worker'], 
      default: 'customer' 
    },
    googleId: { type: String },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
