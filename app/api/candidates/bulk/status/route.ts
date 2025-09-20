import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/progress-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 });
    }
    
    // Get progress from shared store
    const progress = progressStore.getProgress(sessionId);
    
    if (!progress) {
      return NextResponse.json({ 
        error: 'Upload session not found' 
      }, { status: 404 });
    }
    
    const progressPercentage = progress.totalFiles > 0 
      ? Math.round((progress.processedFiles / progress.totalFiles) * 100) 
      : 0;
    
    const response = {
      status: progress.status,
      progress: progressPercentage,
      totalFiles: progress.totalFiles,
      processedFiles: progress.processedFiles,
      currentFile: progress.currentFile,
      results: progress.results,
      startTime: progress.startTime,
      endTime: progress.endTime,
      elapsedTime: progress.endTime 
        ? progress.endTime - progress.startTime 
        : Date.now() - progress.startTime
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching upload progress:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch upload progress' 
    }, { status: 500 });
  }
}