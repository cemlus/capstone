import express from 'express';
import mongoose from 'mongoose';
import { PatientModel, SessionModel, CaptureImageModel } from './models';

const app = express();
app.use(express.json());

// Initialize MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundus_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err));

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
