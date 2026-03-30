// components/ai/LoadingState.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Image, FileText } from "lucide-react";

interface LoadingStateProps {
  progress: number;
  stage?: string;
}

export function LoadingState({ progress, stage = "Generating..." }: LoadingStateProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Sparkles className="h-12 w-12 text-primary animate-pulse relative" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">AI is Creating Your Content</h3>
            <p className="text-sm text-muted-foreground">{stage}</p>
          </div>

          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing</span>
              <span>{progress}%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs">Captions</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
              <Image className="h-5 w-5 text-primary" />
              <span className="text-xs">Media</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-xs">Optimization</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}