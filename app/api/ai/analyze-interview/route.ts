import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseClient } from '@/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { interviewId, transcript, jobTitle, jobDescription, candidateName } = await request.json();

    if (!interviewId || !transcript) {
      return NextResponse.json(
        { error: 'Interview ID and transcript are required' },
        { status: 400 }
      );
    }

    // Get job and candidate details for context
    const { data: interview, error: interviewError } = await supabaseClient
      .from('Interview')
      .select(`
        *,
        job:Job(title, jdRaw, responsibilities),
        candidate:Candidate(name, email)
      `)
      .eq('id', interviewId)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const job = interview.job;
    const candidate = interview.candidate;

    // Create comprehensive analysis prompt
    const analysisPrompt = `You are an expert HR analyst and interview evaluator. Analyze the following interview transcript and provide a comprehensive evaluation.

**Job Details:**
- Title: ${jobTitle || job?.title || 'N/A'}
- Description: ${jobDescription || job?.jdRaw || job?.responsibilities || 'N/A'}

**Candidate Details:**
- Name: ${candidateName || candidate?.name || 'N/A'}

**Interview Transcript:**
${transcript}

Please provide a detailed analysis in the following JSON format:

{
  "overallScore": 85,
  "overallEvaluation": "Detailed overall assessment of the candidate's performance...",
  "technicalSkills": {
    "score": 80,
    "evaluation": "Assessment of technical abilities...",
    "strengths": ["List of technical strengths"],
    "weaknesses": ["List of technical areas for improvement"]
  },
  "communicationSkills": {
    "score": 90,
    "evaluation": "Assessment of communication abilities...",
    "strengths": ["List of communication strengths"],
    "weaknesses": ["List of communication areas for improvement"]
  },
  "culturalFit": {
    "score": 85,
    "evaluation": "Assessment of cultural alignment...",
    "strengths": ["List of cultural fit strengths"],
    "weaknesses": ["List of cultural fit concerns"]
  },
  "problemSolving": {
    "score": 75,
    "evaluation": "Assessment of problem-solving approach...",
    "strengths": ["List of problem-solving strengths"],
    "weaknesses": ["List of problem-solving areas for improvement"]
  },
  "leadershipPotential": {
    "score": 70,
    "evaluation": "Assessment of leadership qualities...",
    "strengths": ["List of leadership strengths"],
    "weaknesses": ["List of leadership development areas"]
  },
  "keyInsights": [
    "Important insights about the candidate",
    "Notable responses or behaviors",
    "Unique qualities or concerns"
  ],
  "recommendations": {
    "hire": "yes|no|maybe",
    "reasoning": "Detailed reasoning for the recommendation",
    "nextSteps": ["Specific next steps if moving forward"],
    "developmentAreas": ["Areas for development if hired"],
    "interviewerNotes": "Additional notes for the hiring team"
  },
  "summary": "Executive summary of the interview and recommendation"
}

Focus on:
1. Specific examples from the transcript
2. Alignment with job requirements
3. Cultural fit and team dynamics
4. Growth potential and development areas
5. Concrete recommendations with reasoning
6. Actionable next steps

Be thorough, objective, and provide specific evidence from the conversation.`;

    // Generate AI analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst and interview evaluator. Provide detailed, objective analysis of interview transcripts. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Clean the response text to remove potential formatting issues
      let cleanedText = analysisText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing backticks or other formatting
      cleanedText = cleanedText.replace(/^`+|`+$/g, '').trim();
      
      console.log('Cleaned analysis text:', cleanedText.substring(0, 200) + '...');
      
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI analysis JSON:', parseError);
      console.error('Raw analysis text:', analysisText);
      // Fallback to a basic analysis structure
      analysis = {
        overallScore: 75,
        overallEvaluation: analysisText.replace(/`/g, ''), // Remove backticks from fallback
        summary: "AI analysis completed but formatting needs review",
        recommendations: {
          hire: "maybe",
          reasoning: "Analysis generated but requires manual review",
          nextSteps: ["Review the detailed analysis"],
          developmentAreas: ["To be determined"],
          interviewerNotes: analysisText.replace(/`/g, '') // Remove backticks
        }
      };
    }

    // Save analysis to database
    const { error: updateError } = await supabaseClient
      .from('Interview')
      .update({
        summary: analysis.summary || analysis.overallEvaluation,
        score: analysis.overallScore / 100, // Convert to 0-1 scale
        transcript: transcript
      })
      .eq('id', interviewId);

    if (updateError) {
      console.error('Error updating interview:', updateError);
    }

    // Save detailed evaluation (only if table exists)
    try {
      const { error: evalError } = await supabaseClient
        .from('InterviewEvaluation')
        .insert({
          id: uuidv4(), // Generate UUID for the evaluation
          interviewId: interviewId,
          evaluations: analysis,
          overallScore: analysis.overallScore / 100,
          overallEvaluation: analysis.overallEvaluation,
          strengths: analysis.keyInsights || [],
          improvements: analysis.recommendations?.developmentAreas || [],
          recommendation: analysis.recommendations?.hire || 'maybe'
        });

      if (evalError) {
        console.error('Error saving evaluation:', evalError);
        // Don't fail the entire process if evaluation table doesn't exist
        if (evalError.code === 'PGRST205') {
          console.log('InterviewEvaluation table not found - skipping detailed evaluation save');
        }
      } else {
        console.log('✅ Interview evaluation saved successfully');
      }
    } catch (evalError) {
      console.error('Error saving evaluation:', evalError);
      // Continue with the process even if evaluation save fails
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      message: 'Interview analysis completed successfully'
    });

  } catch (error) {
    console.error('Error analyzing interview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze interview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
