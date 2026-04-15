import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  TrendingUp,
  Zap,
  MessageSquare,
  Phone,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useFeatures } from "../hooks/useFeatures";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function formatResponseTime(seconds) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const { features } = useFeatures();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/leads/metrics/summary`, {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const cards = [
    {
      label: "Leads hoje",
      value: metrics.today,
      icon: Zap,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Esta semana",
      value: metrics.week ?? 0,
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Qualificados",
      value: metrics.qualified,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Taxa de conversão",
      value: `${metrics.conversionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Tempo médio de resposta",
      value: formatResponseTime(metrics.avgResponseTimeSeconds),
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  const whats = metrics.channelBreakdown?.whatsapp ?? 0;
  const voice = metrics.channelBreakdown?.voice ?? 0;
  const totalCh = whats + voice || 1;
  const urg = metrics.urgencyBreakdown || {};

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Por canal</h3>
          <div className="space-y-2">
            <ChannelBar
              icon={<MessageSquare className="w-4 h-4 text-green-600" />}
              label="WhatsApp"
              value={whats}
              pct={(whats / totalCh) * 100}
              color="bg-green-500"
            />
            <ChannelBar
              icon={<Phone className="w-4 h-4 text-blue-600" />}
              label="Voz"
              value={voice}
              pct={(voice / totalCh) * 100}
              color="bg-blue-500"
            />
          </div>
        </div>

        {/* Urgency breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            Por urgência
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <UrgencyPill label="Emergência" value={urg.emergency || 0} color="bg-red-50 text-red-700" />
            <UrgencyPill label="Alta" value={urg.high || 0} color="bg-orange-50 text-orange-700" />
            <UrgencyPill label="Média" value={urg.medium || 0} color="bg-yellow-50 text-yellow-700" />
            <UrgencyPill label="Baixa" value={urg.low || 0} color="bg-green-50 text-green-700" />
          </div>
        </div>
      </div>

      {features.solanaEscrow && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Depósitos confirmados</p>
          <p className="text-2xl font-bold text-emerald-600">{metrics.depositsConfirmed ?? 0}</p>
        </div>
      )}
    </div>
  );
}

function ChannelBar({ icon, label, value, pct, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-1.5 text-gray-700">
          {icon}
          {label}
        </span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function UrgencyPill({ label, value, color }) {
  return (
    <div className={`${color} rounded-lg py-2`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-medium">{label}</p>
    </div>
  );
}
