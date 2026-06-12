import mongoose, { Schema } from 'mongoose';

export interface ISession {
  _id: string; // Client-generated UUID
  patientId: string; // References Patient._id
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
  _id: { type: String, required: true },
  patientId: { type: String, required: true, ref: 'Patient' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);
