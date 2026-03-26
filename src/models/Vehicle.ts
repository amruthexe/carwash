import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleNumber: string;
  vehicleModel: string;
  type: 'car' | 'bike';
  status: 'active' | 'inactive';
}

const VehicleSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleModel: { type: String, required: true },
  type: { type: String, enum: ['car', 'bike'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
