// External API utilities for document text extraction

const EXTERNAL_TEXT_EXTRACTION_API = 'https://web-production-5932e.up.railway.app';

// External API text extraction function
export async function extractTextBulkWithProgress(files: File[]): Promise<{sessionId: string}> {
  try {
    console.log('Using external API for bulk text extraction with progress...');
    
    // Create FormData for the external API
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${EXTERNAL_TEXT_EXTRACTION_API}/extract-progress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('External API bulk response:', result);

    if (result && result.session_id) {
      return { sessionId: result.session_id };
    } else {
      throw new Error('External API returned invalid response format');
    }
  } catch (error) {
    console.error('External API bulk error:', error);
    throw new Error(`External bulk text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get progress from external API
export async function getExternalAPIProgress(sessionId: string): Promise<unknown> {
  try {
    const response = await fetch(`${EXTERNAL_TEXT_EXTRACTION_API}/progress/${sessionId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Session not found');
      }
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('External API progress error:', error);
    throw error;
  }
}

// Extract text using external API
export async function extractTextWithExternalAPI(file: File): Promise<string> {
  try {
    console.log('Using external API for text extraction...');
    
    // Create FormData for the external API
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${EXTERNAL_TEXT_EXTRACTION_API}/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('External API response:', result);

    // Handle the response format from the external API
    if (result && result.text) {
      return result.text;
    } else {
      throw new Error('External API returned no text content');
    }
  } catch (error) {
    console.error('External API error:', error);
    throw new Error(`External text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
