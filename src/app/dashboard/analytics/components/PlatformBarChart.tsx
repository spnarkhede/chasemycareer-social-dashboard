// app/dashboard/analytics/components/PlatformBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformMetrics } from "@/types/analytics";
import { PlatformIcon } from "@/components/shared/PlatformIcon";

interface PlatformBarChartProps {
  data: PlatformMetrics[];
  metric: "impressions" | "engagements" | "engagementRate" | "clicks";
  title?: string;
}

const metricConfig = {
  impressions: { label: "Impressions", format: (v: number) => `${(v / 1000).toFixed(1)}K`, color: "#3b82f6" },
  engagements: { label: "Engagements", format: (v: number) => `${(v / 1000).toFixed(1)}K`, color: "#22c55e" },
  engagementRate: { label: "Engagement Rate", format: (v: number) => `${v}%`, color: "#f59e0b" },
  clicks: { label: "Clicks", format: (v: number) => `${(v / 1000).toFixed(1)}K`, color: "#8b5cf6" },
};

export function PlatformBarChart({ data, metric, title = "Performance by Platform" }: PlatformBarChartProps) {
  const config = metricConfig[metric];
  
  const chartData = data.map(item => ({
    platform: item.platform,
    value: item[metric],
    formatted: config.format(item[metric]),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.[0]) {
      return (
        <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
          <div className="flex items-center gap-2 mb-2">
            <PlatformIcon platform={label} size="sm" />
            <span className="font-medium">{label}</span>
          </div>
          <p className="text-lg font-bold">{payload[0].payload.formatted}</p>
          <p className="text-muted-foreground text-xs">{config.label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Comparing {config.label.toLowerCase()} across platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => metric === "engagementRate" ? `${value}%` : `${(value/1000).toFixed(0)}K`}
              />
              <YAxis
                dataKey="platform"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(var(--primary) / ${0.6 + (index * 0.08)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}