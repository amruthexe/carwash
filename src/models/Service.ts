import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  requestedTime: Date;
  scheduledTime: Date; // auto = requestedTime + 2 hours
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'failed' | 'no_show' | 'rescheduled';
  notes?: string;
  createdAt: Date;
}

const ServiceRequestSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  requestedTime: { type: Date, required: true },
  scheduledTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'failed', 'no_show', 'rescheduled'],
    default: 'pending'
  },
  notes: { type: String }
}, { timestamps: true });

export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);

export interface IWorkerAssignment extends Document {
  requestId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId; // adminId
  assignedAt: Date;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed';
}

const WorkerAssignmentSchema: Schema = new Schema({
  requestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['assigned', 'accepted', 'rejected', 'completed'], default: 'assigned' }
}, { timestamps: true });

export const WorkerAssignment = mongoose.models.WorkerAssignment || mongoose.model<IWorkerAssignment>('WorkerAssignment', WorkerAssignmentSchema);

export interface IWorkerAvailability extends Document {
  workerId: mongoose.Types.ObjectId;
  date: Date;
  isAvailable: boolean;
  maxJobsPerDay: number;
}

const WorkerAvailabilitySchema: Schema = new Schema({
  workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true },
  maxJobsPerDay: { type: Number, default: 5 }
}, { timestamps: true });

export const WorkerAvailability = mongoose.models.WorkerAvailability || mongoose.model<IWorkerAvailability>('WorkerAvailability', WorkerAvailabilitySchema);

export interface IServiceHistory extends Document {
  requestId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  completedAt: Date;
  rating?: number;
  feedback?: string;
}

const ServiceHistorySchema: Schema = new Schema({
  requestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String }
}, { timestamps: true });

export const ServiceHistory = mongoose.models.ServiceHistory || mongoose.model<IServiceHistory>('ServiceHistory', ServiceHistorySchema);
