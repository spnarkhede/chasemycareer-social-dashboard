// app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home, Mail } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application Error:", error);
    }
  }, [error]);

  const errorId = typeof window !== "undefined" ? crypto.randomUUID().slice(0, 8) : "unknown";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We've been notified and are working to fix this issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <p className="font-mono text-xs">
              Error ID: {errorId}
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="font-mono text-xs mt-2 text-destructive">
                {error.message}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1 gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="outline" className="flex-1 gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>If the problem persists, contact support:</p>
            <a href="mailto:support@chasemycareer.com" className="text-primary hover:underline flex items-center justify-center gap-1 mt-1">
              <Mail className="h-3 w-3" />
              support@chasemycareer.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}