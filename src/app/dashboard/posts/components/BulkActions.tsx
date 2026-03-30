// app/dashboard/posts/components/BulkActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { MoreHorizontal, Trash2, Calendar as CalendarIcon, Play, FileText } from "lucide-react";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedPostIds: string[];
  onClearSelection: () => void;
}

export function BulkActions({ selectedPostIds, onClearSelection }: BulkActionsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"delete" | "publish" | "schedule" | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!action) return;
    setLoading(true);

    try {
      const response = await fetch("/api/posts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          postIds: selectedPostIds,
          data: action === "schedule" ? { scheduledDate: scheduledDate?.toISOString() } : undefined,
        }),
      });

      if (!response.ok) throw new Error("Action failed");

      toast.success(`Successfully ${action}d ${selectedPostIds.length} posts`);
      onClearSelection();
      setShowDialog(false);
    } catch (error) {
      toast.error(`Failed to ${action} posts`);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (selectedAction: typeof action) => {
    setAction(selectedAction);
    setShowDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
        <span className="text-sm font-medium">
          {selectedPostIds.length} post(s) selected
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog("publish")}>
              <Play className="h-4 w-4 mr-2" />
              Publish Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("schedule")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("delete")} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "delete" && "Delete Posts"}
              {action === "publish" && "Publish Posts"}
              {action === "schedule" && "Schedule Posts"}
            </DialogTitle>
            <DialogDescription>
              {action === "delete" && `Are you sure you want to delete ${selectedPostIds.length} posts? This cannot be undone.`}
              {action === "publish" && `Publish ${selectedPostIds.length} posts now?`}
              {action === "schedule" && "Select a date and time for these posts."}
            </DialogDescription>
          </DialogHeader>

          {action === "schedule" && (
            <Calendar
              mode="single"
              selected={scheduledDate}
              onSelect={setScheduledDate}
              className="rounded-md border"
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading || (action === "schedule" && !scheduledDate)}
              variant={action === "delete" ? "destructive" : "default"}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}