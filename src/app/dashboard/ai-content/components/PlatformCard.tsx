// app/dashboard/ai-content/components/PlatformCard.tsx
"use client";

import { GeneratedContent } from "@/types/ai-content";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { Copy, Check, ExternalLink, Image, Video, Layers } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlatformCardProps {
  content: GeneratedContent;
  onCopy: () => void;
  onPublish: () => void;
}

export function PlatformCard({ content, onCopy, onPublish }: PlatformCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullContent = `${content.caption}\n\n${content.hashtags.map(h => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    onPublish();
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={content.platform} size="md" />
            <span className="font-semibold">{content.platform}</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {content.contentType}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <span>📈 Est. Reach: {(content.estimatedReach.average / 1000).toFixed(1)}K</span>
          <span>⏰ Best Time: {content.bestPostingTime}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Caption */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Caption</label>
          <Textarea
            value={content.caption}
            readOnly
            className="min-h-[100px] text-sm resize-none"
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Hashtags</label>
          <div className="flex flex-wrap gap-1">
            {content.hashtags.slice(0, 10).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {content.hashtags.length > 10 && (
              <Badge variant="outline" className="text-xs">
                +{content.hashtags.length - 10}
              </Badge>
            )}
          </div>
        </div>

        {/* Media Preview */}
        {content.media.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {content.media[0].type === "video" ? (
                <Video className="h-4 w-4" />
              ) : content.media[0].type === "carousel" ? (
                <Layers className="h-4 w-4" />
              ) : (
                <Image className="h-4 w-4" />
              )}
              Media Suggestions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {content.media[0].thumbnails.slice(0, 3).map((thumb, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                  <img src={thumb} alt="Media" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carousel Slides Preview */}
        {content.carouselSlides && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Carousel Slides</label>
            <div className="space-y-1">
              {content.carouselSlides.slice(0, 3).map((slide, i) => (
                <div key={i} className="text-xs p-2 rounded bg-muted/50">
                  <span className="font-medium">{slide.title}</span>
                  <p className="text-muted-foreground truncate">{slide.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Keywords</label>
          <div className="flex flex-wrap gap-1">
            {content.keywords.slice(0, 5).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>

        <Button
          onClick={handlePublish}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <ExternalLink className="h-4 w-4" />
          Publish
        </Button>
      </CardFooter>
    </Card>
  );
}