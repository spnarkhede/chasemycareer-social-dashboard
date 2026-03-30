// app/dashboard/analytics/components/EngagementChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricDataPoint, Platform } from "@/types/analytics";
import { format, parseISO } from "date-fns";

interface EngagementChartProps {
  data: MetricDataPoint[];
  platforms?: Platform[];
  title?: string;
  description?: string;
}

// Format date for x-axis
const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "MMM d");
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
        <p className="font-medium mb-1">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EngagementChart({ 
  data, 
  platforms = [], 
  title = "Engagement Over Time",
  description = "Daily engagement metrics across selected platforms"
}: EngagementChartProps) {
  // Transform data for recharts
  const chartData = data.map(point => ({
    date: point.date,
    dateLabel: formatDate(point.date),
    engagements: point.value,
    // Add platform-specific series if needed
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={Math.max(1, Math.floor(data.length / 7))}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagements"
                name="Engagements"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend hint */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Hover over points for exact values • Data updates daily at 2 AM UTC
        </p>
      </CardContent>
    </Card>
  );
}