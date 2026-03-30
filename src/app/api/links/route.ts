// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLinkPageSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
});

// GET - List user's link pages
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const linkPages = await prisma.linkPage.findMany({
      where: { userId: session.user.id },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        socialProfiles: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { links: true, analytics: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(linkPages);
  } catch (error) {
    console.error("Get link pages error:", error);
    return NextResponse.json(
      { error: "Failed to get link pages" },
      { status: 500 }
    );
  }
}

// POST - Create link page
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createLinkPageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check username availability
    const existing = await prisma.linkPage.findUnique({
      where: { username: validation.data.username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const linkPage = await prisma.linkPage.create({
       {
        userId: session.user.id,
        username: validation.data.username,
        displayName: validation.data.displayName,
        bio: validation.data.bio,
        avatar: validation.data.avatar,
        banner: validation.data.banner,
      },
    });

    return NextResponse.json(linkPage, { status: 201 });
  } catch (error) {
    console.error("Create link page error:", error);
    return NextResponse.json(
      { error: "Failed to create link page" },
      { status: 500 }
    );
  }
}