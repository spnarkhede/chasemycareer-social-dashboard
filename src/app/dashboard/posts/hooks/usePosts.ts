// app/dashboard/posts/hooks/usePosts.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { Post, PostFilters, PostStatus, Platform, PostType } from "@/types/post";
import { mockPosts } from "../lib/mockPosts";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filters, setFilters] = useState<PostFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Filter posts based on criteria
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filters.status?.length && !filters.status.includes(post.status)) return false;
      if (filters.platforms?.length && !post.platforms.some(p => filters.platforms?.includes(p))) return false;
      if (filters.type?.length && !filters.type.includes(post.type)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!post.caption.toLowerCase().includes(searchLower) && 
            !post.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      if (filters.dateRange && post.scheduledDate) {
        const postDate = new Date(post.scheduledDate);
        if (postDate < filters.dateRange.start || postDate > filters.dateRange.end) return false;
      }
      return true;
    });
  }, [posts, filters]);

  // Group posts by status for tabbed view
  const postsByStatus = useMemo(() => {
    const groups: Record<PostStatus, Post[]> = {
      draft: [],
      scheduled: [],
      published: [],
      backlog: [],
    };
    filteredPosts.forEach(post => {
      groups[post.status].push(post);
    });
    return groups;
  }, [filteredPosts]);

  const addPost = useCallback((newPost: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    const post: Post = {
      ...newPost,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPosts(prev => [post, ...prev]);
    setIsDialogOpen(false);
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => 
      post.id === id 
        ? { ...post, ...updates, updatedAt: new Date() }
        : post
    ));
    setEditingPost(null);
    setIsDialogOpen(false);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  }, []);

  const changeStatus = useCallback((id: string, newStatus: PostStatus) => {
    setPosts(prev => prev.map(post =>
      post.id === id
        ? { 
            ...post, 
            status: newStatus,
            publishedDate: newStatus === "published" ? new Date() : post.publishedDate,
            updatedAt: new Date()
          }
        : post
    ));
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  }, []);

  const publishPost = useCallback(async (post: Post) => {
    // In production: Call API to publish to selected platforms
    // For now: Simulate with status change + toast
    changeStatus(post.id, "published");
    
    // Show platform-specific publish confirmations
    const platforms = post.platforms.join(", ");
    return { success: true, message: `Published to ${platforms}` };
  }, [changeStatus]);

  return {
    posts: filteredPosts,
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
  };
}