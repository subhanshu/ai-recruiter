-- Add additional fields to Candidate table for storing AI-parsed data
-- Run this in your Supabase SQL Editor

ALTER TABLE "Candidate" 
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "skills" TEXT,
ADD COLUMN IF NOT EXISTS "experience" TEXT,
ADD COLUMN IF NOT EXISTS "education" TEXT,
ADD COLUMN IF NOT EXISTS "summary" TEXT,
ADD COLUMN IF NOT EXISTS "workHistory" TEXT,
ADD COLUMN IF NOT EXISTS "projects" TEXT,
ADD COLUMN IF NOT EXISTS "certifications" TEXT,
ADD COLUMN IF NOT EXISTS "languages" TEXT;

-- Update the status column to have a default value if it doesn't exist
ALTER TABLE "Candidate" 
ALTER COLUMN "status" SET DEFAULT 'pending';

-- Add comments to explain the JSON fields
COMMENT ON COLUMN "Candidate"."skills" IS 'JSON string of skills array';
COMMENT ON COLUMN "Candidate"."workHistory" IS 'JSON string of work history array';
COMMENT ON COLUMN "Candidate"."projects" IS 'JSON string of projects array';
COMMENT ON COLUMN "Candidate"."certifications" IS 'JSON string of certifications array';
COMMENT ON COLUMN "Candidate"."languages" IS 'JSON string of languages array';
