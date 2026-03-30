// app/dashboard/calendar/components/DayCell.tsx
"use client";

import { Post } from "@/types/post";
import { PostChip } from "./PostChip";
import { format, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  posts: Post[];
  isSelected: boolean;
  onClick: (date: Date) => void;
  onAdd: (date: Date) => void;
}

export function DayCell({ date, isCurrentMonth, posts, isSelected, onClick, onAdd }: DayCellProps) {
  const today = isToday(date);
  const maxVisible = 4;
  const visiblePosts = posts.slice(0, maxVisible);
  const remaining = posts.length - maxVisible;

  return (
    <div
      className={cn(
        "min-h-[120px] border-r border-b p-2 transition-colors relative group",
        isCurrentMonth ? "bg-card" : "bg-muted/10 text-muted-foreground",
        isSelected && "ring-2 ring-primary ring-inset",
        today && "bg-primary/5"
      )}
      onClick={() => onClick(date)}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
            today ? "bg-primary text-primary-foreground" : ""
          )}
        >
          {format(date, "d")}
        </span>
        
        {/* Add Button (visible on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(date);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
          title="Add Post"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Posts Chips */}
      <div className="space-y-1.5">
        {visiblePosts.map((post) => (
          <PostChip
            key={post.id}
            post={post}
            compact={posts.length > 6}
            onClick={(e) => {
              e.stopPropagation();
              onClick(date);
            }}
          />
        ))}
        
        {remaining > 0 && (
          <div className="text-xs text-muted-foreground pl-1">
            +{remaining} more
          </div>
        )}
        
        {posts.length === 0 && isCurrentMonth && (
          <div className="text-xs text-muted-foreground/50 italic mt-4 text-center">
            No content
          </div>
        )}
      </div>
    </div>
  );
}