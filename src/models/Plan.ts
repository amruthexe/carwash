import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  numberOfServices: number;
  validity: { period: 'yearly' | 'quarterly' | 'halfyear' | 'month'; days: number }[];
}

const PlanSchema: Schema = new Schema({
  name: { type: String,  required: true },
  price: { type: Number, required: true },
  numberOfServices: { type: Number, required: true },
  validity: [{ period: { type: String, enum: ['yearly','quarterly','halfyear','month'], required: true }, days: { type: Number, required: true } }],
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
