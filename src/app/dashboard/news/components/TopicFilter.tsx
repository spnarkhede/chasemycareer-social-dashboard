// app/dashboard/news/components/TopicFilter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { NewsTopic } from "@/types/news";
import { TOPIC_CONFIG, TOPIC_OPTIONS } from "../lib/rssFeeds";
import { cn } from "@/lib/utils";

interface TopicFilterProps {
  selected: NewsTopic;
  onSelect: (topic: NewsTopic) => void;
}

export function TopicFilter({ selected, onSelect }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPIC_OPTIONS.map((topic) => {
        const config = TOPIC_CONFIG[topic];
        const isSelected = selected === topic;
        
        return (
          <Button
            key={topic}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5 text-xs",
              isSelected && "bg-primary hover:bg-primary/90"
            )}
            onClick={() => onSelect(topic)}
          >
            <span>{config.icon}</span>
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}