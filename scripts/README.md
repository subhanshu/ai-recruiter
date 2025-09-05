# Database Seeding Scripts

This directory contains scripts to populate the database with sample data for development and testing purposes.

## Available Scripts

### `seed.ts`
Populates the database with realistic sample data including:
- 4 sample job postings (Senior Frontend Developer, Product Manager, UX Designer, DevOps Engineer)
- 8 interview questions per job (32 total questions)
- 2-3 sample candidates per job (9 total candidates)

## Usage

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Make sure your `.env` file contains the required Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_API_KEY=your_supabase_service_key
   ```

3. **Run the seeding script**:
   ```bash
   npm run seed
   ```

## Sample Data Overview

### Jobs
- **Senior Frontend Developer** - Engineering role with React/TypeScript focus
- **Product Manager** - Product role with B2B SaaS experience
- **UX Designer** - Design role with user research focus
- **DevOps Engineer** - Infrastructure role with AWS expertise

### Questions
Each job includes 8 relevant interview questions covering:
- Technical skills and experience
- Problem-solving approaches
- Collaboration and communication
- Industry knowledge and best practices

### Candidates
Each job has 2-3 sample candidates with:
- Realistic names and contact information
- LinkedIn profile URLs
- Resume URLs (placeholder)
- Professional email addresses

## Notes

- The script uses `randomUUID()` to generate unique IDs for all records
- All data is inserted using Supabase client
- The script includes error handling and progress logging
- Sample data is designed to be realistic and useful for testing the application

## Troubleshooting

If you encounter issues:

1. **Environment variables**: Ensure all required Supabase credentials are set
2. **Database connection**: Verify your Supabase project is active and accessible
3. **Permissions**: Make sure your service key has the necessary permissions
4. **Schema**: Ensure the database schema is properly set up (run `schema.sql` in Supabase)

## Customization

To modify the sample data:
1. Edit the `sampleJobs`, `sampleQuestions`, or `sampleCandidates` objects in `seed.ts`
2. Run `npm run seed` to populate with your custom data
3. The script will replace any existing data, so be careful in production environments
