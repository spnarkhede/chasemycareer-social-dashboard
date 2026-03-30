// app/dashboard/competitors/hooks/useCompetitors.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { Competitor, SortField, SortDirection } from "@/types/competitor";
import { mockCompetitors } from "../lib/mockCompetitors";

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors);
  const [sortField, setSortField] = useState<SortField>("followers");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  // Sorting Logic
  const sortedCompetitors = useMemo(() => {
    let data = [...competitors];

    // Filter by search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.handle.toLowerCase().includes(lower) ||
          c.niche.toLowerCase().includes(lower)
      );
    }

    // Filter by platform
    if (platformFilter.length > 0) {
      data = data.filter((c) => platformFilter.includes(c.platform));
    }

    // Sort
    data.sort((a, b) => {
      const aValue = a.metrics[sortField] || a[sortField] || 0;
      const bValue = b.metrics[sortField] || b[sortField] || 0;
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [competitors, sortField, sortDirection, searchQuery, platformFilter]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }, [sortField]);

  const addCompetitor = useCallback((newCompetitor: Omit<Competitor, "id" | "metrics" | "growthTrend" | "recentPosts" | "lastUpdated">) => {
    const competitor: Competitor = {
      ...newCompetitor,
      id: crypto.randomUUID(),
      metrics: {
        followers: 0,
        engagementRate: 0,
        avgPostsPerWeek: 0,
        growthRate: 0,
        totalLikes: 0,
        totalComments: 0,
      },
      growthTrend: [0, 0, 0, 0, 0, 0, 0],
      recentPosts: [],
      lastUpdated: new Date().toISOString(),
    };
    setCompetitors(prev => [competitor, ...prev]);
    setIsDialogOpen(false);
  }, []);

  const deleteCompetitor = useCallback((id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  }, []);

  const refreshMetrics = useCallback(async (id: string) => {
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCompetitors(prev => prev.map(c => 
      c.id === id 
        ? { 
            ...c, 
            metrics: { ...c.metrics, followers: c.metrics.followers + Math.floor(Math.random() * 100) },
            lastUpdated: new Date().toISOString()
          } 
        : c
    ));
  }, []);

  return {
    competitors: sortedCompetitors,
    sortField,
    sortDirection,
    onSort: handleSort,
    searchQuery,
    setSearchQuery,
    platformFilter,
    setPlatformFilter,
    isDialogOpen,
    setIsDialogOpen,
    selectedCompetitor,
    setSelectedCompetitor,
    addCompetitor,
    deleteCompetitor,
    refreshMetrics,
    totalCompetitors: competitors.length,
  };
}