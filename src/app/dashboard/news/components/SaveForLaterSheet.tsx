// app/dashboard/news/components/SaveForLaterSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NewsItem } from "@/types/news";
import { NewsCard } from "./NewsCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SaveForLaterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedItems: NewsItem[];
  onSave: (item: NewsItem) => void;
  onMarkRead: (id: string) => void;
}

export function SaveForLaterSheet({ open, onOpenChange, savedItems, onSave, onMarkRead }: SaveForLaterSheetProps) {
  const handleClearAll = () => {
    if (confirm("Remove all saved articles?")) {
      savedItems.forEach(item => onSave(item)); // Unsave all
      toast.success("All saved articles cleared");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              <SheetTitle>Saved Articles</SheetTitle>
            </div>
            {savedItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive gap-1"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
          </div>
          <SheetDescription>
            {savedItems.length} article{savedItems.length !== 1 ? "s" : ""} saved for later reading
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          {savedItems.length > 0 ? (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onSave={onSave}
                  onMarkRead={onMarkRead}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No saved articles yet</p>
              <p className="text-sm">Click the bookmark icon on any article to save it</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}