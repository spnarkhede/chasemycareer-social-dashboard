// app/dashboard/calendar/hooks/useCalendar.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { Post, Platform, PostStatus } from "@/types/post";
import { generateMonthPosts } from "../lib/mockCalendarData";
import { groupPostsByDate } from "../lib/calendarUtils";
import { startOfMonth, addMonths, isSameMonth } from "date-fns";

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState<{
    platforms: Platform[];
    statuses: PostStatus[];
  }>({
    platforms: [],
    statuses: [],
  });

  // Generate mock posts for current month
  const allPosts = useMemo(() => generateMonthPosts(currentMonth), [currentMonth]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      if (filters.platforms.length > 0 && !post.platforms.some(p => filters.platforms.includes(p))) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(post.status)) {
        return false;
      }
      return true;
    });
  }, [allPosts, filters]);

  // Group by date for calendar grid
  const postsByDate = useMemo(() => {
    return groupPostsByDate(filteredPosts, currentMonth);
  }, [filteredPosts, currentMonth]);

  const handleMonthChange = useCallback((direction: "prev" | "next") => {
    setCurrentMonth(prev => addMonths(prev, direction === "next" ? 1 : -1));
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  }, []);

  const handleFilterChange = useCallback((key: "platforms" | "statuses", value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const getPostsForDate = useCallback((date: Date) => {
    const key = new Date(date).toISOString().split("T")[0];
    // Simple match based on YYYY-MM-DD
    return filteredPosts.filter(post => {
      const postDate = post.scheduledDate || post.publishedDate || post.createdAt;
      return postDate.toISOString().split("T")[0] === key;
    });
  }, [filteredPosts]);

  return {
    currentMonth,
    postsByDate,
    selectedDate,
    isSheetOpen,
    setIsSheetOpen,
    onMonthChange: handleMonthChange,
    onDayClick: handleDayClick,
    filters,
    onFilterChange: handleFilterChange,
    getPostsForDate,
    allPostsCount: allPosts.length,
    filteredPostsCount: filteredPosts.length,
  };
}