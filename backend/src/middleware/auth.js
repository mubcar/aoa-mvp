import { createClient } from "@supabase/supabase-js";

/**
 * Fastify auth middleware — verifies Supabase JWT and attaches user + business info.
 * Use on routes that need authenticated access (leads, payments, settings).
 * Do NOT use on webhook routes (those use API key auth).
 */
export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  // Use anon key to verify the JWT (respects RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }

  // Look up the user's business
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .single();

  request.user = user;
  request.business = business; // may be null if not onboarded
  request.businessId = business?.id || null;
  request.supabaseAuth = supabase; // client scoped to this user's RLS
}

/**
 * Webhook auth — verifies shared secret from Evolution API / Vapi.
 */
export async function webhookAuthMiddleware(request, reply) {
  const secret = request.headers["x-webhook-secret"] || request.headers["apikey"];
  const expected = process.env.WEBHOOK_SECRET;

  // If no webhook secret configured, allow all (dev mode)
  if (!expected) return;

  if (secret !== expected) {
    return reply.status(403).send({ error: "Invalid webhook secret" });
  }
}
