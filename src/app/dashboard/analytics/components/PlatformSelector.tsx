// app/dashboard/analytics/components/PlatformSelector.tsx
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
import { Platform } from "@/types/analytics";
import { Filter, X, Check } from "lucide-react";
import { PlatformIcon } from "@/components/shared/PlatformIcon";

const ALL_PLATFORMS: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Pinterest",
  "Medium", "Facebook", "Website Blog", "Twitter"
];

interface PlatformSelectorProps {
  selected: Platform[];
  onToggle: (platform: Platform) => void;
  onClear: () => void;
}

export function PlatformSelector({ selected, onToggle, onClear }: PlatformSelectorProps) {
  const hasFilters = selected.length > 0 && selected.length < ALL_PLATFORMS.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Platforms
          {hasFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
              {selected.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-xs">Select Platforms</DropdownMenuLabel>
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2"
              onClick={onClear}
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {/* Select All */}
        <DropdownMenuCheckboxItem
          checked={selected.length === ALL_PLATFORMS.length}
          onCheckedChange={(checked) => {
            if (checked) {
              ALL_PLATFORMS.forEach(p => onToggle(p));
            } else {
              onClear();
            }
          }}
          className="font-medium"
        >
          <div className="flex items-center gap-2">
            <Check className={cn(
              "h-3.5 w-3.5",
              selected.length === ALL_PLATFORMS.length ? "text-primary" : "invisible"
            )} />
            All Platforms
          </div>
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        {/* Individual Platforms */}
        {ALL_PLATFORMS.map((platform) => (
          <DropdownMenuCheckboxItem
            key={platform}
            checked={selected.includes(platform)}
            onCheckedChange={() => onToggle(platform)}
            className="py-2"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={platform} size="sm" />
              <span>{platform}</span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}