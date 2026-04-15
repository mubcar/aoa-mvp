import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeLeads } from "../hooks/useRealtimeLeads";
import { useAuth } from "../hooks/useAuth";
import { LeadCard } from "../components/LeadCard";
import { MetricsPanel } from "../components/MetricsPanel";
import { LeadDetail } from "../components/LeadDetail";
import { MessageSquare, Phone, Filter, Settings, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "qualifying", label: "Qualificando" },
  { key: "qualified", label: "Qualificados" },
  { key: "deposit_sent", label: "Depósito enviado" },
  { key: "deposit_paid", label: "Depósito pago" },
];

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { leads, loading, business } = useRealtimeLeads();
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Redirect to onboarding if no business
  useEffect(() => {
    if (!loading && user && !business) {
      navigate("/onboarding");
    }
  }, [loading, user, business, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  const filteredLeads =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              AOA
              <span className="text-blue-600 ml-1">Dashboard</span>
            </h1>
            <p className="text-sm text-gray-500">{business?.name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-green-600" />
                WhatsApp
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-blue-600" />
                Voz
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Ao vivo</span>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <a
                href="/settings"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </a>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <MetricsPanel />

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 opacity-70">
                  ({leads.filter((l) => l.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lead grid */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">Nenhum lead ainda</p>
            <p className="text-sm text-gray-400">
              Envie uma mensagem pelo WhatsApp ou ligue para ver os leads
              aparecerem em tempo real
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={setSelectedLead}
              />
            ))}
          </div>
        )}
      </main>

      {/* Lead detail slide-over */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
