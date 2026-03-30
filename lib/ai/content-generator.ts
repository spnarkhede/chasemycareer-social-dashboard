// lib/ai/content-generator.ts
import { generateContentWithQwen } from "./qwen";
import { generateMediaForTopic } from "@/lib/media/media-generator";
import { getPlatformSpec } from "@/lib/social/platform-config";
import { 
  ContentGenerationRequest, 
  ContentGenerationResponse, 
  GeneratedContent,
  Platform 
} from "@/types/ai-content";
import { getPlatformSpec } from "@/lib/social/platform-config";

export async function generateCompleteContent(
  request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
  const startTime = Date.now();
  const contents: GeneratedContent[] = [];
  let totalReach = 0;

  // Generate content for each platform in parallel
  const platformPromises = request.platforms.map(async (platform) => {
    const specs = getPlatformSpec(platform);
    
    // Determine content type based on platform and request
    const contentType = determineContentType(platform, request);

    try {
      // Generate text content with Qwen
      const aiContent = await generateContentWithQwen({
        topic: request.topic,
        platform,
        tone: request.tone || "professional",
        targetAudience: request.targetAudience || "Job seekers and professionals",
        goal: request.goal || "engagement",
        contentType,
        platformSpecs: {
          maxCaptionLength: specs.maxCaptionLength,
          maxHashtags: specs.maxHashtags,
          toneRecommendation: specs.toneRecommendation,
          hashtagStrategy: specs.hashtagStrategy,
          emojiUsage: specs.emojiUsage,
        },
      });

      // Generate media if requested
      let media = [];
      if (request.includeMedia) {
        const mediaResults = await generateMediaForTopic(
          request.topic,
          platform,
          request.includeVideo
        );
        
        if (contentType === "carousel" && mediaResults.images.length >= 3) {
          media = [{
            type: "carousel" as const,
            urls: mediaResults.images.slice(0, 5).map(img => img.url),
            thumbnails: mediaResults.images.slice(0, 5).map(img => img.thumbnail),
            alt: `${request.topic} carousel`,
          }];
        } else if (contentType === "video" && mediaResults.videos.length > 0) {
          media = [{
            type: "video" as const,
            urls: mediaResults.videos.map(v => v.url),
            thumbnails: mediaResults.videos.map(v => v.thumbnail),
            alt: `${request.topic} video`,
          }];
        } else if (mediaResults.images.length > 0) {
          media = [{
            type: "image" as const,
            urls: mediaResults.images.slice(0, 3).map(img => img.url),
            thumbnails: mediaResults.images.slice(0, 3).map(img => img.thumbnail),
            alt: `${request.topic} image`,
          }];
        }
      }

      // Generate carousel slides if applicable
      let carouselSlides;
      if (contentType === "carousel") {
        carouselSlides = await generateCarouselSlides(request.topic, platform);
      }

      // Generate video script if applicable
      let videoScript;
      if (contentType === "video" || contentType === "reel") {
        videoScript = {
          hook: aiContent.caption.split("\n")[0],
          mainPoints: aiContent.keywords.slice(0, 3),
          cta: aiContent.callToAction,
          duration: specs.videoMaxLength > 60 ? 60 : 30,
        };
      }

      const content: GeneratedContent = {
        id: crypto.randomUUID(),
        topic: request.topic,
        platform,
        contentType,
        caption: aiContent.caption,
        hashtags: aiContent.hashtags,
        keywords: aiContent.keywords,
        fullText: aiContent.fullText,
        callToAction: aiContent.callToAction,
        estimatedReach: aiContent.estimatedReach,
        bestPostingTime: aiContent.bestPostingTime,
        media,
        carouselSlides,
        videoScript,
        seoMetadata: aiContent.seoMetadata,
        createdAt: new Date(),
        status: "draft",
      };

      totalReach += aiContent.estimatedReach.average;

      return content;
    } catch (error) {
      console.error(`Failed to generate content for ${platform}:`, error);
      return null;
    }
  });

  const results = await Promise.all(platformPromises);
  
  // Filter out failed generations
  contents.push(...results.filter((c): c is GeneratedContent => c !== null));

  return {
    success: contents.length > 0,
    contents,
    totalPlatforms: contents.length,
    estimatedTotalReach: totalReach,
    generationTime: Date.now() - startTime,
    creditsUsed: contents.length,
  };
}

function determineContentType(platform: Platform, request: ContentGenerationRequest): ContentType {
  const specs = getPlatformSpec(platform);
  
  if (request.includeCarousel && specs.supportedContentTypes.includes("carousel")) {
    return "carousel";
  }
  if (request.includeVideo && specs.supportedContentTypes.includes("video")) {
    return "video";
  }
  if (platform === "Instagram" || platform === "TikTok") {
    return "reel";
  }
  if (platform === "Medium" || platform === "Website Blog") {
    return "text";
  }
  if (specs.supportedContentTypes.includes("image")) {
    return "image";
  }
  
  return "text";
}

async function generateCarouselSlides(topic: string, platform: string) {
  // Generate 5-slide carousel structure
  return [
    {
      title: `📌 ${topic}`,
      content: "Hook slide - grab attention",
    },
    {
      title: "💡 Key Point 1",
      content: "First valuable insight",
    },
    {
      title: "💡 Key Point 2",
      content: "Second valuable insight",
    },
    {
      title: "💡 Key Point 3",
      content: "Third valuable insight",
    },
    {
      title: "✅ Call to Action",
      content: "Save, share, and follow for more!",
    },
  ];
}