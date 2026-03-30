// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/security/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import posthog from "posthog-js";
import { PostHogProvider } from "@/lib/monitoring/posthog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Chase My Career | Social Media Manager",
    template: "%s | Chase My Career",
  },
  description: "Complete social media management platform for career professionals. Automate posts, track analytics, and grow your audience across all platforms.",
  keywords: ["social media", "career", "automation", "analytics", "LinkedIn", "Instagram", "content management"],
  authors: [{ name: "Chase My Career", url: "https://chasemycareer.com" }],
  creator: "Chase My Career",
  publisher: "Chase My Career",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chasemycareer.com",
    siteName: "Chase My Career",
    title: "Chase My Career | Social Media Manager",
    description: "Complete social media management platform for career professionals",
    images: [
      {
        url: "https://chasemycareer.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Chase My Career",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chase My Career | Social Media Manager",
    description: "Complete social media management platform for career professionals",
    images: ["https://chasemycareer.com/og-image.jpg"],
    creator: "@ChaseMyCareers",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://chasemycareer.com"),
  alternates: {
    canonical: "/",
  },
};

// Initialize PostHog
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    person_profiles: "identified_only",
    session_recording: {
      recordCrossOriginIframes: true,
    },
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <PostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              forcedTheme="dark"
            >
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </PostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}