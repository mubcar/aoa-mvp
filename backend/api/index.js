import "../src/env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { webhookRoutes } from "../src/routes/webhooks.js";
import { leadsRoutes } from "../src/routes/leads.js";
import { paymentsRoutes } from "../src/routes/payments.js";
import { testChatRoutes } from "../src/routes/test-chat.js";
import { bookingRoutes } from "../src/routes/booking.js";
import { configRoutes } from "../src/routes/config.js";
import { adminRoutes } from "../src/routes/admin.js";
import { calendlyWebhookRoutes } from "../src/routes/webhooks-calendly.js";

const app = Fastify({ logger: true });

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

await app.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});
await app.register(rateLimit, { global: false });

// Health check
app.get("/health", async () => ({
  status: "ok",
  service: "aoa-backend",
  timestamp: new Date().toISOString(),
}));

app.get("/api/health", async () => ({
  status: "ok",
  service: "aoa-backend",
  timestamp: new Date().toISOString(),
}));

// Register routes
app.register(webhookRoutes, { prefix: "/api/webhooks" });
app.register(leadsRoutes, { prefix: "/api/leads" });
app.register(paymentsRoutes, { prefix: "/api/payments" });
app.register(testChatRoutes, { prefix: "/api/test-chat" });
app.register(bookingRoutes, { prefix: "/api/booking" });
app.register(configRoutes, { prefix: "/api/config" });
app.register(adminRoutes, { prefix: "/api/admin" });
app.register(calendlyWebhookRoutes, { prefix: "/api/webhooks" });

await app.ready();

export default async (req, res) => {
  app.server.emit("request", req, res);
};
