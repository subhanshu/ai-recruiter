import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a PDF or Word document.' 
      }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Please upload a file smaller than 10MB.' 
      }, { status: 400 });
    }

    // Convert file to text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let resumeText = '';
    
    try {
      if (file.type === 'application/pdf') {
        // Parse PDF using dynamic import
        const pdf = (await import('pdf-parse')).default;
        const pdfData = await pdf(buffer);
        resumeText = pdfData.text;
      } else if (file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Parse Word document using dynamic import
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json({ 
        error: 'Failed to extract text from file. Please ensure the file is not corrupted.' 
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract sufficient text from the resume. Please ensure the file contains readable text.' 
      }, { status: 400 });
    }

    // Use AI to parse the resume text
    const parsedData = await parseResumeWithAI(resumeText);

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: 'Resume parsed successfully'
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse resume. Please try again.' 
    }, { status: 500 });
  }
}

async function parseResumeWithAI(resumeText: string) {
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

// Fallback extraction functions
function extractName(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  return lines[0]?.trim() || 'Unknown';
}

function extractEmail(text: string): string | null {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
}

function extractLocation(text: string): string | null {
  const locationRegex = /([A-Za-z\s]+,\s*[A-Z]{2})/;
  const match = text.match(locationRegex);
  return match ? match[0] : null;
}

function extractLinkedIn(text: string): string | null {
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+/;
  const match = text.match(linkedinRegex);
  return match ? match[0] : null;
}

function extractSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'SQL', 'MongoDB',
    'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
    'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'Kotlin', 'Android', 'iOS', 'Machine Learning', 'AI', 'Data Science',
    'DevOps', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills;
}

function extractExperience(text: string): string {
  const experienceRegex = /(\d+)\+?\s*years?/i;
  const match = text.match(experienceRegex);
  return match ? `${match[1]} years` : 'Unknown';
}

function extractEducation(text: string): string {
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Degree', 'University', 'College', 'BSc', 'MSc', 'MBA'];
  const lines = text.split('\n');
  
  for (const line of lines) {
    for (const keyword of educationKeywords) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        return line.trim();
      }
    }
  }
  
  return 'Not specified';
}

function extractSummary(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 20);
  return lines.slice(0, 2).join(' ').substring(0, 200) || 'No summary available';
}
