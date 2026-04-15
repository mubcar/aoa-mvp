import "./env.js"; // Load .env BEFORE any other imports that read process.env
import Fastify from "fastify";
import cors from "@fastify/cors";
import { webhookRoutes } from "./routes/webhooks.js";
import { leadsRoutes } from "./routes/leads.js";
import { paymentsRoutes } from "./routes/payments.js";
import { testChatRoutes } from "./routes/test-chat.js";
import { bookingRoutes } from "./routes/booking.js";
import { configRoutes } from "./routes/config.js";

const app = Fastify({ logger: true });

// CORS — allow production frontend + localhost for dev
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

await app.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});

// Health check (expanded for production monitoring)
app.get("/health", async () => {
  const checks = { status: "ok", service: "aoa-backend", timestamp: new Date().toISOString() };

  // Check Supabase
  try {
    const { getSupabase } = await import("./config/supabase.js");
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("businesses").select("id").limit(1);
      checks.supabase = error ? "error" : "connected";
    } else {
      checks.supabase = "not configured";
    }
  } catch {
    checks.supabase = "error";
  }

  // Check Claude API key
  checks.claude = process.env.ANTHROPIC_API_KEY ? "configured" : "missing";

  return checks;
});

// Register routes
app.register(webhookRoutes, { prefix: "/api/webhooks" });
app.register(leadsRoutes, { prefix: "/api/leads" });
app.register(paymentsRoutes, { prefix: "/api/payments" });
app.register(testChatRoutes, { prefix: "/api/test-chat" });
app.register(bookingRoutes, { prefix: "/api/booking" });
app.register(configRoutes, { prefix: "/api/config" });

const PORT = process.env.PORT || 3000;

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`🚀 AOA Backend running on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
