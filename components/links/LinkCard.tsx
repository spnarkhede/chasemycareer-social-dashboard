// components/links/LinkCard.tsx
"use client";

import { Link, LinkTheme } from "@/types/links";
import { ExternalLink, Mail, Phone, FileText, Video, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  link: Link;
  theme: LinkTheme;
  index: number;
  onClick: () => void;
}

export function LinkCard({ link, theme, index, onClick }: LinkCardProps) {
  const getIcon = () => {
    if (link.icon) return <span className="text-xl">{link.icon}</span>;
    
    switch (link.type) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "phone":
        return <Phone className="h-5 w-5" />;
      case "file":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "image":
        return <Image className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const buttonStyles = {
    rounded: "rounded-lg",
    square: "rounded-none",
    pill: "rounded-full",
  };

  const animationStyles = {
    none: "",
    fade: "animate-fade-in",
    slide: "animate-slide-in",
    bounce: "animate-bounce-in",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 flex items-center gap-4 transition-all duration-300 group",
        "hover:scale-[1.02] active:scale-[0.98]",
        buttonStyles[theme.buttonStyle],
        animationStyles[theme.animation],
      )}
      style={{
        backgroundColor: theme.accentColor + "20",
        border: `1px solid ${theme.accentColor}40`,
        animationDelay: `${index * 100}ms`,
      }}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Thumbnail */}
      {link.thumbnail && (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={link.thumbnail}
            alt={link.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Icon (if no thumbnail) */}
      {!link.thumbnail && (
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: theme.accentColor + "30" }}
        >
          {getIcon()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-base sm:text-lg">{link.title}</h3>
        {link.description && (
          <p className="text-sm opacity-70 line-clamp-1">{link.description}</p>
        )}
      </div>

      {/* Arrow */}
      <ExternalLink className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
}