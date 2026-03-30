// app/dashboard/posts/components/PostCard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { CopyButton } from "./CopyButton";
import { Post, PostStatus, PostType, Platform } from "@/types/post";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ExternalLink, Edit, Trash2, Calendar, Play, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PostStatus) => void;
  onPublish: (post: Post) => Promise<void>;
}

export function PostCard({ post, onEdit, onDelete, onStatusChange, onPublish }: PostCardProps) {
  const statusColors: Record<PostStatus, string> = {
    draft: "bg-muted text-muted-foreground border-muted-foreground/20",
    scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    published: "bg-green-500/10 text-green-400 border-green-500/20",
    backlog: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  const typeConfig: Record<PostType, { icon: React.ReactNode; label: string }> = {
    text: { icon: "📝", label: "Text Post" },
    carousel: { icon: "🎠", label: "Carousel" },
    image: { icon: <ImageIcon className="h-4 w-4" />, label: "Image" },
    reel: { icon: <Play className="h-4 w-4" />, label: "Reel" },
    video: { icon: <Play className="h-4 w-4" />, label: "Video" },
    diagram: { icon: "📊", label: "Diagram/Infographic" },
  };

  const canPublish = post.status !== "published" && post.caption.trim().length > 0;

  const handlePublish = async () => {
    await onPublish(post);
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {post.platforms.map((platform) => (
              <div key={platform} className="flex items-center gap-1.5">
                <PlatformIcon platform={platform} size="sm" />
                <span className="text-sm font-medium hidden sm:inline">{platform}</span>
              </div>
            ))}
          </div>
          <Badge variant="outline" className={cn("text-xs", statusColors[post.status])}>
            {post.status}
          </Badge>
        </div>
        
        {post.scheduledDate && post.status === "scheduled" && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(post.scheduledDate), "MMM d, yyyy • h:mm a")}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Type Badge */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{typeConfig[post.type].icon}</span>
          <span>{typeConfig[post.type].label}</span>
        </div>
        
        {/* Caption Preview */}
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-foreground/90 whitespace-pre-wrap line-clamp-4">
            {post.caption}
          </p>
        </div>

        {/* Media Preview */}
        {post.mediaUrl && (
          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground text-sm">
              {post.type === "video" || post.type === "reel" ? (
                <div className="text-center">
                  <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span>Video Preview</span>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span>Image Preview</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <CopyButton text={post.caption} label="Copy Caption" />
          
          {canPublish && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="gap-1.5 bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Publish Now
            </Button>
          )}
        </div>
        
        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Post
            </DropdownMenuItem>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Change Status
                </DropdownMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["draft", "scheduled", "backlog", "published"] as PostStatus[]).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(post.id, status)}
                    className={post.status === status ? "bg-accent" : ""}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(post.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}