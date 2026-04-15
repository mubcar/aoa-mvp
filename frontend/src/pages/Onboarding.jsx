import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Zap, ArrowRight, ArrowLeft, Building2, Wrench, Bot, Check, MessageSquare } from "lucide-react";

const STEPS = [
  { id: 1, label: "Empresa", icon: Building2 },
  { id: 2, label: "Serviços", icon: Wrench },
  { id: 3, label: "IA", icon: Bot },
  { id: 4, label: "WhatsApp", icon: MessageSquare },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp_number: "",
    services: "",
    service_area: "",
    business_hours_start: "08:00",
    business_hours_end: "18:00",
    ai_prompt_context: "",
  });

  useEffect(() => {
    async function checkUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate("/login"); return; }
      setUser(authUser);

      // If already has a business, go to dashboard
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", authUser.id)
        .single();

      if (existing) navigate("/dashboard");
    }
    checkUser();
  }, [navigate]);

  const handleFinish = async () => {
    if (!user || !form.name) return;
    setSaving(true);

    try {
      const slug = form.name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { error } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name: form.name,
        slug: `${slug}-${Date.now().toString(36)}`,
        phone: form.phone,
        whatsapp_number: form.whatsapp_number.replace(/\D/g, ""),
        services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
        service_area: form.service_area,
        business_hours: { start: form.business_hours_start, end: form.business_hours_end },
        ai_prompt_context: form.ai_prompt_context,
      });

      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">AOA</span>
          <span className="text-neutral-500 text-sm ml-2">Configure sua empresa</span>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step > s.id ? "bg-emerald-500/20 text-emerald-400" :
                step === s.id ? "bg-white/10 text-white" :
                "bg-white/5 text-neutral-600"
              }`}>
                {step > s.id ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${step > s.id ? "bg-emerald-500/30" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Sobre sua empresa</h2>
                <p className="text-neutral-500">Informações básicas para configurar sua conta</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">Nome da empresa *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: ClimaTech Refrigeração" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Telefone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="11 3000-0000" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Área de atendimento</label>
                    <input type="text" value={form.service_area} onChange={(e) => setForm({ ...form, service_area: e.target.value })} placeholder="São Paulo - Zona Sul" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Abre às</label>
                    <input type="time" value={form.business_hours_start} onChange={(e) => setForm({ ...form, business_hours_start: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Fecha às</label>
                    <input type="time" value={form.business_hours_end} onChange={(e) => setForm({ ...form, business_hours_end: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Seus serviços</h2>
                <p className="text-neutral-500">Quais serviços sua empresa oferece?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Serviços (separados por vírgula)</label>
                <textarea value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} placeholder="Instalação de ar-condicionado, Manutenção preventiva, Limpeza de filtros, Conserto de ar-condicionado" rows={5} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 resize-none" />
                <p className="text-xs text-neutral-600 mt-2">A IA vai usar essa lista para entender o que o cliente precisa</p>
              </div>
            </div>
          )}

          {/* Step 3: AI Context */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Treine sua IA</h2>
                <p className="text-neutral-500">Escreva tudo que a IA precisa saber para responder como sua recepcionista</p>
              </div>
              <div>
                <textarea value={form.ai_prompt_context} onChange={(e) => setForm({ ...form, ai_prompt_context: e.target.value })} placeholder={`Exemplo:\n\nSomos uma empresa familiar com 8 anos de experiência em ar-condicionado. Trabalhamos com todas as marcas.\n\nPreços:\n- Instalação de split: a partir de R$800\n- Manutenção preventiva: R$250\n- Visita técnica: R$150 (descontada do serviço)\n- Emergência 24h: +R$200\n\nGarantia de 90 dias no serviço. Aceitamos Pix e cartão.`} rows={12} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 resize-none font-mono text-xs" />
                <p className="text-xs text-neutral-600 mt-2">Inclua: preços, políticas, diferenciais, garantias, formas de pagamento, horários especiais</p>
              </div>
            </div>
          )}

          {/* Step 4: WhatsApp */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Conecte seu WhatsApp</h2>
                <p className="text-neutral-500">Último passo — informe o número que a IA vai atender</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Número do WhatsApp (com DDD)</label>
                <input type="text" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="5511987654321" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20" />
                <p className="text-xs text-neutral-600 mt-2">Use o formato: 55 + DDD + número (ex: 5511987654321)</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-sm text-amber-400 font-medium mb-1">Conexão do WhatsApp</p>
                <p className="text-xs text-neutral-400">Após concluir o cadastro, nossa equipe vai configurar a integração do seu WhatsApp em até 24h. Você receberá um email quando estiver pronto.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 1 && !form.name) { alert("Preencha o nome da empresa"); return; }
                  setStep(step + 1);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Próximo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving || !form.name}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Finalizar e ir para o Dashboard"}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
