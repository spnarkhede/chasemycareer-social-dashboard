// lib/backup/backup-manager.ts
import { exec } from "child_process";
import { promisify } from "util";
import { createWriteStream, createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { createGzip, createGunzip } from "zlib";
import { prisma } from "@/lib/prisma";

const execAsync = promisify(exec);

export interface BackupResult {
  success: boolean;
  path?: string;
  size?: number;
  error?: string;
  timestamp: Date;
  type: "full" | "incremental";
}

export class BackupManager {
  private backupDir = process.env.BACKUP_DIR || "/tmp/backups";

  async createBackup(type: "full" | "incremental" = "full"): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${this.backupDir}/backup-${type}-${timestamp}.sql.gz`;

    try {
      // Create backup directory if it doesn't exist
      await execAsync(`mkdir -p ${this.backupDir}`);

      // Create backup using pg_dump
      const dumpCommand = `pg_dump ${process.env.DATABASE_URL} | gzip > ${backupPath}`;
      await execAsync(dumpCommand);

      // Get file size
      const stats = await require("fs").promises.stat(backupPath);

      // Upload to cloud storage (implement based on your provider)
      // await this.uploadToCloud(backupPath, `backups/${type}-${timestamp}.sql.gz`);

      // Log backup
      await prisma.auditLog.create({
        data: {
          eventType: "system.backup",
          action: `Created ${type} backup`,
          metadata: { path: backupPath, size: stats.size, type },
          status: "success",
        },
      });

      return {
        success: true,
        path: backupPath,
        size: stats.size,
        timestamp: new Date(),
        type,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Backup failed";
      
      await prisma.auditLog.create({
        data: {
          eventType: "system.error",
          action: "Backup failed",
          metadata: { error: errorMessage, type },
          status: "failure",
        },
      });

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        type,
      };
    }
  }

  async restoreBackup(backupPath: string): Promise<boolean> {
    try {
      const restoreCommand = `gunzip -c ${backupPath} | psql ${process.env.DATABASE_URL}`;
      await execAsync(restoreCommand);

      await prisma.auditLog.create({
        data: {
          eventType: "system.maintenance",
          action: "Database restored from backup",
          metadata: { backupPath },
          status: "success",
        },
      });

      return true;
    } catch (error) {
      console.error("Restore failed:", error);
      
      await prisma.auditLog.create({
        data: {
          eventType: "system.error",
          action: "Restore failed",
          metadata: { backupPath, error: error instanceof Error ? error.message : "Unknown" },
          status: "failure",
        },
      });

      return false;
    }
  }

  async cleanupOldBackups(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { stdout } = await execAsync(`find ${this.backupDir} -name "*.sql.gz" -mtime +${daysToKeep}`);
      const files = stdout.trim().split("\n").filter(Boolean);

      for (const file of files) {
        await require("fs").promises.unlink(file);
      }

      return files.length;
    } catch (error) {
      console.error("Cleanup failed:", error);
      return 0;
    }
  }

  async scheduleDailyBackup() {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0);

    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();

    setTimeout(async () => {
      await this.createBackup("full");
      await this.cleanupOldBackups(30);
      this.scheduleDailyBackup();
    }, delay);
  }

  async getBackupStatus() {
    const backups = await prisma.auditLog.findMany({
      where: {
        eventType: "system.backup",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const lastBackup = backups[0];
    const totalBackups = backups.filter(b => b.status === "success").length;

    return {
      lastBackup: lastBackup ? {
        timestamp: lastBackup.createdAt,
        status: lastBackup.status,
      } : null,
      totalBackups,
      successRate: backups.length > 0 ? (totalBackups / backups.length) * 100 : 0,
    };
  }
}

export const backupManager = new BackupManager();