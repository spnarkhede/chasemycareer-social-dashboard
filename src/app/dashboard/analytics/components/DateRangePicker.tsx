// app/dashboard/analytics/components/DateRangePicker.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "@/types/analytics";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets: Array<{ label: string; days: number }>;
  className?: string;
}

export function DateRangePicker({ value, onChange, presets, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({
    from: value.start,
    to: value.end,
  });

  const handlePresetSelect = (days: number, label: string) => {
    if (days === -1) {
      // This month
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      onChange({ start, end, label });
    } else if (days === -2) {
      // Custom - open calendar
      setOpen(true);
    } else {
      const start = subDays(new Date(), days);
      const end = new Date();
      onChange({ start, end, label });
    }
    setOpen(false);
  };

  const handleCustomApply = () => {
    if (customRange.from && customRange.to) {
      onChange({
        start: customRange.from,
        end: customRange.to,
        label: "Custom",
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[240px] justify-start text-left font-normal", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground">Date Range</span>
            <span className="text-sm font-medium">
              {value.label === "Custom" && customRange.from && customRange.to
                ? `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d, yyyy")}`
                : value.label}
            </span>
          </div>
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={value.label === preset.label ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => handlePresetSelect(preset.days, preset.label)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Range Calendar */}
          {value.label === "Custom" && (
            <div className="border-t pt-4">
              <Calendar
                mode="range"
                selected={{ from: customRange.from, to: customRange.to }}
                onSelect={(range) => {
                  setCustomRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
                className="rounded-md border"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCustomApply}
                  disabled={!customRange.from || !customRange.to}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p>Data updates every 24 hours. Metricool syncs at 2 AM UTC.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}