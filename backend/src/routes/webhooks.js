import { getSupabase } from "../config/supabase.js";
import { processMessage } from "../services/claude.js";
import {
  sendWhatsAppMessage,
  parseEvolutionWebhook,
} from "../services/evolution.js";
import { features } from "../config/features.js";

// Demo business fallback (for testing without a real client)
const DEFAULT_BUSINESS = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "ClimaTech Refrigeração",
  slug: "climatech",
  services: [
    "Instalação de ar-condicionado",
    "Manutenção preventiva",
    "Limpeza de filtros",
    "Conserto de ar-condicionado",
    "Instalação de câmara fria",
  ],
  service_area: "São Paulo — Zona Sul e Centro",
  business_hours: { start: "08:00", end: "18:00" },
  ai_prompt_context: `ClimaTech Refrigeração é uma empresa familiar com 8 anos de experiência em ar-condicionado residencial e comercial na zona sul de São Paulo. Trabalhamos com todas as marcas. Visita técnica custa R$150, descontada do serviço. Instalação de split a partir de R$800. Manutenção preventiva R$250. Atendemos emergências 24h com taxa adicional de R$200.`,
};

/**
 * Look up business by Evolution API instance name or WhatsApp number
 */
async function findBusiness(instanceName, toNumber) {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Try by instance name first
  if (instanceName) {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("whatsapp_instance", instanceName)
      .single();
    if (data) return data;
  }

  // Fallback: try by WhatsApp number
  if (toNumber) {
    const cleaned = toNumber.replace(/\D/g, "");
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("whatsapp_number", cleaned)
      .single();
    if (data) return data;
  }

  return null;
}

export async function webhookRoutes(app) {
  /**
   * Evolution API webhook — incoming WhatsApp messages
   */
  app.post("/evolution", async (request, reply) => {
    try {
      const parsed = parseEvolutionWebhook(request.body);
      if (!parsed) return reply.status(200).send({ ok: true });

      const { phoneNumber, text, isAudio } = parsed;

      // Extract instance from webhook payload
      const instanceName =
        request.body.instance?.instanceName ||
        request.body.instance ||
        request.body.instanceName ||
        process.env.EVOLUTION_INSTANCE_NAME;

      // Find the business for this WhatsApp instance
      const business = (await findBusiness(instanceName, null)) || DEFAULT_BUSINESS;

      // If it's an audio message, ask for text
      if (isAudio) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Desculpe, ainda não consigo ouvir áudios 😅 Poderia enviar sua mensagem por texto?",
          instanceName
        );
        return reply.status(200).send({ ok: true });
      }

      const supabase = getSupabase();
      if (!supabase) {
        return reply.status(500).send({ error: "Database not configured" });
      }

      // Find or create lead
      let { data: lead } = await supabase
        .from("leads")
        .select("*")
        .eq("contact_phone", phoneNumber)
        .eq("business_id", business.id)
        .in("status", ["new", "qualifying"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lead) {
        const { data: newLead } = await supabase
          .from("leads")
          .insert({
            business_id: business.id,
            channel: "whatsapp",
            status: "qualifying",
            contact_phone: phoneNumber,
          })
          .select()
          .single();
        lead = newLead;
      }

      // Save prospect message
      await supabase.from("messages").insert({
        lead_id: lead.id,
        role: "prospect",
        content: text,
        channel: "whatsapp",
      });

      // Load conversation history
      const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });

      const conversationHistory = (history || []).slice(0, -1);

      // Process with Claude AI
      const { reply: aiReply, toolCall } = await processMessage(
        business,
        conversationHistory,
        text,
        { paymentEnabled: features.SOLANA_ESCROW }
      );

      // Save assistant message
      if (aiReply) {
        await supabase.from("messages").insert({
          lead_id: lead.id,
          role: "assistant",
          content: aiReply,
          channel: "whatsapp",
        });
      }

      // If AI qualified the lead, update lead data
      if (toolCall) {
        await supabase
          .from("leads")
          .update({
            status: "qualified",
            contact_name: toolCall.contact_name,
            service_needed: toolCall.service_needed,
            urgency: toolCall.urgency,
            problem_description: toolCall.problem_description,
            preferred_schedule: toolCall.preferred_schedule || null,
            location: toolCall.location || null,
            qualified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", lead.id);
      }

      // Send reply via WhatsApp
      if (aiReply) {
        await sendWhatsAppMessage(phoneNumber, aiReply, instanceName);
      }

      // Optionally generate & send Solana Pay deposit link after qualification
      if (toolCall && features.SOLANA_ESCROW) {
        try {
          const { generateDepositLink } = await import("../services/solana-pay.js");
          const merchantWallet = process.env.SOLANA_MERCHANT_WALLET;
          if (merchantWallet) {
            const depositAmounts = { emergency: 50, high: 30, medium: 20, low: 15 };
            const amount = depositAmounts[toolCall.urgency] || 20;
            const deposit = generateDepositLink({
              merchantWallet,
              amount,
              leadId: lead.id,
              businessName: business.name,
            });
            await supabase
              .from("leads")
              .update({
                deposit_amount_usdc: deposit.amount,
                solana_pay_url: deposit.url,
                status: "deposit_sent",
                updated_at: new Date().toISOString(),
              })
              .eq("id", lead.id);
            await sendWhatsAppMessage(
              phoneNumber,
              `Para garantir seu agendamento, aqui está o link de depósito: ${deposit.url}`,
              instanceName
            );
          }
        } catch (err) {
          request.log.warn({ err }, "Failed to auto-generate deposit link");
        }
      }

      return reply.status(200).send({ ok: true });
    } catch (error) {
      request.log.error(error, "Error processing WhatsApp webhook");
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  /**
   * Vapi webhook — voice call completion
   */
  app.post("/vapi", async (request, reply) => {
    try {
      const payload = request.body;

      if (payload.message?.type !== "end-of-call-report") {
        return reply.status(200).send({ ok: true });
      }

      const supabase = getSupabase();
      if (!supabase) return reply.status(500).send({ error: "Database not configured" });

      const report = payload.message;
      const phoneNumber = report.customer?.number;
      const summary = report.summary;
      const transcript = report.transcript;

      // For Vapi, route by the assistant's phone number or use default
      const business = DEFAULT_BUSINESS;

      const { data: lead } = await supabase
        .from("leads")
        .insert({
          business_id: business.id,
          channel: "voice",
          status: "qualified",
          contact_phone: phoneNumber,
          conversation_summary: summary,
          raw_messages: transcript,
          qualified_at: new Date().toISOString(),
        })
        .select()
        .single();

      return reply.status(200).send({ ok: true, leadId: lead?.id });
    } catch (error) {
      request.log.error(error, "Error processing Vapi webhook");
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
