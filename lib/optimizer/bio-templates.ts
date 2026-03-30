// lib/optimizer/bio-templates.ts
import { BrandInfo, SocialPlatform } from "@/types/optimizer";

export const BIO_TEMPLATES: Record<SocialPlatform, string[]> = {
  instagram: [
    "🎯 {valueProposition} | {niche} Expert\n📍 {location}\n👇 {cta}",
    "{tagline}\n✨ Helping {targetAudience} {valueProposition}\n🔗 {link}",
    "📈 {establishedYear}+ Years in {niche}\n💡 {uniqueSellingPoints[0]}\n👇 Free Resource",
    "🏆 {uniqueSellingPoints[0]} | {uniqueSellingPoints[1]}\n📧 {email}\n🔗 {link}",
    "💼 {businessName}\n🎯 {valueProposition}\n📩 DM for collaborations",
  ],
  linkedin: [
    "{headline} | {valueProposition}\n\nHelping {targetAudience} achieve {goal} through {niche} expertise.\n\n🏆 {uniqueSellingPoints[0]}\n📧 {email}",
    "{tagline}\n\n{description}\n\nSpecializing in: {niche}\n\nLet's connect! 👋",
    "🎯 {valueProposition}\n\n{description}\n\n✅ {uniqueSellingPoints[0]}\n✅ {uniqueSellingPoints[1]}\n\n📩 {email}",
  ],
  twitter: [
    "{tagline} | {niche}\n📈 {valueProposition}\n👇 {link}",
    "Building {businessName} | {targetAudience}\n💡 Daily tips on {niche}\n🔗 {link}",
    "{description}\n\nFollow for {niche} insights\n\n📧 {email}",
  ],
  tiktok: [
    "{tagline} 🎯\n{valueProposition}\n👇 {link}",
    "{niche} Creator ✨\n{uniqueSellingPoints[0]}\n📩 {email}",
    "Helping {targetAudience} {valueProposition}\nNew videos daily! 🎬",
  ],
  youtube: [
    "Welcome to {businessName}! 🎬\n\n{description}\n\nNew videos every {postingFrequency}\n\n📧 Business: {email}\n🔗 {link}",
    "{tagline}\n\nSubscribe for {niche} content that helps you {valueProposition}\n\n📩 Collaborations: {email}",
  ],
  facebook: [
    "{businessName} - {tagline}\n\n{description}\n\n📍 {location}\n📧 {email}\n🔗 {link}",
    "Welcome to our community! 👋\n\n{valueProposition}\n\nFollow for daily {niche} tips!",
  ],
  pinterest: [
    "{tagline} | {niche}\n✨ {valueProposition}\n🔗 {link}",
    "Curating the best {niche} ideas\n💡 {uniqueSellingPoints[0]}\n👇 Shop my favorites",
    "{businessName}\n{description}\n\nFollow for daily inspiration!",
  ],
  medium: [
    "{tagline}\n\nWriting about {niche}, {valueProposition}, and {targetAudience} growth.\n\n📧 {email}",
    "{description}\n\nFollow for weekly insights on {niche}\n\n🔗 {link}",
  ],
  threads: [
    "{tagline} | {niche}\n{valueProposition}\nIG: @{instagramHandle}",
    "Building in public 🚀\n{description}\n\nFollow the journey!",
  ],
};

export function generateBio(platform: SocialPlatform, brandInfo: BrandInfo): string {
  const templates = BIO_TEMPLATES[platform];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template
    .replace(/{businessName}/g, brandInfo.businessName)
    .replace(/{tagline}/g, brandInfo.tagline)
    .replace(/{description}/g, brandInfo.description)
    .replace(/{valueProposition}/g, brandInfo.valueProposition)
    .replace(/{targetAudience}/g, brandInfo.targetAudience)
    .replace(/{niche}/g, brandInfo.niche)
    .replace(/{location}/g, brandInfo.location)
    .replace(/{email}/g, brandInfo.email)
    .replace(/{link}/g, brandInfo.website)
    .replace(/{establishedYear}/g, brandInfo.establishedYear?.toString() || "5+")
    .replace(/{uniqueSellingPoints\[0\]}/g, brandInfo.uniqueSellingPoints[0] || "Industry Expert")
    .replace(/{uniqueSellingPoints\[1\]}/g, brandInfo.uniqueSellingPoints[1] || "Trusted by 10K+")
    .replace(/{goal}/g, brandInfo.primaryGoal)
    .replace(/{cta}/g, getCTA(platform))
    .replace(/{postingFrequency}/g, getPostingFrequency(platform))
    .replace(/{instagramHandle}/g, "chasemycareer");
}

function getCTA(platform: SocialPlatform): string {
  const ctas: Record<SocialPlatform, string> = {
    instagram: "Click the link below",
    linkedin: "Let's connect",
    twitter: "Follow for daily tips",
    tiktok: "Watch latest video",
    youtube: "Subscribe now",
    facebook: "Join our community",
    pinterest: "Save this pin",
    medium: "Read latest article",
    threads: "Join the conversation",
  };
  return ctas[platform];
}

function getPostingFrequency(platform: SocialPlatform): string {
  const frequencies: Record<SocialPlatform, string> = {
    instagram: "Tuesday & Friday",
    linkedin: "Weekdays",
    twitter: "Daily",
    tiktok: "Daily",
    youtube: "Weekly",
    facebook: "3x Weekly",
    pinterest: "Daily",
    medium: "Weekly",
    threads: "Daily",
  };
  return frequencies[platform];
}