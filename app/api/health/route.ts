import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

export async function GET() {
  // Liveness gate: as long as this handler responds, the web process is up,
  // so we always return HTTP 200. Supabase reachability is reported as an
  // informational field — a DB outage must NOT fail the platform health check
  // (that would restart-loop an otherwise healthy container).
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
    console.error("Health check: Supabase unreachable (app still healthy):", error);

    // Supabase surfaces errors as a plain object ({ message, details, hint, code }),
    // not a JS Error instance, so handle both shapes.
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Unknown error";

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      supabase: "error",
      error: message,
      environment: process.env.NODE_ENV || "development"
    });
  }
}
