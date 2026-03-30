// app/dashboard/posts/components/PostFilters.tsx
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
import { Filter, X } from "lucide-react";
import { PostFilters as PostFiltersType, PostStatus, Platform, PostType } from "@/types/post";
import { Badge } from "@/components/ui/badge";

const allStatuses: PostStatus[] = ["draft", "scheduled", "published", "backlog"];
const allPlatforms: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Pinterest", 
  "Medium", "Facebook", "Website Blog", "Twitter"
];
const allTypes: PostType[] = ["text", "carousel", "image", "reel", "video", "diagram"];

interface PostFiltersProps {
  filters: PostFiltersType;
  onFiltersChange: (filters: PostFiltersType) => void;
}

export function PostFilters({ filters, onFiltersChange }: PostFiltersProps) {
  const activeFilterCount = [
    filters.status?.length,
    filters.platforms?.length,
    filters.type?.length,
  ].filter(Boolean).reduce((a, b) => a + (b || 0), 0);

  const toggleFilter = <T extends string>(
    key: keyof PostFiltersType,
    value: T,
    current: T[] = []
  ) => {
    const newArray = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>Filter Posts</DropdownMenuLabel>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {/* Status Filter */}
        <DropdownMenuLabel className="text-xs text-muted-foreground mt-2">Status</DropdownMenuLabel>
        {allStatuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={filters.status?.includes(status)}
            onCheckedChange={() => toggleFilter("status", status, filters.status)}
            className="capitalize"
          >
            {status}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Platform Filter */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">Platform</DropdownMenuLabel>
        <div className="max-h-48 overflow-y-auto py-1">
          {allPlatforms.map((platform) => (
            <DropdownMenuCheckboxItem
              key={platform}
              checked={filters.platforms?.includes(platform)}
              onCheckedChange={() => toggleFilter("platforms", platform, filters.platforms)}
            >
              {platform}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Type Filter */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">Content Type</DropdownMenuLabel>
        {allTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={filters.type?.includes(type)}
            onCheckedChange={() => toggleFilter("type", type, filters.type)}
            className="capitalize"
          >
            {type}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}