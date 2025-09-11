export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

// Update a question
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, order } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }
    
    const supabaseClient = await createClient(cookies());
    
    const updateData: any = { text };
    if (order !== undefined) {
      updateData.order = order;
    }
    
    const { data: question, error } = await supabaseClient
      .from('Question')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// Delete a question
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseClient = await createClient(cookies());
    
    const { error } = await supabaseClient
      .from('Question')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
