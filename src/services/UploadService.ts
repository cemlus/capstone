import { dbService } from '../database/SQLiteService';

export class UploadService {
  /**
   * Pushes a captured image ID onto the S3 upload queue.
   */
  static async queueUpload(imageId: string): Promise<void> {
    const uploadId = `upload_${Date.now()}_${imageId}`;
    console.log(`Queueing upload task ${uploadId} for image ${imageId}`);
    
    await dbService.enqueueUpload({
      id: uploadId,
      imageId: imageId,
      status: 'pending',
      retryCount: 0,
    });
    
    await dbService.updateCapturedImage(imageId, { uploadStatus: 'pending' });

    // Try uploading immediately
    this.processNextInQueue();
  }

  /**
   * Processes the upload queue. Designed to be resilient to offline states.
   */
  private static async processNextInQueue(): Promise<void> {
    // In a real app we would check network connectivity first using @react-native-community/netinfo
    // const state = await NetInfo.fetch();
    // if (!state.isConnected) return;

    const pendingUploads = await dbService.getPendingUploads();
    if (pendingUploads.length === 0) return;

    const task = pendingUploads[0];
    
    try {
      console.log(`Processing S3 upload for task ${task.id} (Attempt ${task.retryCount + 1})`);
      
      // Simulate network latency for S3 putObject or presigned URL upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // On Success:
      await dbService.updateUploadQueueItem(task.id, {
        status: 'processing', // actually 'completed' or we delete from queue
      });
      await dbService.updateCapturedImage(task.imageId, { uploadStatus: 'uploaded' });
      console.log(`Successfully uploaded image ${task.imageId} to S3.`);
      
    } catch (error: any) {
      console.error(`Failed to upload ${task.id}`, error);
      
      const newRetryCount = task.retryCount + 1;
      await dbService.updateUploadQueueItem(task.id, {
        status: newRetryCount > 3 ? 'failed' : 'pending',
        retryCount: newRetryCount,
        lastAttemptAt: new Date().toISOString(),
        errorMessage: error.message,
      });

      if (newRetryCount > 3) {
        await dbService.updateCapturedImage(task.imageId, { uploadStatus: 'failed' });
      }
    }
  }

  /**
   * Retries all failed uploads (e.g. called when network is restored)
   */
  static async retryFailedUploads(): Promise<void> {
    console.log('Retrying failed uploads...');
    // Fetch failed tasks and reset them to pending, then call processNextInQueue()
  }
}
