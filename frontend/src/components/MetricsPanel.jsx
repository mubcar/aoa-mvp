import { useState, useEffect } from "react";
import { Users, CheckCircle, TrendingUp, Zap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(`${API_URL}/api/leads/metrics/summary`);
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
      label: "Total de leads",
      value: metrics.total,
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
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
  );
}
