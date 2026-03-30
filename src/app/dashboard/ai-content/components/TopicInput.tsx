// app/dashboard/ai-content/components/TopicInput.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Lightbulb } from "lucide-react";
import { Platform } from "@/types/ai-content";

const ALL_PLATFORMS: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Pinterest",
  "Medium", "Facebook", "Website Blog", "Twitter"
];

const POPULAR_TOPICS = [
  "Resume optimization tips for 2024",
  "How to ace video interviews",
  "Salary negotiation strategies",
  "LinkedIn profile optimization",
  "Career change success stories",
  "AI tools for job seekers",
  "Networking tips for introverts",
  "Remote work best practices",
];

interface TopicInputProps {
  onGenerate: (topic: string, platforms: string[], options: any) => void;
}

export function TopicInput({ onGenerate }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "LinkedIn", "Instagram", "Twitter"
  ]);
  const [tone, setTone] = useState("professional");
  const [goal, setGoal] = useState("engagement");
  const [includeMedia, setIncludeMedia] = useState(true);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [includeCarousel, setIncludeCarousel] = useState(true);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const selectAll = () => setSelectedPlatforms(ALL_PLATFORMS);
  const clearAll = () => setSelectedPlatforms([]);

  const handleSubmit = () => {
    if (!topic.trim() || selectedPlatforms.length === 0) return;
    
    onGenerate(topic, selectedPlatforms, {
      tone,
      goal,
      includeMedia,
      includeVideo,
      includeCarousel,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Input Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Enter Your Content Topic
          </CardTitle>
          <CardDescription>
            AI will generate complete content for all selected platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., 5 Resume Tips That Got Me 10 Interviews"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-base"
            />
            
            {/* Popular Topics */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Try:
              </span>
              {POPULAR_TOPICS.slice(0, 4).map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setTopic(t)}
                >
                  {t.slice(0, 30)}...
                </Badge>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Platforms *</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/20">
              {ALL_PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <Label htmlFor={platform} className="text-sm font-normal cursor-pointer">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPlatforms.length} platform(s) selected
            </p>
          </div>

          {/* Content Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Options */}
          <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
            <Label>Media Options</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMedia"
                  checked={includeMedia}
                  onCheckedChange={(v) => setIncludeMedia(v as boolean)}
                />
                <Label htmlFor="includeMedia" className="text-sm cursor-pointer">
                  Images
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeVideo"
                  checked={includeVideo}
                  onCheckedChange={(v) => setIncludeVideo(v as boolean)}
                />
                <Label htmlFor="includeVideo" className="text-sm cursor-pointer">
                  Videos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCarousel"
                  checked={includeCarousel}
                  onCheckedChange={(v) => setIncludeCarousel(v as boolean)}
                />
                <Label htmlFor="includeCarousel" className="text-sm cursor-pointer">
                  Carousels
                </Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleSubmit}
            disabled={!topic.trim() || selectedPlatforms.length === 0}
            className="w-full h-12 text-base gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Generate Content for {selectedPlatforms.length} Platforms
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Powered by Qwen AI • Free media from Unsplash, Pexels, Pixabay
          </p>
        </CardContent>
      </Card>
    </div>
  );
}