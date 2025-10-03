"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger"); // custom logger utility
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable CORS for frontend projects
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
}));
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
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
io.of(/^\/\w+$/).on("connection", (socket) => {
    const namespace = socket.nsp;
    (0, logger_1.log)(`Client connected to namespace: ${namespace.name}, socketId: ${socket.id}`);
    // Listen for any event dynamically
    socket.onAny((event, data) => {
        (0, logger_1.log)(`[${namespace.name}] Event received: ${event}`, data);
        // Broadcast to everyone in the same namespace
        namespace.emit(event, data);
    });
    socket.on("disconnect", (reason) => {
        (0, logger_1.log)(`Client disconnected from namespace: ${namespace.name}, socketId: ${socket.id}, reason: ${reason}`);
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
    (0, logger_1.log)(`Realtime server running on port ${PORT}`);
});
