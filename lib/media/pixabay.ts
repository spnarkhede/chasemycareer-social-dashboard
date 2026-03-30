// lib/media/pixabay.ts
import { MediaSearchResult } from "@/types/ai-content";

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

export async function searchPixabayMedia(
  query: string,
  limit: number = 10,
  mediaType: "image" | "video" = "image"
): Promise<MediaSearchResult[]> {
  try {
    const endpoint = mediaType === "image" ? "" : "/videos";
    const response = await fetch(
      `https://pixabay.com/api/${endpoint}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const hits = data.hits || [];

    if (mediaType === "image") {
      return hits.map((hit: any) => ({
        id: hit.id.toString(),
        url: hit.largeImageURL,
        thumbnail: hit.previewURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        alt: hit.tags,
        photographer: hit.user,
        source: "pixabay" as const,
      }));
    } else {
      return hits.map((hit: any) => ({
        id: hit.id.toString(),
        url: hit.videos?.large?.url || "",
        thumbnail: hit.videos?.large?.url?.replace(".mp4", ".jpg") || "",
        width: hit.videos?.large?.width || 0,
        height: hit.videos?.large?.height || 0,
        alt: hit.tags,
        photographer: hit.user,
        source: "pixabay" as const,
      }));
    }
  } catch (error) {
    console.error("Pixabay API Error:", error);
    return [];
  }
}