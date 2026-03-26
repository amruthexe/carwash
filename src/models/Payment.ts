import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  amount: number;
  method: 'upi' | 'card' | 'cash';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi', 'card', 'cash'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  paidAt: { type: Date }
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
