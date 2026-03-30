// app/dashboard/calendar/page.tsx
"use client";

import { useCalendar } from "./hooks/useCalendar";
import { DayCell } from "./components/DayCell";
import { DayDetailSheet } from "./components/DayDetailSheet";
import { CalendarFilters } from "./components/CalendarFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getDaysInMonthGrid } from "./lib/calendarUtils";
import { toast } from "sonner";

export default function CalendarPage() {
  const {
    currentMonth,
    postsByDate,
    selectedDate,
    isSheetOpen,
    setIsSheetOpen,
    onMonthChange,
    onDayClick,
    filters,
    onFilterChange,
    getPostsForDate,
    filteredPostsCount,
  } = useCalendar();

  const days = getDaysInMonthGrid(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleAddPost = (date: Date) => {
    // In real app, this would open the form with pre-filled date
    toast.info(`Add post flow for ${format(date, "MMM d")}`);
    onDayClick(date);
  };

  const handleEditPost = (post: any) => {
    // Update post logic
    toast.success("Post updated");
  };

  const handleDeletePost = (id: string) => {
    // Delete post logic
    toast.success("Post deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">
            Plan and visualize your content across all platforms
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarFilters
            platforms={filters.platforms}
            statuses={filters.statuses}
            onPlatformChange={(p) => onFilterChange("platforms", p)}
            onStatusChange={(s) => onFilterChange("statuses", s)}
          />
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onMonthChange("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onMonthChange("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredPostsCount} posts visible
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((dayObj, index) => {
              const dateKey = dayObj.date.toISOString().split("T")[0];
              const dayPosts = postsByDate[dateKey] || [];
              const isSelected = selectedDate && dayObj.date.toDateString() === selectedDate.toDateString();
              
              return (
                <DayCell
                  key={index}
                  date={dayObj.date}
                  isCurrentMonth={dayObj.isCurrentMonth}
                  posts={dayPosts}
                  isSelected={!!isSelected}
                  onClick={onDayClick}
                  onAdd={handleAddPost}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Sheet */}
      <DayDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        date={selectedDate}
        posts={selectedDate ? getPostsForDate(selectedDate) : []}
        onAddPost={handleAddPost}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground py-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500/50" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <span>Published</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <span>Backlog</span>
        </div>
      </div>
    </div>
  );
}