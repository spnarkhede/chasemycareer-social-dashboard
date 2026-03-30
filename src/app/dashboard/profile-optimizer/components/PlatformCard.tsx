// app/dashboard/profile-optimizer/components/PlatformCard.tsx
"use client";

import { useState } from "react";
import { OptimizedProfile } from "@/types/optimizer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, DollarSign, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PlatformCardProps {
  profile: OptimizedProfile;
}

export function PlatformCard({ profile }: PlatformCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      linkedin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      tiktok: "bg-black/40 text-white border-zinc-600",
      youtube: "bg-red-500/10 text-red-400 border-red-500/20",
      facebook: "bg-blue-600/10 text-blue-400 border-blue-600/20",
      pinterest: "bg-red-400/10 text-red-300 border-red-400/20",
      medium: "bg-green-500/10 text-green-400 border-green-500/20",
      threads: "bg-black/40 text-white border-zinc-600",
    };
    return colors[profile.platform] || "bg-muted";
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      tiktok: "🎵",
      youtube: "📺",
      facebook: "📘",
      pinterest: "📌",
      medium: "📝",
      threads: "🧵",
    };
    return icons[profile.platform] || "🔗";
  };

  return (
    <Card className={cn("border-2", getPlatformColor(profile.platform))}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getPlatformIcon(profile.platform)}</span>
            <div>
              <h3 className="text-lg font-bold capitalize">{profile.platform}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Score: {profile.optimizationScore}/100
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(
              `https://chasemycareer.com/${profile.platform}`,
              "profile-url"
            )}
          >
            {copiedField === "profile-url" ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Headline</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(profile.headline, `headline-${profile.platform}`)}
            >
              {copiedField === `headline-${profile.platform}` ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm">{profile.headline}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Bio</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(profile.bio, `bio-${profile.platform}`)}
            >
              {copiedField === `bio-${profile.platform}` ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          </div>
        </div>

        {/* Accordion for Details */}
        <Accordion type="single" collapsible className="w-full">
          {/* Monetization */}
          <AccordionItem value="monetization">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Monetization Strategies
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {profile.monetizationTips.map((option, index) => (
                  <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-medium text-sm text-green-400">{option.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {option.earningPotential}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {option.timeToRevenue}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Growth Tips */}
          <AccordionItem value="growth">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Growth Strategies
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-2">
                {profile.growthTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Content Strategy */}
          <AccordionItem value="content">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                Content Strategy
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-sm font-medium">Content Pillars:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.contentPillars.map((pillar, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {pillar}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Posting Frequency:</p>
                  <p className="text-sm text-muted-foreground">{profile.postingFrequency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Best Times to Post:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.bestPostingTimes.map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Checklist */}
          <AccordionItem value="checklist">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                Optimization Checklist
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-2">
                {profile.checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-muted-foreground"
                    />
                    <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                      {item.task}
                    </span>
                    <Badge
                      variant={item.priority === "high" ? "destructive" : "secondary"}
                      className="text-xs ml-auto"
                    >
                      {item.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}