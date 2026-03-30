// lib/media/pexels.ts
import { MediaSearchResult } from "@/types/ai-content";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function searchPexelsMedia(
  query: string,
  limit: number = 10,
  mediaType: "photo" | "video" = "photo"
): Promise<MediaSearchResult[]> {
  try {
    const endpoint = mediaType === "photo" ? "search" : "videos/search";
    const response = await fetch(
      `https://api.pexels.com/v1/${endpoint}?query=${encodeURIComponent(query)}&per_page=${limit}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY!,
        },
      }
    );

    const data = await response.json();

    if (mediaType === "photo") {
      return data.photos.map((photo: any) => ({
        id: photo.id.toString(),
        url: photo.src.large,
        thumbnail: photo.src.thumbnail,
        width: photo.width,
        height: photo.height,
        alt: photo.alt || "Pexels image",
        photographer: photo.photographer,
        source: "pexels" as const,
      }));
    } else {
      return data.videos.map((video: any) => ({
        id: video.id.toString(),
        url: video.video_files[0]?.link || "",
        thumbnail: video.image,
        width: video.width,
        height: video.height,
        alt: "Pexels video",
        photographer: video.user.name,
        source: "pexels" as const,
      }));
    }
  } catch (error) {
    console.error("Pexels API Error:", error);
    return [];
  }
}