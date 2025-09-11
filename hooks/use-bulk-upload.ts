import { useState, useEffect, useCallback } from 'react';
import { randomUUID } from 'crypto';

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
  startBulkUpload: (jobId: string, candidates?: any[], resumeFiles?: File[]) => Promise<string | null>;
  clearJob: () => void;
}

export function useBulkUpload(): UseBulkUploadReturn {
  const [job, setJob] = useState<BulkUploadJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Handle file uploads
        const formData = new FormData();
        formData.append('jobId', targetJobId);
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
          // Create a mock job for progress tracking
          const mockJob = {
            id: randomUUID(),
            jobId: targetJobId,
            status: 'completed' as const,
            totalFiles: resumeFiles.length,
            processedFiles: resumeFiles.length,
            successfulCandidates: result.data.summary.successful,
            failedCandidates: result.data.summary.failed,
            errors: result.data.candidates
              .filter((c: any) => c.status === 'invalid')
              .map((c: any) => c.errors.join(', ')),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          };
          
          setJob(mockJob);
          return mockJob.id;
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
  }, []);

  // Set up real-time progress monitoring
  useEffect(() => {
    if (!job?.id) return;

    const eventSource = new EventSource(`/api/candidates/bulk/status?jobId=${job.id}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setJob(data);
        
        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close();
          setIsUploading(false);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      setIsUploading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [job?.id]);

  return {
    job,
    isUploading,
    progress,
    error,
    startBulkUpload,
    clearJob,
  };
}
