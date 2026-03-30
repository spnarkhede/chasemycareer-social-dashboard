// app/dashboard/analytics/page.tsx
"use client";

import { useAnalytics } from "./hooks/useAnalytics";
import { MetricCard } from "./components/MetricCards";
import { EngagementChart } from "./components/EngagementChart";
import { PlatformBarChart } from "./components/PlatformBarChart";
import { TopPostsTable } from "./components/TopPostsTable";
import { DateRangePicker } from "./components/DateRangePicker";
import { PlatformSelector } from "./components/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const {
    analytics,
    loading,
    error,
    dateRange,
    setDateRange,
    selectedPlatforms,
    onPlatformToggle,
    onPlatformClear,
    refreshData,
    kpiCards,
    DEFAULT_DATE_RANGES,
  } = useAnalytics();

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Analytics refreshed");
  };

  const handleCopyCaption = async (caption: string) => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Caption copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {error}
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track performance across all your social platforms
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                presets={DEFAULT_DATE_RANGES}
              />
              <PlatformSelector
                selected={selectedPlatforms}
                onToggle={onPlatformToggle}
                onClear={onPlatformClear}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedPlatforms.length > 0 
                ? `Filtering: ${selectedPlatforms.join(", ")}`
                : "Showing all platforms"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : analytics ? (
          kpiCards.map((card, index) => (
            <MetricCard key={index} {...card} />
          ))
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Card className="bg-card border-border h-[400px]">
              <CardContent className="pt-6">
                <Skeleton className="h-full w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border h-[400px]">
              <CardContent className="pt-6">
                <Skeleton className="h-full w-full rounded-lg" />
              </CardContent>
            </Card>
          </>
        ) : analytics ? (
          <>
            <EngagementChart
              data={analytics.engagementTrend}
              title="Engagement Trend"
              description="Daily total engagements across selected platforms"
            />
            <PlatformBarChart
              data={analytics.platforms}
              metric="engagementRate"
              title="Engagement Rate by Platform"
            />
          </>
        ) : null}
      </div>

      {/* Follower Growth Chart */}
      {!loading && analytics && (
        <EngagementChart
          data={analytics.followerTrend}
          title="Follower Growth"
          description="Total follower count over time"
        />
      )}

      {/* Top Performing Posts */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Top Performing Posts</h3>
              <p className="text-sm text-muted-foreground">
                Ranked by total engagements • {analytics?.topPosts.length} posts analyzed
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : analytics ? (
            <TopPostsTable 
              posts={analytics.topPosts} 
              onCopyCaption={handleCopyCaption}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Data Source Notice */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        Data sourced from Metricool • Updates daily at 2:00 AM UTC • 
        <Button variant="link" className="h-auto p-0 text-xs" asChild>
          <a href="https://help.metricool.com" target="_blank" rel="noopener noreferrer">
            Learn more about metrics
          </a>
        </Button>
      </div>
    </div>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}