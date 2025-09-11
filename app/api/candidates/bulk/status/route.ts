import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/job-status';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }
    
    // Set up Server-Sent Events
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const stream = new ReadableStream({
      start(controller) {
        const sendUpdate = (data: { id: string; jobId: string; status: string; progress: number; totalCandidates: number; processedCandidates: number; errors: string[] } | { error: string }) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        };

        // Send initial status
        const job = getJobStatus(jobId);
        if (job) {
          sendUpdate(job);
        } else {
          sendUpdate({ error: 'Job not found' });
          controller.close();
          return;
        }

        // Set up polling for updates
        const interval = setInterval(() => {
          const currentJob = getJobStatus(jobId);
          if (currentJob) {
            sendUpdate(currentJob);
            
            // Close connection if job is completed or failed
            if (currentJob.status === 'completed' || currentJob.status === 'failed') {
              clearInterval(interval);
              controller.close();
            }
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 1000); // Poll every second

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });
    
  } catch (error) {
    console.error('SSE error:', error);
    return NextResponse.json({ 
      error: 'Failed to establish connection' 
    }, { status: 500 });
  }
}


