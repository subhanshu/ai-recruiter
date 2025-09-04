import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

type ParsedJD = {
  title?: string;
  department?: string;
  location?: string;
  responsibilities?: string;
  requiredSkills?: string;
  qualifications?: string;
  questions: string[];
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  }

  const { jd } = await req.json();
  if (!jd) return NextResponse.json({ error: "jd is required" }, { status: 400 });

  // Simple prompt to structure JD and generate questions
  const prompt = `You are an assistant that structures job descriptions and generates basic screening questions for recruiters.

Generate 8-10 basic screening questions that a recruiter would ask to assess:
- Basic qualifications and experience
- Interest in the role and company
- Availability and location preferences
- Salary expectations
- General fit for the position

These should be initial screening questions, NOT deep technical or behavioral questions that would be asked by hiring managers in later rounds.

Return strict JSON with fields: title, department, location, responsibilities, requiredSkills, qualifications, questions (array of 8-10 concise screening questions). If a field is missing, omit it.

JD:\n${jd}`;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return only JSON. No commentary.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!r.ok) {
    const text = await r.text();
    
    // If OpenAI quota exceeded, provide fallback response
    if (text.includes('quota') || text.includes('insufficient_quota')) {
      const mockQuestions = [
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
        title: jd.split('\n')[0].substring(0, 100) || 'Extracted Position',
        questions: mockQuestions,
        note: 'OpenAI quota exceeded - using fallback questions'
      });
    }
    
    return NextResponse.json({ error: text }, { status: 500 });
  }
  const data = await r.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';
  let parsed: ParsedJD = { questions: [] };
  try {
    parsed = JSON.parse(content);
  } catch {}

  if (!Array.isArray(parsed.questions)) parsed.questions = [];

  return NextResponse.json(parsed);
}



