import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseClient } from "@/lib/supabase-client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interviewId, candidateId, jobId, transcript, questions } = body;

    if (!interviewId || !candidateId || !jobId || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get job details for context
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

    // Get candidate details with rich data
    const { data: candidate } = await supabaseClient
      .from('Candidate')
      .select('name, email, skills, experience, education, summary, workHistory, projects, certifications, languages, location')
      .eq('id', candidateId)
      .single();

    const candidateContext = candidate ? `
Candidate: ${candidate.name} (${candidate.email})
Location: ${candidate.location || 'Not specified'}
Experience: ${candidate.experience || 'Not specified'}
Education: ${candidate.education || 'Not specified'}
Skills: ${candidate.skills ? JSON.parse(candidate.skills).join(', ') : 'Not specified'}
Professional Summary: ${candidate.summary || 'Not available'}
Work History: ${candidate.workHistory ? JSON.parse(candidate.workHistory).map((work: { position: string; company: string; duration: string }) => `${work.position} at ${work.company} (${work.duration})`).join('; ') : 'Not available'}
Projects: ${candidate.projects ? JSON.parse(candidate.projects).map((project: { name: string; description: string }) => `${project.name} - ${project.description}`).join('; ') : 'Not available'}
Certifications: ${candidate.certifications ? JSON.parse(candidate.certifications).join(', ') : 'Not available'}
Languages: ${candidate.languages ? JSON.parse(candidate.languages).join(', ') : 'Not specified'}
` : '';

    // Evaluate each question-answer pair
    const evaluations = [];
    for (const qa of questions) {
      if (!qa.answer) continue;

      const prompt = `
You are an expert interviewer evaluating a candidate's response. Please provide a detailed evaluation considering the candidate's background and experience.

${jobContext}
${candidateContext}

Question: ${qa.text}
Category: ${qa.category || 'general'}
Candidate's Answer: ${qa.answer}

Please evaluate this answer considering:
1. Relevance to the question and job requirements
2. Depth of understanding based on their experience level
3. Specificity and examples provided (consider their work history)
4. Communication clarity and professionalism
5. Technical accuracy (if applicable, consider their skills)
6. Problem-solving approach (if applicable)
7. Alignment with their background and experience
8. How well they leverage their past projects/work history

Consider the candidate's:
- Experience level: ${candidate?.experience || 'Not specified'}
- Skills: ${candidate?.skills ? JSON.parse(candidate.skills).join(', ') : 'Not specified'}
- Work history: ${candidate?.workHistory ? JSON.parse(candidate.workHistory).map((work: { position: string; company: string }) => `${work.position} at ${work.company}`).join(', ') : 'Not available'}
- Projects: ${candidate?.projects ? JSON.parse(candidate.projects).map((project: { name: string }) => project.name).join(', ') : 'Not available'}

Provide:
1. A score from 0-100 (considering their experience level)
2. A brief evaluation (2-3 sentences) that references their background
3. Constructive feedback for improvement
4. A follow-up question suggestion (optional) that builds on their experience

Format your response as JSON:
{
  "score": number,
  "evaluation": "brief evaluation text that considers their background",
  "feedback": "constructive feedback text",
  "followUpQuestion": "optional follow-up question that leverages their experience"
}
`;

      try {
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
        
        if (response) {
          try {
            const evaluationData = JSON.parse(response);
            evaluations.push({
              questionId: qa.id,
              question: qa.text,
              answer: qa.answer,
              category: qa.category || 'general',
              score: evaluationData.score,
              evaluation: evaluationData.evaluation,
              feedback: evaluationData.feedback,
              followUpQuestion: evaluationData.followUpQuestion
            });
          } catch (parseError) {
            console.error('Failed to parse evaluation JSON:', parseError);
            // Add fallback evaluation
            evaluations.push({
              questionId: qa.id,
              question: qa.text,
              answer: qa.answer,
              category: qa.category || 'general',
              score: 70,
              evaluation: "The candidate provided a response that shows some understanding of the topic.",
              feedback: "Consider providing more specific examples and details in your responses.",
              followUpQuestion: "Can you elaborate on that with a specific example?"
            });
          }
        }
      } catch (error) {
        console.error('Error evaluating question:', error);
        // Add fallback evaluation
        evaluations.push({
          questionId: qa.id,
          question: qa.text,
          answer: qa.answer,
          category: qa.category || 'general',
          score: 70,
          evaluation: "The candidate provided a response that shows some understanding of the topic.",
          feedback: "Consider providing more specific examples and details in your responses.",
          followUpQuestion: "Can you elaborate on that with a specific example?"
        });
      }
    }

    // Calculate overall score
    const overallScore = evaluations.length > 0 
      ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length 
      : 0;

    // Generate overall evaluation summary
    const summaryPrompt = `
Based on the following interview evaluations, provide an overall assessment:

${evaluations.map(evaluation => `
Question: ${evaluation.question}
Answer: ${evaluation.answer}
Score: ${evaluation.score}/100
Evaluation: ${evaluation.evaluation}
`).join('\n')}

Overall Score: ${overallScore.toFixed(1)}/100

Please provide:
1. A comprehensive overall evaluation (3-4 sentences)
2. Key strengths observed
3. Areas for improvement
4. Recommendation for next steps

Format as JSON:
{
  "overallEvaluation": "comprehensive evaluation text",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "recommendation": "next steps recommendation"
}
`;

    let overallEvaluation = {
      overallEvaluation: "The candidate demonstrated competency in the interview.",
      strengths: ["Good communication skills"],
      improvements: ["Could provide more specific examples"],
      recommendation: "Consider for next round"
    };

    try {
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer providing overall assessment. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const summaryResponse = summaryCompletion.choices[0]?.message?.content;
      if (summaryResponse) {
        try {
          overallEvaluation = JSON.parse(summaryResponse);
        } catch (parseError) {
          console.error('Failed to parse summary JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating overall evaluation:', error);
    }

    // Save evaluations to database
    const { error: saveError } = await supabaseClient
      .from('InterviewEvaluation')
      .insert([
        {
          interviewId,
          evaluations: evaluations,
          overallScore: overallScore / 100, // Convert to 0-1 scale
          overallEvaluation: overallEvaluation.overallEvaluation,
          strengths: overallEvaluation.strengths,
          improvements: overallEvaluation.improvements,
          recommendation: overallEvaluation.recommendation
        }
      ]);

    if (saveError) {
      console.error('Error saving evaluations:', saveError);
      return NextResponse.json(
        { error: 'Failed to save evaluations' },
        { status: 500 }
      );
    }

    // Update interview with overall score
    const { error: updateError } = await supabaseClient
      .from('Interview')
      .update({ 
        score: overallScore / 100,
        summary: overallEvaluation.overallEvaluation
      })
      .eq('id', interviewId);

    if (updateError) {
      console.error('Error updating interview:', updateError);
    }

    return NextResponse.json({
      success: true,
      evaluations,
      overallScore,
      overallEvaluation
    });

  } catch (error) {
    console.error('Error evaluating interview:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate interview' },
      { status: 500 }
    );
  }
}
