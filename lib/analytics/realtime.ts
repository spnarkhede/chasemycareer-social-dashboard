// lib/analytics/realtime.ts
import { Server } from "socket.io";
import { NextApiRequest } from "next";
import { verifyToken } from "@/lib/auth";

let io: Server | null = null;

export function initIO(server: any) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Authenticate socket connection
      socket.on("authenticate", async (token: string) => {
        try {
          const user = await verifyToken(token);
          if (user) {
            socket.join(`user:${user.id}`);
            socket.emit("authenticated", { success: true });
          }
        } catch {
          socket.emit("authenticated", { success: false });
        }
      });

      // Subscribe to analytics updates
      socket.on("subscribe:analytics", (userId: string) => {
        socket.join(`analytics:${userId}`);
      });

      // Subscribe to automation updates
      socket.on("subscribe:automation", (userId: string) => {
        socket.join(`automation:${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

export function emitAnalyticsUpdate(userId: string,  {
  io = getIO();
  io.to(`analytics:${userId}`).emit("analytics:update", data);
}

export function emitAutomationEvent(userId: string, event: {
  type: string;
   any;
}) {
  const io = getIO();
  io.to(`automation:${userId}`).emit("automation:event", event);
}

export function emitNotification(userId: string, notification: {
  title: string;
  message: string;
  type: string;
}) {
  const io = getIO();
  io.to(`user:${userId}`).emit("notification", notification);
}