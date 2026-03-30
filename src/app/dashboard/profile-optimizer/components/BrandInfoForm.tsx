// app/dashboard/profile-optimizer/components/BrandInfoForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { BrandInfo } from "@/types/optimizer";

const brandInfoSchema = z.object({
  businessName: z.string().min(2, "Business name required"),
  tagline: z.string().min(5, "Tagline required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  targetAudience: z.string().min(5, "Target audience required"),
  niche: z.string().min(2, "Niche required"),
  valueProposition: z.string().min(10, "Value proposition required"),
  brandVoice: z.enum(["professional", "casual", "inspirational", "educational", "entertaining"]),
  primaryGoal: z.enum(["awareness", "engagement", "leads", "sales", "community"]),
  website: z.string().url("Valid URL required"),
  email: z.string().email("Valid email required"),
  location: z.string().min(2, "Location required"),
  establishedYear: z.number().optional(),
  teamSize: z.string().optional(),
  uniqueSellingPoints: z.array(z.string()).min(1, "At least one USP required"),
  competitorAccounts: z.array(z.string()).optional(),
  currentFollowers: z.record(z.number()).optional(),
});

type BrandInfoFormValues = z.infer<typeof brandInfoSchema>;

interface BrandInfoFormProps {
  onSubmit: (data: BrandInfo) => void;
}

export function BrandInfoForm({ onSubmit }: BrandInfoFormProps) {
  const [usp, setUsp] = useState("");
  const [usps, setUsps] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BrandInfoFormValues>({
    resolver: zodResolver(brandInfoSchema),
    defaultValues: {
      brandVoice: "professional",
      primaryGoal: "engagement",
      uniqueSellingPoints: [],
    },
  });

  const addUsp = () => {
    if (usp.trim()) {
      setUsps([...usps, usp.trim()]);
      setValue("uniqueSellingPoints", [...usps, usp.trim()]);
      setUsp("");
    }
  };

  const removeUsp = (index: number) => {
    const newUsps = usps.filter((_, i) => i !== index);
    setUsps(newUsps);
    setValue("uniqueSellingPoints", newUsps);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business/Brand Name *</Label>
          <Input
            id="businessName"
            placeholder="Chase My Career"
            {...register("businessName")}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline *</Label>
          <Input
            id="tagline"
            placeholder="Land your dream job in 50 days"
            {...register("tagline")}
          />
          {errors.tagline && (
            <p className="text-sm text-destructive">{errors.tagline.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe what you do, who you help, and how..."
          className="min-h-[100px]"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience *</Label>
          <Input
            id="targetAudience"
            placeholder="Job seekers, career changers, professionals"
            {...register("targetAudience")}
          />
          {errors.targetAudience && (
            <p className="text-sm text-destructive">{errors.targetAudience.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Niche/Industry *</Label>
          <Input
            id="niche"
            placeholder="Career Development, Job Search"
            {...register("niche")}
          />
          {errors.niche && (
            <p className="text-sm text-destructive">{errors.niche.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valueProposition">Value Proposition *</Label>
        <Input
          id="valueProposition"
          placeholder="What unique value do you provide?"
          {...register("valueProposition")}
        />
        {errors.valueProposition && (
          <p className="text-sm text-destructive">{errors.valueProposition.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brandVoice">Brand Voice *</Label>
          <Select onValueChange={(v) => setValue("brandVoice", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="entertaining">Entertaining</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryGoal">Primary Goal *</Label>
          <Select onValueChange={(v) => setValue("primaryGoal", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awareness">Brand Awareness</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="leads">Lead Generation</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="community">Community Building</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website *</Label>
          <Input
            id="website"
            placeholder="https://chasemycareer.com"
            {...register("website")}
          />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@chasemycareer.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="New York, NY"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Unique Selling Points */}
      <div className="space-y-2">
        <Label>Unique Selling Points *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a USP (e.g., AI-powered tools)"
            value={usp}
            onChange={(e) => setUsp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUsp())}
          />
          <Button type="button" size="icon" onClick={addUsp}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {usps.map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {item}
              <button type="button" onClick={() => removeUsp(index)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {errors.uniqueSellingPoints && (
          <p className="text-sm text-destructive">{errors.uniqueSellingPoints.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Continue to Platform Selection
      </Button>
    </form>
  );
}