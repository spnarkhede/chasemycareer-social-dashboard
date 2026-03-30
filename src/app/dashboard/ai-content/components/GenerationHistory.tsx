// app/dashboard/ai-content/components/GenerationHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface GenerationHistoryProps {
  onClose: () => void;
}

export function GenerationHistory({ onClose }: GenerationHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const response = await fetch("/api/ai/history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    if (!confirm("Clear all generation history?")) return;
    
    try {
      await fetch("/api/ai/history", { method: "DELETE" });
      setHistory([]);
      toast.success("History cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <SheetTitle>Generation History</SheetTitle>
            </div>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No generation history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{item.topic.slice(0, 30)}...</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.platforms.length} platforms</span>
                    <span>•</span>
                    <span>{item.contentCount} contents</span>
                    <span>•</span>
                    <span>{(item.generationTime / 1000).toFixed(1)}s</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => {
                      toast.info("Regeneration feature coming soon");
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}