export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseClient = await createClient(cookies());
    
    // Fetch job with related data
    const { data: job, error: jobError } = await supabaseClient
      .from('Job')
      .select(`
        *,
        questions:Question(*),
        candidates:Candidate(*)
      `)
      .eq('id', id)
      .single();
    
    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, department, location, responsibilities, requiredSkills, qualifications, jdRaw, questions } = body;
    
    const supabaseClient = await createClient(cookies());
    
    // Update the job
    const { data: job, error } = await supabaseClient
      .from('Job')
      .update({
        title,
        department,
        location,
        responsibilities,
        requiredSkills,
        qualifications,
        jdRaw,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Handle questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions for this job
      await supabaseClient.from('Question').delete().eq('jobId', id);
      
      // Insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((question: string | { text: string }, index: number) => ({
          id: randomUUID(), // Generate UUID for each question
          jobId: id,
          text: typeof question === 'string' ? question : question.text,
          order: index + 1
        }));
        
        const { error: questionsError } = await supabaseClient
          .from('Question')
          .insert(questionsToInsert);
        
        if (questionsError) {
          console.error('Error inserting questions:', questionsError);
          // Don't fail the entire request if questions fail
        }
      }
    }
    
    // Fetch the updated job with questions
    const { data: updatedJob, error: fetchError } = await supabaseClient
      .from('Job')
      .select(`
        *,
        questions:Question(*),
        candidates:Candidate(*)
      `)
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseClient = await createClient(cookies());
    
    // Delete related records first
    await supabaseClient.from('Question').delete().eq('jobId', id);
    await supabaseClient.from('Candidate').delete().eq('jobId', id);
    await supabaseClient.from('Interview').delete().eq('jobId', id);
    await supabaseClient.from('OutreachLink').delete().eq('jobId', id);
    
    // Delete the job
    const { error } = await supabaseClient
      .from('Job')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
