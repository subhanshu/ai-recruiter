import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { generateUrl } from '@/lib/url-utils';
import { progressStore } from '@/lib/progress-store';

// Helper function to limit concurrent operations
async function processConcurrently<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrencyLimit: number = 3
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrencyLimit) {
    const batch = items.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map((item, batchIndex) => 
      processor(item, i + batchIndex)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch processing error:', result.reason);
        // Add error result
        results.push({
          name: 'Unknown',
          email: '',
          phone: '',
          linkedinUrl: '',
          status: 'invalid' as const,
          errors: ['Processing failed']
        } as R);
      }
    }
  }
  
  return results;
}

// Shared progress state for thread-safe updates
const progressState = {
  processedFiles: 0,
  results: [] as Array<{
    name: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    status: 'valid' | 'invalid';
    errors: string[];
  }>
};

// Helper function to update progress with detailed status
function updateProgress(sessionId: string, totalFiles: number, startTime: number, currentStatus: string) {
  const progressPercentage = Math.round((progressState.processedFiles / totalFiles) * 100);
  
  progressStore.setProgress(sessionId, {
    status: 'processing',
    totalFiles,
    processedFiles: progressState.processedFiles,
    currentFile: currentStatus,
    results: [...progressState.results],
    startTime: startTime
  });
  
  console.log(`📊 Progress: ${progressState.processedFiles}/${totalFiles} (${progressPercentage}%) - ${currentStatus}`);
}

