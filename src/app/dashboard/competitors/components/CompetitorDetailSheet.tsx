// app/dashboard/competitors/components/CompetitorDetailSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Competitor } from "@/types/competitor";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users, Heart, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CompetitorDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor: Competitor | null;
}

export function CompetitorDetailSheet({ open, onOpenChange, competitor }: CompetitorDetailSheetProps) {
  if (!competitor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <PlatformIcon platform={competitor.platform} size="lg" />
            <div>
              <SheetTitle>{competitor.name}</SheetTitle>
              <SheetDescription>{competitor.handle}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(competitor.metrics.followers / 1000).toFixed(1)}K</div>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +{competitor.metrics.growthRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Eng. Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitor.metrics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">Avg. per post</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Profile Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Niche</span>
                <Badge variant="outline">{competitor.niche}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posting Frequency</span>
                <span>{competitor.metrics.avgPostsPerWeek} posts/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(competitor.lastUpdated), "MMM d, h:mm a")}</span>
              </div>
              {competitor.website && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Website</span>
                  <Button variant="link" className="h-auto p-0 text-xs" asChild>
                    <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Recent Posts
            </h3>
            {competitor.recentPosts.length > 0 ? (
              <div className="space-y-2">
                {competitor.recentPosts.map((post) => (
                  <div key={post.id} className="p-3 rounded-lg border bg-muted/20 text-sm">
                    <p className="line-clamp-2 mb-2">{post.caption}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(new Date(post.publishedDate), "MMM d")}</span>
                      <span>❤️ {post.likes} 💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No recent posts captured yet.</p>
            )}
          </div>

          {/* Strategy Tips */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-2">💡 Insight</h3>
            <p className="text-xs text-primary/90">
              {competitor.metrics.engagementRate > 5 
                ? "High engagement! Analyze their caption structure and posting times." 
                : "Focus on their follower growth strategy rather than engagement."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}