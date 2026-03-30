// lib/media/unsplash.ts
import { createApi } from "unsplash-js";
import { MediaSearchResult } from "@/types/ai-content";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function searchUnsplashImages(
  query: string,
  limit: number = 10
): Promise<MediaSearchResult[]> {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      perPage: limit,
      orientation: "landscape",
    });

    if (result.type === "success") {
      return result.response.results.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnail: photo.urls.thumb,
        width: photo.width,
        height: photo.height,
        alt: photo.alt_description || "Unsplash image",
        photographer: photo.user.name,
        source: "unsplash" as const,
      }));
    }

    return [];
  } catch (error) {
    console.error("Unsplash API Error:", error);
    return [];
  }
}

export async function getUnsplashImage(query: string): Promise<MediaSearchResult | null> {
  const results = await searchUnsplashImages(query, 1);
  return results[0] || null;
}