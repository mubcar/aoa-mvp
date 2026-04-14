import "./env.js"; // Load .env BEFORE any other imports that read process.env
import Fastify from "fastify";
import cors from "@fastify/cors";
import { webhookRoutes } from "./routes/webhooks.js";
import { leadsRoutes } from "./routes/leads.js";
import { paymentsRoutes } from "./routes/payments.js";
import { testChatRoutes } from "./routes/test-chat.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
});

// Health check
app.get("/health", async () => ({ status: "ok", service: "aoa-backend" }));

// Register routes
app.register(webhookRoutes, { prefix: "/api/webhooks" });
app.register(leadsRoutes, { prefix: "/api/leads" });
app.register(paymentsRoutes, { prefix: "/api/payments" });
app.register(testChatRoutes, { prefix: "/api/test-chat" });

const PORT = process.env.PORT || 3000;

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`🚀 AOA Backend running on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
