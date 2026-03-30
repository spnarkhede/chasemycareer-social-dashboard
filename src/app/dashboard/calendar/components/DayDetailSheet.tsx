// app/dashboard/calendar/components/DayDetailSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { PostChip } from "./PostChip";
import { format } from "date-fns";
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { PostForm } from "@/app/dashboard/posts/components/PostForm"; // Reuse Step 2 form
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DayDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  posts: Post[];
  onAddPost: (date: Date) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (id: string) => void;
}

export function DayDetailSheet({ open, onOpenChange, date, posts, onAddPost, onEditPost, onDeletePost }: DayDetailSheetProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  if (!date) return null;

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    if (editingPost) {
      onEditPost({ ...editingPost, ...values });
      toast.success("Post updated");
    } else {
      onAddPost(date);
      toast.success("Post created");
    }
    setIsFormOpen(false);
    setEditingPost(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {format(date, "EEEE, MMMM d, yyyy")}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} scheduled
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-3 rounded-lg border bg-card space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-1">
                      {post.platforms.map(p => (
                        <PostChip key={p} post={{ ...post, platforms: [p] }} compact />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(post)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeletePost(post.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{post.caption}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{post.type}</span>
                    <span className="capitalize">{post.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No content scheduled for this day.</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Button className="w-full gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Post for This Day
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reuse Post Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <PostForm
            initialData={editingPost || { 
              scheduledDate: date, 
              platforms: [], 
              type: "text", 
              status: "draft", 
              caption: "", 
              tags: [], 
              createdAt: new Date(), 
              updatedAt: new Date(), 
              id: "" 
            } as any}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPost(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}