Requirement Document — AI Recruiter Agent Web App
1. Overview
This system is a web-based recruitment assistant that automates the initial screening process for job candidates using AI.
It enables recruiters to create job descriptions, generate screening questions, conduct AI-based interviews (audio/video), store and summarize interview results, and rank candidates based on suitability.

The application will be built using Next.js for the frontend and backend API routes, with OpenAI APIs for AI functionalities.

2. User Roles
Recruiter (Primary User)

Creates and manages job listings.

Reviews AI-generated screening questions.

Adds candidates.

Reviews interview results and candidate rankings.

Candidate

Receives AI outreach (email/WhatsApp).

Confirms interest.

Participates in AI screening interview.

3. Functional Requirements
3.1 Job Management
Add Job Description

Input: Job title, department, location, responsibilities, required skills, and qualifications.

Take the JD in a text area and the above should be populated automatically using AI

Store in database.

AI Question Generation

Use OpenAI API to generate relevant screening questions from job description.

Questions should be editable by the recruiter.

3.2 Candidate Management
Add Candidate

Fields: Name, email, phone number, resume (optional), LinkedIn URL (optional).

Bulk Upload Candidates

CSV/Excel import.

AI Outreach

Email & WhatsApp messages (via Twilio/SendGrid) to ask if they are interested.

If yes, send them a secure unique link to their interview.

3.3 AI Interview Process
AI Interview Link

Opens in browser (Next.js page).

Uses OpenAI Realtime API for live audio/video interaction.

AI agent asks screening questions and records answers.

Recording

Record both audio & video.

Save to cloud storage (AWS S3, GCP Storage, or Supabase Storage).

Transcription

Use OpenAI Whisper API for transcript generation.

Summary

Use OpenAI GPT model to summarize interview answers.

3.4 Candidate Evaluation
Scoring

AI ranks candidates based on transcript + summary + JD requirements.

Sorting

Recruiter can view candidates sorted by suitability score.

3.5 Recruiter Dashboard
View all job postings.

View candidate lists for each job.

Review interview recordings, transcripts, summaries.

Approve or reject candidates.

4. Technical Requirements
4.1 Tech Stack
Frontend/Backend: Next.js (Full-stack capabilities).

Database: PostgreSQL / MySQL (via Prisma ORM).

Authentication: NextAuth.js (JWT or OAuth).

Storage: AWS S3 or Supabase for recordings.

AI Models:

GPT-4o (Question Generation, Summarization, Candidate Scoring).

Whisper API (Transcription).

OpenAI Realtime API (Interview).

Messaging:

Twilio WhatsApp API.

SendGrid or AWS SES for email.

Deployment: Railway (Full-stack), Supabase (Database), AWS/GCP (Storage if needed).

4.2 APIs Needed
OpenAI GPT-4o

Question generation.

Candidate scoring.

Summarization.

OpenAI Whisper

Interview transcription.

OpenAI Realtime API

Live interview.

Twilio API

WhatsApp communication.

SendGrid/AWS SES

Email communication.

5. Non-Functional Requirements
Security

All candidate links must be secure and expire after use.

Data encryption at rest & in transit.

Scalability

Should support multiple recruiters and jobs simultaneously.

Performance

Interview streaming should have minimal latency.

Compliance

GDPR/Privacy compliance for candidate data.

Availability

99% uptime target.

6. Example Flow
Recruiter logs in → Creates job description.

AI generates 8–10 screening questions.

Recruiter edits & saves.

Recruiter uploads candidate list.

AI agent sends WhatsApp/email asking for interest.

Candidate clicks link → Joins AI interview.

Interview recorded & transcribed.

AI generates a summary & suitability score.

Recruiter sees sorted candidate list.