// Process a single file with proper progress tracking
async function processFile(
  file: File, 
  index: number, 
  jobId: string, 
  supabaseClient: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  sessionId: string,
  totalFiles: number,
  startTime: number
): Promise<{
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  status: 'valid' | 'invalid';
  errors: string[];
}> {
  const fileName = file.name.replace(/\.[^/.]+$/, "");
  
  // Update progress - starting this file
  updateProgress(sessionId, totalFiles, startTime, `Starting ${file.name}...`);
  
  try {
    // Quick validation first
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      const result = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: ['Invalid file type']
      };
      
      // Update progress - file completed
      progressState.results.push(result);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (invalid type)`);
      
      return result;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const result = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: ['File too large (max 10MB)']
      };
      
      // Update progress - file completed
      progressState.results.push(result);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (too large)`);
      
      return result;
    }

    // Update progress - extracting text
    updateProgress(sessionId, totalFiles, startTime, `Extracting text from ${file.name}...`);

    // Skip extensive PDF validation for speed - let the external API handle it
    console.log(`🚀 Processing ${file.name} (${file.size} bytes)`);
    
    // Parse resume with AI - this is the main bottleneck
    updateProgress(sessionId, totalFiles, startTime, `AI parsing ${file.name}...`);
    
    const parseFormData = new FormData();
    parseFormData.append('resume', file);
    
    const parseResponse = await fetch(generateUrl('/api/ai/parse-resume'), {
      method: 'POST',
      body: parseFormData,
    });
    
    if (!parseResponse.ok) {
      const errorText = await parseResponse.text();
      const result = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: [`Parse error: ${parseResponse.status} ${errorText.substring(0, 100)}`]
      };
      
      // Update progress - file completed with error
      progressState.results.push(result);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (parse error)`);
      
      return result;
    }

    const result = await parseResponse.json();
    
    if (!result.success || !result.data) {
      const errorResult = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: ['Failed to parse resume - no data returned']
      };
      
      // Update progress - file completed with error
      progressState.results.push(errorResult);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (no data)`);
      
      return errorResult;
    }

    // Quick validation of extracted data
    const hasValidData = result.data.name && 
                         result.data.name.trim() !== '' && 
                         result.data.name !== fileName &&
                         result.data.name.toLowerCase() !== fileName.toLowerCase();
    
    if (!hasValidData) {
      const errorResult = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: ['No meaningful data could be extracted from the resume']
      };
      
      // Update progress - file completed with error
      progressState.results.push(errorResult);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (no valid data)`);
      
      return errorResult;
    }
    
    // Update progress - saving to database
    updateProgress(sessionId, totalFiles, startTime, `Saving ${result.data.name} to database...`);
    
    // Create candidate with all AI-parsed data
    const candidateData = {
      id: crypto.randomUUID(),
      name: result.data.name || fileName,
      email: result.data.email || '',
      phone: result.data.phone || '',
      linkedinUrl: result.data.linkedinUrl || '',
      resumeUrl: result.data.resumeUrl || '',
      location: result.data.location || '',
      skills: result.data.skills ? JSON.stringify(result.data.skills) : null,
      experience: result.data.experience || '',
      education: result.data.education || '',
      summary: result.data.summary || '',
      workHistory: result.data.workHistory ? JSON.stringify(result.data.workHistory) : null,
      projects: result.data.projects ? JSON.stringify(result.data.projects) : null,
      certifications: result.data.certifications ? JSON.stringify(result.data.certifications) : null,
      languages: result.data.languages ? JSON.stringify(result.data.languages) : null,
      jobId: jobId,
      status: 'pending'
    };
    
    const { data: candidate, error } = await supabaseClient
      .from('Candidate')
      .insert([candidateData])
      .select()
      .single();
    
    if (error) {
      const errorResult = {
        name: fileName,
        email: '',
        phone: '',
        linkedinUrl: '',
        status: 'invalid' as const,
        errors: [`Database error: ${error.message}`]
      };
      
      // Update progress - file completed with error
      progressState.results.push(errorResult);
      progressState.processedFiles++;
      updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (database error)`);
      
      return errorResult;
    }

    const successResult = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || '',
      linkedinUrl: candidate.linkedinUrl || '',
      status: 'valid' as const,
      errors: []
    };
    
    // Update progress - file completed successfully
    progressState.results.push(successResult);
    progressState.processedFiles++;
    updateProgress(sessionId, totalFiles, startTime, `✅ Completed ${candidate.name}`);

    return successResult;

  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    const errorResult = {
      name: fileName,
      email: '',
      phone: '',
      linkedinUrl: '',
      status: 'invalid' as const,
      errors: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
    
    // Update progress - file completed with error
    progressState.results.push(errorResult);
    progressState.processedFiles++;
    updateProgress(sessionId, totalFiles, startTime, `Completed ${file.name} (error)`);
    
    return errorResult;
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 OPTIMIZED UPLOAD ROUTE CALLED');
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const files = formData.getAll('files') as File[];
    const sessionId = formData.get('sessionId') as string || crypto.randomUUID();
    
    if (!jobId || files.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: jobId and files are required' 
      }, { status: 400 });
    }

    console.log(`⚡ Processing ${files.length} files with detailed progress tracking`);
    
    // Reset progress state for this session
    progressState.processedFiles = 0;
    progressState.results = [];
    
    const supabaseClient = await createClient(cookies());
    const totalFiles = files.length;
    
    // Initialize progress tracking
    progressStore.setProgress(sessionId, {
      status: 'processing',
      totalFiles,
      processedFiles: 0,
      currentFile: 'Initializing...',
      results: [],
      startTime: startTime
    });
    
    console.log(`📊 Progress tracking initialized for ${totalFiles} files`);
    
    // Process files with controlled concurrency (3 files at a time)
    const processedCandidates = await processConcurrently(
      files,
      (file, index) => processFile(file, index, jobId, supabaseClient, sessionId, totalFiles, startTime),
      3 // Concurrency limit
    );
    
    const successfulCount = processedCandidates.filter(c => c.status === 'valid').length;
    const failedCount = processedCandidates.filter(c => c.status === 'invalid').length;
    const processingTime = Date.now() - startTime;
    
    // Final progress update
    progressStore.setProgress(sessionId, {
      status: 'completed',
      totalFiles,
      processedFiles: totalFiles,
      currentFile: undefined,
      results: processedCandidates,
      startTime: startTime,
      endTime: Date.now()
    });
    
    console.log(`✅ Bulk upload completed in ${processingTime}ms: ${successfulCount} successful, ${failedCount} failed`);
    
    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      processingTimeMs: processingTime,
      data: {
        candidates: processedCandidates,
        summary: {
          total: processedCandidates.length,
          successful: successfulCount,
          failed: failedCount
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk upload error:', error);
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({ 
      error: 'Failed to process bulk upload',
      processingTimeMs: processingTime
    }, { status: 500 });
  }
}
