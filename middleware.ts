// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/api/posts",
    "/api/analytics",
    "/api/calendar",
    "/api/competitors",
    "/api/news",
  ];

  // Define auth routes (redirect if already logged in)
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/error"];

  // Define public API routes
  const publicApiRoutes = ["/api/auth"];

  // Check if it's an API route
  const isApiRoute = pathname.startsWith("/api");

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protect API routes
  if (isApiRoute && !pathname.startsWith("/api/auth")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Handle auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};