import { getSupabase } from "../config/supabase.js";

const BR_WHATSAPP_RE = /^\+?55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

const ALLOWED_SERVICES = [
  "HVAC",
  "Encanador",
  "Solar",
  "Eletricista",
  "Paisagismo",
];

const ALLOWED_TIMES = ["10:00", "14:00", "16:00"];

export async function bookingRoutes(fastify) {
  fastify.post("/", async (request, reply) => {
    const {
      business_name,
      owner_name,
      whatsapp,
      service_type,
      description,
      preferred_date,
      preferred_time,
    } = request.body || {};

    // Validation
    if (!business_name || !owner_name || !whatsapp || !service_type || !preferred_date || !preferred_time) {
      return reply.code(400).send({ error: "Campos obrigatórios faltando" });
    }

    const normalizedWhats = String(whatsapp).replace(/\s+/g, " ").trim();
    if (!BR_WHATSAPP_RE.test(normalizedWhats)) {
      return reply.code(400).send({ error: "Formato de WhatsApp inválido. Use +55 11 91234-5678" });
    }

    if (!ALLOWED_SERVICES.includes(service_type)) {
      return reply.code(400).send({ error: "Tipo de serviço inválido" });
    }

    if (!ALLOWED_TIMES.includes(preferred_time)) {
      return reply.code(400).send({ error: "Horário inválido" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        business_name,
        owner_name,
        whatsapp: normalizedWhats,
        service_type,
        description: description || null,
        preferred_date,
        preferred_time,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      request.log.error({ error }, "Failed to insert booking");
      return reply.code(500).send({ error: "Falha ao salvar agendamento" });
    }

    // Fire-and-forget webhook notification (optional)
    const notifyUrl = process.env.BOOKING_NOTIFY_WEBHOOK;
    if (notifyUrl) {
      fetch(notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "booking.created",
          booking: data,
        }),
      }).catch((err) => request.log.warn({ err }, "Booking webhook failed"));
    }

    return reply.send({
      ok: true,
      booking_id: data.id,
      message: "Agendamento confirmado! Falaremos com você em breve.",
    });
  });
}
