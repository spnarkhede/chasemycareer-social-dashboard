// components/layout/Sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Instagram,
  BarChart3,
  CalendarDays,
  Users,
  Newspaper,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Post Manager", href: "/dashboard/posts", icon: Instagram },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Content Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Competitor Tracker", href: "/dashboard/competitors", icon: Users },
  { name: "News Consolidator", href: "/dashboard/news", icon: Newspaper },
];

const platforms = [
  { name: "LinkedIn", url: "https://www.linkedin.com/company/chasemycareer" },
  { name: "Instagram", url: "https://www.instagram.com/chasemycareer/" },
  { name: "TikTok", url: "https://www.tiktok.com/@chasemycareer" },
  { name: "YouTube", url: "https://www.youtube.com/@chasemycareer" },
  { name: "Pinterest", url: "#" },
  { name: "Medium", url: "https://medium.com/@chasemycareer" },
  { name: "Facebook", url: "https://www.facebook.com/chasemycareer" },
  { name: "Blog", url: "https://www.chasemycareer.com/" },
  { name: "Twitter/X", url: "https://x.com/ChaseMyCareers" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm">CMC</span>
          </div>
          <span className="text-lg">Chase My Career</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/10 text-primary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-6 px-3">
          <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platforms
          </h3>
          <div className="space-y-1">
            {platforms.map((platform) => (
              <Button
                key={platform.name}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                asChild
              >
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  {platform.name}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-3" asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}