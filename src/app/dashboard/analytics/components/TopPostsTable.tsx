// app/dashboard/analytics/components/TopPostsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { CopyButton } from "@/app/dashboard/posts/components/CopyButton";

interface TopPost {
  id: string;
  platform: string;
  caption: string;
  publishedDate: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  clicks: number;
  type: string;
}

interface TopPostsTableProps {
  posts: TopPost[];
  onCopyCaption: (caption: string) => void;
}

export function TopPostsTable({ posts, onCopyCaption }: TopPostsTableProps) {
  const typeColors: Record<string, string> = {
    text: "bg-blue-500/10 text-blue-400",
    carousel: "bg-purple-500/10 text-purple-400",
    image: "bg-pink-500/10 text-pink-400",
    reel: "bg-orange-500/10 text-orange-400",
    video: "bg-red-500/10 text-red-400",
    diagram: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-right">Engagements</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post, index) => (
            <TableRow key={post.id} className="group hover:bg-muted/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  #{index + 1}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-md">
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {post.caption}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={typeColors[post.type]}>
                      {post.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.publishedDate), "MMM d")}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} size="sm" />
                  <span className="text-sm">{post.platform}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {(post.engagements / 1000).toFixed(1)}K
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  {post.engagementRate}%
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {(post.clicks / 1000).toFixed(1)}K
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton 
                    text={post.caption} 
                    label="" 
                    variant="ghost" 
                    size="icon"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => window.open(`https://chasemycareer.com/posts/${post.id}`, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {posts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No posts found for selected filters
        </div>
      )}
    </div>
  );
}