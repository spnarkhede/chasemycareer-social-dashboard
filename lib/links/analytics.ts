// lib/links/analytics.ts
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

export async function trackView({
  linkPageId,
  userId,
}: {
  linkPageId: string;
  userId: string;
}) {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const ip = "unknown"; // Get from request in server context

  const { device, browser, os, country, city } = parseUserAgent(userAgent, ip);

  await prisma.linkAnalytics.create({
     {
      linkPageId,
      userId,
      userAgent,
      ipAddress: ip,
      device,
      browser,
      os,
      country,
      city,
    },
  });
}

export function parseUserAgent(userAgent: string, ip: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Get geo data from IP (in production, use a service like ipapi.co)
  const geo = geoip.lookup(ip) || { country: "Unknown", city: "Unknown" };

  return {
    device: result.device.type || "desktop",
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    country: geo.country || "Unknown",
    city: geo.city || "Unknown",
  };
}

export async function getLinkAnalytics(linkPageId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalViews, totalClicks, uniqueVisitors, viewsByDay, topLinks, topCountries, topDevices] = await Promise.all([
    prisma.linkAnalytics.count({
      where: { linkPageId, clickedAt: { gte: startDate } },
    }),
    prisma.linkAnalytics.count({
      where: { linkPageId, linkId: { not: null }, clickedAt: { gte: startDate } },
    }),
    prisma.linkAnalytics.groupBy({
      by: ["ipAddress"],
      where: { linkPageId, clickedAt: { gte: startDate } },
      _count: true,
    }),
    prisma.linkAnalytics.groupBy({
      by: ["clickedAt"],
      where: { linkPageId, clickedAt: { gte: startDate } },
      _count: true,
    }),
    prisma.linkAnalytics.groupBy({
      by: ["linkId"],
      where: { linkPageId, linkId: { not: null }, clickedAt: { gte: startDate } },
      _count: true,
      orderBy: { _count: { linkId: "desc" } },
      take: 10,
    }),
    prisma.linkAnalytics.groupBy({
      by: ["country"],
      where: { linkPageId, clickedAt: { gte: startDate } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
    prisma.linkAnalytics.groupBy({
      by: ["device"],
      where: { linkPageId, clickedAt: { gte: startDate } },
      _count: true,
      orderBy: { _count: { device: "desc" } },
    }),
  ]);

  return {
    totalViews,
    totalClicks,
    uniqueVisitors: uniqueVisitors.length,
    clickThroughRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
    viewsByDay,
    topLinks,
    topCountries,
    topDevices,
  };
}