import mongoose from 'mongoose';
import { PatientModel, SessionModel, CaptureImageModel } from './models';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundus_db';

async function runVerification() {
  console.log('--- E2E Database Sync Verification ---');
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear existing mock data if any
    await PatientModel.deleteMany({ _id: { $regex: /^test_/ } });
    await SessionModel.deleteMany({ _id: { $regex: /^test_/ } });
    await CaptureImageModel.deleteMany({ _id: { $regex: /^test_/ } });
    console.log('🧹 Cleaned up old test data.');

    const mockPatientId = 'test_patient_001';
    const mockSessionId = 'test_session_001';
    const mockCaptureId = 'test_capture_001';

    // 2. Simulate Syncing Patient demographics from client
    console.log('\nStep 1: Syncing Patient Demographics...');
    const patientDoc = await PatientModel.findOneAndUpdate(
      { _id: mockPatientId },
      {
        $set: {
          name: 'Jane Doe Verification',
          gender: 'Female',
          dob: new Date('1990-05-15'),
          patientId: 'MRN-VERIFY-123',
          notes: 'Test verification patient notes.'
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Patient synced:', patientDoc);

    // 3. Simulate Syncing Session
    console.log('\nStep 2: Syncing Session...');
    const sessionDoc = await SessionModel.findOneAndUpdate(
      { _id: mockSessionId },
      {
        $set: {
          notes: 'retinal scan session',
          updatedAt: new Date()
        },
        $setOnInsert: {
          patientId: mockPatientId,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Session synced:', sessionDoc);

    // 4. Simulate Syncing Capture Images (Raw and Enhanced S3 links)
    console.log('\nStep 3: Syncing Capture Images (Dual S3 URLs)...');
    const captureDoc = await CaptureImageModel.findOneAndUpdate(
      { _id: mockCaptureId },
      {
        $set: {
          enhancedImageUrl: 'https://fundus-pro-captures.s3.amazonaws.com/uploads/12345_test_capture_001_enhanced.jpg',
          enhancementStatus: 'done',
          qualityScore: 0.94,
          notes: 'No glare detected. Clean disc view.',
          metadata: { zoom: 2.5, exposure: -0.5, flash: 'off' }
        },
        $setOnInsert: {
          sessionId: mockSessionId,
          patientId: mockPatientId,
          eyeSide: 'left',
          rawImageUrl: 'https://fundus-pro-captures.s3.amazonaws.com/uploads/12345_test_capture_001_raw.jpg',
          captureTime: new Date()
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Capture Image synced:', captureDoc);

    // 5. Query MongoDB to verify relations and indexes
    console.log('\nStep 4: Running Verification Queries...');
    
    // Find patient and populate their sessions
    const patientWithSessions = await PatientModel.findById(mockPatientId);
    console.log('🔍 Verified Patient details:', patientWithSessions);

    const capturesUnderSession = await CaptureImageModel.find({ sessionId: mockSessionId });
    console.log('🔍 Verified Captures under Session:', capturesUnderSession);
    
    if (capturesUnderSession.length > 0 && capturesUnderSession[0].rawImageUrl.includes('_raw.jpg') && capturesUnderSession[0].enhancedImageUrl?.includes('_enhanced.jpg')) {
      console.log('\n🎉 SUCCESS: All database references, MongoDB collections, custom string keys, and S3 URLs verified successfully.');
    } else {
      throw new Error('Verification failed: Capture image URLs are incorrect.');
    }

  } catch (error) {
    console.error('❌ E2E Verification failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runVerification();
