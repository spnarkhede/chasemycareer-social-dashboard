// lib/security/audit-logger.ts
import { prisma } from "@/lib/prisma";

export enum AuditEventType {
  // Authentication
  AUTH_LOGIN = "auth.login",
  AUTH_LOGOUT = "auth.logout",
  AUTH_FAILED = "auth.failed",
  AUTH_PASSWORD_RESET = "auth.password_reset",
  AUTH_2FA_ENABLED = "auth.2fa_enabled",
  AUTH_2FA_DISABLED = "auth.2fa_disabled",
  
  // User Actions
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  
  // Data Access
  DATA_ACCESSED = "data.accessed",
  DATA_CREATED = "data.created",
  DATA_UPDATED = "data.updated",
  DATA_DELETED = "data.deleted",
  DATA_EXPORTED = "data.exported",
  
  // Security
  SECURITY_API_KEY_CREATED = "security.api_key_created",
  SECURITY_API_KEY_REVOKED = "security.api_key_revoked",
  SECURITY_PERMISSION_CHANGED = "security.permission_changed",
  SECURITY_IP_BLOCKED = "security.ip_blocked",
  
  // Automation
  AUTOMATION_RULE_CREATED = "automation.rule_created",
  AUTOMATION_RULE_UPDATED = "automation.rule_updated",
  AUTOMATION_MESSAGE_SENT = "automation.message_sent",
  AUTOMATION_MESSAGE_FAILED = "automation.message_failed",
  
  // System
  SYSTEM_ERROR = "system.error",
  SYSTEM_BACKUP = "system.backup",
  SYSTEM_MAINTENANCE = "system.maintenance",
}

export interface AuditLogData {
  userId?: string;
  eventType: AuditEventType;
  entityType?: string;
  entityId?: string;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "warning";
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
       {
        userId: data.userId,
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging shouldn't break main functionality
  }
}

/**
 * Convenience methods for common audit events
 */
export const audit = {
  auth: {
    login: (userId: string, ip?: string, ua?: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.AUTH_LOGIN,
        action: "User logged in",
        ipAddress: ip,
        userAgent: ua,
        status: "success",
      }),
    failed: (email: string, ip?: string, ua?: string) =>
      createAuditLog({
        eventType: AuditEventType.AUTH_FAILED,
        action: "Failed login attempt",
        metadata: { email },
        ipAddress: ip,
        userAgent: ua,
        status: "failure",
      }),
    logout: (userId: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.AUTH_LOGOUT,
        action: "User logged out",
        status: "success",
      }),
  },
  
  data: {
    accessed: (userId: string, entityType: string, entityId: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.DATA_ACCESSED,
        entityType,
        entityId,
        action: `Accessed ${entityType}`,
        status: "success",
      }),
    created: (userId: string, entityType: string, entityId: string, metadata?: any) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.DATA_CREATED,
        entityType,
        entityId,
        action: `Created ${entityType}`,
        metadata,
        status: "success",
      }),
    updated: (userId: string, entityType: string, entityId: string, changes?: any) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.DATA_UPDATED,
        entityType,
        entityId,
        action: `Updated ${entityType}`,
        metadata: { changes },
        status: "success",
      }),
    deleted: (userId: string, entityType: string, entityId: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.DATA_DELETED,
        entityType,
        entityId,
        action: `Deleted ${entityType}`,
        status: "success",
      }),
  },
  
  security: {
    apiKeyCreated: (userId: string, keyName: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.SECURITY_API_KEY_CREATED,
        action: "API key created",
        metadata: { keyName },
        status: "success",
      }),
    apiKeyRevoked: (userId: string, keyId: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.SECURITY_API_KEY_REVOKED,
        action: "API key revoked",
        metadata: { keyId },
        status: "success",
      }),
  },
  
  automation: {
    messageSent: (userId: string, platform: string, recipientId: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.AUTOMATION_MESSAGE_SENT,
        action: "Automated message sent",
        metadata: { platform, recipientId },
        status: "success",
      }),
    messageFailed: (userId: string, platform: string, recipientId: string, error: string) =>
      createAuditLog({
        userId,
        eventType: AuditEventType.AUTOMATION_MESSAGE_FAILED,
        action: "Automated message failed",
        metadata: { platform, recipientId, error },
        status: "failure",
      }),
  },
};

/**
 * Query audit logs
 */
export async function getAuditLogs(filters: {
  userId?: string;
  eventType?: AuditEventType;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  status?: "success" | "failure" | "warning";
  limit?: number;
  offset?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      eventType: filters.eventType,
      entityType: filters.entityType,
      status: filters.status,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 100,
    skip: filters.offset || 0,
  });
}

/**
 * Get audit statistics
 */
export async function getAuditStats(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [total, byType, byStatus] = await Promise.all([
    prisma.auditLog.count({
      where: { userId, createdAt: { gte: startDate } },
    }),
    prisma.auditLog.groupBy({
      by: ["eventType"],
      where: { userId, createdAt: { gte: startDate } },
      _count: true,
    }),
    prisma.auditLog.groupBy({
      by: ["status"],
      where: { userId, createdAt: { gte: startDate } },
      _count: true,
    }),
  ]);

  return {
    total,
    byType: byType.reduce((acc, item) => {
      acc[item.eventType] = item._count;
      return acc;
    }, {} as Record<string, number>),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
}