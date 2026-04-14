import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { X, MessageSquare, Phone, Bot, User, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function LeadDetail({ lead, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    }
    fetchMessages();

    // Real-time messages
    const channel = supabase
      .channel(`messages-${lead.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${lead.id}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [lead.id]);

  async function handleGenerateDeposit() {
    try {
      const res = await fetch(`${API_URL}/api/payments/create-deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.url) alert(`Link gerado: ${data.url}`);
    } catch (err) {
      console.error("Failed to generate deposit:", err);
    }
  }

  async function handleConfirmDeposit() {
    try {
      await fetch(`${API_URL}/api/payments/confirm-deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
    } catch (err) {
      console.error("Failed to confirm deposit:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">
              {lead.contact_name || "Prospect"}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              {lead.channel === "whatsapp" ? (
                <MessageSquare className="w-3 h-3 text-green-600" />
              ) : (
                <Phone className="w-3 h-3 text-blue-600" />
              )}
              {lead.contact_phone} · {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Qualification Summary */}
        {lead.status !== "new" && lead.status !== "qualifying" && (
          <div className="p-4 bg-blue-50 border-b text-sm space-y-1">
            {lead.service_needed && <p><strong>Serviço:</strong> {lead.service_needed}</p>}
            {lead.urgency && <p><strong>Urgência:</strong> {lead.urgency}</p>}
            {lead.location && <p><strong>Local:</strong> {lead.location}</p>}
            {lead.preferred_schedule && <p><strong>Horário:</strong> {lead.preferred_schedule}</p>}
            {lead.problem_description && <p><strong>Descrição:</strong> {lead.problem_description}</p>}
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-center">Carregando conversa...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma mensagem</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "assistant"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "prospect" && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          {lead.status === "qualified" && (
            <button
              onClick={handleGenerateDeposit}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Gerar link de depósito (Solana Pay)
            </button>
          )}
          {lead.status === "deposit_sent" && (
            <button
              onClick={handleConfirmDeposit}
              className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Confirmar depósito (demo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
