import { useState, useEffect } from "react";
import {
  Zap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Clock,
  TrendingUp,
  Shield,
  Bot,
  ChevronRight,
  Check,
  Star,
  Users,
  Globe,
  Cpu,
  Lock,
  Sparkles,
  ArrowUpRight,
  CircleDot,
  Bell,
  TreePine,
  Leaf,
  Flower2,
  Calendar,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "IA treinada no seu catálogo",
    desc: "Sabe quais plantas, vasos e insumos você trabalha, os preços e a área de atendimento. Responde como você responderia.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20 hover:border-violet-500/40",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp integrado",
    desc: "Responde automaticamente no WhatsApp da sua empresa. Seu número, sua identidade — a IA só cuida do atendimento.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    icon: Bell,
    title: "Notificação no seu WhatsApp",
    desc: "Quando um cliente é qualificado, você recebe um resumo: nome, o que quer, tamanho do jardim, localização e horário preferido.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: Clock,
    title: "Atende enquanto você trabalha",
    desc: "Você está plantando, fazendo projeto, na estrada. A IA responde em menos de 3 segundos. Nenhum cliente perdido.",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: BarChart3,
    title: "Dashboard em tempo real",
    desc: "Todos os leads organizados por urgência, serviço desejado e localização. Acesse do celular, onde estiver.",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
  },
  {
    icon: Leaf,
    title: "Para qualquer jardim",
    desc: "Plantas, vasos, substrato, fertilizante, projetos residenciais e comerciais. A IA se adapta a tudo que você vende.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
  },
];

const STATS = [
  { value: "40%", label: "dos clientes perdidos por falta de resposta no WhatsApp", color: "text-red-400" },
  { value: "3s", label: "tempo médio de resposta da nossa IA", color: "text-emerald-400" },
  { value: "2.5x", label: "mais orçamentos fechados com atendimento instantâneo", color: "text-blue-400" },
];

const STEPS = [
  {
    num: "01",
    title: "Agende uma conversa com a gente",
    desc: "Falamos sobre o seu negócio, seu catálogo, preços e a forma como você atende. Não tem formulário — é uma conversa real.",
    color: "from-emerald-500 to-emerald-600",
    glow: "bg-emerald-500/20",
    icon: Calendar,
  },
  {
    num: "02",
    title: "Configuramos tudo para você",
    desc: "Nossa equipe treina a IA com o seu catálogo específico. Plantas, vasos, insumos, preços, área de atendimento — tudo.",
    color: "from-blue-500 to-blue-600",
    glow: "bg-blue-500/20",
    icon: Leaf,
  },
  {
    num: "03",
    title: "Leads chegam no seu WhatsApp",
    desc: "A IA passa a atender. Cada cliente qualificado chega pra você com nome, o que quer e onde está. Só fechar.",
    color: "from-violet-500 to-violet-600",
    glow: "bg-violet-500/20",
    icon: MessageSquare,
  },
];

const TESTIMONIALS = [
  {
    name: "Rodrigo Vieira",
    role: "Dono — Verde Nobre Paisagismo",
    text: "Eu estava perdendo clientes porque não conseguia responder no WhatsApp enquanto fazia projeto. Agora a IA responde, coleta tudo e eu só entro em contato pra fechar o orçamento.",
    avatar: "RP",
    color: "bg-emerald-600",
  },
  {
    name: "Fernanda Jardins",
    role: "Paisagista — Espaço Verde SP",
    text: "O melhor é que a IA já sabe quais plantas, vasos e substratos eu trabalho e os preços. O cliente chega na conversa já informado. Economia de tempo enorme.",
    avatar: "FJ",
    color: "bg-blue-600",
  },
  {
    name: "Marcelo Flores",
    role: "Proprietário — Flora Tropical Campinas",
    text: "Tinha medo de parecer robótico pro cliente. Mas o atendimento ficou mais profissional do que quando eu mesmo respondia às pressas do canteiro de obras.",
    avatar: "MF",
    color: "bg-violet-600",
  },
];

const FAQ = [
  {
    q: "Preciso trocar meu número de WhatsApp?",
    a: "Não. A AOA conecta diretamente no seu número atual. Seus clientes continuam mandando mensagem pro mesmo número de sempre.",
  },
  {
    q: "Como a IA sabe sobre o meu catálogo?",
    a: "Na conversa de setup, nossa equipe mapeia tudo: quais plantas, vasos, substratos e outros insumos você trabalha, faixas de preço, área de atendimento e como você prefere receber os leads. A IA é configurada especificamente para o seu negócio.",
  },
  {
    q: "E se o cliente perguntar algo fora do catálogo?",
    a: "A IA responde que vai verificar disponibilidade com a equipe e registra a pergunta. Você recebe a notificação e pode responder manualmente quando quiser.",
  },
  {
    q: "Quanto tempo leva para ficar pronto?",
    a: "Após a conversa de setup, sua IA fica configurada e ativa em até 48 horas.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa. Cancele a qualquer momento.",
  },
];

