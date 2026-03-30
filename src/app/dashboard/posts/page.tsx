// app/dashboard/posts/page.tsx
"use client";

import { useState } from "react";
import { usePosts } from "./hooks/usePosts";
import { PostCard } from "./components/PostCard";
import { PostFilters } from "./components/PostFilters";
import { AddPostDialog } from "./components/AddPostDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { PostStatus, Platform, PostType } from "@/types/post";
import { toast } from "sonner";

export default function PostsPage() {
  const {
    posts,
    postsByStatus,
    filters,
    setFilters,
    isDialogOpen,
    setIsDialogOpen,
    editingPost,
    setEditingPost,
    addPost,
    updatePost,
    deletePost,
    changeStatus,
    copyToClipboard,
    publishPost,
  } = usePosts();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<PostStatus | "all">("all");

  const handleAddPost = (values: any) => {
    addPost(values);
    toast.success("Post created successfully!");
  };

  const handleUpdatePost = (values: any) => {
    if (editingPost) {
      updatePost(editingPost.id, values);
      toast.success("Post updated!");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost(id);
      toast.success("Post deleted");
    }
  };

  const handlePublish = async (post: any) => {
    try {
      await publishPost(post);
      toast.success(`Published to ${post.platforms.join(", ")}!`);
    } catch (error) {
      toast.error("Failed to publish. Please try again.");
    }
  };

  const displayedPosts = activeTab === "all" 
    ? posts 
    : postsByStatus[activeTab as PostStatus] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post Manager</h1>
          <p className="text-muted-foreground">
            Create, schedule, and publish content across all platforms
          </p>
        </div>
        
        <AddPostDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={editingPost ? handleUpdatePost : handleAddPost}
          editingPost={editingPost}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts by caption or tags..."
            className="pl-9"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2">
          <PostFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-10 w-10"
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs by Status */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({postsByStatus.draft?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({postsByStatus.scheduled?.length || 0})</TabsTrigger>
          <TabsTrigger value="backlog">Backlog ({postsByStatus.backlog?.length || 0})</TabsTrigger>
          <TabsTrigger value="published">Published ({postsByStatus.published?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground mb-4">
                {activeTab === "all" 
                  ? "No posts yet. Create your first post!" 
                  : `No ${activeTab} posts. Try another tab or create new content.`}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Create Post
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
              : "space-y-4"
            }>
              {displayedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(post) => {
                    setEditingPost(post);
                    setIsDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  onStatusChange={changeStatus}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t text-sm text-muted-foreground">
        <p>
          Showing {displayedPosts.length} of {posts.length} posts
          {filters.search && ` matching "${filters.search}"`}
        </p>
        <div className="flex gap-4">
          <span>📝 Drafts: {postsByStatus.draft?.length}</span>
          <span>📅 Scheduled: {postsByStatus.scheduled?.length}</span>
          <span>✅ Published: {postsByStatus.published?.length}</span>
        </div>
      </div>
    </div>
  );
}