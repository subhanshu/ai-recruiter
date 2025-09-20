import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractTextWithExternalAPI } from '@/lib/external-api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Quick validation for bulk processing optimization
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a PDF, Word document, or plain text file.' 
      }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Please upload a file smaller than 10MB.' 
      }, { status: 400 });
    }
    
    console.log(`⚡ Processing ${file.name} (${(file.size / 1024).toFixed(1)}KB) - skipping extensive validation for speed`);

    // Extract text using external API with timeout
    let resumeText = '';
    
    try {
      console.log(`⚡ Starting text extraction for ${file.name} (${file.size} bytes)`);
      const extractionStart = Date.now();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('External API timeout after 30 seconds')), 30000)
      );
      
      resumeText = await Promise.race([
        extractTextWithExternalAPI(file),
        timeoutPromise
      ]) as string;
      
      const extractionTime = Date.now() - extractionStart;
      console.log(`✅ Text extraction completed in ${extractionTime}ms for ${file.name}`);
      
    } catch (parseError: unknown) {
      console.error('External API parsing error:', parseError);
      
      let errorMessage = 'Failed to extract text from file.';
      if (parseError instanceof Error) {
        console.error('External API error details:', {
          message: parseError.message,
          stack: parseError.stack,
          name: parseError.name
        });
        
        errorMessage = parseError.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract sufficient text from the resume. Please ensure the file contains readable text.' 
      }, { status: 400 });
    }

    // Parse the resume text with OpenAI
    const parsedData = await parseResumeWithAI(resumeText, file.name);

    return NextResponse.json({
      success: true,
      data: parsedData
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to parse resume' 
    }, { status: 500 });
  }
}

async function parseResumeWithAI(resumeText: string, fileName: string) {
  try {
    const prompt = `Please parse the following resume text and extract structured information. Return the data in JSON format with the following structure:

{
  "name": "Full name of the candidate",
  "email": "Email address if found",
  "phone": "Phone number if found",
  "location": "Location/City, State if found",
  "linkedinUrl": "LinkedIn profile URL if found",
  "skills": ["array", "of", "technical", "skills"],
  "experience": "Total years of experience as a string (e.g., '5 years', '2-3 years')",
  "education": "Educational background summary",
  "summary": "Professional summary or objective (2-3 sentences)",
  "workHistory": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Employment duration",
      "description": "Brief description of role and achievements"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "certifications": ["certification1", "certification2"],
  "languages": ["language1", "language2"]
}

Resume text:
${resumeText}

Please extract as much relevant information as possible. If a field is not found, use null or an empty array/string as appropriate.`;

    console.log(`🤖 Starting OpenAI parsing for ${fileName}`);
    const aiStart = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Extract structured information from resume text and return it in valid JSON format. Be accurate and thorough in your extraction."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const aiTime = Date.now() - aiStart;
    console.log(`✅ OpenAI parsing completed in ${aiTime}ms for ${fileName}`);
    
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsedData;
    try {
      // Clean the response text to remove potential formatting issues
      let cleanedText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response JSON:', parseError);
      console.error('Raw AI response:', responseText);
      
      // Fallback to basic extraction
      parsedData = {
        name: extractName(resumeText),
        email: extractEmail(resumeText),
        phone: extractPhone(resumeText),
        location: extractLocation(resumeText),
        linkedinUrl: extractLinkedIn(resumeText),
        skills: extractSkills(resumeText),
        experience: extractExperience(resumeText),
        education: extractEducation(resumeText),
        summary: extractSummary(resumeText),
        workHistory: [],
        projects: [],
        certifications: [],
        languages: []
      };
    }

    return parsedData;

  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error('Failed to parse resume with AI');
  }
}

// Basic extraction functions as fallback
function extractName(text: string): string | null {
  const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
  return nameMatch ? nameMatch[1] : null;
}

function extractEmail(text: string): string | null {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}

function extractPhone(text: string): string | null {
  const phoneMatch = text.match(/[\+]?[1-9]?[\-\.\s]?\(?[0-9]{3}\)?[\-\.\s]?[0-9]{3}[\-\.\s]?[0-9]{4}/);
  return phoneMatch ? phoneMatch[0] : null;
}

function extractLocation(text: string): string | null {
  const locationMatch = text.match(/([A-Z][a-z]+,?\s+[A-Z]{2}|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
  return locationMatch ? locationMatch[0] : null;
}

function extractLinkedIn(text: string): string | null {
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  return linkedinMatch ? `https://${linkedinMatch[0]}` : null;
}

function extractSkills(text: string): string[] {
  const skillsSection = text.match(/skills?:?\s*(.+?)(?:\n\n|\n[A-Z])/i);
  if (skillsSection) {
    return skillsSection[1].split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

function extractExperience(text: string): string {
  const expMatch = text.match(/(\d+[\+]?\s*years?)/i);
  return expMatch ? expMatch[0] : '';
}

function extractEducation(text: string): string {
  const eduMatch = text.match(/education:?\s*(.+?)(?:\n\n|\n[A-Z])/i);
  return eduMatch ? eduMatch[1].trim() : '';
}

function extractSummary(text: string): string {
  const summaryMatch = text.match(/(?:summary|objective):?\s*(.+?)(?:\n\n|\n[A-Z])/i);
  return summaryMatch ? summaryMatch[1].trim() : '';
}
