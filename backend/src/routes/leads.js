import { getSupabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";

export async function leadsRoutes(app) {
  // All leads routes require auth
  app.addHook("preHandler", authMiddleware);

  // List leads for the authenticated user's business
  app.get("/", async (request, reply) => {
    if (!request.businessId) {
      return reply.status(400).send({ error: "No business configured. Complete onboarding first." });
    }

    const supabase = getSupabase();
    const { status, urgency, channel, limit = 50 } = request.query;

    let query = supabase
      .from("leads")
      .select("*")
      .eq("business_id", request.businessId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (urgency) query = query.eq("urgency", urgency);
    if (channel) query = query.eq("channel", channel);

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });

    return data;
  });

  // Get single lead with messages (must belong to user's business)
  app.get("/:id", async (request, reply) => {
    const supabase = getSupabase();
    const { id } = request.params;

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("business_id", request.businessId)
      .single();

    if (leadError || !lead) return reply.status(404).send({ error: "Lead not found" });

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: true });

    return { ...lead, messages: messages || [] };
  });

  // Update lead status (must belong to user's business)
  app.patch("/:id", async (request, reply) => {
    const supabase = getSupabase();
    const { id } = request.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .eq("business_id", request.businessId)
      .single();

    if (!existing) return reply.status(404).send({ error: "Lead not found" });

    // Whitelist allowed update fields
    const allowed = ["status", "contact_name", "service_needed", "urgency",
      "problem_description", "preferred_schedule", "location", "conversation_summary"];
    const updates = {};
    for (const key of allowed) {
      if (request.body[key] !== undefined) updates[key] = request.body[key];
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // Dashboard metrics for the user's business only
  app.get("/metrics/summary", async (request, reply) => {
    if (!request.businessId) {
      return { total: 0, qualified: 0, today: 0, depositsConfirmed: 0, conversionRate: 0, channelBreakdown: { whatsapp: 0, voice: 0 }, urgencyBreakdown: {} };
    }

    const supabase = getSupabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: allLeads } = await supabase
      .from("leads")
      .select("status, urgency, channel, created_at, service_needed")
      .eq("business_id", request.businessId);

    const total = allLeads?.length || 0;
    const qualified = allLeads?.filter((l) => l.status !== "new" && l.status !== "qualifying").length || 0;
    const today = allLeads?.filter((l) => l.created_at >= todayStart).length || 0;
    const depositsConfirmed = allLeads?.filter((l) => l.status === "deposit_paid" || l.status === "job_complete").length || 0;

    return {
      total,
      qualified,
      today,
      depositsConfirmed,
      conversionRate: total > 0 ? ((qualified / total) * 100).toFixed(1) : 0,
      channelBreakdown: {
        whatsapp: allLeads?.filter((l) => l.channel === "whatsapp").length || 0,
        voice: allLeads?.filter((l) => l.channel === "voice").length || 0,
      },
      urgencyBreakdown: {
        emergency: allLeads?.filter((l) => l.urgency === "emergency").length || 0,
        high: allLeads?.filter((l) => l.urgency === "high").length || 0,
        medium: allLeads?.filter((l) => l.urgency === "medium").length || 0,
        low: allLeads?.filter((l) => l.urgency === "low").length || 0,
      },
    };
  });
}
