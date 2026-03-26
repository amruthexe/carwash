import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: 'monthly' | 'quarterly' | 'yearly' | 'per_service';
  price: number;
  totalServices: number;
  validityDays: number;
}

const PlanSchema: Schema = new Schema({
  name: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'per_service'], required: true },
  price: { type: Number, required: true },
  totalServices: { type: Number, required: true },
  validityDays: { type: Number, required: true },
}, { timestamps: true });

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  remainingServices: number;
  status: 'active' | 'expired' | 'paused';
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  remainingServices: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'paused'], default: 'active' },
}, { timestamps: true });

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
