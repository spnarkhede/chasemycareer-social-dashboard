// app/api/cron/refresh-analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { metricool } from "@/lib/api/metricool";
import { prisma } from "@/lib/prisma";
import { verifyCronSignature } from "@/lib/cron";

// Verify cron job signature
async function verifyCronSignature(request: NextRequest): Promise<boolean> {
  const signature = request.headers.get("x-cron-secret");
  return signature === process.env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  // Verify cron authentication
  const isValid = await verifyCronSignature(request);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users with connected Metricool accounts
    const users = await prisma.user.findMany({
      where: {
        accounts: {
          some: {
            provider: "metricool",
          },
        },
      },
      include: {
        accounts: true,
      },
    });

    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Refresh analytics for each user
    for (const user of users) {
      try {
        const metricoolAccount = user.accounts.find(
          (a) => a.provider === "metricool"
        );

        if (!metricoolAccount?.access_token) {
          continue;
        }

        // Fetch last 30 days of analytics
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const analytics = await metricool.getAnalytics({
          startDate,
          endDate,
        });

        // Store in database for historical tracking
        await prisma.activity.create({
           {
            userId: user.id,
            action: "cron.analytics_refreshed",
            entityType: "Analytics",
            metadata: {
              startDate,
              endDate,
              metricsCount: Object.keys(analytics).length,
            },
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`User ${user.id}: ${(error as Error).message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}