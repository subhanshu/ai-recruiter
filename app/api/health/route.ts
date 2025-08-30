import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test Supabase connection
    const supabaseClient = await createClient(cookies());
    const { error } = await supabaseClient.from('information_schema.tables').select('table_name').limit(1);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      supabase: "working",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      supabase: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV || "development"
    }, { status: 503 });
  }
}
