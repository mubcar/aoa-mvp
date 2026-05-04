import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { X, MessageSquare, Bot, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
              <MessageSquare className="w-3 h-3 text-green-600" />
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

        {/* Status note for qualified leads */}
        {lead.status === "qualified" && (
          <div className="p-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              Lead qualificado — entre em contato para agendar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
