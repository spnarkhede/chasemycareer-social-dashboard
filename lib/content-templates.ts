// lib/content-templates.ts
export const contentTemplates = {
  careerTips: {
    hook: "🚀 Stop doing [common mistake] in your job search",
    body: "Most job seekers [problem]. Here's what actually works:\n\n✅ [Tip 1]\n✅ [Tip 2]\n✅ [Tip 3]\n\nSave this for your next application ↓",
    cta: "What's your biggest job search challenge? Comment below 👇",
    platforms: ["LinkedIn", "Twitter", "Instagram"],
  },
  
  successStory: {
    hook: "✨ From [struggle] to [win] in [timeframe]",
    body: "[Name] was [starting point].\n\nAfter using our [method/tool]:\n🎯 [Result 1]\n🎯 [Result 2]\n🎯 [Result 3]\n\nYour turn starts today.",
    cta: "Ready for your transformation? Link in bio 🔗",
    platforms: ["Instagram", "LinkedIn", "Facebook", "TikTok"],
  },
  
  toolHighlight: {
    hook: "🤖 This AI tool just changed my resume game",
    body: "I tested [Tool Name] for [use case]:\n\n📊 Before: [metric]\n📈 After: [metric]\n\nWhy it works:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]",
    cta: "Try it free → [link]",
    platforms: ["Twitter", "LinkedIn", "Medium", "Website Blog"],
  },
  
  quickWin: {
    hook: "⏱️ 60-second career upgrade:",
    body: "[Actionable micro-tip]\n\nExample:\n❌ \"Responsible for managing projects\"\n✅ \"Led 3 cross-functional projects delivering $X impact\"\n\nSmall tweak, big difference.",
    cta: "What will you update today? 💬",
    platforms: ["Twitter", "Instagram Stories", "TikTok", "LinkedIn"],
  },
  
  industryInsight: {
    hook: "📊 [Industry] hiring trend you need to know",
    body: "New data shows [statistic/finding].\n\nWhat this means for you:\n🔹 [Implication 1]\n🔹 [Implication 2]\n🔹 [Action step]\n\nStay ahead of the curve.",
    cta: "Follow for more career intelligence →",
    platforms: ["LinkedIn", "Medium", "Website Blog", "Twitter"],
  },
};

export function generateContent(template: keyof typeof contentTemplates, platform: string, customVars?: Record<string, string>) {
  const t = contentTemplates[template];
  let content = `${t.hook}\n\n${t.body}\n\n${t.cta}`;
  
  if (customVars) {
    Object.entries(customVars).forEach(([key, value]) => {
      content = content.replace(`[${key}]`, value);
    });
  }
  
  // Platform-specific optimizations
  if (platform === "Twitter") {
    content = content.slice(0, 275) + (content.length > 275 ? "…" : "");
  }
  if (platform === "Instagram") {
    content = content + "\n\n#CareerTips #JobSearch #ChaseMyCareer";
  }
  if (platform === "LinkedIn") {
    content = content + "\n\n🔗 Learn more: chasemycareer.com";
  }
  
  return content;
}