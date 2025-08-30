import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const { voice = "alloy", instructions } = await req.json().catch(() => ({}));

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice,
        modalities: ["audio", "text"],
        instructions:
          instructions ||
          "You are an AI interviewer for a recruiting platform. Greet the candidate, then proceed with screening questions. Keep answers concise and friendly.",
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API request failed: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching session data:", error);
    return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
  }
}