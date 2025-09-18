import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { generateUrl } from '@/lib/url-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const files = formData.getAll('files') as File[];
    
    if (!jobId || files.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: jobId and files are required' 
      }, { status: 400 });
    }

    const supabaseClient = await createClient(cookies());
    const processedCandidates = [];
    
    for (const file of files) {
      try {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          processedCandidates.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            email: '',
            phone: '',
            linkedinUrl: '',
            status: 'invalid',
            errors: ['Invalid file type']
          });
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          processedCandidates.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            email: '',
            phone: '',
            linkedinUrl: '',
            status: 'invalid',
            errors: ['File too large (max 10MB)']
          });
          continue;
        }

        // Parse resume with AI
        const parseFormData = new FormData();
        parseFormData.append('resume', file);
        
        const parseResponse = await fetch(generateUrl('/api/ai/parse-resume'), {
          method: 'POST',
          body: parseFormData,
        });
        
        if (parseResponse.ok) {
          const result = await parseResponse.json();
          if (result.success && result.data) {
            // Create candidate with all AI-parsed data
            const candidateData = {
              name: result.data.name || file.name.replace(/\.[^/.]+$/, ""),
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
              processedCandidates.push({
                name: file.name.replace(/\.[^/.]+$/, ""),
                email: '',
                phone: '',
                linkedinUrl: '',
                status: 'invalid',
                errors: [`Database error: ${error.message}`]
              });
            } else {
              processedCandidates.push({
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone || '',
                linkedinUrl: candidate.linkedinUrl || '',
                status: 'valid',
                errors: []
              });
            }
          } else {
            processedCandidates.push({
              name: file.name.replace(/\.[^/.]+$/, ""),
              email: '',
              phone: '',
              linkedinUrl: '',
              status: 'invalid',
              errors: ['Failed to parse resume']
            });
          }
        } else {
          processedCandidates.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            email: '',
            phone: '',
            linkedinUrl: '',
            status: 'invalid',
            errors: ['Failed to process resume']
          });
        }
      } catch (error) {
        processedCandidates.push({
          name: file.name.replace(/\.[^/.]+$/, ""),
          email: '',
          phone: '',
          linkedinUrl: '',
          status: 'invalid',
          errors: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }
    
    const successfulCount = processedCandidates.filter(c => c.status === 'valid').length;
    const failedCount = processedCandidates.filter(c => c.status === 'invalid').length;
    
    return NextResponse.json({
      success: true,
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
    return NextResponse.json({ 
      error: 'Failed to process bulk upload' 
    }, { status: 500 });
  }
}
