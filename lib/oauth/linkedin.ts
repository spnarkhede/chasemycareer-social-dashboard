// lib/oauth/linkedin.ts
import { prisma } from "@/lib/prisma";

const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
  authUrl: "https://www.linkedin.com/oauth/v2/authorization",
  tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
  scopes: ["r_emailaddress", "r_liteprofile", "w_member_social", "r_fullprofile"],
};

export async function getLinkedInAuthUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CONFIG.clientId,
    redirect_uri: LINKEDIN_CONFIG.redirectUri,
    state,
    scope: LINKEDIN_CONFIG.scopes.join(" "),
  });

  return `${LINKEDIN_CONFIG.authUrl}?${params.toString()}`;
}

export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  userId: string;
  email: string;
  name: string;
}> {
  // Exchange code for token
  const tokenResponse = await fetch(LINKEDIN_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LINKEDIN_CONFIG.redirectUri,
      client_id: LINKEDIN_CONFIG.clientId,
      client_secret: LINKEDIN_CONFIG.clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get LinkedIn access token");
  }

  const tokenData = await tokenResponse.json();

  // Get user profile
  const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await profileResponse.json();

  // Get email
  const emailResponse = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  const emailData = await emailResponse.json();
  const email = emailData.elements?.[0]?.["handle~"]?.emailAddress;

  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
    refreshToken: tokenData.refresh_token,
    userId: profile.id,
    email,
    name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
  };
}

export async function refreshLinkedInToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}> {
  const response = await fetch(LINKEDIN_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: LINKEDIN_CONFIG.clientId,
      client_secret: LINKEDIN_CONFIG.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh LinkedIn token");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
  };
}