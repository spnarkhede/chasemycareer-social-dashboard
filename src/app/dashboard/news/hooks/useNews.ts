// app/dashboard/news/hooks/useNews.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { NewsItem, NewsTopic, NewsFilters } from "@/types/news";
import { generateMockNews } from "../lib/mockNews";
import { subDays } from "date-fns";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({
    topic: "all",
    sources: [],
    search: "",
    dateRange: "week",
    showSaved: false,
  });
  const [savedItems, setSavedItems] = useState<NewsItem[]>([]);

  // Fetch news data
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production: Fetch from RSS API endpoint
      // For development: Use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const data = generateMockNews(30);
      setNews(data);
      
      // Load saved items from localStorage
      const saved = localStorage.getItem("savedNews");
      if (saved) {
        setSavedItems(JSON.parse(saved));
      }
    } catch (err) {
      setError("Failed to load news feed. Please try again.");
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Filter news based on criteria
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Topic filter
      if (filters.topic !== "all" && item.topic !== filters.topic) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.title.toLowerCase().includes(searchLower) &&
          !item.summary.toLowerCase().includes(searchLower) &&
          !item.source.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const itemDate = new Date(item.publishDate);
        const now = new Date();
        let cutoffDate: Date;

        switch (filters.dateRange) {
          case "today":
            cutoffDate = subDays(now, 1);
            break;
          case "week":
            cutoffDate = subDays(now, 7);
            break;
          case "month":
            cutoffDate = subDays(now, 30);
            break;
          default:
            cutoffDate = subDays(now, 7);
        }

        if (itemDate < cutoffDate) {
          return false;
        }
      }

      // Saved filter
      if (filters.showSaved && !item.saved) {
        return false;
      }

      return true;
    });
  }, [news, filters]);

  // Save/unsave article
  const toggleSave = useCallback((item: NewsItem) => {
    const newSaved = item.saved
      ? savedItems.filter((s) => s.id !== item.id)
      : [...savedItems, { ...item, saved: true }];
    
    setSavedItems(newSaved);
    localStorage.setItem("savedNews", JSON.stringify(newSaved));
    
    // Update main news list
    setNews(prev => prev.map(n => 
      n.id === item.id ? { ...n, saved: !item.saved } : n
    ));
  }, [savedItems]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNews(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  // Get unique sources for filter
  const uniqueSources = useMemo(() => {
    return [...new Set(news.map(item => item.source))];
  }, [news]);

  return {
    news: filteredNews,
    allNews: news,
    loading,
    error,
    filters,
    setFilters,
    savedItems,
    onToggleSave: toggleSave,
    onMarkAsRead: markAsRead,
    onRefresh: refreshFeed,
    uniqueSources,
    totalUnread: news.filter(n => !n.read).length,
    totalSaved: savedItems.length,
  };
}