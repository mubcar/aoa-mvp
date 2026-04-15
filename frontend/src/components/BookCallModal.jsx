import { useState, useEffect, useRef } from "react";
import { X, Check, Calendar, Clock, Loader2 } from "lucide-react";

const SERVICE_TYPES = ["HVAC", "Encanador", "Solar", "Eletricista", "Paisagismo"];
const TIME_SLOTS = [
  { value: "10:00", label: "10:00 (São Paulo)" },
  { value: "14:00", label: "14:00 (São Paulo)" },
  { value: "16:00", label: "16:00 (São Paulo)" },
];

const BR_WHATSAPP_RE = /^\+?55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

const API_BASE = import.meta.env.VITE_API_URL || "https://backend-three-alpha-88.vercel.app";
const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL; // e.g. https://calendly.com/yourname/setup-aoa

export function BookCallModal({ onClose, onSuccess, fullscreen = false }) {
  const [step, setStep] = useState("details"); // details → schedule → success
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    whatsapp: "",
    service_type: "",
    description: "",
    preferred_date: "",
    preferred_time: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateDetails = () => {
    const e = {};
    if (!form.business_name.trim()) e.business_name = "Obrigatório";
    if (!form.owner_name.trim()) e.owner_name = "Obrigatório";
    if (!form.whatsapp.trim()) e.whatsapp = "Obrigatório";
    else if (!BR_WHATSAPP_RE.test(form.whatsapp.trim()))
      e.whatsapp = "Formato: +55 11 91234-5678";
    if (!form.service_type) e.service_type = "Selecione um tipo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitBooking = async (payload) => {
    setApiError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao agendar");
      localStorage.setItem("aoa_setup_booked", "true");
      localStorage.setItem("aoa_setup_booked_at", new Date().toISOString());
      setStep("success");
      onSuccess?.();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailsSubmit = (ev) => {
    ev.preventDefault();
    if (!validateDetails()) return;
    setStep("schedule");
  };

  const handleFallbackSchedule = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.preferred_date) e.preferred_date = "Selecione uma data";
    if (!form.preferred_time) e.preferred_time = "Selecione um horário";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    await submitBooking(form);
  };

  // Listen for Calendly booking completion
  useEffect(() => {
    if (step !== "schedule" || !CALENDLY_URL) return;

    function isCalendlyEvent(e) {
      return e.origin === "https://calendly.com" && e.data.event && e.data.event.indexOf("calendly.") === 0;
    }
    function onMessage(e) {
      if (!isCalendlyEvent(e)) return;
      if (e.data.event === "calendly.event_scheduled") {
        const payload = e.data.payload || {};
        const ev = payload.event || {};
        const startTime = ev.uri || ev.start_time || "";
        // Best effort: pull datetime from invitee payload if present
        const inviteeStart = payload.invitee?.start_time || startTime;
        const dt = inviteeStart ? new Date(inviteeStart) : null;
        submitBooking({
          ...form,
          preferred_date: dt ? dt.toISOString().split("T")[0] : "",
          preferred_time: dt ? `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}` : "10:00",
          description:
            (form.description ? form.description + "\n" : "") +
            `[Calendly] ${inviteeStart || "scheduled"}`,
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [step, form]);

  // Load Calendly widget script
  useEffect(() => {
    if (step !== "schedule" || !CALENDLY_URL) return;
    if (document.querySelector('script[src*="calendly.com/assets/external/widget.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
  }, [step]);

  const today = new Date().toISOString().split("T")[0];

  const overlayClasses = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    : "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto";

  return (
    <div className={overlayClasses}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === "success" && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Agendamento confirmado!
            </h3>
            <p className="text-gray-600 mb-6">
              Falaremos com você em breve no WhatsApp para configurar sua IA.
            </p>
            <button
              onClick={() => {
                if (onClose) onClose();
                else window.location.reload();
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Acessar dashboard
            </button>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Agendar Chamada de Setup
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Vamos configurar sua IA juntos em 30 minutos.
            </p>

            <div className="space-y-4">
              <Field label="Nome da empresa" error={errors.business_name}>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => set("business_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Ar Cool Manutenção"
                />
              </Field>

              <Field label="Seu nome" error={errors.owner_name}>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={(e) => set("owner_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João Silva"
                />
              </Field>

              <Field label="WhatsApp (com DDD)" error={errors.whatsapp}>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+55 11 91234-5678"
                />
              </Field>

              <Field label="Tipo de serviço" error={errors.service_type}>
                <select
                  value={form.service_type}
                  onChange={(e) => set("service_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Descrição do negócio (opcional)">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Conte um pouco sobre seu negócio..."
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Escolher horário →
            </button>
          </form>
        )}

        {step === "schedule" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Escolha um horário</h3>
                <p className="text-sm text-gray-500">
                  {form.owner_name} · {form.business_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                ← Voltar
              </button>
            </div>

            {submitting && (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirmando agendamento...
              </div>
            )}

            {!submitting && CALENDLY_URL && (
              <>
                <div
                  className="calendly-inline-widget rounded-xl border border-gray-200 overflow-hidden"
                  data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=2563eb&name=${encodeURIComponent(form.owner_name)}&email=${encodeURIComponent(form.owner_name)}`}
                  style={{ minWidth: "320px", height: "620px" }}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Horários em São Paulo (UTC-3) · powered by Calendly
                </p>
              </>
            )}

            {!submitting && !CALENDLY_URL && (
              <form onSubmit={handleFallbackSchedule}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data" icon={<Calendar className="w-4 h-4" />} error={errors.preferred_date}>
                    <input
                      type="date"
                      min={today}
                      value={form.preferred_date}
                      onChange={(e) => set("preferred_date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </Field>
                  <Field label="Horário" icon={<Clock className="w-4 h-4" />} error={errors.preferred_time}>
                    <select
                      value={form.preferred_time}
                      onChange={(e) => set("preferred_time", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Selecione...</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {apiError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {apiError}
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Confirmar agendamento
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Dica: configure VITE_CALENDLY_URL para horários disponíveis reais
                </p>
              </form>
            )}

            {apiError && !submitting && CALENDLY_URL && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {apiError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
