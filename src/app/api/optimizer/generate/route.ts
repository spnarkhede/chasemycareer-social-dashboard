// app/api/optimizer/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBio } from "@/lib/optimizer/bio-templates";
import { getPlatformSpec, getMonetizationOptions, getGrowthStrategies } from "@/lib/optimizer/platform-config";
import { BrandInfo, SocialPlatform, OptimizedProfile, OptimizationResult, ChecklistItem } from "@/types/optimizer";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandInfo, platforms } = await request.json();

    // Generate optimized profiles for each platform
    const profiles: OptimizedProfile[] = platforms.map((platform: SocialPlatform) => {
      const spec = getPlatformSpec(platform);
      const monetization = getMonetizationOptions(platform);
      const growthStrategies = getGrowthStrategies(platform);

      // Generate bio
      const bio = generateBio(platform, brandInfo);

      // Generate headline
      const headline = generateHeadline(platform, brandInfo);

      // Create checklist
      const checklist = createChecklist(platform, brandInfo);

      // Calculate optimization score
      const score = calculateOptimizationScore(brandInfo, checklist);

      return {
        platform,
        headline,
        bio,
        profilePictureTips: getProfilePictureTips(platform),
        bannerTips: getBannerTips(platform),
        linkStrategy: getLinkStrategy(platform, brandInfo),
        recommendedLinks: getRecommendedLinks(platform, brandInfo),
        contentPillars: getContentPillars(brandInfo),
        postingFrequency: getPostingFrequency(platform),
        bestPostingTimes: spec.bestPostingTimes,
        hashtagStrategy: getHashtagStrategy(platform),
        engagementTips: getEngagementTips(platform),
        growthTips: growthStrategies.map(s => s.description),
        monetizationTips: monetization.slice(0, 3),
        optimizationScore: score,
        checklist,
      };
    });

    // Calculate overall results
    const totalChecklistItems = profiles.reduce((acc, p) => acc + p.checklist.length, 0);
    const completedItems = profiles.reduce(
      (acc, p) => acc + p.checklist.filter(c => c.completed).length,
      0
    );
    const overallScore = Math.round(
      profiles.reduce((acc, p) => acc + p.optimizationScore, 0) / profiles.length
    );

    const result: OptimizationResult = {
      overallScore,
      profiles,
      totalChecklistItems,
      completedItems,
      estimatedGrowthPotential: estimateGrowth(overallScore),
      estimatedRevenuePotential: estimateRevenue(overallScore, platforms.length),
      priorityActions: getPriorityActions(profiles),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate profiles error:", error);
    return NextResponse.json(
      { error: "Failed to generate profiles" },
      { status: 500 }
    );
  }
}

function generateHeadline(platform: SocialPlatform, brandInfo: BrandInfo): string {
  const templates: Record<SocialPlatform, string[]> = {
    instagram: [
      "{tagline} | {niche}",
      "Helping {targetAudience} {valueProposition}",
      "{businessName} Founder | {niche} Expert",
    ],
    linkedin: [
      "{tagline} at {businessName}",
      "Helping {targetAudience} | {valueProposition}",
      "{niche} Expert | {uniqueSellingPoints[0]}",
    ],
    twitter: [
      "Building {businessName} | {niche}",
      "{tagline} | {valueProposition}",
      "Sharing {niche} tips daily",
    ],
    tiktok: [
      "{niche} Creator",
      "{tagline}",
      "Helping {targetAudience}",
    ],
    youtube: [
      "Welcome to {businessName}",
      "{tagline} | New Videos Weekly",
      "{niche} Tips & Tutorials",
    ],
    facebook: [
      "{businessName} - {tagline}",
      "Official Page | {niche}",
      "Community for {targetAudience}",
    ],
    pinterest: [
      "{tagline} | {niche}",
      "Curating {niche} Ideas",
      "{valueProposition}",
    ],
    medium: [
      "Writing about {niche}",
      "{tagline}",
      "{businessName} Founder",
    ],
    threads: [
      "{tagline}",
      "Building {businessName}",
      "{niche} Insights",
    ],
  };

  const template = templates[platform][0];
  return template
    .replace(/{businessName}/g, brandInfo.businessName)
    .replace(/{tagline}/g, brandInfo.tagline)
    .replace(/{niche}/g, brandInfo.niche)
    .replace(/{targetAudience}/g, brandInfo.targetAudience)
    .replace(/{valueProposition}/g, brandInfo.valueProposition)
    .replace(/{uniqueSellingPoints\[0\]}/g, brandInfo.uniqueSellingPoints[0] || "Expert");
}

