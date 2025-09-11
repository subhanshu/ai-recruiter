import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, category, jobId } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Get job details for context
    const { supabaseClient } = await import("@/lib/supabase-client");
    
    const { data: job } = await supabaseClient
      .from('Job')
      .select('title, description, requiredSkills, qualifications')
      .eq('id', jobId)
      .single();

    const jobContext = job ? `
Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.requiredSkills || 'Not specified'}
Qualifications: ${job.qualifications || 'Not specified'}
` : '';

    const prompt = `
You are an expert interviewer evaluating a candidate's response. Please provide a detailed evaluation.

${jobContext}

Question Category: ${category}
Question: ${question}
Candidate's Answer: ${answer}

Please evaluate this answer on the following criteria:
1. Relevance to the question
2. Depth of understanding
3. Specificity and examples provided
4. Communication clarity
5. Technical accuracy (if applicable)
6. Problem-solving approach (if applicable)

Provide:
1. A score from 0-100
2. A brief evaluation (2-3 sentences)
3. Constructive feedback for improvement
4. A follow-up question suggestion (optional)

Format your response as JSON:
{
  "score": number,
  "evaluation": "brief evaluation text",
  "feedback": "constructive feedback text",
  "followUpQuestion": "optional follow-up question"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer and evaluator. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let evaluationData;
    try {
      evaluationData = JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      evaluationData = {
        score: 70,
        evaluation: "The candidate provided a response that shows some understanding of the topic.",
        feedback: "Consider providing more specific examples and details in your responses.",
        followUpQuestion: "Can you elaborate on that with a specific example?"
      };
    }

    return NextResponse.json({
      success: true,
      score: evaluationData.score,
      evaluation: evaluationData.evaluation,
      feedback: evaluationData.feedback,
      followUpQuestion: evaluationData.followUpQuestion
    });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
