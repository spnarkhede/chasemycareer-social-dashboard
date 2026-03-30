// app/dashboard/competitors/page.tsx
"use client";

import { useCompetitors } from "./hooks/useCompetitors";
import { CompetitorTable } from "./components/CompetitorTable";
import { AddCompetitorDialog } from "./components/AddCompetitorDialog";
import { CompetitorDetailSheet } from "./components/CompetitorDetailSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, TrendingUp, Users, Activity } from "lucide-react";
import { Platform } from "@/types/post";
import { toast } from "sonner";

const PLATFORMS: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Twitter", "Facebook"
];

export default function CompetitorsPage() {
  const {
    competitors,
    sortField,
    sortDirection,
    onSort,
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
    totalCompetitors,
  } = useCompetitors();

  // Calculate aggregate stats
  const avgEngagement = competitors.length > 0 
    ? (competitors.reduce((acc, c) => acc + c.metrics.engagementRate, 0) / competitors.length).toFixed(2)
    : 0;
  
  const totalFollowers = competitors.reduce((acc, c) => acc + c.metrics.followers, 0);

  const handleDelete = (id: string) => {
    if (confirm("Stop tracking this competitor?")) {
      deleteCompetitor(id);
      toast.success("Competitor removed");
    }
  };

  const handleRefresh = async (id: string) => {
    await refreshMetrics(id);
    toast.success("Metrics updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competitor Tracker</h1>
          <p className="text-muted-foreground">
            Monitor competitor performance and identify content gaps
          </p>
        </div>
        
        <AddCompetitorDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAdd={addCompetitor}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tracked Competitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompetitors}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">Industry benchmark: 3.5%</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalFollowers / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Combined follower count</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competitors by name or handle..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Platform
              {platformFilter.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {platformFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PLATFORMS.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={platformFilter.includes(platform)}
                onCheckedChange={(checked) => {
                  setPlatformFilter(
                    checked 
                      ? [...platformFilter, platform] 
                      : platformFilter.filter(p => p !== platform)
                  );
                }}
              >
                {platform}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <CompetitorTable
        competitors={competitors}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        onViewDetails={setSelectedCompetitor}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
      />

      {/* Detail Sheet */}
      <CompetitorDetailSheet
        open={!!selectedCompetitor}
        onOpenChange={(open) => !open && setSelectedCompetitor(null)}
        competitor={selectedCompetitor}
      />

      {/* Data Source Notice */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        Data is simulated for demo. Integrate Metricool Competitors API or Social Blade for live data.
      </div>
    </div>
  );
}