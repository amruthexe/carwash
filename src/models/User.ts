import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer' | 'worker';
  password?: string;
  googleId?: string;
  status: 'active' | 'inactive';
  address?: {
    city: string;
    community: string;
    block: string;
    flatNumber: string;
  };
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
    password: { type: String },
    googleId: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    address: {
      type: new Schema(
        {
          city: { type: String, required: true },
          community: { type: String, required: true },
          block: { type: String, required: true },
          flatNumber: { type: String, required: true },
        },
        { _id: false }
      ),
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
