import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/progress-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');
    
    if (action === 'list') {
      // List all active sessions with details
      const debugInfo = progressStore.debugInfo();
      return NextResponse.json({
        ...debugInfo,
        message: 'Active sessions in shared progress store'
      });
    }
    
    if (action === 'get' && sessionId) {
      // Get specific session details
      const progress = progressStore.getProgress(sessionId);
      return NextResponse.json({
        sessionId,
        found: !!progress,
        progress: progress || null,
        message: progress ? 'Session found' : 'Session not found in store'
      });
    }
    
    if (action === 'test') {
      // Test creating a session
      const testSessionId = 'test-' + Date.now();
      progressStore.setProgress(testSessionId, {
        status: 'processing',
        totalFiles: 1,
        processedFiles: 0,
        currentFile: 'test.pdf',
        results: [],
        startTime: Date.now()
      });
      
      return NextResponse.json({
        message: 'Test session created',
        sessionId: testSessionId,
        totalSessions: progressStore.getStoreSize(),
        testUrl: `/api/candidates/bulk/status?sessionId=${testSessionId}`
      });
    }
    
    if (action === 'clear' && sessionId) {
      // Clear specific session
      progressStore.clearProgress(sessionId);
      return NextResponse.json({
        message: `Session ${sessionId} cleared`,
        totalSessions: progressStore.getStoreSize()
      });
    }
    
    return NextResponse.json({
      message: 'Debug endpoint for bulk upload sessions',
      availableActions: ['list', 'get', 'test', 'clear'],
      usage: {
        list: '/api/candidates/bulk/debug?action=list',
        get: '/api/candidates/bulk/debug?action=get&sessionId=<session_id>',
        test: '/api/candidates/bulk/debug?action=test',
        clear: '/api/candidates/bulk/debug?action=clear&sessionId=<session_id>'
      },
      currentSessions: progressStore.getStoreSize(),
      debugInfo: progressStore.debugInfo()
    });
    
  } catch (error: unknown) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
