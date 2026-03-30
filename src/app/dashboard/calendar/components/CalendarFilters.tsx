// app/dashboard/calendar/components/CalendarFilters.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Platform, PostStatus } from "@/types/post";
import { Filter, X } from "lucide-react";
import { PlatformIcon } from "@/components/shared/PlatformIcon";

const ALL_PLATFORMS: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Pinterest",
  "Medium", "Facebook", "Website Blog", "Twitter"
];

const ALL_STATUSES: PostStatus[] = ["draft", "scheduled", "published", "backlog"];

interface CalendarFiltersProps {
  platforms: Platform[];
  statuses: PostStatus[];
  onPlatformChange: (platforms: Platform[]) => void;
  onStatusChange: (statuses: PostStatus[]) => void;
}

export function CalendarFilters({ platforms, statuses, onPlatformChange, onStatusChange }: CalendarFiltersProps) {
  const activeCount = platforms.length + statuses.length;

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = platforms.includes(platform)
      ? platforms.filter(p => p !== platform)
      : [...platforms, platform];
    onPlatformChange(newPlatforms);
  };

  const toggleStatus = (status: PostStatus) => {
    const newStatuses = statuses.includes(status)
      ? statuses.filter(s => s !== status)
      : [...statuses, status];
    onStatusChange(newStatuses);
  };

  const clearFilters = () => {
    onPlatformChange([]);
    onStatusChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="text-xs">Platforms</DropdownMenuLabel>
            {platforms.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onPlatformChange([])}>
                Clear
              </Button>
            )}
          </div>
          {ALL_PLATFORMS.map(platform => (
            <DropdownMenuCheckboxItem
              key={platform}
              checked={platforms.includes(platform)}
              onCheckedChange={() => togglePlatform(platform)}
              className="py-2"
            >
              <div className="flex items-center gap-2">
                <PlatformIcon platform={platform} size="sm" />
                {platform}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
            {statuses.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onStatusChange([])}>
                Clear
              </Button>
            )}
          </div>
          {ALL_STATUSES.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
              className="capitalize"
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
          <X className="h-3 w-3" /> Clear All
        </Button>
      )}
    </div>
  );
}