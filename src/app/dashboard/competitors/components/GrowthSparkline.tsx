// app/dashboard/competitors/components/GrowthSparkline.tsx
"use client";

import { useMemo } from "react";

interface GrowthSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function GrowthSparkline({ data, width = 100, height = 40 }: GrowthSparklineProps) {
  const { path, strokeColor, endY } = useMemo(() => {
    if (data.length < 2) return { path: "", strokeColor: "#64748b", endY: height / 2 };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });
    
    const isPositive = data[data.length - 1] >= data[0];
    const color = isPositive ? "#22c55e" : "#ef4444";
    const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
    
    return { 
      path: `M ${points.join(" L ")}`, 
      strokeColor: color,
      endY: lastY
    };
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={endY} r="3" fill={strokeColor} />
    </svg>
  );
}