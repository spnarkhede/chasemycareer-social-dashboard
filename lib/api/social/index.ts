// lib/api/social/index.ts
import { linkedInClient } from "./linkedin";
// Import other platform clients as you implement them
// import { instagramClient } from "./instagram";
// import { twitterClient } from "./twitter";

import { BaseSocialClient, SocialAccount, PublishParams, PublishResult } from "./base";

class UnifiedSocialClient {
  private clients: Map<string, BaseSocialClient> = new Map();

  constructor() {
    this.registerClient("linkedin", linkedInClient);
    // this.registerClient("instagram", instagramClient);
    // this.registerClient("twitter", twitterClient);
  }

  private registerClient(platform: string, client: BaseSocialClient) {
    this.clients.set(platform.toLowerCase(), client);
  }

  getClient(platform: string): BaseSocialClient {
    const client = this.clients.get(platform.toLowerCase());
    if (!client) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return client;
  }

  async authenticate(platform: string, code: string, redirectUri: string): Promise<SocialAccount> {
    const client = this.getClient(platform);
    const account = await client.authenticate(code, redirectUri);
    return account;
  }

  async publish(platform: string, account: SocialAccount, params: PublishParams): Promise<PublishResult> {
    const client = this.getClient(platform);
    return client.publish(account, params);
  }

  async getAnalytics(platform: string, account: SocialAccount, startDate: Date, endDate: Date) {
    const client = this.getClient(platform);
    return client.getAnalytics(account, startDate, endDate);
  }

  async getProfile(platform: string, account: SocialAccount) {
    const client = this.getClient(platform);
    return client.getProfile(account);
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.clients.keys());
  }
}

export const socialClient = new UnifiedSocialClient();