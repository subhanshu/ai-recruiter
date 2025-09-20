import { useState, useEffect, useCallback } from 'react';

export interface BulkUploadProgress {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  results: Array<{
    name: string;
    status: 'valid' | 'invalid';
    email: string;
    phone: string;
    linkedinUrl: string;
    errors: string[];
  }>;
  startTime: number;
  endTime?: number;
  elapsedTime: number;
}

export function useBulkUploadProgress(sessionId: string | null) {
  const [progress, setProgress] = useState<BulkUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/candidates/bulk/status?sessionId=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        setError(null);
        
        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false);
        }
      } else if (response.status === 404) {
        // Session not found, might not have started yet
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch progress');
      }
    } catch (err) {
      setError('Failed to fetch progress');
      console.error('Error fetching upload progress:', err);
    }
  }, [sessionId]);

  const startPolling = useCallback(() => {
    if (sessionId) {
      setIsPolling(true);
      setError(null);
    }
  }, [sessionId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const clearProgress = useCallback(() => {
    setProgress(null);
    setError(null);
    setIsPolling(false);
  }, []);

  // Poll for progress updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling && sessionId) {
      // Fetch immediately
      fetchProgress();
      
      // Then poll every 250ms for more responsive updates
      intervalId = setInterval(fetchProgress, 250);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, sessionId, fetchProgress]);

  return {
    progress,
    error,
    isPolling,
    startPolling,
    stopPolling,
    clearProgress,
    fetchProgress
  };
}


