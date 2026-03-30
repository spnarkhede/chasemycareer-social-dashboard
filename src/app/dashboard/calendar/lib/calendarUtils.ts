// app/dashboard/calendar/lib/calendarUtils.ts
import { Post, Platform } from "@/types/post";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function groupPostsByDate(posts: Post[], month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  const grouped: Record<string, Post[]> = {};
  
  // Initialize all days in month
  days.forEach(day => {
    grouped[format(day, "yyyy-MM-dd")] = [];
  });
  
  // Assign posts to days
  posts.forEach(post => {
    const date = post.scheduledDate || post.publishedDate || post.createdAt;
    const dateKey = format(date, "yyyy-MM-dd");
    
    // Only include posts within the current month view
    if (grouped[dateKey]) {
      grouped[dateKey].push(post);
    }
  });
  
  // Sort posts within each day by time (if available) or status
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      const dateA = a.scheduledDate || a.publishedDate || a.createdAt;
      const dateB = b.scheduledDate || b.publishedDate || b.createdAt;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  });
  
  return grouped;
}

export function getDaysInMonthGrid(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const startDay = start.getDay(); // 0 = Sunday
  const daysInMonth = eachDayOfInterval({ start, end });
  
  // Add padding days for previous month
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() - (startDay - i));
    return { date, isCurrentMonth: false };
  });
  
  // Current month days
  const currentDays = daysInMonth.map(date => ({ date, isCurrentMonth: true }));
  
  // Add padding days for next month to complete 6 rows (42 cells)
  const totalCells = 42;
  const remainingCells = totalCells - (paddingDays.length + currentDays.length);
  const nextPadding = Array.from({ length: remainingCells }, (_, i) => {
    const date = new Date(end);
    date.setDate(date.getDate() + (i + 1));
    return { date, isCurrentMonth: false };
  });
  
  return [...paddingDays, ...currentDays, ...nextPadding];
}

export const platformColors: Record<Platform, string> = {
  LinkedIn: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
  Instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30",
  TikTok: "bg-black/40 text-white border-zinc-600 hover:bg-zinc-800",
  YouTube: "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
  Pinterest: "bg-red-400/20 text-red-200 border-red-400/30 hover:bg-red-400/30",
  Medium: "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30",
  Facebook: "bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30",
  "Website Blog": "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30",
  Twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30 hover:bg-sky-500/30",
};

export const statusColors = {
  draft: "border-l-2 border-l-muted-foreground",
  scheduled: "border-l-2 border-l-blue-400",
  published: "border-l-2 border-l-green-400",
  backlog: "border-l-2 border-l-yellow-400",
};