// lib/ai-service.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CONTENT_TEMPLATES = {
  linkedin: `You are a career content expert. Write a professional LinkedIn post about: {topic}
- Keep it under 1300 characters
- Include 3-5 relevant hashtags
- Add a clear call-to-action
- Use emojis sparingly (2-3 max)
- Start with a strong hook`,

  instagram: `You are a social media expert. Write an engaging Instagram caption about: {topic}
- Keep it under 2200 characters
- Include 10-15 niche hashtags
- Add line breaks for readability
- Include a question to boost engagement
- Use 3-5 relevant emojis`,

  twitter: `You are a Twitter content expert. Write a thread-worthy tweet about: {topic}
- Keep it under 275 characters
- Include 1-2 relevant hashtags
- Start with a strong hook
- Add a clear CTA`,

  tiktok: `You are a TikTok script expert. Write a 60-second video script about: {topic}
- Include hook (first 3 seconds)
- Main content (3 key points)
- Call-to-action at end
- Suggest trending sounds`,
};

export async function generateCaption({
  topic,
  platform,
  tone = "professional",
  additionalContext,
}: {
  topic: string;
  platform: string;
  tone?: string;
  additionalContext?: string;
}) {
  const template = CONTENT_TEMPLATES[platform as keyof typeof CONTENT_TEMPLATES] 
    || CONTENT_TEMPLATES.linkedin;

  const prompt = `${template}

Topic: ${topic}
Tone: ${tone}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Write the content now:`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}

export async function optimizeCaption({
  caption,
  platform,
  goal = "engagement",
}: {
  caption: string;
  platform: string;
  goal?: "engagement" | "clicks" | "shares" | "follows";
}) {
  const prompt = `Optimize this social media caption for ${goal} on ${platform}:

Current Caption:
${caption}

Provide:
1. Improved version (keep core message)
2. Explanation of changes
3. Suggested hashtags (5 max)
4. Best posting time recommendation

Format as JSON.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
    system: "You are a social media optimization expert. Respond in JSON format.",
  });

  return JSON.parse(response.content[0].text);
}

export async function generateContentIdeas({
  niche,
  platform,
  count = 10,
}: {
  niche: string;
  platform: string;
  count?: number;
}) {
  const prompt = `Generate ${count} content ideas for a career development brand on ${platform}.

Niche: ${niche}
Target Audience: Job seekers, career changers, professionals

For each idea provide:
- Hook/Title
- Content Type (text, carousel, video, etc.)
- Key Points (3 bullets)
- Expected Engagement Level

Format as JSON array.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    system: "You are a content strategy expert. Respond in JSON format.",
  });

  return JSON.parse(response.content[0].text);
}

export async function analyzeCompetitorContent({
  competitorPosts,
  yourNiche,
}: {
  competitorPosts: string[];
  yourNiche: string;
}) {
  const prompt = `Analyze these competitor posts and provide insights:

Competitor Posts:
${competitorPosts.join("\n---\n")}

My Niche: ${yourNiche}

Provide:
1. Common themes/topics
2. Engagement patterns
3. Content gaps I can exploit
4. Recommended content strategy
5. Posting frequency recommendation

Format as JSON.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
    system: "You are a competitive intelligence expert. Respond in JSON format.",
  });

  return JSON.parse(response.content[0].text);
}