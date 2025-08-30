export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabaseClient = await createClient(cookies());
    const { data: jobs, error } = await supabaseClient
      .from('Job')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, requirements, jdRaw, recruiterId } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    const supabaseClient = await createClient(cookies());
    const { data: job, error } = await supabaseClient
      .from('Job')
      .insert([
        {
          title,
          description,
          requirements,
          jdRaw,
          recruiterId: recruiterId || 'default-recruiter', // TODO: Get from auth
          status: 'active'
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}


