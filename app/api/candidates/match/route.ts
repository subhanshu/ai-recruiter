import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseCandidateData, calculateSkillsMatch, sortCandidatesByRanking } from '@/lib/candidate-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const minScore = parseInt(searchParams.get('minScore') || '60');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }

    const supabaseClient = await createClient(cookies());

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('Job')
      .select('title, requiredSkills, qualifications, location, department')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ 
        error: 'Job not found' 
      }, { status: 404 });
    }

    // Get all candidates for this job
    const { data: candidates, error: candidatesError } = await supabaseClient
      .from('Candidate')
      .select('*')
      .eq('jobId', jobId);

    if (candidatesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch candidates' 
      }, { status: 500 });
    }

    // Parse candidate data and calculate rankings
    const parsedCandidates = candidates.map(parseCandidateData);
    const rankings = sortCandidatesByRanking(parsedCandidates, {
      requiredSkills: job.requiredSkills,
      qualifications: job.qualifications,
      location: job.location,
      title: job.title
    });

    // Filter by minimum score and limit
    const filteredRankings = rankings
      .filter(ranking => ranking.overallScore >= minScore)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        job: {
          id: jobId,
          title: job.title,
          requiredSkills: job.requiredSkills,
          qualifications: job.qualifications,
          location: job.location
        },
        rankings: filteredRankings,
        totalCandidates: candidates.length,
        filteredCount: filteredRankings.length
      }
    });

  } catch (error) {
    console.error('Skills matching error:', error);
    return NextResponse.json({ 
      error: 'Failed to match candidates' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, jobId } = body;

    if (!candidateId || !jobId) {
      return NextResponse.json({ 
        error: 'Candidate ID and Job ID are required' 
      }, { status: 400 });
    }

    const supabaseClient = await createClient(cookies());

    // Get candidate details
    const { data: candidate, error: candidateError } = await supabaseClient
      .from('Candidate')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json({ 
        error: 'Candidate not found' 
      }, { status: 404 });
    }

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('Job')
      .select('title, requiredSkills, qualifications, location')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ 
        error: 'Job not found' 
      }, { status: 404 });
    }

    // Calculate detailed matching
    const parsedCandidate = parseCandidateData(candidate);
    const skillsMatch = calculateSkillsMatch(
      parsedCandidate.skills,
      job.requiredSkills?.split(',').map((s: string) => s.trim()) || []
    );

    return NextResponse.json({
      success: true,
      data: {
        candidate: parsedCandidate,
        job: job,
        skillsMatch: skillsMatch
      }
    });

  } catch (error) {
    console.error('Skills matching error:', error);
    return NextResponse.json({ 
      error: 'Failed to match candidate' 
    }, { status: 500 });
  }
}
