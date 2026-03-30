// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";
import { createAuditLog, AuditEventType } from "@/lib/security/audit-logger";

export default auth(async (request) => {
  const { nextUrl } = request;
  const isLoggedIn = !!request.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isPublicRoute = ["/", "/auth/signin", "/auth/signup", "/auth/verify-email"].includes(nextUrl.pathname);

  // ===========================================
  // SECURITY HEADERS (All Routes)
  // ===========================================
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Restrict powerful features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com https://*.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.sentry.io https://*.upstash.io https://*.posthog.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );
  
  // HTTP Strict Transport Security
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  
  // XSS Protection (legacy)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // ===========================================
  // RATE LIMITING (API Routes)
  // ===========================================
  if (isApiRoute) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const userId = request.auth?.user?.id || ip;
    
    const { success, limit, reset, remaining } = await ratelimit.limit(userId);

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    if (!success) {
      await createAuditLog({
        eventType: AuditEventType.SECURITY_IP_BLOCKED,
        action: "Rate limit exceeded",
        ipAddress: ip,
        status: "warning",
      });

      return NextResponse.json(
        { error: "Too many requests", code: "RATE_LIMIT_EXCEEDED" },
        { status: 429, headers: response.headers }
      );
    }
  }

  // ===========================================
  // AUTHENTICATION CHECKS
  // ===========================================
  
  // Protect API routes
  if (isApiRoute && !nextUrl.pathname.startsWith("/api/auth") && !nextUrl.pathname.startsWith("/api/webhooks")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401, headers: response.headers }
      );
    }
  }

  // Auth pages redirect
  if (isAuthRoute) {
    if (isLoggedIn && !nextUrl.pathname.includes("verify-email")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return response;
  }

  // Protect dashboard routes
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  // Handle root path
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Add security info to headers
  response.headers.set("X-Request-Id", crypto.randomUUID());
  response.headers.set("X-Response-Time", Date.now().toString());

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};