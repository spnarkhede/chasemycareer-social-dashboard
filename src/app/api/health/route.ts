// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/api/cache";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "healthy",
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Redis check
  try {
    const redisStart = Date.now();
    await cache.get("health:check");
    checks.redis = {
      status: "healthy",
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // External APIs check
  try {
    const apiStart = Date.now();
    const response = await fetch("https://api.metricool.com/v2", {
      method: "HEAD",
      timeout: 5000,
    });
    checks.externalApis = {
      status: response.ok ? "healthy" : "degraded",
      latency: Date.now() - apiStart,
    };
  } catch (error) {
    checks.externalApis = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const allHealthy = Object.values(checks).every(c => c.status === "healthy");
  const anyUnhealthy = Object.values(checks).some(c => c.status === "unhealthy");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : anyUnhealthy ? "unhealthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      checks,
      totalLatency: Date.now() - startTime,
    },
    { status: allHealthy ? 200 : anyUnhealthy ? 503 : 200 }
  );
}