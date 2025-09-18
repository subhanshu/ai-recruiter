# AI Recruiter Web App

A Next.js application that automates the initial screening process for job candidates using AI. It enables recruiters to create job descriptions, generate screening questions, conduct AI-based interviews, store and summarize interview results, and rank candidates based on suitability.

## Features

- **Job Management**: Create and manage job listings with AI-powered JD parsing
- **AI Question Generation**: Automatically generate relevant screening questions from job descriptions
- **Candidate Management**: Add candidates and bulk upload via CSV/Excel
- **AI Interview Process**: Conduct real-time AI interviews using OpenAI Realtime API
- **Candidate Evaluation**: AI-powered scoring and ranking based on interview performance
- **Recruiter Dashboard**: Comprehensive view of jobs, candidates, and interview results

## Tech Stack

- **Frontend/Backend**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4o, Whisper API, Realtime API
- **UI**: Tailwind CSS, Radix UI components
- **Authentication**: NextAuth.js (to be implemented)
- **Storage**: Supabase Storage (for interview recordings)

## Project Structure

```
ai-recruiter/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable UI components
├── lib/                    # Utility functions and database client
├── prisma/                 # Database schema and migrations
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── .env                    # Environment variables
├── schema.sql             # Database schema (run manually in Supabase)
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project (already created: `eigvloqjirrvnmbrdftd`)
- OpenAI API key

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
# Database - Direct connection to Supabase
DATABASE_URL="postgresql://postgres:6SegBqjdjbW8sZB3@db.eigvloqjirrvnmbrdftd.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://eigvloqjirrvnmbrdftd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_API_KEY="your-service-key"

# OpenAI
OPENAI_API_KEY="sk-..."
```

### 3. Database Setup

Since Prisma migrations aren't working with Supabase directly, run the SQL schema manually:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/eigvloqjirrvnmbrdftd)
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL to create all tables

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

- `POST /api/jobs` - Create new job
- `GET /api/jobs` - List all jobs
- `POST /api/candidates` - Add candidate
- `GET /api/candidates?jobId=X` - List candidates for a job
- `POST /api/outreach` - Generate secure interview link
- `POST /api/ai/parse-jd` - Parse JD and generate questions
- `POST /api/session` - Create OpenAI Realtime session

## Pages

- `/` - AI Interview Demo (main page)
- `/dashboard` - Recruiter dashboard
- `/jobs/new` - Create new job
- `/interview/[token]` - Secure candidate interview page

## Current Status

✅ **Completed:**
- Next.js app structure with AI interview demo integration
- Prisma schema and database models
- Basic API routes for jobs, candidates, and outreach
- AI JD parsing endpoint
- UI components and pages
- Build system working
- Project reorganized for better CI/CD deployment

🔄 **In Progress:**
- Database connection and schema creation
- Testing API endpoints

⏳ **Next Steps:**
- Test database operations
- Implement authentication
- Add storage for interview recordings
- Implement transcription and scoring
- Add bulk candidate upload
- Implement outreach messaging (Twilio/SendGrid)

## Troubleshooting

### Database Connection Issues
- Ensure Supabase project is active
- Check connection string format
- Verify database password is correct
- Try using Supabase dashboard SQL editor for schema creation

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Check `.env` file for correct DATABASE_URL
- Ensure all dependencies are installed

## Development

```bash
# Generate Prisma client
npm run prisma:generate

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

This project is now organized for easy CI/CD deployment:

- **Railway**: Automatic deployment from GitHub (Primary platform)
- **Netlify**: Build command: `npm run build`, publish directory: `.next`
- **Other platforms**: Standard Next.js deployment
- **Docker**: Use the Dockerfile (if created) for containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
