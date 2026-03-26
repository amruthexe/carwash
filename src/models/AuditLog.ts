import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  action: string;
  oldValue?: string; // JSON string
  newValue?: string; // JSON string
  modifiedBy: mongoose.Types.ObjectId;
  role: 'admin' | 'worker';
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  oldValue: { type: String }, // Storing as JSON string
  newValue: { type: String }, // Storing as JSON string
  modifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'worker'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
