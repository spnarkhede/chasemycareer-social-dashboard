// app/api/webhooks/linkedin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processTrigger } from "@/lib/automation/rule-engine";
import { TriggerType } from "@prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get("x-linkedin-signature");
    const body = await request.text();
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.LINKEDIN_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);

    // Process different event types
    switch (data.eventType) {
      case "comment":
        await processTrigger({
          type: TriggerType.COMMENT,
          platform: "linkedin",
          userId: data.userId,
          recipientId: data.commenterId,
          recipientName: data.commenterName,
          postId: data.postId,
          commentText: data.commentText,
          timestamp: new Date(data.timestamp),
        });
        break;

      case "follow":
        await processTrigger({
          type: TriggerType.FOLLOW,
          platform: "linkedin",
          userId: data.userId,
          recipientId: data.followerId,
          recipientName: data.followerName,
          timestamp: new Date(data.timestamp),
        });
        break;

      case "like":
        await processTrigger({
          type: TriggerType.LIKE,
          platform: "linkedin",
          userId: data.userId,
          recipientId: data.likerId,
          recipientName: data.likerName,
          postId: data.postId,
          timestamp: new Date(data.timestamp),
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LinkedIn webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}