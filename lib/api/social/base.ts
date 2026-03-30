// lib/api/social/base.ts
import { ApiError } from "@/lib/api-error";

export interface SocialAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId: string;
}

export interface PublishParams {
  content: string;
  media?: string[];
  scheduledDate?: Date;
  options?: Record<string, any>;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export abstract class BaseSocialClient {
  protected abstract platform: string;
  protected abstract baseUrl: string;

  protected async request<T>(
    method: string,
    endpoint: string,
    accessToken: string,
    data?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw ApiError.externalApi(
        `${this.platform} API error`,
        { status: response.status, error }
      );
    }

    return response.json();
  }

  abstract authenticate(code: string, redirectUri: string): Promise<SocialAccount>;
  abstract refreshTokens(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
  abstract publish(account: SocialAccount, params: PublishParams): Promise<PublishResult>;
  abstract getAnalytics(account: SocialAccount, startDate: Date, endDate: Date): Promise<any>;
  abstract getProfile(account: SocialAccount): Promise<any>;
}