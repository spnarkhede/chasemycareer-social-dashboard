// app/dashboard/calendar/lib/mockCalendarData.ts
import { Post } from "@/types/post";
import { startOfMonth, addDays, setHours } from "date-fns";

export function generateMonthPosts(month: Date): Post[] {
  const start = startOfMonth(month);
  const platforms: Post["platforms"] = [
    ["LinkedIn"], ["Instagram"], ["Twitter"], ["LinkedIn", "Twitter"], 
    ["YouTube"], ["TikTok", "Instagram"], ["Website Blog"], ["Facebook"]
  ];
  
  const types: Post["type"][] = ["text", "carousel", "image", "video", "reel"];
  const statuses: Post["status"][] = ["scheduled", "published", "draft"];
  
  return Array.from({ length: 25 }, (_, i) => {
    const date = addDays(start, Math.floor(Math.random() * 28));
    const platformSet = platforms[i % platforms.length];
    
    return {
      id: `cal-${i}`,
      caption: `Content piece #${i + 1} for ${platformSet.join(", ")}. Engaging career advice...`,
      platforms: platformSet,
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      scheduledDate: setHours(date, 10 + (i % 5)),
      tags: ["career", "tips"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}