// app/dashboard/posts/components/PostForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostType, PostStatus, Platform, Post } from "@/types/post";
import { generateContent, contentTemplates } from "@/lib/content-templates";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const postSchema = z.object({
  caption: z.string().min(1, "Caption is required").max(2200, "Caption too long"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  type: z.nativeEnum(PostType),
  status: z.nativeEnum(PostStatus),
  scheduledDate: z.date().optional(),
  mediaUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.array(z.string()),
});

type PostFormValues = z.infer<typeof postSchema>;

const platforms: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Pinterest", 
  "Medium", "Facebook", "Website Blog", "Twitter"
];

const postTypes: PostType[] = ["text", "carousel", " "image", "reel", "video", "diagram"];

interface PostFormProps {
  initialData?: Post;
  onSubmit: (values: PostFormValues) => void;
  onCancel: () => void;
}

export function PostForm({ initialData, onSubmit, onCancel }: PostFormProps) {
  const [newTag, setNewTag] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: initialData?.caption || "",
      platforms: initialData?.platforms || [],
      type: initialData?.type || "text",
      status: initialData?.status || "draft",
      scheduledDate: initialData?.scheduledDate,
      mediaUrl: initialData?.mediaUrl || "",
      tags: initialData?.tags || [],
    },
  });

  const selectedPlatforms = watch("platforms");
  const tags = watch("tags");
  const postType = watch("type");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue("tags", [...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tags.filter(tag => tag !== tagToRemove));
  };

  const applyTemplate = (templateKey: keyof typeof contentTemplates) => {
    const template = contentTemplates[templateKey];
    const exampleVars = {
      common mistake: "sending the same resume to every job",
      problem: "waste hours customizing applications",
      "Tip 1": "Use our keyword extractor to match job descriptions",
      "Tip 2": "Lead with metrics, not duties",
      "Tip 3": "Add a 'Career Highlights' section at the top",
    };
    
    const generated = generateContent(templateKey, selectedPlatforms[0] || "LinkedIn", exampleVars);
    setValue("caption", generated);
    setTemplateOpen(false);
    toast.success("Template applied! Customize for your voice.");
  };

  const onSubmitForm = (values: PostFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Caption with AI Template Helper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="caption">Content / Caption *</Label>
          <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Use Template
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <p className="text-sm font-medium mb-2">Quick Start Templates</p>
              <div className="space-y-1">
                {Object.entries(contentTemplates).map(([key, template]) => (
                  <Button
                    key={key}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    onClick={() => applyTemplate(key as keyof typeof contentTemplates)}
                  >
                    {template.hook.slice(0, 40)}...
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea
          id="caption"
          placeholder="Write your audience-catching content here... Use templates or start from scratch."
          className="min-h-[140px] resize-y font-mono text-sm"
          {...register("caption")}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{watch("caption")?.length || 0} / 2,200 characters</span>
          <span>Pro tip: Keep LinkedIn posts under 1,300 chars for best engagement</span>
        </div>
        {errors.caption && (
          <p className="text-sm text-destructive">{errors.caption.message}</p>
        )}
      </div>

      {/* Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Post Type *</Label>
          <Select onValueChange={(value) => setValue("type", value as PostType)} defaultValue={postType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {postTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select onValueChange={(value) => setValue("status", value as PostStatus)} defaultValue={watch("status")}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">📝 Draft</SelectItem>
              <SelectItem value="scheduled">📅 Scheduled</SelectItem>
              <SelectItem value="backlog">📦 Backlog</SelectItem>
              <SelectItem value="published">✅ Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-2">
        <Label>Target Platforms *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border rounded-lg bg-muted/20">
          {platforms.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={platform}
                checked={selectedPlatforms?.includes(platform)}
                onCheckedChange={(checked) => {
                  const current = selectedPlatforms || [];
                  setValue("platforms", checked 
                    ? [...current, platform] 
                    : current.filter(p => p !== platform)
                  );
                }}
              />
              <Label htmlFor={platform} className="text-sm font-normal cursor-pointer select-none">
                {platform}
              </Label>
            </div>
          ))}
        </div>
        {errors.platforms && (
          <p className="text-sm text-destructive">{errors.platforms.message}</p>
        )}
      </div>

      {/* Scheduling & Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Schedule Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watch("scheduledDate") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch("scheduledDate") 
                  ? format(watch("scheduledDate")!, "PPP h:mm a") 
                  : "Pick date & time"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watch("scheduledDate")}
                onSelect={(date) => {
                  // Preserve time if already set, otherwise default to 2pm
                  const newDate = date ? new Date(date) : undefined;
                  if (newDate && !watch("scheduledDate")) {
                    newDate.setHours(14, 0, 0, 0);
                  }
                  setValue("scheduledDate", newDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Best times: LinkedIn 8-10am, Instagram 11am-1pm, Twitter 12-3pm
          </p>
        </div>

        <div className="space-y-2">
          <Label>Media URL (Optional)</Label>
          <Input
            placeholder="https://example.com/image.jpg"
            {...register("mediaUrl")}
          />
          {errors.mediaUrl && (
            <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
          )}
          {postType === "video" || postType === "reel" ? (
            <p className="text-xs text-muted-foreground">
              Tip: Use .mp4, max 4GB. Instagram Reels: 90s max, TikTok: 10min max
            </p>
          ) : postType === "image" || postType === "carousel" ? (
            <p className="text-xs text-muted-foreground">
              Tip: 1080x1080px (square) or 1080x1350px (portrait) works best
            </p>
          ) : null}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag (e.g., resume-tips, ai-tools)..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" size="icon" onClick={addTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
              #{tag}
              <button 
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-muted-foreground">
              Add tags to organize content (e.g., #career-tips, #success-story)
            </span>
          )}
        </div>
      </div>

      {/* Platform-Specific Previews (Collapsible) */}
      {selectedPlatforms?.length > 1 && (
        <div className="rounded-lg border p-4 bg-muted/10">
          <p className="text-sm font-medium mb-2">Platform Optimization Tips</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {selectedPlatforms.includes("Twitter") && (
              <li>• Twitter: Keep under 280 chars. Add 1-2 relevant hashtags.</li>
            )}
            {selectedPlatforms.includes("Instagram") && (
              <li>• Instagram: Add 3-5 niche hashtags. Use line breaks for readability.</li>
            )}
            {selectedPlatforms.includes("LinkedIn") && (
              <li>• LinkedIn: Professional tone. Add a question to boost comments.</li>
            )}
            {selectedPlatforms.includes("TikTok") && (
              <li>• TikTok: Hook in first 3 seconds. Use trending sounds when relevant.</li>
            )}
          </ul>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}