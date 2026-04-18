import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, Link2, LogOut, ChevronDown, ChevronUp,
  Check, X, Users, Building2, RefreshCw, Shield
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "aoa_admin_token";

// ─── helpers ────────────────────────────────────────────────────────────────
function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function apiFetch(path, token, opts = {}) {
  const res = await fetch(`${API}/api/admin${path}`, {
    ...opts,
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro desconhecido");
  return json;
}

// ─── Login gate ─────────────────────────────────────────────────────────────
function LoginGate({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token } = await apiFetch("/auth", pw, {
        method: "POST",
        body: JSON.stringify({ password: pw }),
      });
      localStorage.setItem(STORAGE_KEY, token);
      onLogin(token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">AOA Admin</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Senha de admin"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Business form ───────────────────────────────────────────────────────────
function BusinessForm({ initial = {}, onSave, onCancel, token }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    phone: initial.phone || "",
    whatsapp_number: initial.whatsapp_number || "",
    whatsapp_instance: initial.whatsapp_instance || "",
    notification_whatsapp: initial.notification_whatsapp || "",
    services: Array.isArray(initial.services) ? initial.services.join(", ") : (initial.services || ""),
    service_area: initial.service_area || "",
    business_hours_start: initial.business_hours?.start || "08:00",
    business_hours_end: initial.business_hours?.end || "18:00",
    ai_prompt_context: initial.ai_prompt_context || "",
    owner_email: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const payload = { ...form };
      const result = initial.id
        ? await apiFetch(`/businesses/${initial.id}`, token, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiFetch("/businesses", token, { method: "POST", body: JSON.stringify(payload) });
      onSave(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="grid grid-cols-2 gap-3">
        <FField label="Nome da empresa *">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required
            className={input} placeholder="Ex: Hidráulica Silva" />
        </FField>
        <FField label="Área de atendimento">
          <input value={form.service_area} onChange={(e) => set("service_area", e.target.value)}
            className={input} placeholder="São Paulo - Zona Sul" />
        </FField>
        <FField label="Telefone">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className={input} placeholder="+55 11 9xxxx-xxxx" />
        </FField>
        <FField label="Número WhatsApp">
          <input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)}
            className={input} placeholder="5511..." />
        </FField>
        <FField label="Evolution API — Instance Name">
          <input value={form.whatsapp_instance} onChange={(e) => set("whatsapp_instance", e.target.value)}
            className={input} placeholder="hidraulica-silva" />
        </FField>
        <FField label="📲 Notificações WhatsApp">
          <input value={form.notification_whatsapp} onChange={(e) => set("notification_whatsapp", e.target.value)}
            className={input} placeholder="5511999999999 ou JID do grupo @g.us" />
          <p className="text-[10px] text-gray-600 mt-0.5">Número ou grupo que recebe o card quando um lead qualifica</p>
        </FField>
        <FField label="Horário de funcionamento">
          <div className="flex gap-2 items-center">
            <input type="time" value={form.business_hours_start}
              onChange={(e) => set("business_hours_start", e.target.value)} className={`${input} flex-1`} />
            <span className="text-gray-500 text-sm">às</span>
            <input type="time" value={form.business_hours_end}
              onChange={(e) => set("business_hours_end", e.target.value)} className={`${input} flex-1`} />
          </div>
        </FField>
      </div>

      <FField label="Serviços (separados por vírgula)">
        <input value={form.services} onChange={(e) => set("services", e.target.value)}
          className={input} placeholder="Encanamento, Desentupimento, Reparos hidráulicos" />
      </FField>

      <FField label="Contexto da IA">
        <textarea value={form.ai_prompt_context} onChange={(e) => set("ai_prompt_context", e.target.value)}
          rows={5} className={`${input} resize-none`}
          placeholder="Descreva a empresa: nome, experiência, serviços, preços, área de atuação, diferenciais. Quanto mais detalhe, melhor a IA vai performar." />
      </FField>

      {!initial.id && (
        <FField label="Email do cliente (para vincular conta)">
          <input type="email" value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)}
            className={input} placeholder="cliente@email.com (opcional)" />
        </FField>
      )}

      {err && <p className="text-red-400 text-sm">{err}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Salvando..." : initial.id ? "Salvar alterações" : "Criar empresa"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Business card ───────────────────────────────────────────────────────────
function BusinessCard({ biz, token, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleAssign(e) {
    e.preventDefault();
    setAssigning(true);
    setAssignMsg("");
    try {
      await apiFetch(`/businesses/${biz.id}/assign-owner`, token, {
        method: "POST",
        body: JSON.stringify({ email: assignEmail }),
      });
      setAssignMsg("✅ Vinculado com sucesso");
      setAssignEmail("");
      onUpdate();
    } catch (err) {
      setAssignMsg(`❌ ${err.message}`);
    } finally {
      setAssigning(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Deletar "${biz.name}"? Isso não apaga os leads.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/businesses/${biz.id}`, token, { method: "DELETE" });
      onDelete(biz.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <BusinessForm
        initial={biz}
        token={token}
        onSave={(updated) => { onUpdate(updated); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-semibold text-white truncate">{biz.name}</span>
            {biz.owner_id
              ? <span className="text-[10px] bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">vinculado</span>
              : <span className="text-[10px] bg-yellow-900/50 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full">sem conta</span>
            }
          </div>
          <div className="flex gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
            {biz.service_area && <span>{biz.service_area}</span>}
            {biz.whatsapp_instance && <span className="text-emerald-500">📱 {biz.whatsapp_instance}</span>}
            {biz.services?.length > 0 && <span>{biz.services.slice(0, 2).join(", ")}{biz.services.length > 2 ? "..." : ""}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <button onClick={() => setEditing(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-4">
          {biz.ai_prompt_context && (
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Contexto da IA</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{biz.ai_prompt_context}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {biz.whatsapp_number && <Detail label="WhatsApp" value={biz.whatsapp_number} />}
            {biz.phone && <Detail label="Telefone" value={biz.phone} />}
            {biz.business_hours && (
              <Detail label="Horário" value={`${biz.business_hours.start} – ${biz.business_hours.end}`} />
            )}
            <Detail label="ID" value={biz.id} mono />
          </div>

          {/* Assign owner */}
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Vincular cliente (por email)
            </p>
            <form onSubmit={handleAssign} className="flex gap-2">
              <input
                type="email"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="email@cliente.com"
                className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" disabled={assigning}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {assigning ? "..." : "Vincular"}
              </button>
            </form>
            {assignMsg && <p className="text-xs mt-1 text-gray-400">{assignMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin page ─────────────────────────────────────────────────────────
export function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("businesses");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [bizData, usersData] = await Promise.all([
        apiFetch("/businesses", token),
        apiFetch("/users", token),
      ]);
      setBusinesses(bizData);
      setUsers(usersData);
    } catch (err) {
      if (err.message === "Unauthorized") {
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
  }

  if (!token) return <LoginGate onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-lg">AOA Admin</span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-1">
            {businesses.length} empresa{businesses.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white" title="Recarregar">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-xl p-1 w-fit">
          {[["businesses", <Building2 className="w-4 h-4" />, "Empresas"],
            ["users", <Users className="w-4 h-4" />, "Usuários"]].map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Businesses tab */}
        {tab === "businesses" && (
          <div className="space-y-3">
            {!creating && (
              <button onClick={() => setCreating(true)}
                className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Nova empresa
              </button>
            )}
            {creating && (
              <BusinessForm
                token={token}
                onSave={(biz) => { setBusinesses((prev) => [biz, ...prev]); setCreating(false); }}
                onCancel={() => setCreating(false)}
              />
            )}
            {loading && (
              <p className="text-center text-gray-500 py-8">Carregando...</p>
            )}
            {!loading && businesses.length === 0 && (
              <p className="text-center text-gray-600 py-8">Nenhuma empresa ainda.</p>
            )}
            {businesses.map((biz) => (
              <BusinessCard
                key={biz.id}
                biz={biz}
                token={token}
                onUpdate={(updated) => {
                  if (updated) setBusinesses((prev) => prev.map((b) => b.id === updated.id ? updated : b));
                  else load();
                }}
                onDelete={(id) => setBusinesses((prev) => prev.filter((b) => b.id !== id))}
              />
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="space-y-2">
            {loading && <p className="text-center text-gray-500 py-8">Carregando...</p>}
            {!loading && users.length === 0 && (
              <p className="text-center text-gray-600 py-8">Nenhum usuário cadastrado.</p>
            )}
            {users.map((u) => (
              <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{u.email}</p>
                  <p className="text-xs text-gray-500 font-mono">{u.id}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                  {u.last_sign_in && <p>Último login: {new Date(u.last_sign_in).toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────
const input = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

function FField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-300 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  );
}
