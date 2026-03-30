// app/api/teams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  slug: z.string().min(2).max(50),
});

// GET - List user's teams
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: session.user.id },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        _count: {
          select: { members: true, projects: true },
        },
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      { error: "Failed to get teams" },
      { status: 500 }
    );
  }
}

// POST - Create team
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, slug } = createTeamSchema.parse(body);

    // Check slug uniqueness
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Team slug already taken" },
        { status: 400 }
      );
    }

    // Create team with user as owner
    const team = await prisma.team.create({
      data: {
        name,
        description,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}