// app/dashboard/competitors/components/CompetitorTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Competitor, SortField, SortDirection } from "@/types/competitor";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { GrowthSparkline } from "./GrowthSparkline";
import { ArrowUpDown, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorTableProps {
  competitors: Competitor[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onViewDetails: (competitor: Competitor) => void;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}

const columns: { key: SortField; label: string; align?: "left" | "right" }[] = [
  { key: "name", label: "Competitor", align: "left" },
  { key: "followers", label: "Followers", align: "right" },
  { key: "engagementRate", label: "Eng. Rate", align: "right" },
  { key: "growthRate", label: "Growth (30d)", align: "right" },
  { key: "avgPostsPerWeek", label: "Posts/Week", align: "right" },
  { key: "followers", label: "Trend", align: "left" }, // Visual column
];

export function CompetitorTable({ 
  competitors, 
  sortField, 
  sortDirection, 
  onSort, 
  onViewDetails, 
  onDelete,
  onRefresh 
}: CompetitorTableProps) {
  
  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={cn(
      "ml-2 h-3 w-4 inline",
      sortField === field ? "text-primary" : "text-muted-foreground/50"
    )} />
  );

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn(col.align === "right" ? "text-right" : "text-left")}>
                {col.key !== "followers" || col.label !== "Trend" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium hover:bg-transparent"
                    onClick={() => col.key !== "followers" && onSort(col.key)}
                    disabled={col.label === "Trend"}
                  >
                    {col.label}
                    {col.label !== "Trend" && <SortIcon field={col.key} />}
                  </Button>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">7-Day Trend</span>
                )}
              </TableHead>
            ))}
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitors.map((competitor) => (
            <TableRow key={competitor.id} className="group hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={competitor.platform} size="sm" />
                  <div>
                    <div className="font-medium">{competitor.name}</div>
                    <div className="text-xs text-muted-foreground">{competitor.handle}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {(competitor.metrics.followers / 1000).toFixed(1)}K
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className={cn(
                  competitor.metrics.engagementRate > 5 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  competitor.metrics.engagementRate > 3 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-muted text-muted-foreground"
                )}>
                  {competitor.metrics.engagementRate}%
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "text-sm font-medium",
                  competitor.metrics.growthRate > 0 ? "text-green-400" : "text-destructive"
                )}>
                  {competitor.metrics.growthRate > 0 ? "+" : ""}{competitor.metrics.growthRate}%
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {competitor.metrics.avgPostsPerWeek}
              </TableCell>
              <TableCell>
                <GrowthSparkline data={competitor.growthTrend} width={80} height={30} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRefresh(competitor.id)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetails(competitor)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(competitor.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {competitors.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No competitors found. Add one to start tracking.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}