// app/api/automation/queue/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processQueue } from "@/lib/automation/message-queue";
import { verifyCronSignature } from "@/lib/cron";

export async function POST(request: NextRequest) {
  // Verify cron/authentication
  const isValid = await verifyCronSignature(request);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    const results = await processQueue(platform, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Queue processing error:", error);
    return NextResponse.json(
      { error: "Queue processing failed" },
      { status: 500 }
    );
  }
}