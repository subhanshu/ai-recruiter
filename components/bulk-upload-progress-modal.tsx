'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, FileText, Mail, Phone, ExternalLink } from 'lucide-react';
import { useBulkUploadProgress, BulkUploadProgress } from '@/hooks/use-bulk-upload-progress';

interface BulkUploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  onComplete?: (results: BulkUploadProgress) => void;
}

export function BulkUploadProgressModal({ 
  isOpen, 
  onClose, 
  sessionId,
  onComplete 
}: BulkUploadProgressModalProps) {
  const { progress, error, isPolling, startPolling, stopPolling, clearProgress } = useBulkUploadProgress(sessionId);
  const completionCalledRef = useRef(false);

  // Start polling when modal opens and sessionId is available
  useEffect(() => {
    if (isOpen && sessionId && !isPolling) {
      startPolling();
    }
  }, [isOpen, sessionId, isPolling, startPolling]);

  // Handle completion - use ref to prevent multiple calls
  useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed') && !completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete?.(progress);
    }
  }, [progress, onComplete]);

  // Reset completion flag when modal opens with new session
  useEffect(() => {
    if (isOpen && sessionId) {
      completionCalledRef.current = false;
    }
  }, [isOpen, sessionId]);

  // Stop polling when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
    }
  }, [isOpen, stopPolling]);

  const handleClose = () => {
    stopPolling();
    clearProgress();
    onClose();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Upload Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {progress && (
            <>
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Overall Progress ({progress.processedFiles}/{progress.totalFiles})
                  </span>
                  <span className="text-sm text-gray-500">
                    {progress.progress}%
                  </span>
                </div>
                <Progress value={progress.progress} className="w-full" />
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    {progress.status === 'processing' && progress.currentFile && (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        {progress.currentFile}
                      </>
                    )}
                    {progress.status === 'completed' && (
                      <>
                        <CheckCircle className="inline h-3 w-3 text-green-500" />
                        Upload completed!
                      </>
                    )}
                    {progress.status === 'failed' && (
                      <>
                        <XCircle className="inline h-3 w-3 text-red-500" />
                        Upload failed
                      </>
                    )}
                  </span>
                  <span>
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatTime(progress.elapsedTime)}
                  </span>
                </div>
              </div>

              {/* Status Summary */}
              {progress.results.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Successful
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {progress.results.filter(r => r.status === 'valid').length}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Failed
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {progress.results.filter(r => r.status === 'invalid').length}
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              {progress.results.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Processed Files</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {progress.results.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'valid' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {result.status === 'valid' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {result.name}
                              </p>
                              
                              {result.status === 'valid' && (
                                <div className="text-xs text-gray-600 space-y-1 mt-1">
                                  {result.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate">{result.email}</span>
                                    </div>
                                  )}
                                  {result.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{result.phone}</span>
                                    </div>
                                  )}
                                  {result.linkedinUrl && (
                                    <div className="flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      <span className="truncate">LinkedIn</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {result.status === 'invalid' && result.errors.length > 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                  {result.errors.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {progress.status === 'processing' && (
                  <Button variant="outline" onClick={handleClose}>
                    Run in Background
                  </Button>
                )}
                
                {(progress.status === 'completed' || progress.status === 'failed') && (
                  <Button onClick={handleClose}>
                    Close
                  </Button>
                )}
              </div>
            </>
          )}

          {!progress && !error && sessionId && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Initializing upload...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
