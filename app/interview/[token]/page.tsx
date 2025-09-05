'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { interviewTools } from "@/lib/interview-tools";
import { useInterviewTools } from "@/hooks/use-interview-tools";
// Removed VoiceSelector - using random voice selection
import { BroadcastButton } from "@/components/broadcast-button";
import { StatusDisplay } from "@/components/status";
import { TokenUsageDisplay } from "@/components/token-usage";
import { MessageControls } from "@/components/message-controls";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Removed translations - using English only
import { 
  Play, 
  CheckCircle, 
  Clock,
  User,
  Briefcase,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface OutreachLink {
  id: string;
  token: string;
  candidateId: string;
  jobId: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  jd_raw: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

// Generate dynamic interview instructions
function generateInterviewInstructions(
  jobTitle: string,
  jobDescription: string,
  candidateName: string,
  questions: Array<{ text?: string; question?: string }>
): string {
  const questionsList = questions.length > 0 
    ? questions.map(q => `- ${q.text || q.question}`).join('\n')
    : '(Questions will be loaded when interview starts)';
  
  return `You are a professional AI recruiter conducting an interview for the position of "${jobTitle}".

CANDIDATE INFORMATION:
- Candidate Name: ${candidateName}
- Position: ${jobTitle}

JOB DETAILS:
${jobDescription}

INTERVIEW QUESTIONS TO COVER:
${questionsList}

YOUR ROLE AS AN AI RECRUITER:
1. **Professional Interviewer**: You are representing the company as a recruiter. Be warm, professional, and engaging.

2. **Natural Conversation Flow**: 
   - Start with a warm greeting and brief introduction
   - Don't rigidly follow the question list - let the conversation flow naturally
   - Ask follow-up questions based on the candidate's responses
   - Use the provided questions as a guide, but adapt them contextually
   - **CRITICAL**: Wait for the candidate's response before asking the next question
   - **NEVER repeat the same question back-to-back**
   - **NEVER ask multiple questions at once**

3. **What You CAN Do**:
   - Answer questions about the job role, requirements, and responsibilities
   - Discuss company culture, work environment, and team structure (use general best practices if specific details aren't provided)
   - Explain the interview process and next steps
   - Provide clarity on job expectations and growth opportunities
   - Ask behavioral and situational questions related to the role

4. **What You CANNOT Do**:
   - Discuss salary/compensation details (redirect to HR/hiring manager)
   - Make hiring decisions or promises ("I'll need to discuss with the team")
   - Answer technical questions outside the job scope
   - Provide personal advice unrelated to the role
   - Discuss other candidates or confidential company information

5. **Handling Rescheduling Requests**:
   - If candidate requests to reschedule due to illness, emergency, or technical issues:
     - Be understanding and accommodating
     - End the interview immediately with endInterview function
     - Use a score of 0-20 (not a performance score, but a "rescheduled" indicator)
     - Summary should clearly state "Interview rescheduled at candidate's request"
     - Example: "I understand you're not feeling well. Let's reschedule this for when you're feeling better. I'll end our session here and we'll coordinate a new time."

6. **Interview Flow**:
   - Begin with introductions and role overview
   - Use the startInterview function to formally begin
   - Ask questions using the askQuestion function
   - Take notes during the conversation using the takeNotes function
   - **IMPORTANT**: After 15-20 minutes or when you've covered all key areas, you MUST call the endInterview function with a summary and score (0-100)
   - Focus on natural conversation flow and gathering information
   - Always end the interview by calling endInterview - don't leave the candidate hanging

7. **Tone**: Conversational, professional, encouraging. Make the candidate feel comfortable while maintaining professionalism.

8. **CRITICAL - Interview Completion**:
   - You MUST end every interview by calling the endInterview function
   - Provide a thoughtful summary of the candidate's performance
   - Give a score from 0-100 based on their responses
   - Thank the candidate and explain next steps
   - Example: "Thank you for your time today. Based on our conversation, I'd rate your performance as 85/100. We'll be in touch about next steps."

Remember: You're here to assess the candidate's fit for the role while also representing the company positively. Be helpful, honest, and create a positive interview experience. ALWAYS end the interview properly using the endInterview function.`;
}

// AI Interview Component
function AIInterview({ 
  jobTitle, 
  jobDescription, 
  candidateName, 
  candidateId, 
  jobId 
}: { 
  jobTitle: string; 
  jobDescription: string; 
  candidateName: string;
  candidateId: string;
  jobId: string;
}) {
  // Randomly select a voice for the AI interviewer
  const [voice] = useState(() => {
    const voices = ["ash", "ballad", "coral", "sage", "verse"];
    return voices[Math.floor(Math.random() * voices.length)];
  });
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  // Interview tools hook
  const {
    session,
    isLoading,
    startInterview,
    askQuestion,
    evaluateAnswer,
    endInterview,
    takeNotes
  } = useInterviewTools(candidateId, jobId);

  // Generate dynamic instructions based on job and questions
  const interviewInstructions = useMemo(() => {
    // Generate instructions once with empty questions - they'll be loaded during interview
    const instructions = generateInterviewInstructions(jobTitle, jobDescription, candidateName, []);
    console.log("📝 Generated interview instructions:", instructions.substring(0, 200) + "...");
    return instructions;
  }, [jobTitle, jobDescription, candidateName]);

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation
  } = useWebRTCAudioSession(voice, interviewTools, interviewInstructions);

  // Track if functions are already registered to prevent re-registration
  const functionsRegistered = useRef(false);

  useEffect(() => {
    if (functionsRegistered.current) return;
    
    // Register interview functions (only once)
    registerFunction('startInterview', startInterview);
    registerFunction('askQuestion', askQuestion);
    registerFunction('evaluateAnswer', evaluateAnswer);
    registerFunction('endInterview', (params: { summary: string; score: number }) => {
      // Pass conversation data when ending interview
      return endInterview({
        ...params,
        conversation: conversation
      });
    });
    registerFunction('takeNotes', takeNotes);
    
    functionsRegistered.current = true;
  }, [registerFunction, startInterview, askQuestion, evaluateAnswer, endInterview, takeNotes, conversation]);

  const handleStartInterview = async () => {
    const result = await startInterview();
    if (result.success) {
      setIsInterviewStarted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            AI Interview Session
          </CardTitle>
          <CardDescription className="text-blue-100">
            Welcome to your AI-powered interview experience
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Details
              </h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Position:</strong> {jobTitle}</p>
              <p className="text-sm text-gray-600"><strong>Description:</strong> {jobDescription}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidate Details
              </h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Name:</strong> {candidateName}</p>
              <div className="text-sm text-gray-600">
                <strong>Status:</strong> 
                <Badge variant="outline" className="ml-2">
                  {isInterviewStarted ? 'Interview Active' : 'Ready to Start'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Interface */}
      <motion.div 
        className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!isInterviewStarted ? (
          <div className="text-center space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click &quot;Start Interview&quot; to begin your AI-powered interview session. 
                The AI will ask you questions based on the job requirements and evaluate your responses.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleStartInterview}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? 'Starting Interview...' : 'Start Interview'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interview in Progress</h3>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            {/* Interview Controls */}
            <div className="space-y-4">
              {/* Voice Indicator */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  AI Voice: <span className="font-medium capitalize">{voice}</span>
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <BroadcastButton 
                  isSessionActive={isSessionActive} 
                  onClick={handleStartStopClick}
                />
                <div className="text-sm text-gray-600 text-center">
                  {isSessionActive ? 'Speak naturally - the AI is listening' : 'Click to start voice interaction'}
                </div>
              </div>
            </div>

            {/* Messages and Status */}
            {msgs.length > 4 && <TokenUsageDisplay messages={msgs} />}
            {status && (
              <motion.div 
                className="w-full flex flex-col gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageControls conversation={conversation} msgs={msgs} />
              </motion.div>
            )}
            
            {status && <StatusDisplay status={status} />}
          </div>
        )}
      </motion.div>

      {/* Interview Progress */}
      {session && session.questions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Interview Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Questions Asked</span>
                <span>{session.questions.filter(q => q.asked).length} / {session.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(session.questions.filter(q => q.asked).length / session.questions.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function InterviewPage() {
  const [outreachLink, setOutreachLink] = useState<OutreachLink | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams() as { token: string };

  const fetchInterviewData = useCallback(async () => {
    try {
      // Fetch outreach link
      const { data: linkData, error: linkError } = await supabaseClient
        .from('OutreachLink')
        .select('*')
        .eq('token', token)
        .single();

      if (linkError || !linkData) {
        setError('Invalid or expired interview link');
        setLoading(false);
        return;
      }

      // Check if link is expired
      if (new Date(linkData.expiresAt) < new Date()) {
        setError('Interview link has expired');
        setLoading(false);
        return;
      }

      setOutreachLink(linkData);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabaseClient
        .from('Job')
        .select('*')
        .eq('id', linkData.jobId)
        .single();

      if (jobError || !jobData) {
        setError('Job not found');
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Fetch candidate details
      const { data: candidateData, error: candidateError } = await supabaseClient
        .from('Candidate')
        .select('*')
        .eq('id', linkData.candidateId)
        .single();

      if (candidateError || !candidateData) {
        setError('Candidate not found');
        setLoading(false);
        return;
      }

      setCandidate(candidateData);
    } catch (error) {
      console.error('Error fetching interview data:', error);
      setError('Failed to load interview data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Interview Link Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the recruiter for a new interview link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!outreachLink || !job || !candidate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Interview Not Found</h1>
            <p className="text-gray-600">The requested interview could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIInterview 
      jobTitle={job.title}
      jobDescription={(job as Job & { jdRaw?: string; responsibilities?: string }).jdRaw || (job as Job & { jdRaw?: string; responsibilities?: string }).responsibilities || 'No job description available'}
      candidateName={candidate.name}
      candidateId={candidate.id}
      jobId={job.id}
    />
  );
}


