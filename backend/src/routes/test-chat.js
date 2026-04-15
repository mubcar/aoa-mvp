import { processMessage } from "../services/claude.js";
import { getSupabase } from "../config/supabase.js";

// Generic demo business — same config as webhooks.js DEFAULT_BUSINESS
const DEMO_BUSINESS = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "AOA",
  slug: "aoa",
  services: ["Serviços residenciais e comerciais"],
  service_area: "Brasil",
  business_hours: { start: "08:00", end: "18:00" },
  ai_prompt_context: `Você é a recepcionista virtual da AOA, plataforma de atendimento inteligente para prestadores de serviços. Atenda o prospect com simpatia, entenda o que ele precisa, capture os dados necessários (nome, serviço, urgência, localização, horário preferido) e informe que um técnico entrará em contato para confirmar o agendamento.`,
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
        name: "Maria Santos",
        messages: [
          "Oi, meu ar-condicionado quebrou e ta saindo ar quente. Ta fazendo 38 graus aqui!",
          "Meu nome e Maria Santos, moro na Vila Mariana. E um split LG. Faz 2 anos sem manutencao e tenho um bebe em casa. Preciso resolver hoje de manha se possivel.",
          "Sim, esta tudo certo! Obrigada.",
        ],
      },
      {
        name: "Carlos Oliveira",
        messages: [
          "Boa tarde, gostaria de instalar um ar-condicionado no meu escritorio.",
          "Me chamo Carlos Oliveira, fico no Brooklin. Queria instalar 2 splits de 12000 BTUs. Pode ser na proxima semana.",
          "Perfeito, pode confirmar sim.",
        ],
      },
      {
        name: "Ana Ferreira",
        messages: [
          "Ola, preciso de uma manutencao preventiva nos meus ar-condicionados.",
          "Sou a Ana Ferreira, tenho 3 splits em casa no Ipiranga. Queria agendar uma limpeza completa. Qualquer dia da semana que vem de tarde serve.",
          "Tudo certo, obrigada!",
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
