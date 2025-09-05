"use client"

import { toast } from "sonner"
import { useState, useCallback } from "react"

interface InterviewSession {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle?: string;
  jobDescription?: string;
  candidateName?: string;
  questions: Array<{
    id: string;
    text: string;
    category: string;
    asked: boolean;
    answer?: string;
    evaluation?: string;
    score?: number;
  }>;
  notes: Array<{
    id: string;
    text: string;
    category: string;
    timestamp: Date;
  }>;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  overallScore?: number;
  summary?: string;
}

export const useInterviewTools = (candidateId: string, jobId: string) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch job and candidate details along with questions
      const [jobResponse, candidateResponse] = await Promise.all([
        fetch(`/api/jobs/${jobId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/candidates/${candidateId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);
      
      if (!jobResponse.ok) {
        const errorText = await jobResponse.text();
        throw new Error(`Failed to fetch job details: ${jobResponse.status} - ${errorText}`);
      }
      
      if (!candidateResponse.ok) {
        const errorText = await candidateResponse.text();
        throw new Error(`Failed to fetch candidate details: ${candidateResponse.status} - ${errorText}`);
      }
      
      const jobData = await jobResponse.json();
      const candidateData = await candidateResponse.json();
      const questionsData = { questions: jobData.questions || [] };
      
      const newSession: InterviewSession = {
        id: `interview_${Date.now()}`,
        candidateId,
        jobId,
        jobTitle: jobData.title || 'Unknown Position',
        jobDescription: jobData.jdRaw || jobData.responsibilities || 'No description available',
        candidateName: candidateData.name || 'Unknown Candidate',
        questions: questionsData.questions?.map((q: any, index: number) => ({
          id: q.id || `q_${index}`,
          text: q.question || q.text,
          category: q.category || 'general',
          asked: false,
        })) || [],
        notes: [],
        isActive: true,
        startTime: new Date(),
      };
      
      setSession(newSession);
      
      toast.success("Interview started! 🎤", {
        description: "The AI interviewer is ready to begin.",
      });
      
      return {
        success: true,
        message: "Interview started. I will now ask the first question.",
        questions: questionsData.questions,
      };
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error("Failed to start interview");
      return {
        success: false,
        message: `Failed to start interview: ${error}`
      };
    } finally {
      setIsLoading(false);
    }
  }, [jobId, candidateId]);

  const askQuestion = useCallback(async ({ question, category }: { question: string; category: string }) => {
    if (!session) {
      return { success: false, message: "No active interview session" };
    }

    try {
      // Mark the question as asked
      const updatedQuestions = session.questions.map(q => 
        q.text === question ? { ...q, asked: true } : q
      );
      
      setSession(prev => prev ? { ...prev, questions: updatedQuestions } : null);
      
      return {
        success: true,
        message: `Asking question: ${question}`
      };
    } catch (error) {
      console.error('Error asking question:', error);
      return {
        success: false,
        message: `Failed to ask question: ${error}`
      };
    }
  }, [session]);

  const evaluateAnswer = useCallback(async ({ question, answer, category }: { question: string; answer: string; category: string }) => {
    if (!session) {
      return { success: false, message: "No active interview session" };
    }

    try {
      // Call AI API to evaluate the answer
      const evaluationResponse = await fetch('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          category,
          jobId: session.jobId
        })
      });
      
      const evaluationData = await evaluationResponse.json();
      
      // Update the question with evaluation
      const updatedQuestions = session.questions.map(q => 
        q.text === question ? { 
          ...q, 
          answer, 
          evaluation: evaluationData.evaluation,
          score: evaluationData.score 
        } : q
      );
      
      setSession(prev => prev ? { ...prev, questions: updatedQuestions } : null);
      
      return {
        success: true,
        message: `Answer evaluated. Score: ${evaluationData.score}`,
        evaluation: evaluationData.evaluation,
        score: evaluationData.score
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return {
        success: false,
        message: `Failed to evaluate answer: ${error}`
      };
    }
  }, [session, candidateId, jobId]);

  const endInterview = useCallback(async ({ 
    summary, 
    score, 
    conversation 
  }: { 
    summary: string; 
    score: number; 
    conversation?: any[] 
  }) => {
    console.log('🎯 endInterview called with:', { summary, score, conversationLength: conversation?.length });
    
    if (!session) {
      console.error('❌ No active interview session');
      return { success: false, message: "No active interview session" };
    }

    try {
      setIsLoading(true);
      console.log('🔄 Starting interview finalization process...');
      
      // Create transcript from full conversation if available, otherwise from Q&A
      let transcript = '';
      if (conversation && conversation.length > 0) {
        // Use full conversation transcript
        console.log('📝 Using full conversation transcript');
        transcript = conversation
          .filter(msg => msg.text && msg.text.trim().length > 0)
          .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
          .join('\n\n');
        console.log('📄 Generated transcript length:', transcript.length);
      } else {
        // Fallback to Q&A format
        console.log('📝 Using Q&A format transcript');
        transcript = session.questions
          .filter(q => q.asked && q.answer)
          .map(q => `Q: ${q.text}\nA: ${q.answer}\n`)
          .join('\n');
        console.log('📄 Generated Q&A transcript length:', transcript.length);
      }
      
      // Save interview results to database
      console.log('💾 Saving interview to database...');
      const saveResponse = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: session.candidateId,
          jobId: session.jobId,
          transcript,
          summary,
          score: score / 100 // Convert to 0-1 scale
        })
      });
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('❌ Failed to save interview:', errorText);
        throw new Error(`Failed to save interview results: ${errorText}`);
      }
      
      const interviewData = await saveResponse.json();
      console.log('✅ Interview saved successfully:', interviewData.id);
      
      // Trigger comprehensive AI analysis
      try {
        console.log('🤖 Triggering AI analysis...');
        await fetch('/api/ai/analyze-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId: interviewData.id,
            transcript,
            jobTitle: session.jobTitle,
            jobDescription: session.jobDescription,
            candidateName: session.candidateName
          })
        });
        console.log('✅ Interview analysis triggered successfully');
      } catch (evalError) {
        console.error('❌ Background analysis failed:', evalError);
        // Don't fail the interview if analysis fails
      }
      
      // End the session
      console.log('🏁 Ending interview session...');
      setSession(prev => prev ? { 
        ...prev, 
        isActive: false, 
        endTime: new Date(),
        overallScore: score,
        summary 
      } : null);
      
      console.log('✅ Interview completed successfully!');
      toast.success("Interview completed! 📝", {
        description: "Your interview has been saved and will be reviewed.",
      });
      
      return {
        success: true,
        message: `Thank you for completing the interview! Your responses have been recorded and will be reviewed by our team. Overall score: ${score}/100`,
        summary,
        score
      };
    } catch (error) {
      console.error('❌ Error ending interview:', error);
      toast.error("Failed to complete interview", {
        description: "There was an error saving your interview. Please try again.",
      });
      return {
        success: false,
        message: `Failed to end interview: ${error}`
      };
    } finally {
      setIsLoading(false);
      console.log('🔄 Interview finalization process completed');
    }
  }, [session]);

  const generateQuestions = useCallback(async ({ jobTitle, jobDescription, questionType }: { jobTitle: string; jobDescription: string; questionType: string }) => {
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          questionType
        })
      });
      
      const data = await response.json();
      
      return {
        success: true,
        message: `Generated ${data.questions?.length || 0} ${questionType} questions for ${jobTitle}`,
        questions: data.questions
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate questions: ${error}`
      };
    }
  }, []);

  const takeNotes = useCallback(async ({ note, category }: { note: string; category: string }) => {
    if (!session) {
      return { success: false, message: "No active interview session" };
    }

    try {
      const newNote = {
        id: `note_${Date.now()}`,
        text: note,
        category,
        timestamp: new Date()
      };
      
      setSession(prev => prev ? { 
        ...prev, 
        notes: [...prev.notes, newNote] 
      } : null);
      
      return {
        success: true,
        message: `Note recorded: ${note}`,
        note: newNote
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to take note: ${error}`
      };
    }
  }, [session]);

  return {
    session,
    isLoading,
    startInterview,
    askQuestion,
    evaluateAnswer,
    endInterview,
    generateQuestions,
    takeNotes
  };
};
