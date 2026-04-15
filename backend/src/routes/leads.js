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
    const { status, urgency, channel, from, to, limit = 50 } = request.query;

    let query = supabase
      .from("leads")
      .select("*")
      .eq("business_id", request.businessId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (urgency) query = query.eq("urgency", urgency);
    if (channel) query = query.eq("channel", channel);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

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
      return {
        total: 0, qualified: 0, today: 0, week: 0, month: 0,
        depositsConfirmed: 0, conversionRate: 0,
        avgResponseTimeSeconds: null,
        channelBreakdown: { whatsapp: 0, voice: 0 },
        urgencyBreakdown: {},
      };
    }

    const supabase = getSupabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: allLeads } = await supabase
      .from("leads")
      .select("id, status, urgency, channel, created_at")
      .eq("business_id", request.businessId);

    const total = allLeads?.length || 0;
    const qualified = allLeads?.filter((l) => l.status !== "new" && l.status !== "qualifying").length || 0;
    const today = allLeads?.filter((l) => l.created_at >= todayStart).length || 0;
    const week = allLeads?.filter((l) => l.created_at >= weekStart).length || 0;
    const month = allLeads?.filter((l) => l.created_at >= monthStart).length || 0;
    const depositsConfirmed = allLeads?.filter((l) => l.status === "deposit_paid" || l.status === "job_complete").length || 0;

    // Average response time: time between first prospect msg and first assistant msg per lead
    let avgResponseTimeSeconds = null;
    const leadIds = (allLeads || []).map((l) => l.id);
    if (leadIds.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("lead_id, role, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true });

      const firstProspect = {};
      const firstAssistant = {};
      for (const m of msgs || []) {
        if (m.role === "prospect" && !firstProspect[m.lead_id]) firstProspect[m.lead_id] = m.created_at;
        if (m.role === "assistant" && !firstAssistant[m.lead_id]) firstAssistant[m.lead_id] = m.created_at;
      }
      const diffs = [];
      for (const lid of Object.keys(firstProspect)) {
        if (firstAssistant[lid]) {
          diffs.push((new Date(firstAssistant[lid]) - new Date(firstProspect[lid])) / 1000);
        }
      }
      if (diffs.length > 0) {
        avgResponseTimeSeconds = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }
    }

    return {
      total,
      qualified,
      today,
      week,
      month,
      depositsConfirmed,
      conversionRate: total > 0 ? ((qualified / total) * 100).toFixed(1) : 0,
      avgResponseTimeSeconds,
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

  // Alias: POST /api/leads/:id/deposit → delegates to payments create-deposit logic
  app.post("/:id/deposit", async (request, reply) => {
    const { features } = await import("../config/features.js");
    const supabase = getSupabase();
    const { id: leadId } = request.params;
    const { amount } = request.body || {};

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("business_id", request.businessId)
      .single();

    if (error || !lead) return reply.status(404).send({ error: "Lead not found" });

    if (!features.SOLANA_ESCROW) {
      await supabase
        .from("leads")
        .update({ status: "qualified", updated_at: new Date().toISOString() })
        .eq("id", leadId);
      return { mode: "none", message: "Payment integration disabled" };
    }

    if (lead.solana_pay_url) {
      return { url: lead.solana_pay_url, message: "Deposit link already generated" };
    }

    const { generateDepositLink } = await import("../services/solana-pay.js");
    const merchantWallet = process.env.SOLANA_MERCHANT_WALLET;
    if (!merchantWallet) return reply.status(500).send({ error: "Merchant wallet not configured" });

    const DEPOSIT_AMOUNTS = { emergency: 50, high: 30, medium: 20, low: 15 };
    const depositAmount = amount || DEPOSIT_AMOUNTS[lead.urgency] || 20;

    const deposit = generateDepositLink({
      merchantWallet,
      amount: depositAmount,
      leadId: lead.id,
      businessName: request.business?.name || "AOA",
    });

    await supabase
      .from("leads")
      .update({
        deposit_amount_usdc: deposit.amount,
        solana_pay_url: deposit.url,
        status: "deposit_sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    return { url: deposit.url, amount: deposit.amount, reference: deposit.reference };
  });
}