// WhatsApp chat demo — Flora Multi Verde
const CHAT_MESSAGES = [
  {
    from: "client",
    text: "Oi! Quero montar um jardim na varanda do meu apartamento. Tenho uns 12m² e queria plantas que aguentem sol e fiquem bonitas 🌿",
    time: "15:10",
  },
  {
    from: "ai",
    text: "Oi! Sou a assistente virtual da Flora Multi Verde 😊 Que projeto gostoso! Varanda com sol direto tem ótimas opções — suculentas, lavanda, pata-de-vaca, ixora. Você prefere mais verde ou gosta de flores também?",
    time: "15:10",
  },
  {
    from: "client",
    text: "Adoro flores! E queria já com vasos bonitos, se possível. Fico em Pinheiros, SP",
    time: "15:11",
  },
  {
    from: "ai",
    text: "Ótimo! 🌸 Trabalhamos com kits completos — planta + vaso + substrato já preparado. Temos vasos de cerâmica, cimento e fibra em vários tamanhos. Qual seu nome para eu registrar o interesse e nossa equipe entrar em contato com opções?",
    time: "15:11",
  },
  {
    from: "client",
    text: "Sou Ana Clara, pode me mandar mensagem aqui mesmo no WhatsApp",
    time: "15:12",
  },
  {
    from: "ai",
    text: "✅ Anotado, Ana Clara! Atendemos Pinheiros com entrega. Nossa equipe vai entrar em contato com fotos dos kits e valores. Tem preferência de horário para receber a mensagem?",
    time: "15:12",
  },
];

