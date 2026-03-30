// lib/social-client.ts
import { LinkedInClient } from "./platforms/linkedin";
import { InstagramClient } from "./platforms/instagram";
import { TwitterClient } from "./platforms/twitter";

export class UnifiedSocialClient {
  private clients: Record<string, any> = {};

  constructor(tokens: Record<string, string>) {
    if (tokens.linkedin) {
      this.clients.linkedin = new LinkedInClient(tokens.linkedin);
    }
    if (tokens.instagram) {
      this.clients.instagram = new InstagramClient(tokens.instagram);
    }
    if (tokens.twitter) {
      this.clients.twitter = new TwitterClient(tokens.twitter);
    }
  }

  async publish({
    platform,
    content,
    media,
    scheduledDate,
  }: {
    platform: string;
    content: string;
    media?: string[];
    scheduledDate?: Date;
  }) {
    const client = this.clients[platform.toLowerCase()];
    if (!client) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return await client.createPost({
      content,
      media,
      scheduledDate,
    });
  }

  async getAnalytics({
    platform,
    startDate,
    endDate,
  }: {
    platform: string;
    startDate: Date;
    endDate: Date;
  }) {
    const client = this.clients[platform.toLowerCase()];
    if (!client) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return await client.getAnalytics({ startDate, endDate });
  }
}