import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import type { HeatmapPayload } from "../types/heatmap.types.js";

let io: SocketIOServer | null = null;

export function initRealtime(server: HttpServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: true
    }
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:ready", { connected: true });
  });

  return io;
}

export function emitHeatmapUpdate(payload: HeatmapPayload): void {
  if (!io) {
    return;
  }

  io.emit("heatmap:update", payload);
}
