// app/dashboard/calendar/components/CalendarView.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Platform } from "@/types/post";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  platform: Platform;
  status: "scheduled" | "published";
  date: Date;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedPlatforms: Platform[];
  onDayClick?: (date: Date) => void;
}

const platformColors: Record<Platform, string> = {
  LinkedIn: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  TikTok: "bg-black/40 text-white border-zinc-600",
  YouTube: "bg-red-500/20 text-red-300 border-red-500/30",
  Pinterest: "bg-red-400/20 text-red-200 border-red-400/30",
  Medium: "bg-green-500/20 text-green-300 border-green-500/30",
  Facebook: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  "Website Blog": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

export function CalendarView({ events, selectedPlatforms, onDayClick }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getDayEvents = (date: Date) => {
    return events.filter(
      (event) => 
        isSameDay(event.date, date) && 
        (selectedPlatforms.length === 0 || selectedPlatforms.includes(event.platform))
    );
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-lg border bg-card"
        components={{
          Day: ({ date, ...props }) => {
            const dayEvents = getDayEvents(date);
            return (
              <button
                {...props}
                onClick={() => {
                  setSelectedDate(date);
                  onDayClick?.(date);
                }}
                className={cn(
                  "relative h-12 w-12 p-0 font-normal hover:bg-accent",
                  props.className
                )}
              >
                <span>{format(date, "d")}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full border",
                          platformColors[event.platform]
                        )}
                        title={`${event.platform}: ${event.title}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          },
        }}
      />

      {selectedDate && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-medium mb-3">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h4>
          <div className="space-y-2">
            {getDayEvents(selectedDate).length > 0 ? (
              getDayEvents(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", platformColors[event.platform])}
                    >
                      {event.platform}
                    </Badge>
                    <span className="text-sm">{event.title}</span>
                  </div>
                  <Badge 
                    variant={event.status === "published" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {event.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No content scheduled for this day
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}