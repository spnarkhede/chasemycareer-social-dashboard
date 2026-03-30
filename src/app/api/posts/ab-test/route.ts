// app/api/posts/ab-test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createABTestSchema = z.object({
  name: z.string().min(2),
  variantA: z.object({
    caption: z.string(),
    mediaUrl: z.string().optional(),
  }),
  variantB: z.object({
    caption: z.string(),
    mediaUrl: z.string().optional(),
  }),
  platforms: z.array(z.string()),
  audience: z.object({
    percentage: z.number().min(1).max(100),
    criteria: z.object({
      location: z.string().optional(),
      interests: z.array(z.string()).optional(),
    }).optional(),
  }),
  duration: z.number().min(1).max(30), // days
});

// POST - Create A/B test
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, variantA, variantB, platforms, audience, duration } = createABTestSchema.parse(body);

    const abTest = await prisma.aBTest.create({
      data: {
        userId: session.user.id,
        name,
        variantA,
        variantB,
        platforms,
        audience,
        duration,
        status: "draft",
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(abTest, { status: 201 });
  } catch (error) {
    console.error("Create A/B test error:", error);
    return NextResponse.json(
      { error: "Failed to create A/B test" },
      { status: 500 }
    );
  }
}

// GET - Get A/B tests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const abTests = await prisma.aBTest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        results: true,
      },
    });

    return NextResponse.json(abTests);
  } catch (error) {
    console.error("Get A/B tests error:", error);
    return NextResponse.json(
      { error: "Failed to get A/B tests" },
      { status: 500 }
    );
  }
}