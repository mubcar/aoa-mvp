import { processMessage } from "../services/claude.js";
import { getSupabase } from "../config/supabase.js";

// Demo business — Flora Multi Verde (paisagismo, palmeiras e plantas)
const DEMO_BUSINESS = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Flora Multi Verde",
  slug: "flora-multi-verde",
  services: ["Venda de palmeiras", "Plantas ornamentais", "Paisagismo", "Jardinagem", "Projeto de jardim"],
  service_area: "Grande São Paulo",
  business_hours: { start: "08:00", end: "18:00" },
  ai_prompt_context: `Flora Multi Verde é uma empresa especializada em paisagismo, venda de palmeiras e plantas ornamentais na Grande São Paulo. Trabalhamos com jerivá, palmeira real, palmeira imperial, areca e diversas plantas tropicais e ornamentais. Fazemos entrega e plantio na Grande SP. Também realizamos projetos completos de paisagismo para residências e empresas. Para orçamentos de palmeiras, precisamos saber o tamanho do espaço e o tipo de planta desejada. Projetos de paisagismo incluem visita técnica gratuita.`,
};

// In-memory conversation store (keyed by session_id)
const sessions = new Map();

export async function testChatRoutes(app) {
  /**
   * POST /api/test-chat
   * Body: { "message": "Oi, preciso de um ar-condicionado", "session_id": "test1" }
   *
   * Test the AI brain via curl without WhatsApp or Supabase.
   * If Supabase is configured, also saves leads + messages to DB.
   */
  app.post("/", async (request, reply) => {
    const { message, session_id = "default" } = request.body || {};

    if (!message) {
      return reply.status(400).send({ error: "Missing 'message' in request body" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return reply.status(500).send({ error: "ANTHROPIC_API_KEY not set in .env" });
    }

    // Get or create session
    if (!sessions.has(session_id)) {
      sessions.set(session_id, { history: [], leadId: null });
    }
    const session = sessions.get(session_id);

    try {
      // If Supabase is connected, create/find a lead
      const supabase = getSupabase();
      if (supabase && !session.leadId) {
        const { data: lead } = await supabase
          .from("leads")
          .insert({
            business_id: DEMO_BUSINESS.id,
            channel: "whatsapp",
            status: "qualifying",
            contact_phone: `test-${session_id}`,
          })
          .select()
          .single();
        if (lead) session.leadId = lead.id;
      }

      // Save prospect message to DB
      if (supabase && session.leadId) {
        await supabase.from("messages").insert({
          lead_id: session.leadId,
          role: "prospect",
          content: message,
          channel: "whatsapp",
        });
      }

      // Process with Claude AI
      const { reply: aiReply, toolCall } = await processMessage(
        DEMO_BUSINESS,
        session.history,
        message
      );

      // Store in session history
      session.history.push({ role: "prospect", content: message });
      if (aiReply) {
        session.history.push({ role: "assistant", content: aiReply });
      }

      // Save assistant message to DB
      if (supabase && session.leadId && aiReply) {
        await supabase.from("messages").insert({
          lead_id: session.leadId,
          role: "assistant",
          content: aiReply,
          channel: "whatsapp",
        });
      }

      // If AI qualified the lead, update lead data in DB
      if (toolCall && supabase && session.leadId) {
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
          .eq("id", session.leadId);
      }

      return {
        session_id,
        lead_id: session.leadId,
        reply: aiReply,
        tool_call: toolCall || null,
        messages_in_session: session.history.length,
        saved_to_db: !!supabase,
      };
    } catch (error) {
      request.log.error(error, "Error in test-chat");
      return reply.status(500).send({
        error: error.message,
        hint: error.status === 401 ? "Check your ANTHROPIC_API_KEY" : undefined,
      });
    }
  });

  /**
   * POST /api/test-chat/simulate
   * Runs a full qualification conversation automatically (no manual curl needed).
   * Creates a lead that shows up on the dashboard immediately.
   */
  app.post("/simulate", async (request, reply) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return reply.status(500).send({ error: "ANTHROPIC_API_KEY not set in .env" });
    }

    const scenarios = [
      {
        name: "Carlos Mendes",
        messages: [
          "Oi, gostaria de saber sobre palmeiras para meu jardim. Tenho um espaco grande em Alphaville.",
          "Me chamo Carlos Mendes. O jardim tem uns 80m2, queria um jeriva adulto ou palmeira imperial. Pode ser qualquer dia dessa semana de manha.",
          "Sim, pode confirmar! Obrigado.",
        ],
      },
      {
        name: "Ana Ferreira",
        messages: [
          "Boa tarde! Quero fazer um projeto de paisagismo na minha casa nova.",
          "Sou a Ana Ferreira, moro no Morumbi, SP. E uma casa com jardim de frente e fundos, uns 200m2 no total. Quero plantas tropicais, palmeiras e uma horta. Pode ser semana que vem para visita.",
          "Perfeito, vou aguardar o contato!",
        ],
      },
      {
        name: "Roberto Lima",
        messages: [
          "Preciso de plantas ornamentais para recepcao da minha empresa.",
          "Sou Roberto Lima, temos um escritorio no Itaim Bibi. Quero plantas grandes para deixar o ambiente mais bonito, umas 5 ou 6 plantas para vasos internos. Pode ser essa semana.",
          "Tudo certo, obrigado!",
        ],
      },
    ];

    const scenarioIndex = request.body?.scenario ?? Math.floor(Math.random() * scenarios.length);
    const scenario = scenarios[scenarioIndex % scenarios.length];
    const sessionId = `sim-${Date.now()}`;

    const results = [];
    const session = { history: [], leadId: null };
    sessions.set(sessionId, session);

    const supabase = getSupabase();

    // Create lead in DB
    if (supabase) {
      const { data: lead } = await supabase
        .from("leads")
        .insert({
          business_id: DEMO_BUSINESS.id,
          channel: "whatsapp",
          status: "qualifying",
          contact_phone: `sim-${scenario.name.toLowerCase().replace(/\s/g, "-")}`,
        })
        .select()
        .single();
      if (lead) session.leadId = lead.id;
    }

    try {
      for (const msg of scenario.messages) {
        // Save prospect message
        if (supabase && session.leadId) {
          await supabase.from("messages").insert({
            lead_id: session.leadId,
            role: "prospect",
            content: msg,
            channel: "whatsapp",
          });
        }

        const { reply: aiReply, toolCall } = await processMessage(
          DEMO_BUSINESS,
          session.history,
          msg
        );

        session.history.push({ role: "prospect", content: msg });
        if (aiReply) {
          session.history.push({ role: "assistant", content: aiReply });
        }

        // Save assistant message
        if (supabase && session.leadId && aiReply) {
          await supabase.from("messages").insert({
            lead_id: session.leadId,
            role: "assistant",
            content: aiReply,
            channel: "whatsapp",
          });
        }

        // Update lead if qualified
        if (toolCall && supabase && session.leadId) {
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
            .eq("id", session.leadId);
        }

        results.push({
          prospect: msg,
          assistant: aiReply,
          tool_call: toolCall || null,
        });
      }

      return {
        session_id: sessionId,
        lead_id: session.leadId,
        scenario: scenario.name,
        conversation: results,
        saved_to_db: !!supabase,
      };
    } catch (error) {
      request.log.error(error, "Error in simulate");
      return reply.status(500).send({ error: error.message });
    }
  });

  // DELETE session to start fresh
  app.delete("/:session_id", async (request) => {
    const { session_id } = request.params;
    sessions.delete(session_id);
    return { ok: true, message: `Session '${session_id}' cleared` };
  });

  // GET session history
  app.get("/:session_id", async (request) => {
    const { session_id } = request.params;
    const session = sessions.get(session_id);
    return { session_id, messages: session?.history || [], lead_id: session?.leadId };
  });
}
