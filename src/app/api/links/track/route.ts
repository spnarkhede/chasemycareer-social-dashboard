// app/api/links/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/links/analytics";

export async function POST(request: NextRequest) {
  try {
    const { linkId, linkPageId } = await request.json();

    // Get user agent and IP
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const referrer = request.headers.get("referer") || "";

    // Parse user agent
    const { device, browser, os, country, city } = parseUserAgent(userAgent, ip);

    // Track analytics
    await prisma.linkAnalytics.create({
       {
        linkId: linkId || null,
        linkPageId: linkPageId || null,
        ipAddress: ip,
        userAgent,
        referrer,
        country,
        city,
        device,
        browser,
        os,
      },
    });

    // Update click counts
    if (linkId) {
      await prisma.link.update({
        where: { id: linkId },
         { clickCount: { increment: 1 } },
      });
    }

    if (linkPageId) {
      await prisma.linkPage.update({
        where: { id: linkPageId },
         { clickCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track link error:", error);
    return NextResponse.json(
      { error: "Failed to track" },
      { status: 500 }
    );
  }
}