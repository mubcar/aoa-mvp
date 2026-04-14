import { getSupabase } from "../config/supabase.js";
import { processMessage } from "../services/claude.js";
import {
  sendWhatsAppMessage,
  parseEvolutionWebhook,
} from "../services/evolution.js";

// Helper to get business config from Supabase
async function getBusinessByInstanceName(instanceName) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("whatsapp_instance", instanceName)
    .single()
    .catch(() => ({ data: null }));

  return data;
}

// Demo business fallback
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
  solana_wallet_address: process.env.SOLANA_MERCHANT_WALLET,
};

export async function webhookRoutes(app) {
  /**
   * Evolution API webhook — incoming WhatsApp messages
   */
  app.post("/evolution", async (request, reply) => {
    try {
      const parsed = parseEvolutionWebhook(request.body);
      if (!parsed) return reply.status(200).send({ ok: true });

      const { phoneNumber, text, isAudio } = parsed;

      // If it's an audio message, ask for text
      if (isAudio) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Desculpe, ainda não consigo ouvir áudios 😅 Poderia enviar sua mensagem por texto?"
        );
        return reply.status(200).send({ ok: true });
      }

      const supabase = getSupabase();
      if (!supabase) {
        return reply.status(500).send({ error: "Supabase not configured" });
      }

      // Get business config (from instance name or use demo)
      const business =
        (await getBusinessByInstanceName(
          process.env.EVOLUTION_INSTANCE_NAME
        )) || DEFAULT_BUSINESS;

      // Find or create lead
      let { data: lead } = await supabase
        .from("leads")
        .select("*")
        .eq("contact_phone", phoneNumber)
        .eq("business_id", business.id)
        .in("status", ["new", "qualifying"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
        .catch(() => ({ data: null }));

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

      // Remove the last message (we already added it) to pass as history
      const conversationHistory = (history || []).slice(0, -1);

      // Process with Claude AI
      const { reply: aiReply, toolCall } = await processMessage(
        business,
        conversationHistory,
        text
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
        await sendWhatsAppMessage(phoneNumber, aiReply);
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

      // Vapi sends different event types
      if (payload.message?.type !== "end-of-call-report") {
        return reply.status(200).send({ ok: true });
      }

      const report = payload.message;
      const phoneNumber = report.customer?.number;
      const summary = report.summary;
      const transcript = report.transcript;

      // Extract structured data from the call summary using a simple parse
      // In production, you'd send the transcript to Claude for extraction
      const { data: lead } = await supabase
        .from("leads")
        .insert({
          business_id: DEMO_BUSINESS.id,
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
