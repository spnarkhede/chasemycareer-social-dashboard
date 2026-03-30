// components/links/LinkPage.tsx
"use client";

import { useState } from "react";
import { LinkPage as LinkPageType, LinkTheme, Link, SocialProfile } from "@/types/links";
import { LinkCard } from "./LinkCard";
import { SocialIcons } from "./SocialIcons";
import { AnalyticsPopup } from "./AnalyticsPopup";
import { Share2, QrCode, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_ICONS, PLATFORM_COLORS } from "@/types/links";

interface LinkPageProps {
  linkPage: LinkPageType;
  theme: LinkTheme;
  isPreview?: boolean;
}

export function LinkPage({ linkPage, theme, isPreview = false }: LinkPageProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleLinkClick = async (linkId: string, url: string) => {
    if (isPreview) return;

    // Track click
    await fetch("/api/links/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, linkPageId: linkPage.id }),
    });

    // Open link
    window.open(url, "_blank");
  };

  const shareUrl = isPreview 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${linkPage.username}`
    : window.location.href;

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        background: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: linkPage.font === "inter" ? "Inter, sans-serif" : 
                   linkPage.font === "serif" ? "Georgia, serif" : 
                   linkPage.font === "mono" ? "Courier New, monospace" : "sans-serif",
      }}
    >
      {/* Animated Background (if gradient) */}
      {theme.backgroundColor.includes("gradient") && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-gradient" />
      )}

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          {/* Avatar */}
          {linkPage.avatar && (
            <div className="mb-4 inline-block">
              <img
                src={linkPage.avatar}
                alt={linkPage.displayName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 shadow-xl"
              />
              {linkPage.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Display Name */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {linkPage.displayName}
          </h1>

          {/* Bio */}
          {linkPage.bio && (
            <p className="text-sm sm:text-base opacity-80 max-w-md mx-auto mb-4">
              {linkPage.bio}
            </p>
          )}

          {/* Social Profiles */}
          {linkPage.socialProfiles.length > 0 && (
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {linkPage.socialProfiles.map((profile) => (
                <a
                  key={profile.id}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: PLATFORM_COLORS[profile.platform as keyof typeof PLATFORM_COLORS] + "33" }}
                  title={profile.platform}
                >
                  <span className="text-xl">{PLATFORM_ICONS[profile.platform as keyof typeof PLATFORM_ICONS]}</span>
                </a>
              ))}
            </div>
          )}
        </header>

        {/* Links */}
        <main className="space-y-3 sm:space-y-4">
          {linkPage.links.map((link, index) => (
            <LinkCard
              key={link.id}
              link={link}
              theme={theme}
              index={index}
              onClick={() => handleLinkClick(link.id, link.url)}
            />
          ))}
        </main>

        {/* Footer Actions (Only for owner when logged in) */}
        {!isPreview && (
          <footer className="mt-8 pt-8 border-t border-white/10">
            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShare(true)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Download QR code
                  window.open(`/api/links/qr?username=${linkPage.username}`, "_blank");
                }}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
            </div>

            <p className="text-center text-xs opacity-50 mt-6">
              Powered by{" "}
              <a href="https://chasemycareer.com" className="underline hover:opacity-80">
                Chase My Career
              </a>
            </p>
          </footer>
        )}

        {/* Analytics Popup */}
        {showAnalytics && (
          <AnalyticsPopup
            linkPageId={linkPage.id}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}