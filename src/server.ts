import express from "express";
import http from "http";
import { Server, Socket, Namespace } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { log } from "./utils/logger"; // custom logger utility

dotenv.config();

const app = express();

// Enable CORS for frontend projects
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
  })
);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e6, // 1 MB (optional, for large messages)
  pingInterval: 10000,
  pingTimeout: 5000,
});

// -----------------------------
// Dynamic Namespaces
// -----------------------------
// Accepts any namespace like /chat, /notifications, /project123
io.of(/^\/\w+$/).on("connection", (socket: Socket) => {
  const namespace: Namespace = socket.nsp;
  log(
    `Client connected to namespace: ${namespace.name}, socketId: ${socket.id}`
  );

  // Listen for any event dynamically
  socket.onAny((event: string, data: any) => {
    log(`[${namespace.name}] Event received: ${event}`, data);
    // Broadcast to everyone in the same namespace
    namespace.emit(event, data);
  });

  socket.on("disconnect", (reason: string) => {
    log(
      `Client disconnected from namespace: ${namespace.name}, socketId: ${socket.id}, reason: ${reason}`
    );
  });
});

// -----------------------------
// Health Check Endpoint
// -----------------------------
app.get("/", (_req, res) => {
  res.send("Realtime WebSocket server is running.");
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  log(`Realtime server running on port ${PORT}`);
});
