import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test Supabase connection by creating client and testing basic functionality
    const supabaseClient = await createClient(cookies());
    
    // Try to query a table that should exist (Job table from our schema)
    const { error } = await supabaseClient
      .from('Job')
      .select('count')
      .limit(0);
    
    // If connection works but table doesn't exist, that's fine for health check
    if (error && error.code !== 'PGRST106' && error.code !== 'PGRST205') {
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
