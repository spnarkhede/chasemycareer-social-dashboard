// app/dashboard/profile-optimizer/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandInfoForm } from "./components/BrandInfoForm";
import { PlatformSelector } from "./components/PlatformSelector";
import { ProfileGenerator } from "./components/ProfileGenerator";
import { OptimizationScore } from "@/components/optimizer/OptimizationScore";
import { Sparkles, Target, TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";
import { BrandInfo, SocialPlatform, OptimizationResult } from "@/types/optimizer";
import { toast } from "sonner";

export default function ProfileOptimizerPage() {
  const [step, setStep] = useState(1);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBrandInfoSubmit = (info: BrandInfo) => {
    setBrandInfo(info);
    setStep(2);
    toast.success("Brand info saved!");
  };

  const handlePlatformSelect = (platforms: SocialPlatform[]) => {
    setSelectedPlatforms(platforms);
  };

  const handleGenerate = async () => {
    if (!brandInfo || selectedPlatforms.length === 0) {
      toast.error("Please complete all steps");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/optimizer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandInfo,
          platforms: selectedPlatforms,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setResult(data);
      setStep(3);
      toast.success("Profiles generated successfully!");
    } catch (error) {
      toast.error("Failed to generate profiles");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Profile Optimizer
          </h1>
          <p className="text-muted-foreground">
            Create optimized social media profiles for growth & monetization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Step: </span>
            <span className="font-medium">{step}/3</span>
          </div>
          <Progress value={(step / 3) * 100} className="w-32" />
        </div>
      </div>

      {/* Step 1: Brand Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Step 1: Tell Us About Your Brand
            </CardTitle>
            <CardDescription>
              This helps us create personalized profiles for each platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandInfoForm onSubmit={handleBrandInfoSubmit} />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Platform Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Step 2: Select Your Platforms
            </CardTitle>
            <CardDescription>
              Choose which platforms you want to optimize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onSelect={handlePlatformSelect}
            />

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={selectedPlatforms.length === 0 || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Optimized Profiles
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Summary</CardTitle>
              <CardDescription>
                Your overall profile optimization score and potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <OptimizationScore score={result.overallScore} size="lg" />
                  <p className="text-sm mt-2">Overall Score</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-500">{result.estimatedGrowthPotential}</p>
                  <p className="text-sm mt-2">Growth Potential</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-500">{result.estimatedRevenuePotential}</p>
                  <p className="text-sm mt-2">Revenue Potential</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <CheckCircle2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-500">
                    {result.completedItems}/{result.totalChecklistItems}
                  </p>
                  <p className="text-sm mt-2">Tasks Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Actions */}
          {result.priorityActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🎯 Priority Actions</CardTitle>
                <CardDescription>Complete these first for maximum impact</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.priorityActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Platform Profiles */}
          <ProfileGenerator result={result} />

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(1)} variant="outline">
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}