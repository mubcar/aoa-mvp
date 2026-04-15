import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, qualifyLeadTool } from "../prompts/receptionist.js";
import { features } from "../config/features.js";

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Process a prospect message through Claude AI
 * Returns: { reply: string, toolCall: object | null }
 */
export async function processMessage(business, conversationHistory, newMessage, options = {}) {
  const paymentEnabled =
    options.paymentEnabled !== undefined ? options.paymentEnabled : features.SOLANA_ESCROW;
  const systemPrompt = buildSystemPrompt(business, { paymentEnabled });

  // Build messages array from conversation history
  const messages = conversationHistory.map((msg) => ({
    role: msg.role === "prospect" ? "user" : "assistant",
    content: msg.content,
  }));

  // Add the new message
  messages.push({ role: "user", content: newMessage });

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    tools: [qualifyLeadTool],
    messages,
  });

  let reply = "";
  let toolCall = null;

  for (const block of response.content) {
    if (block.type === "text") {
      reply = block.text;
    } else if (block.type === "tool_use" && block.name === "qualify_lead") {
      toolCall = block.input;
    }
  }

  // If the AI used a tool but didn't include a text reply,
  // we need to continue the conversation to get the closing message
  if (toolCall && !reply) {
    const followUp = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        ...messages,
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: response.content.find((b) => b.type === "tool_use").id,
              content: "Lead qualificado e registrado com sucesso.",
            },
          ],
        },
      ],
    });

    for (const block of followUp.content) {
      if (block.type === "text") {
        reply = block.text;
      }
    }
  }

  return { reply, toolCall };
}
