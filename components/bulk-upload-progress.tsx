'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bot, 
  Users, 
  AlertCircle,
  X
} from 'lucide-react';

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

interface BulkUploadProgressProps {
  job: BulkUploadJob;
  onClose: () => void;
}

export function BulkUploadProgress({ job, onClose }: BulkUploadProgressProps) {
  const progress = (job.processedFiles / job.totalFiles) * 100;
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isProcessing = job.status === 'processing';

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isFailed) return <XCircle className="w-5 h-5 text-red-600" />;
    if (isProcessing) return <Bot className="w-5 h-5 text-blue-600 animate-spin" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isFailed) return 'Failed';
    if (isProcessing) return 'Processing';
    return 'Pending';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-50 text-green-700 border-green-200';
    if (isFailed) return 'bg-red-50 text-red-700 border-red-200';
    if (isProcessing) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Bulk Upload Progress</CardTitle>
              <CardDescription>
                {job.totalFiles} files • {job.processedFiles} processed
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing files...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">{job.successfulCandidates}</span>
            </div>
            <p className="text-xs text-gray-600">Successful</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="font-semibold">{job.failedCandidates}</span>
            </div>
            <p className="text-xs text-gray-600">Failed</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{job.totalFiles}</span>
            </div>
            <p className="text-xs text-gray-600">Total Files</p>
          </div>
        </div>

        {/* Errors */}
        {job.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Errors ({job.errors.length})
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {job.errors.slice(0, 5).map((error, index) => (
                <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </p>
              ))}
              {job.errors.length > 5 && (
                <p className="text-xs text-gray-500">
                  ... and {job.errors.length - 5} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Upload completed successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {job.successfulCandidates} candidates have been added to the job.
            </p>
          </div>
        )}

        {isFailed && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Upload failed!</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please check the errors above and try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
