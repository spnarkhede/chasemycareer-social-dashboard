// app/dashboard/calendar/components/PostChip.tsx
"use client";

import { Post } from "@/types/post";
import { platformColors } from "../lib/calendarUtils";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/shared/PlatformIcon";

interface PostChipProps {
  post: Post;
  compact?: boolean;
  onClick?: () => void;
}

export function PostChip({ post, compact = false, onClick }: PostChipProps) {
  const primaryPlatform = post.platforms[0];
  const colorClass = platformColors[primaryPlatform] || "bg-muted text-muted-foreground";

  if (compact) {
    return (
      <div
        className={cn(
          "h-2 w-2 rounded-full cursor-pointer transition-transform hover:scale-125",
          colorClass.split(" ")[0] // Extract bg color
        )}
        onClick={onClick}
        title={`${primaryPlatform}: ${post.caption.slice(0, 50)}...`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
        colorClass
      )}
    >
      <PlatformIcon platform={primaryPlatform} size="sm" className="h-3 w-3" />
      <span className="truncate font-medium max-w-[80px]">
        {post.type}
      </span>
    </div>
  );
}