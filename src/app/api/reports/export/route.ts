// app/api/reports/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { z } from "zod";

const exportReportSchema = z.object({
  type: z.enum(["analytics", "posts", "competitors"]),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  platforms: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, dateRange, platforms } = exportReportSchema.parse(body);

    // Fetch data based on report type
    let reportData;
    if (type === "analytics") {
      reportData = await getAnalyticsData(session.user.id, dateRange, platforms);
    } else if (type === "posts") {
      reportData = await getPostsData(session.user.id, dateRange);
    } else {
      reportData = await getCompetitorsData(session.user.id);
    }

    // Generate PDF
    const pdfBytes = await generatePDF(type, reportData);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-report-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generatePDF(type: string, data: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Title
  page.drawText(`Chase My Career - ${type.toUpperCase()} Report`, {
    x: 50,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.23, 0.51, 0.96),
  });
  y -= 40;

  // Date
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 30;

  // Content based on type
  if (type === "analytics") {
    y = drawAnalyticsReport(page, font, boldFont, data, y);
  } else if (type === "posts") {
    y = drawPostsReport(page, font, boldFont, data, y);
  }

  return await pdfDoc.save();
}

function drawAnalyticsReport(page: any, font: any, boldFont: any, data: any, y: number) {
  // Summary metrics
  page.drawText("Summary Metrics", { x: 50, y, size: 14, font: boldFont });
  y -= 25;

  const metrics = [
    { label: "Total Impressions", value: data.totals.impressions },
    { label: "Total Engagements", value: data.totals.engagements },
    { label: "Engagement Rate", value: `${data.totals.engagementRate}%` },
    { label: "Follower Growth", value: `+${data.totals.followerGrowth}` },
  ];

  metrics.forEach((metric) => {
    page.drawText(`${metric.label}:`, { x: 50, y, size: 11, font });
    page.drawText(`${metric.value}`, { x: 200, y, size: 11, font: boldFont });
    y -= 20;
  });

  y -= 20;

  // Platform breakdown
  page.drawText("Platform Performance", { x: 50, y, size: 14, font: boldFont });
  y -= 25;

  data.platforms.forEach((platform: any) => {
    page.drawText(`${platform.platform}:`, { x: 50, y, size: 11, font });
    page.drawText(`${platform.impressions} impressions`, { x: 200, y, size: 11, font });
    y -= 20;
  });

  return y;
}

async function getAnalyticsData(userId: string, dateRange: any, platforms?: string[]) {
  // Fetch from database or Metricool
  return {
    totals: {
      impressions: 125000,
      engagements: 6250,
      engagementRate: 5.0,
      followerGrowth: 1250,
    },
    platforms: [
      { platform: "LinkedIn", impressions: 50000, engagements: 2500 },
      { platform: "Instagram", impressions: 45000, engagements: 2250 },
      { platform: "Twitter", impressions: 30000, engagements: 1500 },
    ],
  };
}

async function getPostsData(userId: string, dateRange: any) {
  return await prisma.post.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      },
    },
    take: 100,
  });
}

async function getCompetitorsData(userId: string) {
  // Fetch competitor data
  return { competitors: [] };
}