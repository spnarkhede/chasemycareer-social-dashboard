// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Request email verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Chase My Career <noreply@chasemycareer.com>",
      to: email,
      subject: "Verify Your Email - Chase My Career",
      react: (
        <EmailVerificationTemplate 
          userName={user.name || "User"}
          verificationUrl={verificationUrl}
          expiresAt={expires}
        />
      ),
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

// Verify email token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid", request.url)
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.emailVerificationToken !== token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid", request.url)
      );
    }

    if (user.emailVerificationExpires! < new Date()) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=expired", request.url)
      );
    }

    // Verify email
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.redirect(
      new URL("/auth/verify-email?success=true", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=unknown", request.url)
    );
  }
}