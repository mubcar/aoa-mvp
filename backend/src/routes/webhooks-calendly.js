import { getSupabase } from "../config/supabase.js";
import crypto from "crypto";

/**
 * Verify Calendly webhook signature.
 * Calendly signs with HMAC-SHA256 of the raw body using your signing key.
 */
function verifyCalendlySignature(rawBody, signature, signingKey) {
  if (!signingKey) return true; // skip if not configured
  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(rawBody)
    .digest("hex");
  return signature === expected;
}

export async function calendlyWebhookRoutes(app) {
  app.post(
    "/calendly",
    { config: { rawBody: true } },
    async (request, reply) => {
      try {
        // Signature verification (optional — requires CALENDLY_SIGNING_KEY env var)
        const sig = request.headers["calendly-webhook-signature"];
        const signingKey = process.env.CALENDLY_SIGNING_KEY;
        if (signingKey && sig) {
          const raw = request.rawBody || JSON.stringify(request.body);
          if (!verifyCalendlySignature(raw, sig, signingKey)) {
            return reply.status(401).send({ error: "Invalid signature" });
          }
        }

        const payload = request.body;
        const eventType = payload.event;

        // Only handle new bookings
        if (eventType !== "invitee.created") {
          return reply.status(200).send({ ok: true, skipped: true });
        }

        const invitee = payload.payload?.invitee || {};
        const event = payload.payload?.event || {};

        const name = invitee.name || "Desconhecido";
        const email = invitee.email || "";
        const startTime = event.start_time || invitee.scheduled_event?.start_time || null;

        let preferred_date = null;
        let preferred_time = null;
        if (startTime) {
          // Convert to São Paulo time (UTC-3)
          const dt = new Date(startTime);
          preferred_date = dt.toISOString().split("T")[0];
          const spHour = ((dt.getUTCHours() - 3 + 24) % 24);
          preferred_time = `${String(spHour).padStart(2, "0")}:${String(dt.getUTCMinutes()).padStart(2, "0")}`;
        }

        // Extract UTM params that BookCallModal could have passed via Calendly URL
        const utmParams = invitee.tracking || {};

        const supabase = getSupabase();
        if (!supabase) return reply.status(200).send({ ok: true, saved: false });

        // Upsert by email to avoid duplicates if postMessage also fired
        const { data: existing } = await supabase
          .from("bookings")
          .select("id")
          .eq("whatsapp", email) // using email as fallback identifier
          .eq("status", "pending")
          .maybeSingle();

        if (existing) {
          // Already captured via form — just update the time
          await supabase
            .from("bookings")
            .update({
              preferred_date,
              preferred_time,
              status: "confirmed",
            })
            .eq("id", existing.id);
        } else {
          // New booking only captured by Calendly (browser closed before form submitted)
          await supabase.from("bookings").insert({
            business_name: utmParams.utm_content || "—",
            owner_name: name,
            whatsapp: email, // best we have without form data
            service_type: utmParams.utm_term || "—",
            description: `[Calendly webhook] ${email}`,
            preferred_date,
            preferred_time,
            status: "confirmed",
          });
        }

        request.log.info({ name, email, startTime }, "Calendly booking received");
        return reply.status(200).send({ ok: true });
      } catch (err) {
        request.log.error(err, "Error processing Calendly webhook");
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
