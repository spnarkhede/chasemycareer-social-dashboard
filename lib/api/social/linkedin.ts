// lib/api/social/linkedin.ts
import { BaseSocialClient, SocialAccount, PublishParams, PublishResult } from "./base";

export class LinkedInClient extends BaseSocialClient {
  protected platform = "LinkedIn";
  protected baseUrl = "https://api.linkedin.com/v2";

  async authenticate(code: string, redirectUri: string): Promise<SocialAccount> {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error("LinkedIn authentication failed");
    }

    const data = await response.json();

    // Get user profile
    const profile = await this.request(
      "GET",
      "/me",
      data.access_token
    ) as any;

    return {
      id: crypto.randomUUID(),
      platform: "LinkedIn",
      accountId: profile.id,
      accountName: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      userId: "", // Will be set by caller
    };
  }

  async refreshTokens(refreshToken: string) {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async publish(account: SocialAccount, params: PublishParams): Promise<PublishResult> {
    try {
      // Get person URN
      const profile = await this.request(
        "GET",
        "/me",
        account.accessToken
      ) as any;

      const personUrn = `urn:li:person:${profile.id}`;

      // Create post
      const postData: any = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: params.content,
            },
            shareMediaCategory: params.media?.length ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      // Add media if present
      if (params.media?.length) {
        // Upload media first (simplified - in production, use LinkedIn's media upload API)
        postData.specificContent["com.linkedin.ugc.ShareContent"].media = [
          {
            status: "READY",
            description: { text: "Post media" },
            media: params.media[0],
            title: { text: "Media" },
          },
        ];
      }

      const result = await this.request(
        "POST",
        "/ugcPosts",
        account.accessToken,
        postData
      ) as any;

      return {
        success: true,
        postId: result.id,
        postUrl: `https://www.linkedin.com/feed/update/${result.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getAnalytics(account: SocialAccount, startDate: Date, endDate: Date) {
    // LinkedIn analytics API implementation
    return this.request(
      "GET",
      `/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalEntity,role))`,
      account.accessToken
    );
  }

  async getProfile(account: SocialAccount) {
    return this.request("GET", "/me", account.accessToken);
  }
}

export const linkedInClient = new LinkedInClient();