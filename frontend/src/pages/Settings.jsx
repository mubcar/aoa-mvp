import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, LogOut, FileText, Save, AlertCircle, CheckCircle } from "lucide-react";

export function Settings() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    services: "",
    service_area: "",
    ai_prompt_context: "",
    whatsapp_number: "",
    phone: "",
  });

  useEffect(() => {
    async function load() {
      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        navigate("/login");
        return;
      }
      setUser(authUser);

      // Get or create business for this user
      const { data: existing } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (existing) {
        setBusiness(existing);
        setForm({
          name: existing.name || "",
          services: existing.services?.join(", ") || "",
          service_area: existing.service_area || "",
          ai_prompt_context: existing.ai_prompt_context || "",
          whatsapp_number: existing.whatsapp_number || "",
          phone: existing.phone || "",
        });
      } else {
        // Create placeholder business profile
        const { data: newBiz } = await supabase
          .from("businesses")
          .insert({
            id: authUser.id,
            name: "Minha Empresa",
            slug: `biz-${authUser.id.slice(0, 8)}`,
            services: [],
            service_area: "",
            ai_prompt_context: "",
          })
          .select()
          .single();
        setBusiness(newBiz);
      }

      setLoading(false);
    }

    load();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const updates = {
        name: form.name,
        services: form.services.split(",").map((s) => s.trim()),
        service_area: form.service_area,
        ai_prompt_context: form.ai_prompt_context,
        whatsapp_number: form.whatsapp_number,
        phone: form.phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", business.id);

      if (error) throw error;

      setMessage("Configurações salvas com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/dashboard" className="text-lg font-bold text-white">
            AOA <span className="text-neutral-500">Configurações</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-5 h-5 text-white" />
            <h1 className="text-2xl font-bold text-white">Configuração da IA</h1>
          </div>
          <p className="text-neutral-500">
            Personalize o comportamento da IA para sua empresa
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-start gap-2 ${
              message.includes("sucesso")
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            {message.includes("sucesso") ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <p
              className={`text-sm ${
                message.includes("sucesso")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Info */}
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-6">
              Informações da Empresa
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  WhatsApp (com país + DDD)
                </label>
                <input
                  type="text"
                  value={form.whatsapp_number}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp_number: e.target.value })
                  }
                  placeholder="55 11 987654321"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Telefone de Contato
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+55 11 3000-0000"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-6">Serviços</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Serviços (separados por vírgula)
                </label>
                <textarea
                  value={form.services}
                  onChange={(e) =>
                    setForm({ ...form, services: e.target.value })
                  }
                  placeholder="Instalação de ar-condicionado, Manutenção preventiva, Conserto de ar-condicionado"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Área de Atendimento
                </label>
                <input
                  type="text"
                  value={form.service_area}
                  onChange={(e) =>
                    setForm({ ...form, service_area: e.target.value })
                  }
                  placeholder="São Paulo - Zona Sul e Centro"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* AI Prompt */}
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <div className="flex items-start gap-2 mb-6">
              <FileText className="w-5 h-5 text-white mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Contexto da IA
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tudo que a IA precisa saber sobre sua empresa para responder
                  com precisão
                </p>
              </div>
            </div>
            <textarea
              value={form.ai_prompt_context}
              onChange={(e) =>
                setForm({ ...form, ai_prompt_context: e.target.value })
              }
              placeholder="Exemplo: 'ClimaTech Refrigeração é uma empresa familiar com 8 anos de experiência. Fazemos instalação de ar-condicionado split a partir de R$800. Manutenção preventiva custa R$250. Atendemos emergências 24h com taxa adicional de R$200. Trabalhamos com todas as marcas e a visita técnica custa R$150, descontada do serviço.'"
              rows={8}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 resize-none font-mono text-xs"
            />
            <p className="text-xs text-neutral-600 mt-2">
              Inclua: missão, serviços, preços, políticas, horários, diferenciais
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <p className="text-xs text-neutral-600">
              {user && `Conectado como: ${user.email}`}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
