import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'service' | 'payment' | 'reminder';
  status: 'sent' | 'failed' | 'read';
  sentAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['service', 'payment', 'reminder'], required: true },
  status: { type: String, enum: ['sent', 'failed', 'read'], default: 'sent' },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
