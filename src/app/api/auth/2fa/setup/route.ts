// app/api/auth/2fa/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Authenticator } from "@otplib/core";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate 2FA secret
    const secret = createHash("sha256")
      .update(crypto.randomUUID())
      .digest("hex")
      .slice(0, 32);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomUUID().slice(0, 8).toUpperCase()
    );

    // Store secret (don't enable yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorBackup: backupCodes,
      },
    });

    // Generate QR code URI
    const issuer = "Chase My Career";
    const account = session.user.email;
    const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;

    return NextResponse.json({
      success: true,
      secret,
      uri,
      backupCodes,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}