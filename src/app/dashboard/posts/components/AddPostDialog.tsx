// app/dashboard/posts/components/AddPostDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PostForm } from "./PostForm";
import { PostFormValues } from "./PostForm"; // Adjust import as needed
import { Post } from "@/types/post";

interface AddPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PostFormValues) => void;
  editingPost?: Post | null;
}

export function AddPostDialog({ open, onOpenChange, onSubmit, editingPost }: AddPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPost ? "✏️ Edit Post" : "✨ Create New Post"}
          </DialogTitle>
          <DialogDescription>
            {editingPost 
              ? "Update your content for all selected platforms." 
              : "Create audience-catching content for LinkedIn, Instagram, TikTok, and more."}
          </DialogDescription>
        </DialogHeader>
        
        <PostForm
          initialData={editingPost || undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}