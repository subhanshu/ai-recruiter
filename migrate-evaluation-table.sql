-- Create InterviewEvaluation table
CREATE TABLE IF NOT EXISTS "InterviewEvaluation" (
  id TEXT PRIMARY KEY,
  "interviewId" TEXT NOT NULL REFERENCES "Interview"(id) ON DELETE CASCADE,
  evaluations JSONB NOT NULL,
  "overallScore" DOUBLE PRECISION NOT NULL,
  "overallEvaluation" TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  recommendation TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_interview_evaluation_interview ON "InterviewEvaluation"("interviewId");
