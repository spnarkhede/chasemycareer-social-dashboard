// lib/security/api-key-rotation.ts
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { hash, verifyHash } from "./encryption";

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string; // First 8 chars for identification
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAPIKeyParams {
  userId: string;
  name: string;
  permissions: string[];
  expiresAt?: Date;
}

export interface APIKeyResult {
  key: string; // Plain text key (shown only once)
  apiKey: APIKey;
}

/**
 * Generate secure API key
 */
function generateAPIKey(): string {
  const prefix = "cmc_";
  const randomPart = randomBytes(32).toString("hex");
  return `${prefix}${randomPart}`;
}

/**
 * Create new API key
 */
export async function createAPIKey(params: CreateAPIKeyParams): Promise<APIKeyResult> {
  const plainKey = generateAPIKey();
  const keyHash = await hash(plainKey);
  const keyPrefix = plainKey.slice(0, 12);

  const apiKey = await prisma.aPIKey.create({
     {
      userId: params.userId,
      name: params.name,
      keyHash,
      keyPrefix,
      permissions: params.permissions,
      expiresAt: params.expiresAt,
    },
  });

  return {
    key: plainKey,
    apiKey,
  };
}

/**
 * Verify API key
 */
export async function verifyAPIKey(plainKey: string): Promise<APIKey | null> {
  if (!plainKey || !plainKey.startsWith("cmc_")) {
    return null;
  }

  // Find potential keys by prefix
  const prefix = plainKey.slice(0, 12);
  const potentialKeys = await prisma.aPIKey.findMany({
    where: {
      keyPrefix: prefix,
      expiresAt: { gte: new Date() },
    },
  });

  // Verify hash
  for (const apiKey of potentialKeys) {
    const isValid = await verifyHash(plainKey, apiKey.keyHash);
    if (isValid) {
      // Update last used
      await prisma.aPIKey.update({
        where: { id: apiKey.id },
         { lastUsedAt: new Date() },
      });
      return apiKey;
    }
  }

  return null;
}

/**
 * Rotate API key (revoke old, create new)
 */
export async function rotateAPIKey(
  keyId: string,
  userId: string,
  permissions?: string[]
): Promise<APIKeyResult> {
  // Revoke old key
  await prisma.aPIKey.update({
    where: { id: keyId, userId },
     { expiresAt: new Date() },
  });

  // Get old key permissions if not provided
  const oldKey = await prisma.aPIKey.findUnique({
    where: { id: keyId },
  });

  // Create new key
  return createAPIKey({
    userId,
    name: `${oldKey?.name} (Rotated)`,
    permissions: permissions || oldKey?.permissions || [],
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  });
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(keyId: string, userId: string): Promise<void> {
  await prisma.aPIKey.update({
    where: { id: keyId, userId },
     { expiresAt: new Date() },
  });
}

/**
 * List API keys for user
 */
export async function listAPIKeys(userId: string): Promise<APIKey[]> {
  return prisma.aPIKey.findMany({
    where: {
      userId,
      expiresAt: { gte: new Date() },
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      permissions: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
}

/**
 * Check API key permissions
 */
export async function checkAPIKeyPermissions(
  keyId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  const apiKey = await prisma.aPIKey.findUnique({
    where: { id: keyId },
  });

  if (!apiKey || apiKey.expiresAt! < new Date()) {
    return false;
  }

  // Check if key has all required permissions
  return requiredPermissions.every(perm => apiKey.permissions.includes(perm));
}

/**
 * Scheduled key rotation (run quarterly)
 */
export async function rotateAllExpiredKeys(): Promise<number> {
  const expiredKeys = await prisma.aPIKey.findMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  let rotated = 0;
  for (const key of expiredKeys) {
    try {
      await rotateAPIKey(key.id, key.userId);
      rotated++;
    } catch (error) {
      console.error(`Failed to rotate key ${key.id}:`, error);
    }
  }

  return rotated;
}