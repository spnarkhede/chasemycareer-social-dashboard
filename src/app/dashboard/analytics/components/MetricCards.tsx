// app/dashboard/analytics/components/MetricCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Eye, Heart, Users, MousePointerClick } from "lucide-react";
import { Sparkline } from "./Sparkline"; // We'll create this next

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: "eye" | "heart" | "users" | "mouse-pointer-click";
  trend?: number[];
}

const iconMap = {
  "eye": Eye,
  "heart": Heart,
  "users": Users,
  "mouse-pointer-click": MousePointerClick,
};

export function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  const Icon = iconMap[icon];
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === 0;

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg",
          isPositive ? "bg-green-500/10 text-green-400" :
          isNeutral ? "bg-muted text-muted-foreground" :
          "bg-destructive/10 text-destructive"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {change !== undefined && (
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              isPositive ? "text-green-400" :
              isNeutral ? "text-muted-foreground" :
              "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> :
               isNeutral ? <Minus className="h-3 w-3" /> :
               <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        
        {/* Mini sparkline trend */}
        {trend && trend.length > 0 && (
          <div className="mt-3 h-8">
            <Sparkline data={trend} color={isPositive ? "#22c55e" : isNeutral ? "#64748b" : "#ef4444"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}