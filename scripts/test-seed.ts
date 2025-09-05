import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

async function testSeededData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_API_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Testing seeded data...');

  try {
    // Test jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('Job')
      .select('*')
      .order('createdAt', { ascending: false });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return;
    }

    console.log(`✅ Found ${jobs?.length || 0} jobs`);

    // Test questions
    const { data: questions, error: questionsError } = await supabase
      .from('Question')
      .select('*')
      .order('order', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return;
    }

    console.log(`✅ Found ${questions?.length || 0} questions`);

    // Test candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from('Candidate')
      .select('*')
      .order('createdAt', { ascending: false });

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError);
      return;
    }

    console.log(`✅ Found ${candidates?.length || 0} candidates`);

    // Show sample data
    if (jobs && jobs.length > 0) {
      console.log('\n📋 Sample Jobs:');
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} (${job.department})`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Created: ${new Date(job.createdAt).toLocaleDateString()}`);
      });
    }

    if (questions && questions.length > 0) {
      console.log('\n❓ Sample Questions:');
      questions.slice(0, 3).forEach((question, index) => {
        console.log(`${index + 1}. ${question.text.substring(0, 80)}...`);
      });
    }

    if (candidates && candidates.length > 0) {
      console.log('\n👥 Sample Candidates:');
      candidates.slice(0, 3).forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
      });
    }

    console.log('\n🎉 Database test completed successfully!');

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test function
testSeededData();
