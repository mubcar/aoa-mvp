import { getSupabase } from "../config/supabase.js";
import { processMessage } from "../services/claude.js";
import {
  sendWhatsAppMessage,
  parseEvolutionWebhook,
  sendLeadNotification,
} from "../services/evolution.js";

// Generic fallback — used when no business is matched by instance/number.
// In production each real client has their own business row with custom context.
const DEFAULT_BUSINESS = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Flora Multi Verde",
  slug: "flora-multi-verde",
  services: ["Venda de palmeiras", "Plantas ornamentais", "Paisagismo", "Jardinagem", "Projeto de jardim"],
  service_area: "Grande São Paulo",
  business_hours: { start: "08:00", end: "18:00" },
  ai_prompt_context: `Flora Multi Verde é uma empresa especializada em paisagismo, venda de palmeiras e plantas ornamentais na Grande São Paulo. Trabalhamos com jerivá, palmeira real, palmeira imperial, areca e diversas plantas tropicais e ornamentais. Fazemos entrega e plantio na Grande SP. Também realizamos projetos completos de paisagismo para residências e empresas. Para orçamentos de palmeiras, precisamos saber o tamanho do espaço e o tipo de planta desejada. Projetos de paisagismo incluem visita técnica gratuita.`,
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
  app.post("/evolution", {
    config: {
      rateLimit: {
        max: 120,         // 120 messages per minute per IP
        timeWindow: "1 minute",
      },
    },
  }, async (request, reply) => {
    // Signature check — Evolution API sends x-webhook-secret header
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const incoming = request.headers["x-webhook-secret"] || request.headers["x-api-key"];
      if (incoming !== webhookSecret) {
        request.log.warn("Rejected Evolution webhook — invalid secret");
        return reply.status(401).send({ error: "Unauthorized" });
      }
    }
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

      // If AI qualified the lead, update lead data + notify owner
      if (toolCall) {
        const updatedLead = {
          ...lead,
          contact_phone: lead.contact_phone || phoneNumber,
        };
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

        // Fire-and-forget: notify business owner via WhatsApp
        sendLeadNotification(business, updatedLead, toolCall);
      }

      // Send reply via WhatsApp
      if (aiReply) {
        await sendWhatsAppMessage(phoneNumber, aiReply, instanceName);
      }

      return reply.status(200).send({ ok: true });
    } catch (error) {
      request.log.error(error, "Error processing WhatsApp webhook");
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
