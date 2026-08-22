import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../lib/jwt";
import { config } from "../config";

let io: Server | null = null;

export function getIo() {
  return io;
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.frontendUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers.cookie || "")
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("accessToken="))
        ?.split("=")[1];
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
    socket.on("chat:join", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });
  });

  return io;
}
