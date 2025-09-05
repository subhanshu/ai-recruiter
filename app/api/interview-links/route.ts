import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, jobId, expiresInDays = 7 } = body;
    
    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'Candidate ID and Job ID are required' },
        { status: 400 }
      );
    }

    const supabaseClient = await createClient(cookies());
    
    // Generate a unique token
    const token = randomBytes(32).toString('hex');
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Create interview link
    const { data: interviewLink, error } = await supabaseClient
      .from('OutreachLink')
      .insert([
        {
          token,
          candidateId,
          jobId,
          expiresAt: expiresAt.toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating interview link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Generate the interview URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const interviewUrl = `${baseUrl}/interview/${token}`;
    
    return NextResponse.json({
      ...interviewLink,
      interviewUrl
    }, { status: 201 });
  } catch (error) {
    console.error('Error in interview-links API:', error);
    return NextResponse.json(
      { error: 'Failed to create interview link' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');
  const jobId = searchParams.get('jobId');

  try {
    const supabaseClient = await createClient(cookies());
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const linksWithUrls = links?.map(link => ({
      ...link,
      interviewUrl: `${baseUrl}/interview/${link.token}`
    })) || [];
    
    return NextResponse.json(linksWithUrls);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch interview links' },
      { status: 500 }
    );
  }
}