function createChecklist(platform: SocialPlatform, brandInfo: BrandInfo): ChecklistItem[] {
  const baseChecklist: ChecklistItem[] = [
    {
      id: `${platform}-profile-pic`,
      task: "Upload professional profile picture",
      category: "profile",
      priority: "high",
      completed: !!brandInfo.website,
      points: 10,
    },
    {
      id: `${platform}-bio`,
      task: "Complete bio with keywords",
      category: "profile",
      priority: "high",
      completed: brandInfo.description.length > 50,
      points: 15,
    },
    {
      id: `${platform}-link`,
      task: "Add link to website/landing page",
      category: "profile",
      priority: "high",
      completed: !!brandInfo.website,
      points: 10,
    },
    {
      id: `${platform}-content-1`,
      task: "Post first piece of content",
      category: "content",
      priority: "high",
      completed: false,
      points: 20,
    },
    {
      id: `${platform}-engage-1`,
      task: "Engage with 10 accounts in niche",
      category: "engagement",
      priority: "medium",
      completed: false,
      points: 10,
    },
    {
      id: `${platform}-consistency`,
      task: "Post consistently for 30 days",
      category: "growth",
      priority: "medium",
      completed: false,
      points: 25,
    },
    {
      id: `${platform}-monetize`,
      task: "Apply for monetization program",
      category: "monetization",
      priority: "low",
      completed: false,
      points: 10,
    },
  ];

  return baseChecklist;
}

function calculateOptimizationScore(brandInfo: BrandInfo, checklist: ChecklistItem[]): number {
  const totalPoints = checklist.reduce((acc, item) => acc + item.points, 0);
  const earnedPoints = checklist
    .filter(item => item.completed)
    .reduce((acc, item) => acc + item.points, 0);
  
  const baseScore = brandInfo.uniqueSellingPoints.length >= 3 ? 20 : 10;
  const checklistScore = (earnedPoints / totalPoints) * 80;
  
  return Math.round(baseScore + checklistScore);
}

function estimateGrowth(score: number): string {
  if (score >= 80) return "10K+ in 3 months";
  if (score >= 60) return "5K+ in 3 months";
  if (score >= 40) return "2K+ in 3 months";
  return "1K+ in 3 months";
}

function estimateRevenue(score: number, platformCount: number): string {
  if (score >= 80 && platformCount >= 5) return "$5K-$20K/month";
  if (score >= 60 && platformCount >= 3) return "$2K-$10K/month";
  if (score >= 40) return "$500-$5K/month";
  return "$100-$2K/month";
}

function getPriorityActions(profiles: OptimizedProfile[]): string[] {
  const actions: string[] = [];
  
  profiles.forEach(profile => {
    const incomplete = profile.checklist.filter(c => !c.completed && c.priority === "high");
    incomplete.slice(0, 2).forEach(item => {
      actions.push(`[${profile.platform}] ${item.task}`);
    });
  });
  
  return actions.slice(0, 5);
}

// Helper functions (implement based on platform specs)
function getProfilePictureTips(platform: SocialPlatform): string[] {
  return [
    "Use high-resolution image (at least 400x400px)",
    "Show your face or brand logo clearly",
    "Use consistent branding across platforms",
    "Ensure good lighting and professional appearance",
  ];
}

function getBannerTips(platform: SocialPlatform): string[] {
  return [
    "Use platform-recommended dimensions",
    "Include your value proposition",
    "Add social proof (followers, clients, etc.)",
    "Keep text minimal and readable",
  ];
}

function getLinkStrategy(platform: SocialPlatform, brandInfo: BrandInfo): string {
  return `Use ${brandInfo.website} as your primary link. Consider using a link-in-bio tool for multiple links.`;
}

function getRecommendedLinks(platform: SocialPlatform, brandInfo: BrandInfo): string[] {
  return [
    brandInfo.website,
    `${brandInfo.website}/free-resource`,
    `${brandInfo.website}/contact`,
  ];
}

function getContentPillars(brandInfo: BrandInfo): string[] {
  return [
    `${brandInfo.niche} Tips`,
    `Success Stories`,
    `Behind the Scenes`,
    `Industry News`,
    `Educational Content`,
  ];
}

function getPostingFrequency(platform: SocialPlatform): string {
  const frequencies: Record<SocialPlatform, string> = {
    instagram: "1-2 posts daily + 5-10 stories",
    linkedin: "3-5 posts per week",
    twitter: "5-10 tweets daily",
    tiktok: "1-3 videos daily",
    youtube: "1-2 videos per week",
    facebook: "1-2 posts daily",
    pinterest: "10-20 pins daily",
    medium: "2-4 articles per week",
    threads: "5-10 posts daily",
  };
  return frequencies[platform];
}

function getHashtagStrategy(platform: SocialPlatform): string {
  const strategies: Record<SocialPlatform, string> = {
    instagram: "Use 10-15 relevant hashtags (mix of small, medium, large)",
    linkedin: "Use 3-5 professional hashtags",
    twitter: "Use 1-2 trending hashtags",
    tiktok: "Use 3-5 trending and niche hashtags",
    youtube: "Use 5-10 tags in video settings",
    facebook: "Use 2-5 relevant hashtags",
    pinterest: "Use 5-10 keywords in pin descriptions",
    medium: "Use 3-5 topic tags",
    threads: "Hashtags not yet supported",
  };
  return strategies[platform];
}

function getEngagementTips(platform: SocialPlatform): string[] {
  return [
    "Reply to all comments within 24 hours",
    "Engage with 10 accounts in your niche daily",
    "Ask questions to encourage comments",
    "Use polls and interactive features",
    "Collaborate with other creators",
  ];
}