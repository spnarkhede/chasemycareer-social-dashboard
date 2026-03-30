// app/dashboard/analytics/hooks/useAnalytics.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsSummary, DateRange, Platform } from "@/types/analytics";
import { metricoolClient } from "@/lib/metricool";
import { generateMockAnalytics, DEFAULT_DATE_RANGES } from "../lib/mockAnalytics";
import { subDays, startOfMonth, endOfMonth } from "date-fns";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: "Last 30 days",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production: fetch from Metricool
      // For development/demo: use mock data
      const data = generateMockAnalytics(
        Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      );
      
      // Filter by selected platforms if specified
      if (selectedPlatforms.length > 0) {
        data.platforms = data.platforms.filter(p => 
          selectedPlatforms.includes(p.platform)
        );
        data.topPosts = data.topPosts.filter(p => 
          selectedPlatforms.includes(p.platform)
        );
        // Recalculate totals
        data.totals.impressions = data.platforms.reduce((sum, p) => sum + p.impressions, 0);
        data.totals.engagements = data.platforms.reduce((sum, p) => sum + p.engagements, 0);
        data.totals.engagementRate = data.totals.impressions > 0 
          ? parseFloat(((data.totals.engagements / data.totals.impressions) * 100).toFixed(2))
          : 0;
        data.totals.followerGrowth = data.platforms.reduce((sum, p) => sum + p.followerGrowth, 0);
      }
      
      setAnalytics(data);
    } catch (err) {
      setError("Failed to load analytics data. Please try again.");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedPlatforms]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeChange = useCallback((newRange: DateRange) => {
    // Handle special cases for "This month" and "Custom"
    if (newRange.days === -1) {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      setDateRange({ start, end, label: newRange.label });
    } else if (newRange.days === -2) {
      // Custom range - keep current selection, calendar will handle updates
      setDateRange(prev => ({ ...prev, label: newRange.label }));
    } else if (newRange.days) {
      const start = subDays(new Date(), newRange.days);
      const end = new Date();
      setDateRange({ start, end, label: newRange.label });
    }
  }, []);

  const handlePlatformToggle = useCallback((platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const handlePlatformClear = useCallback(() => {
    setSelectedPlatforms([]);
  }, []);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics for display
  const kpiCards = useMemo(() => {
    if (!analytics) return [];
    
    return [
      {
        title: "Total Impressions",
        value: analytics.totals.impressions.toLocaleString(),
        change: analytics.comparison?.change.impressions,
        icon: "eye",
        trend: analytics.engagementTrend.slice(-7).map(d => d.value),
      },
      {
        title: "Engagement Rate",
        value: `${analytics.totals.engagementRate}%`,
        change: analytics.comparison?.change.engagementRate,
        icon: "heart",
        trend: analytics.engagementTrend.slice(-7).map(d => 
          parseFloat(((d.value / (analytics.totals.impressions / 30)) * 100).toFixed(1))
        ),
      },
      {
        title: "Follower Growth",
        value: `+${analytics.totals.followerGrowth.toLocaleString()}`,
        change: analytics.comparison?.change.followerGrowth,
        icon: "users",
        trend: analytics.followerTrend.slice(-7).map(d => d.value),
      },
      {
        title: "Total Clicks",
        value: analytics.totals.clicks.toLocaleString(),
        change: analytics.comparison?.change.engagements, // approximate
        icon: "mouse-pointer-click",
        trend: analytics.engagementTrend.slice(-7).map(d => Math.floor(d.value * 0.4)),
      },
    ];
  }, [analytics]);

  return {
    analytics,
    loading,
    error,
    dateRange,
    setDateRange: handleDateRangeChange,
    selectedPlatforms,
    onPlatformToggle: handlePlatformToggle,
    onPlatformClear: handlePlatformClear,
    refreshData,
    kpiCards,
    DEFAULT_DATE_RANGES,
  };
}