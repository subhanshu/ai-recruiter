// Shared progress store for bulk uploads
interface CandidateResult {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  status: 'valid' | 'invalid' | 'pending';
  errors: string[];
}

interface UploadProgress {
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  results: CandidateResult[];
  startTime: number;
  endTime?: number;
}

// Use global to ensure single instance across Next.js hot reloads
declare global {
  var __progressStore: Map<string, UploadProgress> | undefined;
}

// Global store that survives Next.js hot reloads
if (!global.__progressStore) {
  global.__progressStore = new Map<string, UploadProgress>();
  console.log('🏪 Global progress store initialized');
}

const store = global.__progressStore;

export const progressStore = {
  setProgress(sessionId: string, progress: UploadProgress) {
    store.set(sessionId, progress);
    console.log(`Progress updated for session ${sessionId}:`, {
      status: progress.status,
      processedFiles: progress.processedFiles,
      totalFiles: progress.totalFiles,
      currentFile: progress.currentFile
    });
  },

  getProgress(sessionId: string): UploadProgress | undefined {
    return store.get(sessionId);
  },

  clearProgress(sessionId: string) {
    const deleted = store.delete(sessionId);
    console.log(`Session ${sessionId} ${deleted ? 'cleared' : 'not found'}`);
  },

  getAllSessions(): string[] {
    return Array.from(store.keys());
  },

  getStoreSize(): number {
    return store.size;
  },

  debugInfo() {
    const sessions = Array.from(store.entries()).map(([id, progress]) => ({
      sessionId: id,
      status: progress.status,
      processedFiles: progress.processedFiles,
      totalFiles: progress.totalFiles,
      startTime: new Date(progress.startTime).toISOString(),
      endTime: progress.endTime ? new Date(progress.endTime).toISOString() : null
    }));

    return {
      totalSessions: store.size,
      sessions
    };
  }
};


