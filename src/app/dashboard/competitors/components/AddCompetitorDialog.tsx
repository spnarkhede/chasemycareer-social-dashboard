// app/dashboard/competitors/components/AddCompetitorDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Platform } from "@/types/post";
import { NICHE_OPTIONS } from "../lib/mockCompetitors";
import { toast } from "sonner";

const PLATFORMS: Platform[] = [
  "LinkedIn", "Instagram", "TikTok", "YouTube", "Twitter", "Facebook"
];

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (competitor: any) => void;
}

export function AddCompetitorDialog({ open, onOpenChange, onAdd }: AddCompetitorDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    platform: "" as Platform | "",
    niche: "",
    website: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.handle || !formData.platform) {
      toast.error("Please fill in required fields");
      return;
    }
    
    onAdd({
      ...formData,
      tags: [formData.niche].filter(Boolean),
    });
    setFormData({ name: "", handle: "", platform: "" as Platform | "", niche: "", website: "" });
  };

  const handleAutoFill = () => {
    // Simulate fetching public data based on handle
    setIsSearching(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: prev.handle.replace("@", "").toUpperCase(),
        niche: NICHE_OPTIONS[Math.floor(Math.random() * NICHE_OPTIONS.length)],
      }));
      setIsSearching(false);
      toast.success("Profile found!");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Competitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Track New Competitor</DialogTitle>
          <DialogDescription>
            Add a competitor handle to monitor their performance and strategy.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="handle">Handle / URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="handle"
                  placeholder="@username"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAutoFill}
                  disabled={isSearching || !formData.handle}
                >
                  <Search className={cn("h-4 w-4", isSearching && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              placeholder="Competitor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">Primary Niche</Label>
            <Select 
              value={formData.niche} 
              onValueChange={(v) => setFormData({ ...formData, niche: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHE_OPTIONS.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Start Tracking</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}