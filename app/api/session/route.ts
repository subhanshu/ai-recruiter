import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const body = await req.json().catch(() => ({}));
    const { voice = "alloy", instructions } = body;
    
    console.log("🎯 Session API received instructions:", instructions ? "Custom instructions provided" : "Using default instructions");
    if (instructions) {
      console.log("📋 Instructions preview:", instructions.substring(0, 100) + "...");
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview",
        voice,
        modalities: ["audio", "text"],
        instructions:
          instructions ||
          "You are an AI interviewer for a recruiting platform. Your role is to conduct a professional interview with the candidate. Start by calling the startInterview function to begin the session, then ask relevant questions using the askQuestion function. After each answer, use evaluateAnswer to assess the response. Take notes during the interview using takeNotes. When finished, call endInterview with a summary and score. Be conversational, professional, and engaging. Keep questions relevant to the job position.",
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