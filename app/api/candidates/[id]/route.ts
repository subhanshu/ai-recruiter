export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: candidate, error } = await supabaseClient
      .from('Candidate')
      .select(`
        *,
        job:Job(*)
      `)
      .eq('id', (await params).id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const candidateId = (await params).id;
    
    const { error } = await supabaseClient
      .from('Candidate')
      .delete()
      .eq('id', candidateId);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
