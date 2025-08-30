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
      .order('createdAt', { ascending: false });
    
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
    const { title, jdRaw, questions, recruiterId } = body;
    
    if (!title || !jdRaw) {
      return NextResponse.json(
        { error: 'Title and job description are required' },
        { status: 400 }
      );
    }
    
    const supabaseClient = await createClient(cookies());
    const { data: job, error } = await supabaseClient
      .from('Job')
      .insert([
        {
          id: crypto.randomUUID(), // Generate UUID
          title,
          jdRaw,
          recruiterId: recruiterId || null, // TODO: Get from auth
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If questions are provided, insert them
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((text: string, index: number) => ({
        text,
        order: index,
        jobId: job.id
      }));
      
      const { error: questionsError } = await supabaseClient
        .from('Question')
        .insert(questionsToInsert);
      
      if (questionsError) {
        console.error('Error inserting questions:', questionsError);
      }
    }
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}


