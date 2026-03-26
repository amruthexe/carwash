import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  city: string;
  state: string;
  pincode: string;
}

const CommunitySchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
}, { timestamps: true });

export const Community = mongoose.models.Community || mongoose.model<ICommunity>('Community', CommunitySchema);

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  blockNo: string;
  flatNo: string;
  landmark?: string;
}

const AddressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  blockNo: { type: String, required: true },
  flatNo: { type: String, required: true },
  landmark: { type: String },
}, { timestamps: true });

export const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
