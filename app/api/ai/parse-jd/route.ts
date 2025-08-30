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
  const prompt = `You are an assistant that structures job descriptions and generates screening questions.
Return strict JSON with fields: title, department, location, responsibilities, requiredSkills, qualifications, questions (array of 8-10 concise questions). If a field is missing, omit it.
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



