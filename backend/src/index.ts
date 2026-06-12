import express from 'express';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PatientModel, SessionModel, CaptureImageModel } from './models';

const app = express();
app.use(express.json());

// Initialize MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundus_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  },
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'fundus-pro-captures';

// Generate AWS S3 PUT Presigned URL
app.get('/api/upload/presign', async (req, res) => {
  try {
    const filename = req.query.filename as string;
    const fileType = (req.query.fileType as string) || 'image/jpeg';

    if (!filename) {
      return res.status(400).json({ error: 'Filename query parameter is required.' });
    }

    const objectKey = `uploads/${Date.now()}_${filename}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.json({
      uploadUrl: presignedUrl,
      objectUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${objectKey}`,
      objectKey,
    });
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

// Sync Patients from Mobile App
app.post('/api/sync/patient', async (req, res) => {
  try {
    const { id, name, gender, dob, patientId, notes, createdAt } = req.body;
    const patient = await PatientModel.findOneAndUpdate(
      { _id: id },
      { 
        $set: { name, gender, dob: new Date(dob), patientId, notes },
        $setOnInsert: { createdAt: new Date(createdAt) }
      },
      { upsert: true, new: true }
    );
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync patient' });
  }
});

// Sync Session from Mobile App
app.post('/api/sync/session', async (req, res) => {
  try {
    const { id, patientId, notes, createdAt, updatedAt } = req.body;
    const session = await SessionModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { notes, updatedAt: new Date(updatedAt) },
        $setOnInsert: { patientId, createdAt: new Date(createdAt) }
      },
      { upsert: true, new: true }
    );
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync session' });
  }
});

// Sync Captured Image from Mobile App
app.post('/api/sync/capture', async (req, res) => {
  try {
    const { id, sessionId, patientId, eyeSide, rawImageUrl, enhancedImageUrl, captureTime, enhancementStatus, qualityScore, notes, metadata } = req.body;
    const capture = await CaptureImageModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { enhancedImageUrl, enhancementStatus, qualityScore, notes, metadata },
        $setOnInsert: { sessionId, patientId, eyeSide, rawImageUrl, captureTime: new Date(captureTime) }
      },
      { upsert: true, new: true }
    );
    res.json(capture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync capture' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
