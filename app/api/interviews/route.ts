import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, jobId, transcript, summary, score } = body;
    
    // Validate required fields
    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'candidateId and jobId are required' },
        { status: 400 }
      );
    }
    
    // Create interview record
    const { data: interview, error } = await supabaseClient
      .from('Interview')
      .insert([
        {
          id: uuidv4(), // Generate UUID for the interview
          candidateId,
          jobId,
          transcript: transcript || null,
          summary: summary || null,
          score: score || null,
          recordingUrl: null // Will be updated if recording is available
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating interview:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error('Error in interviews API:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');
  const jobId = searchParams.get('jobId');

  try {
    let query = supabaseClient.from('Interview').select('*');
    
    if (candidateId) {
      query = query.eq('candidateId', candidateId);
    }
    
    if (jobId) {
      query = query.eq('jobId', jobId);
    }
    
    const { data: interviews, error } = await query.order('createdAt', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(interviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
