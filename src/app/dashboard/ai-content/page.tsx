// app/dashboard/ai-content/page.tsx
"use client";

import { useState } from "react";
import { TopicInput } from "./components/TopicInput";
import { ContentGrid } from "./components/ContentGrid";
import { GenerationHistory } from "./components/GenerationHistory";
import { LoadingState } from "@/components/ai/LoadingState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, History, Zap, TrendingUp, Users, Clock } from "lucide-react";
import { GeneratedContent, ContentGenerationResponse } from "@/types/ai-content";
import { toast } from "sonner";

export default function AIContentPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [generationStats, setGenerationStats] = useState<ContentGenerationResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerate = async (topic: string, platforms: string[], options: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedContent([]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platforms,
          tone: options.tone,
          targetAudience: options.targetAudience,
          goal: options.goal,
          includeMedia: options.includeMedia,
          includeVideo: options.includeVideo,
          includeCarousel: options.includeCarousel,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Generation failed");
      }

      const result: ContentGenerationResponse = await response.json();
      
      setGeneratedContent(result.contents);
      setGenerationStats(result);
      
      toast.success(`Generated content for ${result.totalPlatforms} platforms!`, {
        description: `Estimated reach: ${result.estimatedTotalReach.toLocaleString()} | Time: ${(result.generationTime / 1000).toFixed(1)}s`,
      });
    } catch (error: any) {
      toast.error("Generation failed", {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleCopyContent = async (content: GeneratedContent) => {
    const fullContent = `${content.caption}\n\n${content.hashtags.map(h => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(fullContent);
    toast.success("Content copied to clipboard!");
  };

  const handlePublish = async (content: GeneratedContent) => {
    try {
      const response = await fetch("/api/metricool/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: content.caption,
          platforms: [content.platform],
          type: content.contentType,
          status: "scheduled",
          mediaUrl: content.media[0]?.urls[0],
          tags: content.hashtags,
        }),
      });

      if (!response.ok) throw new Error("Publishing failed");

      toast.success(`Content scheduled for ${content.platform}!`);
    } catch (error: any) {
      toast.error("Publishing failed", {
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Content Generator
          </h1>
          <p className="text-muted-foreground">
            Generate complete social media content for all platforms from one topic
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          History
        </Button>
      </div>

      {/* Stats Cards */}
      {generationStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platforms
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generationStats.totalPlatforms}</div>
              <p className="text-xs text-muted-foreground">Content generated</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Est. Reach
              </CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(generationStats.estimatedTotalReach / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">Total potential reach</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Generation Time
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(generationStats.generationTime / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground">AI processing time</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Used
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generationStats.creditsUsed}</div>
              <p className="text-xs text-muted-foreground">AI API credits</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {isGenerating && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating content...</span>
                <span className="text-primary">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                AI is creating platform-optimized content with media suggestions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Input */}
      {!isGenerating && !generatedContent.length && (
        <TopicInput onGenerate={handleGenerate} />
      )}

      {/* Content Grid */}
      {generatedContent.length > 0 && (
        <ContentGrid
          contents={generatedContent}
          onCopy={handleCopyContent}
          onPublish={handlePublish}
          onRegenerate={() => setGeneratedContent([])}
        />
      )}

      {/* Generation History */}
      {showHistory && <GenerationHistory onClose={() => setShowHistory(false)} />}

      {/* Quick Tips */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Be specific with your topic (e.g., "Resume tips for tech jobs" vs "Career advice")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Select platforms where your target audience is most active</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use "inspirational" tone for success stories, "educational" for tips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Enable carousel for LinkedIn/Instagram for higher engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Review and customize AI content before publishing for authenticity</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}