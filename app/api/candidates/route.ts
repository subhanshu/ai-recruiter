export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  try {
    let query = supabaseClient.from('Candidate').select(`
      *,
      job:Job(*)
    `);
    
    if (jobId) {
      query = query.eq('jobId', jobId);
    }
    
    const { data: candidates, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, resumeUrl, linkedinUrl, jobId, status } = body;
    
    // Validate required fields
    if (!name || !email || !jobId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and jobId are required' 
      }, { status: 400 });
    }
    
    // Generate a unique ID for the candidate
    const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: candidate, error } = await supabaseClient
      .from('Candidate')
      .insert([
        {
          id: candidateId,
          name,
          email,
          phone: phone || null,
          resumeUrl: resumeUrl || null,
          linkedinUrl: linkedinUrl || null,
          jobId
          // Note: status field will be added when database schema is updated
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}


