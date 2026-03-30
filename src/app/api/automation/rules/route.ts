// app/api/automation/rules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRuleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  triggerType: z.enum(["COMMENT", "FOLLOW", "LIKE", "SHARE", "MENTION"]),
  triggerConfig: z.object({
    platform: z.string(),
    postIds: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    keywordMatch: z.enum(["any", "all"]).optional(),
    excludeExisting: z.boolean().default(true),
  }),
  actionType: z.enum(["SEND_DM"]),
  actionConfig: z.object({
    templateId: z.string().optional(),
    message: z.string().optional(),
    delay: z.number().optional(), // minutes
    priority: z.number().default(0),
    variables: z.record(z.string()).optional(),
  }),
  dailyLimit: z.number().min(1).max(500).default(50),
  isActive: z.boolean().default(true),
});

// GET - List rules
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await prisma.automationRule.findMany({
      where: { userId: session.user.id },
      include: {
        executions: {
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          select: { status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Get rules error:", error);
    return NextResponse.json(
      { error: "Failed to get rules" },
      { status: 500 }
    );
  }
}

// POST - Create rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createRuleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
       {
        userId: session.user.id,
        ...validation.data,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Create rule error:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}