import axios from "axios";

const api = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    apikey: process.env.EVOLUTION_API_KEY,
    "Content-Type": "application/json",
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://frontend-mu-gold-22.vercel.app";

/**
 * Send a text message via WhatsApp (multi-tenant: instance per call).
 * Works for both individual numbers and group JIDs (@g.us).
 */
export async function sendWhatsAppMessage(phoneNumber, text, instanceName) {
  const instance = instanceName || process.env.EVOLUTION_INSTANCE_NAME;
  try {
    const response = await api.post(`/message/sendText/${instance}`, {
      number: phoneNumber,
      text,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response?.data || error.message);
    throw error;
  }
}

const URGENCY_EMOJI = {
  emergency: "🚨 EMERGÊNCIA",
  high: "🔴 Alta",
  medium: "🟡 Média",
  low: "🟢 Baixa",
};

/**
 * Send a formatted lead notification to the business owner's WhatsApp
 * (number or group JID) when a lead is qualified.
 */
export async function sendLeadNotification(business, lead, toolCall) {
  const target = business.notification_whatsapp;
  if (!target) return; // no notification configured

  const urgencyLabel = URGENCY_EMOJI[toolCall.urgency] || toolCall.urgency;
  const contactLine = lead.contact_phone
    ? `📱 *Contato:* wa.me/${lead.contact_phone.replace(/\D/g, "")}`
    : "";

  const lines = [
    `🔔 *Novo lead qualificado — ${business.name}*`,
    "",
    `👤 *Nome:* ${toolCall.contact_name}`,
    `🔧 *Serviço:* ${toolCall.service_needed}`,
    `⚡ *Urgência:* ${urgencyLabel}`,
    toolCall.location ? `📍 *Local:* ${toolCall.location}` : null,
    toolCall.preferred_schedule ? `🗓️ *Preferência:* ${toolCall.preferred_schedule}` : null,
    contactLine || null,
    "",
    toolCall.problem_description ? `💬 _"${toolCall.problem_description}"_` : null,
    "",
    `🔗 ${FRONTEND_URL}/dashboard`,
  ].filter((l) => l !== null);

  const message = lines.join("\n");

  try {
    await sendWhatsAppMessage(target, message, business.whatsapp_instance);
  } catch (err) {
    // Non-fatal — log but don't crash the webhook handler
    console.warn("Lead notification failed:", err.message);
  }
}

/**
 * Extract message data from Evolution API webhook payload
 */
export function parseEvolutionWebhook(payload) {
  const data = payload.data;

  // Ignore status updates, only process actual messages
  if (!data?.message) return null;

  // Ignore messages sent by the bot itself
  if (data.key?.fromMe) return null;

  const phoneNumber = data.key?.remoteJid?.replace("@s.whatsapp.net", "");
  const messageText =
    data.message?.conversation ||
    data.message?.extendedTextMessage?.text ||
    null;

  // Handle audio/voice messages
  if (data.message?.audioMessage) {
    return {
      phoneNumber,
      text: "[Mensagem de áudio recebida — por favor, envie sua mensagem por texto]",
      isAudio: true,
    };
  }

  if (!phoneNumber || !messageText) return null;

  return {
    phoneNumber,
    text: messageText,
    isAudio: false,
  };
}
