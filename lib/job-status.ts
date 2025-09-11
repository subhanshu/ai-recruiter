// In-memory storage for job status (in production, use Redis or database)
const jobStatus = new Map<string, { id: string; jobId: string; status: string; progress: number; totalCandidates: number; processedCandidates: number; errors: string[]; completedAt?: string; processedFiles?: number; successfulCandidates?: number; failedCandidates?: number }>();

export function updateJobStatus(jobId: string, updates: Partial<{ id: string; jobId: string; status: string; progress: number; totalCandidates: number; processedCandidates: number; errors: string[]; completedAt?: string; processedFiles?: number; successfulCandidates?: number; failedCandidates?: number }>) {
  const job = jobStatus.get(jobId);
  if (job) {
    Object.assign(job, updates);
    jobStatus.set(jobId, job);
  }
}

export function getJobStatus(jobId: string) {
  return jobStatus.get(jobId);
}

export function setJobStatus(jobId: string, status: { id: string; jobId: string; status: string; progress: number; totalCandidates: number; processedCandidates: number; errors: string[]; completedAt?: string; processedFiles?: number; successfulCandidates?: number; failedCandidates?: number }) {
  jobStatus.set(jobId, status);
}
