// lib/ai/qwen.ts
import axios from "axios";
import { z } from "zod";

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/api/v1";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen-max";

// Response schema for content generation
const contentGenerationSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  keywords: z.array(z.string()),
  fullText: z.string(),
  callToAction: z.string(),
  estimatedReach: z.object({
    min: z.number(),
    max: z.number(),
    average: z.number(),
  }),
  bestPostingTime: z.string(),
  carouselSlides: z.array(z.object({
    title: z.string(),
    content: z.string(),
    image: z.string().optional(),
  })).optional(),
  videoScript: z.object({
    hook: z.string(),
    mainPoints: z.array(z.string()),
    cta: z.string(),
    duration: z.number(),
  }).optional(),
  seoMetadata: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }).optional(),
});

export interface QwenContentGenerationParams {
  topic: string;
  platform: string;
  tone: string;
  targetAudience: string;
  goal: string;
  contentType: string;
  platformSpecs: {
    maxCaptionLength: number;
    maxHashtags: number;
    toneRecommendation: string;
    hashtagStrategy: string;
    emojiUsage: string;
  };
}

export async function generateContentWithQwen(
  params: QwenContentGenerationParams
): Promise<z.infer<typeof contentGenerationSchema>> {
  const prompt = buildContentGenerationPrompt(params);

  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/services/aigc/text-generation/generation`,
      {
        model: QWEN_MODEL,
        input: {
          messages: [
            {
              role: "system",
              content: "You are an expert social media content creator specializing in career development content. Generate platform-optimized content that drives engagement and provides value to job seekers and professionals.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          result_format: "json",
          temperature: 0.7,
          max_tokens: 2000,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.output.choices[0].message.content;
    
    // Parse JSON response
    const parsed = JSON.parse(content);
    
    // Validate against schema
    const validated = contentGenerationSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error("Qwen API Error:", error);
    throw new Error("Failed to generate content with Qwen AI");
  }
}

export async function generateImagePromptWithQwen(topic: string): Promise<string> {
  const prompt = `Generate a detailed image prompt for a professional career development post about: "${topic}"

Include:
- Scene description
- Colors and mood
- Style (professional, modern, clean)
- Any text overlay suggestions
- Aspect ratio recommendation

Respond in plain text, max 200 words.`;

  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/services/aigc/text-generation/generation`,
      {
        model: QWEN_MODEL,
        input: {
          messages: [
            { role: "system", content: "You are an expert visual content creator." },
            { role: "user", content: prompt },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 500,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.output.choices[0].message.content;
  } catch (error) {
    console.error("Qwen Image Prompt Error:", error);
    return `Professional career development image about ${topic}`;
  }
}

export async function generateVideoScriptWithQwen(
  topic: string,
  platform: string,
  duration: number
): Promise<{ hook: string; mainPoints: string[]; cta: string }> {
  const prompt = `Create a ${duration}-second video script for ${platform} about: "${topic}"

Requirements:
- Hook (first 3 seconds): Attention-grabbing opening
- Main Points: 3 key points to cover
- CTA: Clear call-to-action at the end
- Tone: Engaging and authentic
- Format: Short sentences, speakable text

Respond in JSON format:
{
  "hook": "string",
  "mainPoints": ["point1", "point2", "point3"],
  "cta": "string"
}`;

  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/services/aigc/text-generation/generation`,
      {
        model: QWEN_MODEL,
        input: {
          messages: [
            { role: "system", content: "You are an expert video scriptwriter for social media." },
            { role: "user", content: prompt },
          ],
        },
        parameters: {
          result_format: "json",
          temperature: 0.8,
          max_tokens: 800,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.output.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Qwen Video Script Error:", error);
    throw new Error("Failed to generate video script");
  }
}

function buildContentGenerationPrompt(params: QwenContentGenerationParams): string {
  return `Create complete social media content for ${params.platform} about: "${params.topic}"

PLATFORM SPECIFICATIONS:
- Maximum caption length: ${params.platformSpecs.maxCaptionLength} characters
- Maximum hashtags: ${params.platformSpecs.maxHashtags}
- Recommended tone: ${params.platformSpecs.toneRecommendation}
- Hashtag strategy: ${params.platformSpecs.hashtagStrategy}
- Emoji usage: ${params.platformSpecs.emojiUsage}

CONTENT REQUIREMENTS:
- Tone: ${params.tone}
- Target Audience: ${params.targetAudience}
- Goal: ${params.goal}
- Content Type: ${params.contentType}

GENERATE THE FOLLOWING IN JSON FORMAT:
{
  "caption": "Main post caption (optimized for ${params.platform})",
  "hashtags": ["relevant", "hashtags", "for", "this", "topic"],
  "keywords": ["seo", "keywords", "for", "discovery"],
  "fullText": "Complete long-form text version",
  "callToAction": "Clear CTA for engagement",
  "estimatedReach": {
    "min": 100,
    "max": 10000,
    "average": 2500
  },
  "bestPostingTime": "Optimal posting time",
  ${params.contentType === "carousel" ? `"carouselSlides": [{"title": "Slide 1", "content": "Content for slide 1"}],` : ""}
  ${params.contentType === "video" ? `"videoScript": {"hook": "...", "mainPoints": [], "cta": "...", "duration": ${duration}},` : ""}
  "seoMetadata": {
    "title": "SEO title",
    "description": "SEO description",
    "tags": ["seo", "tags"]
  }
}

IMPORTANT:
- Respond ONLY in valid JSON format
- No markdown, no explanations
- Optimize for ${params.platform} algorithm
- Include trending hashtags for career niche
- Make content actionable and valuable`;
}

export async function testQwenConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/services/aigc/text-generation/generation`,
      {
        model: QWEN_MODEL,
        input: {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello" },
          ],
        },
        parameters: {
          max_tokens: 50,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, message: "Qwen AI connected successfully" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Connection failed" 
    };
  }
}