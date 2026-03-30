// app/api/auth/2fa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Authenticator } from "@otplib/core";
import { totp } from "@otplib/plugin-totp";
import { sha1 } from "@otplib/plugin-crypto";

const authenticator = new Authenticator({ totp });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, backupCode } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not enabled" },
        { status: 400 }
      );
    }

    let isValid = false;

    // Verify token
    if (token) {
      isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      });
    }

    // Verify backup code
    if (backupCode && user.twoFactorBackup?.includes(backupCode)) {
      isValid = true;
      // Remove used backup code
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorBackup: user.twoFactorBackup.filter(
            (code) => code !== backupCode
          ),
        },
      });
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid 2FA code" },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}