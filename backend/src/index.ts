import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Sync Patients from Mobile App
app.post('/api/sync/patient', async (req, res) => {
  try {
    const { id, name, gender, dob, patientId, notes, createdAt } = req.body;
    const patient = await prisma.patient.upsert({
      where: { id },
      update: { name, gender, dob: new Date(dob), patientId, notes },
      create: { id, name, gender, dob: new Date(dob), patientId, notes, createdAt: new Date(createdAt) },
    });
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
    const session = await prisma.session.upsert({
      where: { id },
      update: { notes, updatedAt: new Date(updatedAt) },
      create: { id, patientId, notes, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt) },
    });
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
    const capture = await prisma.captureImage.upsert({
      where: { id },
      update: { enhancedImageUrl, enhancementStatus, qualityScore, notes, metadata },
      create: { id, sessionId, patientId, eyeSide, rawImageUrl, enhancedImageUrl, captureTime: new Date(captureTime), enhancementStatus, qualityScore, notes, metadata },
    });
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
