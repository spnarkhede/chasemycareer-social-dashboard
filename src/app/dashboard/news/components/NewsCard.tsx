// app/dashboard/news/components/NewsCard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsItem, NewsTopic } from "@/types/news";
import { TOPIC_CONFIG } from "../lib/rssFeeds";
import { format, formatDistanceToNow } from "date-fns";
import { Bookmark, BookmarkCheck, ExternalLink, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewsCardProps {
  item: NewsItem;
  onSave: (item: NewsItem) => void;
  onMarkRead: (id: string) => void;
  compact?: boolean;
}

export function NewsCard({ item, onSave, onMarkRead, compact = false }: NewsCardProps) {
  const topicConfig = TOPIC_CONFIG[item.topic];
  const timeAgo = formatDistanceToNow(new Date(item.publishDate), { addSuffix: true });

  const handleSave = () => {
    onSave(item);
    toast.success(item.saved ? "Removed from saved" : "Saved for later");
  };

  const handleMarkRead = () => {
    onMarkRead(item.id);
    toast.success("Marked as read");
  };

  if (compact) {
    return (
      <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{topicConfig.icon}</span>
            <Badge variant="outline" className="text-xs">
              {topicConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{item.source}</span>
          </div>
          <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleSave}
        >
          {item.saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "bg-card border-border hover:border-primary/30 transition-all duration-200 group",
      item.read && "opacity-70"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{topicConfig.icon}</span>
            <div>
              <Badge variant="outline" className={cn("text-xs", topicConfig.color.replace("bg-", "text-").replace("500", "400"))}>
                {topicConfig.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{item.source}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!item.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleMarkRead}
                title="Mark as read"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSave}
              title={item.saved ? "Remove from saved" : "Save for later"}
            >
              {item.saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <a 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group/link"
        >
          <h3 className="text-lg font-semibold line-clamp-2 group-hover/link:text-primary transition-colors">
            {item.title}
          </h3>
        </a>

        {item.imageUrl && !compact && (
          <div className="rounded-lg overflow-hidden border bg-muted/30">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">
          {item.summary}
        </p>

        {item.author && (
          <p className="text-xs text-muted-foreground">
            By {item.author}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <span className="text-xs text-muted-foreground">
          {format(new Date(item.publishDate), "MMM d, yyyy")} • {timeAgo}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          asChild
        >
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            Read More
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}