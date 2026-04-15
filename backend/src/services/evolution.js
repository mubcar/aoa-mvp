import axios from "axios";

const api = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    apikey: process.env.EVOLUTION_API_KEY,
    "Content-Type": "application/json",
  },
});

/**
 * Send a text message via WhatsApp (multi-tenant: instance per call)
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
