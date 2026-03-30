// app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  platforms: z.array(z.string()),
  content: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    type: z.string(),
  }),
  category: z.enum(["career-tips", "success-stories", "promotional", "educational", "engagement"]),
  isPublic: z.boolean().default(false),
});

// GET - Get templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const platform = searchParams.get("platform");

    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isPublic: true },
        ],
        ...(category && { category }),
        ...(platform && { platforms: { has: platform } }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json(
      { error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, platforms, content, category, isPublic } = createTemplateSchema.parse(body);

    const template = await prisma.template.create({
      data: {
        userId: session.user.id,
        name,
        description,
        platforms,
        content,
        category,
        isPublic,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}