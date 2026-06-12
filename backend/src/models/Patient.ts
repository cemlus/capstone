import mongoose, { Schema } from 'mongoose';

export interface IPatient {
  _id: string; // Client-generated UUID
  name: string;
  gender: string;
  dob: Date;
  patientId?: string; // Optional external clinical ID
  notes?: string;
  createdAt: Date;
}

const PatientSchema: Schema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  patientId: { type: String, unique: true, sparse: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);
