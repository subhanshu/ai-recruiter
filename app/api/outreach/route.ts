export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";
import { v4 as uuidv4 } from 'uuid';
import { generateInterviewUrl } from "@/lib/url-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, jobId, expiresAt } = body;
    
    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'Candidate ID and Job ID are required' },
        { status: 400 }
      );
    }
    
    // Generate a secure token and ID
    const token = uuidv4();
    const linkId = uuidv4();
    
    // Create outreach link
    const { data: outreachLink, error } = await supabaseClient
      .from('OutreachLink')
      .insert([
        {
          id: linkId,
          token,
          candidateId,
          jobId,
          expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Outreach API - Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Generate the interview URL
    const interviewUrl = generateInterviewUrl(token);
    
    return NextResponse.json({
      ...outreachLink,
      interviewUrl
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create outreach link' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');
  const jobId = searchParams.get('jobId');

  try {
    let query = supabaseClient.from('OutreachLink').select('*');
    
    if (candidateId) {
      query = query.eq('candidateId', candidateId);
    }
    
    if (jobId) {
      query = query.eq('jobId', jobId);
    }
    
    const { data: links, error } = await query.order('createdAt', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Add interview URLs to the response
    const linksWithUrls = links?.map(link => ({
      ...link,
      interviewUrl: generateInterviewUrl(link.token)
    })) || [];
    
    return NextResponse.json(linksWithUrls);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch outreach links' },
      { status: 500 }
    );
  }
}
