export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  try {
    const supabaseClient = await createClient(cookies());
    let query = supabaseClient.from('Candidate').select('*');
    
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
    const { name, email, phone, resumeUrl, jobId } = body;
    
    const supabaseClient = await createClient(cookies());
    const { data: candidate, error } = await supabaseClient
      .from('Candidate')
      .insert([
        {
          name,
          email,
          phone,
          resumeUrl,
          jobId,
          status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}


