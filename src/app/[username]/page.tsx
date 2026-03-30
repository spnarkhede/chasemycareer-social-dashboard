// app/[username]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LinkPage } from "@/components/links/LinkPage";
import { trackView } from "@/lib/links/analytics";
import { Metadata } from "next";
import { AVAILABLE_THEMES, PLATFORM_ICONS } from "@/types/links";

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const linkPage = await prisma.linkPage.findUnique({
    where: { username: params.username },
    include: {
      links: { where: { isActive: true }, orderBy: { order: "asc" } },
      socialProfiles: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });

  if (!linkPage || !linkPage.isActive) {
    return {
      title: "Page Not Found",
      description: "This link page does not exist or is not active.",
    };
  }

  return {
    title: linkPage.seoTitle || `${linkPage.displayName} | Links`,
    description: linkPage.seoDescription || linkPage.bio || `Check out ${linkPage.displayName}'s links`,
    openGraph: {
      title: linkPage.seoTitle || linkPage.displayName,
      description: linkPage.seoDescription || linkPage.bio,
      images: linkPage.seoImage ? [{ url: linkPage.seoImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: linkPage.seoTitle || linkPage.displayName,
      description: linkPage.seoDescription || linkPage.bio,
      images: linkPage.seoImage ? [linkPage.seoImage] : undefined,
    },
  };
}

export default async function LinkPagePublic({ params }: PageProps) {
  const linkPage = await prisma.linkPage.findUnique({
    where: { username: params.username },
    include: {
      links: { 
        where: { 
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        }, 
        orderBy: { order: "asc" } 
      },
      socialProfiles: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });

  if (!linkPage || !linkPage.isActive) {
    notFound();
  }

  // Track view
  await trackView({
    linkPageId: linkPage.id,
    userId: linkPage.userId,
  });

  // Update view count
  await prisma.linkPage.update({
    where: { id: linkPage.id },
    data: { viewCount: { increment: 1 } },
  });

  // Get theme
  const theme = AVAILABLE_THEMES.find(t => t.id === linkPage.theme) || AVAILABLE_THEMES[0];

  return (
    <LinkPage
      linkPage={linkPage}
      theme={theme}
      isPreview={false}
    />
  );
}