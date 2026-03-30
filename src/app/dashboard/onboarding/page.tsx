// app/dashboard/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Zap, Users, BarChart3, Calendar } from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    id: "connect",
    title: "Connect Social Accounts",
    description: "Link your social media accounts to start managing content",
    icon: Zap,
  },
  {
    id: "create",
    title: "Create Your First Post",
    description: "Create and schedule your first social media post",
    icon: Calendar,
  },
  {
    id: "team",
    title: "Invite Team Members",
    description: "Add team members to collaborate on content",
    icon: Users,
  },
  {
    id: "analytics",
    title: "Set Up Analytics",
    description: "Connect analytics to track your performance",
    icon: BarChart3,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleCompleteStep = async (stepId: string) => {
    // Mark step as complete
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }

    // Move to next step or finish
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // Onboarding complete
      await fetch("/api/users/onboarding/complete", { method: "POST" });
      toast.success("Onboarding complete! Welcome to Chase My Career");
      router.push("/dashboard");
    }
  };

  const progress = ((completedSteps.length / steps.length) * 100).toFixed(0);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Chase My Career!</h1>
        <p className="text-muted-foreground">
          Let's get you set up in a few simple steps
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{progress}% Complete</span>
        </div>
        <Progress value={parseInt(progress)} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {steps[currentStep].icon({ className: "h-6 w-6 text-primary" })}
            </div>
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step content based on current step */}
            {currentStep === 0 && (
              <div className="space-y-3">
                <p>Connect your social media accounts to start managing content:</p>
                <div className="grid grid-cols-2 gap-3">
                  {["LinkedIn", "Instagram", "Twitter", "Facebook"].map((platform) => (
                    <Button key={platform} variant="outline" className="justify-start gap-2">
                      <div className="h-4 w-4 rounded bg-primary" />
                      Connect {platform}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3">
                <p>Ready to create your first post?</p>
                <Button onClick={() => router.push("/dashboard/posts?new=true")}>
                  Create Post
                </Button>
              </div>
            )}

            {/* Add more step content */}

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={() => handleCompleteStep(steps[currentStep].id)}>
                {currentStep === steps.length - 1 ? "Finish" : "Continue"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentStep
                ? "w-8 bg-primary"
                : completedSteps.includes(index)
                ? "w-2 bg-primary"
                : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}