import { supabase } from "../config/supabase.js";

export async function leadsRoutes(app) {
  // List all leads with optional filters
  app.get("/", async (request, reply) => {
    const { status, urgency, channel, limit = 50 } = request.query;

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (urgency) query = query.eq("urgency", urgency);
    if (channel) query = query.eq("channel", channel);

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });

    return data;
  });

  // Get single lead with messages
  app.get("/:id", async (request, reply) => {
    const { id } = request.params;

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (leadError) return reply.status(404).send({ error: "Lead not found" });

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: true });

    return { ...lead, messages: messages || [] };
  });

  // Update lead status
  app.patch("/:id", async (request, reply) => {
    const { id } = request.params;
    const updates = request.body;

    const { data, error } = await supabase
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // Get dashboard metrics
  app.get("/metrics/summary", async (request, reply) => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(
      now.setDate(now.getDate() - now.getDay())
    ).toISOString();

    const { data: allLeads } = await supabase
      .from("leads")
      .select("status, urgency, channel, created_at, service_needed");

    const total = allLeads?.length || 0;
    const qualified = allLeads?.filter((l) => l.status !== "new" && l.status !== "qualifying").length || 0;
    const today = allLeads?.filter((l) => l.created_at >= todayStart).length || 0;
    const depositsConfirmed = allLeads?.filter((l) => l.status === "deposit_paid" || l.status === "job_complete").length || 0;

    const channelBreakdown = {
      whatsapp: allLeads?.filter((l) => l.channel === "whatsapp").length || 0,
      voice: allLeads?.filter((l) => l.channel === "voice").length || 0,
    };

    const urgencyBreakdown = {
      emergency: allLeads?.filter((l) => l.urgency === "emergency").length || 0,
      high: allLeads?.filter((l) => l.urgency === "high").length || 0,
      medium: allLeads?.filter((l) => l.urgency === "medium").length || 0,
      low: allLeads?.filter((l) => l.urgency === "low").length || 0,
    };

    return {
      total,
      qualified,
      today,
      depositsConfirmed,
      conversionRate: total > 0 ? ((qualified / total) * 100).toFixed(1) : 0,
      channelBreakdown,
      urgencyBreakdown,
    };
  });
}
