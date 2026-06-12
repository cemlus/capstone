import mongoose, { Schema } from 'mongoose';

export interface ICaptureImage {
  _id: string; // Client-generated UUID
  sessionId: string; // References Session._id
  patientId: string; // References Patient._id
  eyeSide: 'left' | 'right';
  rawImageUrl: string; // AWS S3 URL
  enhancedImageUrl?: string; // AWS S3 URL (enhanced image)
  captureTime: Date;
  enhancementStatus: 'not_started' | 'queued' | 'processing' | 'done' | 'failed';
  qualityScore?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

const CaptureImageSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, ref: 'Session' },
  patientId: { type: String, required: true, ref: 'Patient' },
  eyeSide: { type: String, enum: ['left', 'right'], required: true },
  rawImageUrl: { type: String, required: true },
  enhancedImageUrl: { type: String },
  captureTime: { type: Date, required: true },
  enhancementStatus: { type: String, default: 'not_started' },
  qualityScore: { type: Number },
  notes: { type: String },
  metadata: { type: Schema.Types.Mixed }
});

export const CaptureImageModel = mongoose.model<ICaptureImage>('CaptureImage', CaptureImageSchema);
