import { useState, useCallback } from 'react';

interface BulkUploadJob {
  id: string;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  successfulCandidates: number;
  failedCandidates: number;
  errors: string[];
  createdAt: string;
  completedAt?: string;
}

interface UseBulkUploadReturn {
  job: BulkUploadJob | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
  sessionId: string | null;
  startBulkUpload: (jobId: string, candidates?: any[], resumeFiles?: File[]) => Promise<string | null>;
  clearJob: () => void;
}

export function useBulkUpload(): UseBulkUploadReturn {
  const [job, setJob] = useState<BulkUploadJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const progress = job ? (job.processedFiles / job.totalFiles) * 100 : 0;

  const startBulkUpload = useCallback(async (
    targetJobId: string, 
    candidates?: any[], 
    resumeFiles?: File[]
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      if (resumeFiles && resumeFiles.length > 0) {
        // Handle file uploads with progress tracking
        const uploadSessionId = crypto.randomUUID();
        setSessionId(uploadSessionId);
        
        const formData = new FormData();
        formData.append('jobId', targetJobId);
        formData.append('sessionId', uploadSessionId);
        resumeFiles.forEach(file => {
          formData.append('files', file);
        });

        const response = await fetch('/api/candidates/bulk/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload files');
        }

        const result = await response.json();
        if (result.success) {
          return result.sessionId || uploadSessionId;
        }
      } else if (candidates && candidates.length > 0) {
        // Handle pre-parsed candidates
        const response = await fetch('/api/candidates/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: targetJobId,
            candidates,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start bulk upload');
        }

        const result = await response.json();
        return result.jobId;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearJob = useCallback(() => {
    setJob(null);
    setError(null);
    setSessionId(null);
  }, []);

  return {
    job,
    isUploading,
    progress,
    error,
    sessionId,
    startBulkUpload,
    clearJob,
  };
}
