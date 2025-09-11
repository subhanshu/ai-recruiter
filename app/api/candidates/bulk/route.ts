import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { updateJobStatus } from '@/lib/job-status';

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

interface CandidateData {
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  status: 'pending' | 'valid' | 'invalid';
  errors: string[];
}

// In-memory storage for job status (in production, use Redis or database)
const jobStatus = new Map<string, BulkUploadJob>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, candidates, resumeFiles } = body;
    
    if (!jobId || (!candidates && !resumeFiles)) {
      return NextResponse.json({ 
        error: 'Missing required fields: jobId and candidates or resumeFiles are required' 
      }, { status: 400 });
    }

    const supabaseClient = await createClient(cookies());
    
    // Create a job ID for tracking
    const jobId_tracking = randomUUID();
    const totalFiles = resumeFiles ? resumeFiles.length : candidates.length;
    
    // Initialize job status
    const job: BulkUploadJob = {
      id: jobId_tracking,
      jobId,
      status: 'pending',
      totalFiles,
      processedFiles: 0,
      successfulCandidates: 0,
      failedCandidates: 0,
      errors: [],
      createdAt: new Date().toISOString()
    };
    
    jobStatus.set(jobId_tracking, job);
    
    // Start background processing
    processBulkUpload(jobId_tracking, jobId, candidates, resumeFiles, supabaseClient);
    
    return NextResponse.json({ 
      success: true, 
      jobId: jobId_tracking,
      message: 'Bulk upload started. Use the job ID to track progress.' 
    }, { status: 202 });
    
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to start bulk upload' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }
    
    const job = jobStatus.get(jobId);
    
    if (!job) {
      return NextResponse.json({ 
        error: 'Job not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json(job);
    
  } catch (error) {
    console.error('Get job status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get job status' 
    }, { status: 500 });
  }
}

async function processBulkUpload(
  jobId: string, 
  targetJobId: string, 
  candidates: CandidateData[] | undefined,
  resumeFiles: File[] | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any
) {
  const job = jobStatus.get(jobId);
  if (!job) return;
  
  job.status = 'processing';
  jobStatus.set(jobId, job);
  updateJobStatus(jobId, { status: 'processing' });
  
  try {
    if (resumeFiles) {
      // Process resume files with AI parsing
      await processResumeFiles(jobId, targetJobId, resumeFiles, supabaseClient);
    } else if (candidates) {
      // Process pre-parsed candidates
      await processCandidates(jobId, targetJobId, candidates, supabaseClient);
    }
    
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    jobStatus.set(jobId, job);
    updateJobStatus(jobId, { 
      status: 'completed', 
      completedAt: job.completedAt 
    });
    
  } catch (error) {
    console.error('Bulk upload processing error:', error);
    job.status = 'failed';
    job.errors.push(error instanceof Error ? error.message : 'Unknown error');
    job.completedAt = new Date().toISOString();
    jobStatus.set(jobId, job);
    updateJobStatus(jobId, { 
      status: 'failed', 
      errors: job.errors,
      completedAt: job.completedAt 
    });
  }
}

async function processResumeFiles(
  jobId: string, 
  targetJobId: string, 
  resumeFiles: File[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any
) {
  const job = jobStatus.get(jobId);
  if (!job) return;
  
  for (let i = 0; i < resumeFiles.length; i++) {
    const fileInfo = resumeFiles[i];
    
    try {
      // For now, we'll create candidates with basic info from file names
      // In a real implementation, you'd need to handle file uploads differently
      const candidateData = {
        name: fileInfo.name.replace(/\.[^/.]+$/, ""),
        email: `candidate_${Date.now()}_${i}@example.com`, // Placeholder email
        phone: '',
        linkedinUrl: '',
        resumeUrl: '', // Would be set after file upload
        jobId: targetJobId,
        status: 'pending'
      };
      
      const { error } = await supabaseClient
        .from('Candidate')
        .insert([candidateData]);
      
      if (error) {
        job.failedCandidates++;
        job.errors.push(`Failed to create candidate from ${fileInfo.name}: ${error.message}`);
      } else {
        job.successfulCandidates++;
      }
    } catch (error) {
      job.failedCandidates++;
      job.errors.push(`Error processing ${fileInfo.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    job.processedFiles++;
    jobStatus.set(jobId, job);
    updateJobStatus(jobId, { 
      processedFiles: job.processedFiles,
      successfulCandidates: job.successfulCandidates,
      failedCandidates: job.failedCandidates,
      errors: job.errors
    });
    
    // Add a small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function processCandidates(
  jobId: string, 
  targetJobId: string, 
  candidates: CandidateData[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any
) {
  const job = jobStatus.get(jobId);
  if (!job) return;
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    
    try {
      if (candidate.status === 'valid') {
        const candidateData = {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone || '',
          linkedinUrl: candidate.linkedinUrl || '',
          resumeUrl: candidate.resumeUrl || '',
          jobId: targetJobId,
          status: 'pending'
        };
        
        const { error } = await supabaseClient
          .from('Candidate')
          .insert([candidateData]);
        
        if (error) {
          job.failedCandidates++;
          job.errors.push(`Failed to create candidate ${candidate.name}: ${error.message}`);
        } else {
          job.successfulCandidates++;
        }
      } else {
        job.failedCandidates++;
        job.errors.push(`Skipped invalid candidate ${candidate.name}: ${candidate.errors.join(', ')}`);
      }
    } catch (error) {
      job.failedCandidates++;
      job.errors.push(`Error creating candidate ${candidate.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    job.processedFiles++;
    jobStatus.set(jobId, job);
    updateJobStatus(jobId, { 
      processedFiles: job.processedFiles,
      successfulCandidates: job.successfulCandidates,
      failedCandidates: job.failedCandidates,
      errors: job.errors
    });
    
    // Add a small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
