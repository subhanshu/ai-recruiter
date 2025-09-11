export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Create a new question
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, text, order } = body;
    
    if (!jobId || !text) {
      return NextResponse.json(
        { error: 'Job ID and question text are required' },
        { status: 400 }
      );
    }
    
    const supabaseClient = await createClient(cookies());
    
    // Get the next order number if not provided
    let questionOrder = order;
    if (!questionOrder) {
      const { data: existingQuestions } = await supabaseClient
        .from('Question')
        .select('order')
        .eq('jobId', jobId)
        .order('order', { ascending: false })
        .limit(1);
      
      questionOrder = existingQuestions && existingQuestions.length > 0 
        ? existingQuestions[0].order + 1 
        : 1;
    }
    
    const { data: question, error } = await supabaseClient
      .from('Question')
      .insert([
        {
          id: randomUUID(),
          jobId,
          text,
          order: questionOrder
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
