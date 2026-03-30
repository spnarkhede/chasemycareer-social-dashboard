// components/shared/PlatformIcon.tsx
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlatformIcon({ platform, size = "md", className }: PlatformIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Platform brand colors for fallback icons
  const brandColors: Record<string, string> = {
    LinkedIn: "bg-[#0A66C2]",
    Instagram: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
    TikTok: "bg-black border border-zinc-700",
    YouTube: "bg-[#FF0000]",
    Pinterest: "bg-[#E60023]",
    Medium: "bg-black",
    Facebook: "bg-[#1877F2]",
    "Website Blog": "bg-primary",
    Twitter: "bg-black",
  };

  // Platform initials for fallback
  const initials: Record<string, string> = {
    LinkedIn: "in",
    Instagram: "IG",
    TikTok: "TT",
    YouTube: "YT",
    Pinterest: "Pin",
    Medium: "M",
    Facebook: "f",
    "Website Blog": "WB",
    Twitter: "X",
  };

  return (
    <div 
      className={cn(
        "rounded-md flex items-center justify-center text-white font-bold text-xs",
        sizeClasses[size],
        brandColors[platform] || "bg-muted-foreground",
        className
      )}
      title={platform}
    >
      {initials[platform] || platform.charAt(0)}
    </div>
  );
}