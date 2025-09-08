import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function saveResumeFile(file: File): Promise<string> {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, uniqueFilename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Return the public URL
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error('Error saving resume file:', error);
    throw new Error('Failed to save resume file');
  }
}

export function getResumeUrl(filename: string): string {
  return `/uploads/${filename}`;
}


