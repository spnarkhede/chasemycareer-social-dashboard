// lib/media/media-generator.ts
import { searchUnsplashImages } from "./unsplash";
import { searchPexelsMedia } from "./pexels";
import { searchPixabayMedia } from "./pixabay";
import { MediaSearchResult } from "@/types/ai-content";
import { generateImagePromptWithQwen } from "@/lib/ai/qwen";

export async function generateMediaForTopic(
  topic: string,
  platform: string,
  includeVideo: boolean = false
): Promise<{ images: MediaSearchResult[]; videos: MediaSearchResult[] }> {
  // Generate optimized search query using Qwen
  const imagePrompt = await generateImagePromptWithQwen(topic);
  
  // Extract keywords from prompt for search
  const searchQuery = `${topic} career professional business`;

  // Search all free sources in parallel
  const [unsplashImages, pexelsImages, pixabayImages] = await Promise.all([
    searchUnsplashImages(searchQuery, 5),
    searchPexelsMedia(searchQuery, 5, "photo"),
    searchPixabayMedia(searchQuery, 5, "image"),
  ]);

  // Combine and deduplicate
  const allImages = [...unsplashImages, ...pexelsImages, ...pixabayImages]
    .slice(0, 10);

  let videos: MediaSearchResult[] = [];
  if (includeVideo) {
    const [pexelsVideos, pixabayVideos] = await Promise.all([
      searchPexelsMedia(searchQuery, 3, "video"),
      searchPixabayMedia(searchQuery, 3, "video"),
    ]);
    videos = [...pexelsVideos, ...pixabayVideos].slice(0, 5);
  }

  return {
    images: allImages,
    videos,
  };
}