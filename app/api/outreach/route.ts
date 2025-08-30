export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

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
    
    // Generate a secure token
    const token = uuidv4();
    
    // Create outreach link
    const supabaseClient = await createClient(cookies());
    const { data: outreachLink, error } = await supabaseClient
      .from('OutreachLink')
      .insert([
        {
          token,
          candidateId,
          jobId,
          expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
          status: 'active'
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Generate the interview URL
    const interviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${token}`;
    
    return NextResponse.json({
      ...outreachLink,
      interviewUrl
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create outreach link' },
      { status: 500 }
    );
  }
}