function FloatingOrb({ className, color, size = "w-64 h-64" }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${size} ${color} ${className}`} />
  );
}

export function Landing() {
  const [email, setEmail] = useState("");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (visibleMessages < CHAT_MESSAGES.length) {
      const timer = setTimeout(
        () => setVisibleMessages((v) => v + 1),
        visibleMessages === 0 ? 800 : 1200
      );
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <div className="min-h-screen bg-[#112a16] text-white antialiased overflow-x-hidden">
      <FloatingOrb className="top-20 -left-32" color="bg-emerald-600" />
      <FloatingOrb className="top-96 -right-32" color="bg-blue-600" />
      <FloatingOrb className="top-[60rem] -left-20" color="bg-violet-600" size="w-48 h-48" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#112a16]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AOA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#plano" className="hover:text-white transition-colors">Plano</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block">
              Login
            </a>
            <a href="/login" className="text-sm font-medium bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Começar
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Para paisagistas e vendedores de plantas
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Pare de perder clientes
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400">
              enquanto planta.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            IA que responde seu WhatsApp, conhece seu catálogo de plantas, vasos e insumos,
            qualifica cada cliente e te manda o resumo pronto para fechar o negócio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
            >
              Agendar conversa de setup
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/10 text-neutral-300 font-medium rounded-xl hover:bg-white/5 transition-colors text-sm text-center"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Demo */}
      <section className="px-6 pb-24 relative">
        <FloatingOrb className="-bottom-20 left-1/2 -translate-x-1/2" color="bg-emerald-600" size="w-96 h-96" />
        <div className="max-w-md mx-auto">
          <div className="rounded-[2.5rem] border-4 border-neutral-800 bg-neutral-900 p-1 shadow-2xl shadow-black/50 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-10" />
            <div className="rounded-[2rem] overflow-hidden">
              {/* WhatsApp header */}
              <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2" />
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Flora Multi Verde · IA</p>
                  <p className="text-[10px] text-emerald-200/70">online</p>
                </div>
                <MessageSquare className="w-4 h-4 text-emerald-200/70" />
              </div>

              {/* Chat area */}
              <div
                className="relative min-h-[420px] p-3 space-y-2 overflow-hidden"
                style={{
                  backgroundColor: "#0e2112",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                <div className="flex justify-center mb-2">
                  <span className="bg-[#182229] text-[10px] text-neutral-400 px-3 py-1 rounded-lg shadow-sm">HOJE</span>
                </div>

                {CHAT_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm ${msg.from === "client" ? "bg-[#005C4B] rounded-tr-none" : "bg-[#202C33] rounded-tl-none"}`}>
                      <p className="text-[13px] text-neutral-200 leading-relaxed">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-neutral-500">{msg.time}</span>
                        {msg.from === "client" && (
                          <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 16 11" fill="currentColor">
                            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.046.249.14.337l2.995 2.83a.724.724 0 0 0 .474.178c.176 0 .34-.085.493-.253l6.525-8.056c.094-.112.14-.225.14-.337a.414.414 0 0 0-.14-.302l-.217-.164z" />
                            <path d="M14.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.136-.312.31 1.79 1.692a.724.724 0 0 0 .474.178c.176 0 .34-.085.493-.253l6.525-8.056c.094-.112.14-.225.14-.337a.414.414 0 0 0-.14-.302l-.217-.164z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {visibleMessages < CHAT_MESSAGES.length && visibleMessages > 0 && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-[#202C33] rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {visibleMessages >= CHAT_MESSAGES.length && (
                  <div className="flex justify-center pt-2 animate-fade-in">
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        Lead qualificado · Pinheiros · Kit varanda com flores
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="bg-[#202C33] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2">
                  <p className="text-xs text-neutral-500">Mensagem</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.239 1.816-13.239 1.817-.011 7.912z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-600 mt-6">
            Conversa real simulada com a Flora Multi Verde — IA responde em menos de 3 segundos
          </p>
        </div>
      </section>

      {/* How it works — 3 steps with setup call emphasis */}
      <section id="como-funciona" className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-20 -right-20" color="bg-blue-600" size="w-48 h-48" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-4">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Três passos. Zero complicação.</h2>
          <p className="text-neutral-500 mb-16 max-w-xl">
            Não tem formulário de auto-cadastro. Começamos com uma conversa real para entender o seu negócio.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="group relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="relative">
                  <div className={`absolute -inset-3 rounded-2xl ${step.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <span className={`text-5xl font-black bg-gradient-to-b ${step.color} bg-clip-text text-transparent`}>
                      {step.num}
                    </span>
                    <h3 className="text-lg font-semibold mt-3 mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setup call highlight box */}
          <div className="mt-16 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">A conversa de setup é o ponto de partida</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Avaliamos seu catálogo, preços, área de atendimento e como você prefere receber os leads.
                  Só depois configuramos sua IA. Levamos no máximo 30 minutos.
                </p>
              </div>
              <a
                href="/login"
                className="flex-shrink-0 px-5 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
              >
                Agendar agora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-40 -left-32" color="bg-violet-600" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-violet-400 tracking-widest uppercase mb-4">Recursos</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Feito para paisagistas.</h2>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-500 mb-16">Não para empresas genéricas.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`group p-6 rounded-2xl border bg-gradient-to-b ${f.color} ${f.borderColor} transition-all hover:scale-[1.02]`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-4">Depoimentos</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-16">Quem usa, recomenda.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the AI learns your catalog */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="bottom-0 right-0" color="bg-emerald-600" size="w-72 h-72" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-cyan-400 tracking-widest uppercase mb-4">Personalização</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">A IA aprende o seu negócio.</h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Não é uma IA genérica. Na conversa de setup mapeamos tudo: plantas, vasos, substratos, fertilizantes, serviços — e como você prefere atender.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { icon: TreePine, text: "Catálogo completo: plantas, vasos, substratos, fertilizantes", color: "text-emerald-400" },
                { icon: Leaf, text: "Tamanhos disponíveis e tempo de entrega", color: "text-green-400" },
                { icon: Globe, text: "Área de atendimento, entrega e plantio", color: "text-blue-400" },
                { icon: Flower2, text: "Projetos: residencial, comercial, hortas", color: "text-violet-400" },
                { icon: Sparkles, text: "Tom de voz e jeito de atender seu cliente", color: "text-amber-400" },
                { icon: Shield, text: "Políticas de visita técnica e orçamento", color: "text-cyan-400" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                  <p className="text-sm text-neutral-300">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 font-mono text-xs">
              <div className="flex items-center gap-2 mb-4 text-neutral-500">
                <CircleDot className="w-3 h-3 text-emerald-500" />
                <span>Catálogo configurado — Flora Multi Verde</span>
              </div>
              <div className="space-y-2 text-neutral-400 leading-relaxed">
                <p className="text-emerald-400">// Plantas</p>
                <p><span className="text-blue-400">tropicais:</span> <span className="text-amber-400">helicônia, ave-do-paraíso, etc</span></p>
                <p><span className="text-blue-400">ornamentais:</span> <span className="text-amber-400">ixora, lavanda, pata-de-vaca</span></p>
                <p><span className="text-blue-400">internas:</span> <span className="text-amber-400">zamioculca, costela-de-adão</span></p>
                <p className="mt-3 text-emerald-400">// Produtos</p>
                <p><span className="text-blue-400">vasos:</span> <span className="text-amber-400">cerâmica, cimento, fibra</span></p>
                <p><span className="text-blue-400">substrato:</span> <span className="text-amber-400">universal, para cactos, orgânico</span></p>
                <p><span className="text-blue-400">fertilizante:</span> <span className="text-amber-400">NPK, húmus, fertilizante foliar</span></p>
                <p className="mt-3 text-emerald-400">// Serviços</p>
                <p><span className="text-blue-400">projeto:</span> <span className="text-amber-400">visita técnica gratuita</span></p>
                <p><span className="text-blue-400">entrega:</span> <span className="text-amber-400">Grande SP inclusa</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — single plan */}
      <section id="plano" className="px-6 py-24 border-t border-white/5 relative">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-4">Plano</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Um plano. Simples assim.</h2>
          <p className="text-neutral-500 mb-12">Sem surpresas, sem camadas. Tudo incluso, cancel quando quiser.</p>

          <div className="relative p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent ring-1 ring-emerald-500/20">
            <span className="inline-block text-[10px] font-semibold tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1.5 rounded-full mb-6">
              Acesso completo
            </span>
            <div className="mb-2">
              <span className="text-6xl font-bold tracking-tight">R$597</span>
              <span className="text-neutral-500 text-lg">/mês</span>
            </div>
            <p className="text-sm text-neutral-500 mb-8">Após conversa de setup obrigatória</p>

            <ul className="space-y-3 mb-10 text-left max-w-sm mx-auto">
              {[
                "Atendimentos ilimitados no WhatsApp",
                "IA treinada no seu catálogo específico",
                "Notificações de leads no seu WhatsApp",
                "Dashboard em tempo real",
                "Conversa de setup personalizada",
                "Suporte direto com nossa equipe",
                "Cancele quando quiser",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/login"
              className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-emerald-500/20"
            >
              Agendar conversa de setup →
            </a>
            <p className="text-xs text-neutral-600 mt-4">
              Ativação em até 48h após a conversa
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium text-blue-400 tracking-widest uppercase mb-4">Perguntas frequentes</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">Tire suas dúvidas.</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AOA */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-0 left-1/2 -translate-x-1/2" color="bg-violet-600" size="w-96 h-96" />
        <div className="max-w-4xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium text-violet-400 tracking-widest uppercase mb-4">Por que a AOA?</p>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Cada mensagem sem resposta é um jardim que você não vai plantar.
              </h2>
              <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
                <p>
                  O paisagista está na terra, no projeto, na entrega. Não tem como ficar no celular o dia inteiro.
                  Enquanto isso, clientes mandam mensagem perguntando sobre plantas, vasos e projetos — e ninguém responde.
                </p>
                <p>
                  <span className="text-white font-medium">40% desses clientes vão pro concorrente</span>{" "}
                  que respondeu mais rápido. Não importa se você tem o catálogo mais bonito.
                </p>
                <p>
                  A AOA coloca uma IA no seu WhatsApp que conhece cada planta do seu catálogo, responde como você responderia e te manda o lead pronto para fechar.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  title: "Mais orçamentos, mais fechamentos",
                  desc: "Recupere os 40% de clientes que você perde por não responder a tempo.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  icon: Clock,
                  title: "Foque no que você sabe fazer",
                  desc: "Para de responder mensagem enquanto planta ou faz projeto. A IA faz isso por você.",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10 border-blue-500/20",
                },
                {
                  icon: Users,
                  title: "Cliente impressionado",
                  desc: "Resposta em 3 segundos com informações corretas sobre seu catálogo. Impressão de empresa grande.",
                  color: "text-violet-400",
                  bg: "bg-violet-500/10 border-violet-500/20",
                },
                {
                  icon: Bell,
                  title: "Lead pronto no seu WhatsApp",
                  desc: "Cada cliente qualificado chega pra você com nome, o que quer, onde fica e o melhor horário.",
                  color: "text-amber-400",
                  bg: "bg-amber-500/10 border-amber-500/20",
                },
              ].map((item) => (
                <div key={item.title} className={`p-5 rounded-xl border ${item.bg}`}>
                  <div className="flex items-start gap-3">
                    <item.icon className={`w-5 h-5 ${item.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute -inset-20 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <TreePine className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pronto para nunca mais perder um cliente?
            </h2>
            <p className="text-neutral-500 mb-8">
              Agende uma conversa de 30 minutos. Nossa equipe avalia seu catálogo e configura tudo.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); window.location.href = "/login"; }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Agendar conversa
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold">AOA</span>
              <span className="text-xs text-neutral-600">Para paisagistas.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-500">
              <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
              <a href="#plano" className="hover:text-white transition-colors">Plano</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="/login" className="hover:text-white transition-colors">Login</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <p className="text-xs text-neutral-700">© 2026 AOA. Todos os direitos reservados.</p>
            <p className="text-xs text-neutral-700">Feito com IA para quem faz com as mãos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
