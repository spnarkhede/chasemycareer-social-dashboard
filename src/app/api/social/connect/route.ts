// app/api/social/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { socialClient } from "@/lib/api/social";
import { ApiError, handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const connectSchema = z.object({
  platform: z.string(),
  code: z.string(),
  redirectUri: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const body = await request.json();
    const validation = connectSchema.safeParse(body);

    if (!validation.success) {
      throw ApiError.badRequest("Invalid connection data", validation.error.errors);
    }

    // Authenticate with platform
    const account = await socialClient.authenticate(
      validation.data.platform,
      validation.data.code,
      validation.data.redirectUri
    );

    // Store account in database
    const storedAccount = await prisma.account.create({
       {
        userId: session.user.id,
        type: "oauth",
        provider: validation.data.platform,
        providerAccountId: account.accountId,
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
        expires_at: account.expiresAt?.getTime(),
        token_type: "Bearer",
        scope: "read write",
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: storedAccount.id,
        platform: account.platform,
        accountName: account.accountName,
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}