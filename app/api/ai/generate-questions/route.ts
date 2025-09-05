import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const { jobDescription, jobTitle } = await request.json();
    
    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // Prompt specifically for generating screening questions from existing job
    const prompt = `You are an expert recruiter creating basic screening questions for the position: "${jobTitle || 'this role'}".

Generate 8-10 basic screening questions that a recruiter would ask to assess:
- Basic qualifications and experience match
- Interest in the role and company
- Availability and location preferences  
- Salary expectations
- General fit for the position
- Notice period and start date availability

These should be initial screening questions, NOT deep technical or behavioral questions that would be asked by hiring managers in later rounds.

Focus on questions that help determine if the candidate meets basic requirements and is worth moving to the next stage.

Job Description:
${jobDescription}

Return only a JSON array of questions, like this:
["Question 1?", "Question 2?", "Question 3?"]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'Return only valid JSON array. No commentary or explanation.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const text = await response.text();
      
      // If OpenAI quota exceeded, provide fallback response
      if (text.includes('quota') || text.includes('insufficient_quota')) {
        const fallbackQuestions = [
          "Can you tell me about your relevant experience for this role?",
          "What interests you most about this position and our company?",
          "What is your current salary expectation for this role?",
          "Are you available to start immediately or do you have a notice period?",
          "Are you comfortable with the location and any travel requirements?",
          "What is your preferred work arrangement (remote, hybrid, or on-site)?",
          "Do you have any questions about the role or company?",
          "What are your career goals for the next 2-3 years?"
        ];
        
        return NextResponse.json({
          questions: fallbackQuestions,
          note: 'OpenAI quota exceeded - using fallback questions'
        });
      }
      
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    try {
      const questions = JSON.parse(content);
      
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      return NextResponse.json({ 
        success: true, 
        questions: questions 
      });
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        rawResponse: content 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
