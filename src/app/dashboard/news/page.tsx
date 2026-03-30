// app/dashboard/news/page.tsx
"use client";

import { useNews } from "./hooks/useNews";
import { NewsCard } from "./components/NewsCard";
import { TopicFilter } from "./components/TopicFilter";
import { SaveForLaterSheet } from "./components/SaveForLaterSheet";
import { NewsSkeleton } from "./components/NewsSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bookmark, RefreshCw, Filter, Rss, AlertCircle } from "lucide-react";
import { NewsTopic } from "@/types/news";
import { toast } from "sonner";
import { useState } from "react";

export default function NewsPage() {
  const {
    news,
    allNews,
    loading,
    error,
    filters,
    setFilters,
    savedItems,
    onToggleSave,
    onMarkAsRead,
    onRefresh,
    uniqueSources,
    totalUnread,
    totalSaved,
  } = useNews();

  const [isSavedSheetOpen, setIsSavedSheetOpen] = useState(false);

  const handleRefresh = async () => {
    await onRefresh();
    toast.success("News feed refreshed");
  };

  const handleTopicSelect = (topic: NewsTopic) => {
    setFilters({ ...filters, topic });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    setFilters({ ...filters, sources: newSources });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load News</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
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
          <h1 className="text-2xl font-bold tracking-tight">News Consolidator</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest career industry news
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsSavedSheetOpen(true)}
          >
            <Bookmark className="h-4 w-4" />
            Saved
            {totalSaved > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {totalSaved}
              </span>
            )}
          </Button>
          
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

      {/* Stats Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Rss className="h-4 w-4 text-muted-foreground" />
                <span>{allNews.length} total articles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>{totalUnread} unread</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <span>{totalSaved} saved</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updates every 30 minutes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Filters */}
      <TopicFilter selected={filters.topic} onSelect={handleTopicSelect} />

      {/* Search & Source Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news by title, summary, or source..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.dateRange}
            onValueChange={(v: any) => setFilters({ ...filters, dateRange: v })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Sources
                {filters.sources.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {filters.sources.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {uniqueSources.map((source) => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={filters.sources.includes(source)}
                  onCheckedChange={() => handleSourceToggle(source)}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <NewsSkeleton key={i} />
          ))
        ) : news.length > 0 ? (
          news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onSave={onToggleSave}
              onMarkRead={onMarkAsRead}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
            <Rss className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No News Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => setFilters({ topic: "all", sources: [], search: "", dateRange: "week", showSaved: false })}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Load More (for pagination simulation) */}
      {!loading && news.length > 0 && news.length >= 12 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2">
            Load More Articles
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Saved Articles Sheet */}
      <SaveForLaterSheet
        open={isSavedSheetOpen}
        onOpenChange={setIsSavedSheetOpen}
        savedItems={savedItems}
        onSave={onToggleSave}
        onMarkRead={onMarkAsRead}
      />

      {/* RSS Feed Sources Info */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        Aggregating from {uniqueSources.length} sources • 
        <Button variant="link" className="h-auto p-0 text-xs" asChild>
          <a href="https://rss.app" target="_blank" rel="noopener noreferrer">
            Manage RSS feeds
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