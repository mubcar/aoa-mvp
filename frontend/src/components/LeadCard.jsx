import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone, AlertTriangle, Clock, MapPin, DollarSign } from "lucide-react";

const urgencyConfig = {
  emergency: { label: "Emergência", color: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  low: { label: "Baixa", color: "bg-green-100 text-green-800 border-green-200" },
};

const statusConfig = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-800" },
  qualifying: { label: "Qualificando", color: "bg-purple-100 text-purple-800" },
  qualified: { label: "Qualificado", color: "bg-green-100 text-green-800" },
  deposit_sent: { label: "Depósito enviado", color: "bg-yellow-100 text-yellow-800" },
  deposit_paid: { label: "Depósito pago", color: "bg-emerald-100 text-emerald-800" },
  job_scheduled: { label: "Agendado", color: "bg-cyan-100 text-cyan-800" },
  job_complete: { label: "Concluído", color: "bg-gray-100 text-gray-800" },
  lost: { label: "Perdido", color: "bg-red-100 text-red-800" },
};

export function LeadCard({ lead, onClick }) {
  const urgency = urgencyConfig[lead.urgency] || urgencyConfig.low;
  const status = statusConfig[lead.status] || statusConfig.new;
  const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      onClick={() => onClick?.(lead)}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {lead.channel === "whatsapp" ? (
            <MessageSquare className="w-4 h-4 text-green-600" />
          ) : (
            <Phone className="w-4 h-4 text-blue-600" />
          )}
          <span className="font-semibold text-gray-900">
            {lead.contact_name || lead.contact_phone || "Prospect"}
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      {lead.service_needed && (
        <p className="text-sm text-gray-700 mb-2">{lead.service_needed}</p>
      )}

      {lead.problem_description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {lead.problem_description}
        </p>
      )}

      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
        {lead.urgency && (
          <span className={`px-2 py-0.5 rounded-full border ${urgency.color} flex items-center gap-1`}>
            <AlertTriangle className="w-3 h-3" />
            {urgency.label}
          </span>
        )}

        {lead.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {lead.location}
          </span>
        )}

        {lead.deposit_amount_usdc && (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <DollarSign className="w-3 h-3" />
            {lead.deposit_amount_usdc} USDC
          </span>
        )}

        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </span>
      </div>
    </div>
  );
}
