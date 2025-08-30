-- AI Recruiter Database Schema
-- Run this in your Supabase SQL Editor

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Job table
CREATE TABLE IF NOT EXISTS "Job" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  responsibilities TEXT,
  "requiredSkills" TEXT,
  qualifications TEXT,
  "jdRaw" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "recruiterId" TEXT REFERENCES "User"(id)
);

-- Create Question table
CREATE TABLE IF NOT EXISTS "Question" (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "jobId" TEXT NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Candidate table
CREATE TABLE IF NOT EXISTS "Candidate" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  "resumeUrl" TEXT,
  "linkedinUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "jobId" TEXT NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE
);

-- Create Interview table
CREATE TABLE IF NOT EXISTS "Interview" (
  id TEXT PRIMARY KEY,
  "candidateId" TEXT NOT NULL REFERENCES "Candidate"(id) ON DELETE CASCADE,
  "jobId" TEXT NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "recordingUrl" TEXT,
  transcript TEXT,
  summary TEXT,
  score DOUBLE PRECISION
);

-- Create OutreachLink table
CREATE TABLE IF NOT EXISTS "OutreachLink" (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  "candidateId" TEXT NOT NULL REFERENCES "Candidate"(id) ON DELETE CASCADE,
  "jobId" TEXT NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "usedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_recruiter ON "Job"("recruiterId");
CREATE INDEX IF NOT EXISTS idx_question_job ON "Question"("jobId");
CREATE INDEX IF NOT EXISTS idx_candidate_job ON "Candidate"("jobId");
CREATE INDEX IF NOT EXISTS idx_interview_candidate ON "Interview"("candidateId");
CREATE INDEX IF NOT EXISTS idx_interview_job ON "Interview"("jobId");
CREATE INDEX IF NOT EXISTS idx_outreach_token ON "OutreachLink"(token);
CREATE INDEX IF NOT EXISTS idx_outreach_candidate ON "OutreachLink"("candidateId");
CREATE INDEX IF NOT EXISTS idx_outreach_job ON "OutreachLink"("jobId");

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutreachLink" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all on User" ON "User" FOR ALL USING (true);
CREATE POLICY "Allow all on Job" ON "Job" FOR ALL USING (true);
CREATE POLICY "Allow all on Question" ON "Question" FOR ALL USING (true);
CREATE POLICY "Allow all on Candidate" ON "Candidate" FOR ALL USING (true);
CREATE POLICY "Allow all on Interview" ON "Interview" FOR ALL USING (true);
CREATE POLICY "Allow all on OutreachLink" ON "OutreachLink" FOR ALL USING (true);
