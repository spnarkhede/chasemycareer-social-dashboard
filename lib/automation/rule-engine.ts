// lib/automation/rule-engine.ts
import { prisma } from "@/lib/prisma";
import { TriggerType, ActionType, ExecutionStatus } from "@prisma/client";
import { addToQueue } from "./message-queue";
import { checkCompliance } from "./compliance";
import { isOptedOut } from "@/lib/utils/opt-out-manager";

export interface TriggerData {
  type: TriggerType;
  platform: string;
  userId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  postId?: string;
  commentText?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export async function processTrigger(triggerData: TriggerData) {
  try {
    // Check if recipient has opted out
    const optedOut = await isOptedOut(triggerData.recipientId, triggerData.platform);
    if (optedOut) {
      console.log("Recipient opted out, skipping:", triggerData.recipientId);
      return { success: false, reason: "OPT_OUT" };
    }

    // Find matching automation rules
    const rules = await prisma.automationRule.findMany({
      where: {
        triggerType: triggerData.type,
        isActive: true,
        userId: triggerData.userId,
      },
      orderBy: { priority: "desc" },
    });

    const results = [];

    for (const rule of rules) {
      // Check if rule matches this trigger
      const matches = await evaluateRule(rule, triggerData);
      
      if (!matches) {
        continue;
      }

      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (rule.lastReset < today) {
        // Reset daily counter
        await prisma.automationRule.update({
          where: { id: rule.id },
           { sentToday: 0, lastReset: new Date() },
        });
        rule.sentToday = 0;
      }

      if (rule.sentToday >= rule.dailyLimit) {
        console.log("Daily limit reached for rule:", rule.name);
        results.push({ ruleId: rule.id, success: false, reason: "DAILY_LIMIT" });
        continue;
      }

      // Check compliance
      const compliance = await checkCompliance({
        platform: triggerData.platform,
        recipientId: triggerData.recipientId,
        messageType: rule.actionType,
      });

      if (!compliance.allowed) {
        results.push({ ruleId: rule.id, success: false, reason: compliance.reason });
        continue;
      }

      // Execute action
      const execution = await executeAction(rule, triggerData);
      
      // Update rule counter
      await prisma.automationRule.update({
        where: { id: rule.id },
         { sentToday: { increment: 1 } },
      });

      results.push({ ruleId: rule.id, success: true, executionId: execution.id });
    }

    return {
      success: results.some(r => r.success),
      results,
    };
  } catch (error) {
    console.error("Rule engine error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function evaluateRule(rule: any, triggerData: TriggerData): Promise<boolean> {
  const config = rule.triggerConfig;

  // Platform filter
  if (config.platform && config.platform !== triggerData.platform) {
    return false;
  }

  // Post ID filter (for comments)
  if (config.postIds && triggerData.postId) {
    if (!config.postIds.includes(triggerData.postId)) {
      return false;
    }
  }

  // Keyword filter (for comments)
  if (config.keywords && triggerData.commentText) {
    const commentLower = triggerData.commentText.toLowerCase();
    const hasKeyword = config.keywords.some((keyword: string) =>
      commentLower.includes(keyword.toLowerCase())
    );
    
    if (config.keywordMatch === "all" && !hasKeyword) {
      return false;
    }
    
    if (config.keywordMatch === "any" && !hasKeyword) {
      return false;
    }
  }

  // Exclude existing connections
  if (config.excludeExisting) {
    // Check if already connected/DMed
    const existing = await prisma.automationExecution.findFirst({
      where: {
        ruleId: rule.id,
        recipientId: triggerData.recipientId,
        status: "SENT",
      },
    });
    
    if (existing) {
      return false;
    }
  }

  return true;
}

async function executeAction(rule: any, triggerData: TriggerData) {
  const config = rule.actionConfig;

  // Log execution
  const execution = await prisma.automationExecution.create({
     {
      ruleId: rule.id,
      userId: triggerData.userId,
      triggerData,
      recipientId: triggerData.recipientId,
      recipientName: triggerData.recipientName,
      recipientEmail: triggerData.recipientEmail,
      platform: triggerData.platform,
      status: "PENDING",
    },
  });

  try {
    if (rule.actionType === "SEND_DM") {
      // Get template
      const template = config.templateId
        ? await prisma.dmTemplate.findUnique({
            where: { id: config.templateId },
          })
        : null;

      // Personalize message
      const message = await personalizeMessage(
        template?.content || config.message,
        triggerData,
        config.variables
      );

      // Add to queue
      await addToQueue({
        userId: triggerData.userId,
        platform: triggerData.platform,
        recipientId: triggerData.recipientId,
        recipientName: triggerData.recipientName,
        messageContent: message,
        templateId: template?.id,
        ruleId: rule.id,
        priority: config.priority || 0,
        scheduledAt: config.delay ? new Date(Date.now() + config.delay * 60 * 1000) : undefined,
      });

      // Update execution
      await prisma.automationExecution.update({
        where: { id: execution.id },
         {
          status: "PROCESSING",
          messageSent: message,
        },
      });
    }

    return execution;
  } catch (error) {
    await prisma.automationExecution.update({
      where: { id: execution.id },
       {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

async function personalizeMessage(
  template: string,
  triggerData: TriggerData,
  variables?: Record<string, string>
): Promise<string> {
  let message = template;

  // Replace standard variables
  const replacements = {
    "{{name}}": triggerData.recipientName,
    "{{firstName}}": triggerData.recipientName.split(" ")[0],
    "{{platform}}": triggerData.platform,
    "{{date}}": new Date().toLocaleDateString(),
    "{{post}}": triggerData.postId || "",
    "{{comment}}": triggerData.commentText || "",
  };

  Object.entries(replacements).forEach(([key, value]) => {
    message = message.replace(new RegExp(key, "g"), value);
  });

  // Replace custom variables
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
  }

  return message;
}