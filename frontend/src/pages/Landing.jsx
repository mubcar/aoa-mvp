import { useState, useEffect } from "react";
import {
  Zap,
  MessageSquare,
  Phone,
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
  Headphones,
  DollarSign,
  Globe,
  Cpu,
  Lock,
  Sparkles,
  ArrowUpRight,
  CircleDot,
  Wrench,
  Flame,
  Sun,
  Droplets,
  Plug,
  TreePine,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "IA que fala português",
    desc: "Atendimento natural em português brasileiro, 24h por dia. Seu cliente nem percebe que é um robô.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20 hover:border-violet-500/40",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp integrado",
    desc: "Responde automaticamente no WhatsApp da sua empresa. Zero configuração, zero treinamento.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    icon: Headphones,
    title: "Atende ligações",
    desc: "Agente de voz que atende chamadas perdidas e qualifica o cliente por ligação.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: Clock,
    title: "Resposta instantânea",
    desc: "Enquanto você está no serviço, a IA responde em menos de 3 segundos. Nenhum cliente perdido.",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: BarChart3,
    title: "Dashboard em tempo real",
    desc: "Veja todos os clientes, urgências e conversas num painel simples. Acesse do celular.",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
  },
  {
    icon: DollarSign,
    title: "Cobra pagamentos",
    desc: "Gera link de pagamento automático após qualificação. Cliente paga o sinal sem você precisar cobrar.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
  },
];

const STATS = [
  { value: "40%", label: "dos clientes são perdidos por falta de resposta", color: "text-red-400" },
  { value: "3s", label: "tempo médio de resposta da nossa IA", color: "text-emerald-400" },
  { value: "2.5x", label: "mais conversões com atendimento instantâneo", color: "text-blue-400" },
];

const STEPS = [
  {
    num: "01",
    title: "Conecte seu WhatsApp",
    desc: "Integração em 5 minutos. Sem mudar de número. Sem instalar nada.",
    color: "from-emerald-500 to-emerald-600",
    glow: "bg-emerald-500/20",
  },
  {
    num: "02",
    title: "IA começa a atender",
    desc: "Atende clientes, responde dúvidas, agenda serviços e cobra pagamentos.",
    color: "from-blue-500 to-blue-600",
    glow: "bg-blue-500/20",
  },
  {
    num: "03",
    title: "Você fecha o serviço",
    desc: "Recebe clientes qualificados prontos para converter. Só chegar e trabalhar.",
    color: "from-violet-500 to-violet-600",
    glow: "bg-violet-500/20",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "297",
    period: "/mês",
    features: [
      "Até 100 atendimentos/mês",
      "WhatsApp integrado",
      "Dashboard básico",
      "1 número conectado",
      "Suporte por email",
    ],
    cta: "Começar agora",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "597",
    period: "/mês",
    features: [
      "Atendimentos ilimitados",
      "WhatsApp + Ligação",
      "Dashboard completo",
      "3 números conectados",
      "Cobrança automática de sinal",
      "Suporte prioritário",
    ],
    cta: "Mais popular",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    features: [
      "Tudo do Pro",
      "Múltiplas unidades",
      "API personalizada",
      "Onboarding dedicado",
      "SLA garantido",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Roberto Almeida",
    role: "Dono — Gelo Total Refrigeração",
    text: "Eu perdia pelo menos 5 clientes por semana porque estava em cima do telhado instalando ar. Agora a IA responde na hora e eu só chego pra fechar.",
    avatar: "RA",
    color: "bg-blue-500",
  },
  {
    name: "Carla Mendes",
    role: "Gerente — SolarTech Energia",
    text: "A taxa de conversão dobrou no primeiro mês. O cliente recebe resposta em segundos e já chega qualificado pra gente.",
    avatar: "CM",
    color: "bg-violet-500",
  },
  {
    name: "Fernando Costa",
    role: "Proprietário — HidroFix Encanamentos",
    text: "Antes eu perdia chamados de emergência porque tava debaixo de uma pia. Agora a IA já agenda e eu recebo tudo organizado no celular.",
    avatar: "FC",
    color: "bg-emerald-500",
  },
];

const INDUSTRIES = [
  { icon: Flame, label: "HVAC / Refrigeração" },
  { icon: Droplets, label: "Encanamento" },
  { icon: Sun, label: "Energia Solar" },
  { icon: Plug, label: "Elétrica" },
  { icon: TreePine, label: "Paisagismo" },
  { icon: Wrench, label: "Manutenção Geral" },
];

const FAQ = [
  {
    q: "Preciso trocar meu número de WhatsApp?",
    a: "Não. A AOA conecta diretamente no seu número atual. Seus clientes continuam mandando mensagem pro mesmo número de sempre.",
  },
  {
    q: "A IA funciona para meu tipo de serviço?",
    a: "Sim. A IA é personalizada para o seu negócio. Você configura os serviços, preços, horários e a forma de atender. Funciona para qualquer serviço residencial ou comercial.",
  },
  {
    q: "E se o cliente perguntar algo que a IA não sabe?",
    a: "A IA responde que vai verificar com a equipe técnica e registra a pergunta. Você recebe a notificação e pode responder manualmente a qualquer momento.",
  },
  {
    q: "Quanto tempo leva para configurar?",
    a: "5 minutos. Você conecta seu WhatsApp, preenche as informações da empresa e a IA já começa a atender automaticamente.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa. Cancele pelo dashboard a qualquer momento.",
  },
];

// WhatsApp chat messages for the demo
const CHAT_MESSAGES = [
  {
    from: "client",
    text: "Oi, boa tarde! Meu ar-condicionado parou de gelar e ta saindo ar quente. Ta fazendo 38 graus aqui e tenho um bebe em casa 😰",
    time: "14:32",
  },
  {
    from: "ai",
    text: "Oi! Sou a assistente virtual da ClimaTech Refrigeração 😊 Nossa, imagino como deve estar desconfortável! Vou te ajudar a resolver isso o mais rápido possível. Qual seu nome e em qual bairro você está?",
    time: "14:32",
  },
  {
    from: "client",
    text: "Maria Santos, moro na Vila Mariana. É um split LG, faz 2 anos sem manutenção",
    time: "14:33",
  },
  {
    from: "ai",
    text: "Maria, entendo a urgência! Com bebê em casa não dá pra esperar mesmo. Vou registrar como emergência e nosso técnico vai te atender ainda hoje pela manhã. A visita técnica custa R$150 e já é descontada do serviço. Posso confirmar?",
    time: "14:33",
  },
  {
    from: "client",
    text: "Sim, por favor! Pode ser às 8h?",
    time: "14:34",
  },
  {
    from: "ai",
    text: "Perfeito Maria! ✅ Agendado para hoje às 8h na Vila Mariana. Nosso técnico vai entrar em contato pra confirmar. Fique tranquila que vamos resolver! 🔧",
    time: "14:34",
  },
];

function FloatingOrb({ className, color, size = "w-64 h-64" }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${size} ${color} ${className}`}
    />
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
    <div className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
      {/* Floating orbs for depth */}
      <FloatingOrb className="top-20 -left-32" color="bg-emerald-600" />
      <FloatingOrb className="top-96 -right-32" color="bg-blue-600" />
      <FloatingOrb className="top-[60rem] -left-20" color="bg-violet-600" size="w-48 h-48" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AOA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">
              Como funciona
            </a>
            <a href="#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#precos" className="hover:text-white transition-colors">
              Preços
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
            >
              Login
            </a>
            <a
              href="/login"
              className="text-sm font-medium bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Começar grátis
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            IA atendendo agora mesmo
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Pare de perder clientes
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400">
              enquanto trabalha.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            IA que atende clientes, responde dúvidas, agenda serviços e cobra
            pagamentos — tudo no automático pelo WhatsApp e ligação.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
            >
              Testar grátis por 14 dias
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
              <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Demo */}
      <section className="px-6 pb-24 relative">
        <FloatingOrb className="-bottom-20 left-1/2 -translate-x-1/2" color="bg-emerald-600" size="w-96 h-96" />
        <div className="max-w-md mx-auto">
          {/* Phone frame */}
          <div className="rounded-[2.5rem] border-4 border-neutral-800 bg-neutral-900 p-1 shadow-2xl shadow-black/50 relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-10" />
            <div className="rounded-[2rem] overflow-hidden">
              {/* WhatsApp header */}
              <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2" /> {/* spacer for notch */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">ClimaTech Refrigeração</p>
                  <p className="text-[10px] text-emerald-200/70">online</p>
                </div>
                <Phone className="w-4 h-4 text-emerald-200/70" />
              </div>

              {/* Chat area with WhatsApp wallpaper */}
              <div
                className="relative min-h-[420px] p-3 space-y-2 overflow-hidden"
                style={{
                  backgroundColor: "#0B141A",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {/* Date bubble */}
                <div className="flex justify-center mb-2">
                  <span className="bg-[#182229] text-[10px] text-neutral-400 px-3 py-1 rounded-lg shadow-sm">
                    HOJE
                  </span>
                </div>

                {CHAT_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm relative ${
                        msg.from === "client"
                          ? "bg-[#005C4B] rounded-tr-none"
                          : "bg-[#202C33] rounded-tl-none"
                      }`}
                    >
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

                {/* Typing indicator */}
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

                {/* Qualified badge after all messages */}
                {visibleMessages >= CHAT_MESSAGES.length && (
                  <div className="flex justify-center pt-2 animate-fade-in">
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        Cliente qualificado · Emergência · Agendado 8h
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp input bar */}
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

          {/* Label under phone */}
          <p className="text-center text-xs text-neutral-600 mt-6">
            Conversa real simulada — a IA responde em menos de 3 segundos
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-20 -right-20" color="bg-blue-600" size="w-48 h-48" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-4">
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-16">
            Três passos. Zero complicação.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="group relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="relative">
                  <div className={`absolute -inset-3 rounded-2xl ${step.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <span
                      className={`text-5xl font-black bg-gradient-to-b ${step.color} bg-clip-text text-transparent`}
                    >
                      {step.num}
                    </span>
                    <h3 className="text-lg font-semibold mt-3 mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-medium text-blue-400 tracking-widest uppercase mb-4">
            Para quem é
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">
            Feito para empresas de serviços residenciais
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.label}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group text-center"
              >
                <ind.icon className="w-6 h-6 mx-auto mb-2 text-neutral-500 group-hover:text-white transition-colors" />
                <p className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  {ind.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-40 -left-32" color="bg-violet-600" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-violet-400 tracking-widest uppercase mb-4">
            Recursos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tudo que você precisa para
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-500 mb-16">
            nunca mais perder um cliente.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group p-6 rounded-2xl border bg-gradient-to-b ${f.color} ${f.borderColor} transition-all hover:scale-[1.02]`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors`}>
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
          <p className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-4">
            Depoimentos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-16">
            Quem usa, recomenda.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}
                  >
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

      {/* How AI learns your business */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="bottom-0 right-0" color="bg-emerald-600" size="w-72 h-72" />
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-cyan-400 tracking-widest uppercase mb-4">
            Personalização
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            A IA aprende sobre seu negócio.
          </h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Cada empresa é única. Por isso a IA da AOA é treinada com as informações específicas do seu negócio.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { icon: Sparkles, text: "Serviços e preços da sua empresa", color: "text-amber-400" },
                { icon: Globe, text: "Área de atendimento e horários", color: "text-blue-400" },
                { icon: Users, text: "Tom de voz e forma de atender", color: "text-violet-400" },
                { icon: Shield, text: "Políticas de cobrança e garantia", color: "text-emerald-400" },
                { icon: Cpu, text: "Respostas para perguntas frequentes", color: "text-cyan-400" },
                { icon: Lock, text: "Informações confidenciais protegidas", color: "text-red-400" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
                >
                  <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                  <p className="text-sm text-neutral-300">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 font-mono text-xs">
              <div className="flex items-center gap-2 mb-4 text-neutral-500">
                <CircleDot className="w-3 h-3 text-emerald-500" />
                <span>Contexto da IA — Exemplo</span>
              </div>
              <div className="space-y-2 text-neutral-400 leading-relaxed">
                <p className="text-emerald-400">// Informações da empresa</p>
                <p>
                  <span className="text-blue-400">empresa:</span> ClimaTech Refrigeração
                </p>
                <p>
                  <span className="text-blue-400">experiência:</span> 8 anos
                </p>
                <p>
                  <span className="text-blue-400">área:</span> São Paulo, Zona Sul e Centro
                </p>
                <p className="mt-3 text-emerald-400">// Tabela de preços</p>
                <p>
                  <span className="text-blue-400">instalação_split:</span>{" "}
                  <span className="text-amber-400">a partir de R$800</span>
                </p>
                <p>
                  <span className="text-blue-400">manutenção:</span>{" "}
                  <span className="text-amber-400">R$250</span>
                </p>
                <p>
                  <span className="text-blue-400">visita_técnica:</span>{" "}
                  <span className="text-amber-400">R$150</span>{" "}
                  <span className="text-neutral-600">(desconta do serviço)</span>
                </p>
                <p>
                  <span className="text-blue-400">emergência_24h:</span>{" "}
                  <span className="text-amber-400">+R$200</span>
                </p>
                <p className="mt-3 text-emerald-400">// Regras especiais</p>
                <p>
                  <span className="text-blue-400">marcas:</span> todas
                </p>
                <p>
                  <span className="text-blue-400">garantia:</span> 90 dias no serviço
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="px-6 py-24 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-4">
            Preços
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Simples e transparente.
          </h2>
          <p className="text-neutral-500 mb-16">
            Sem taxa de setup. Sem surpresas. Cancele quando quiser.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl border transition-all ${
                  plan.highlighted
                    ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent ring-1 ring-emerald-500/20 scale-[1.02]"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block text-[10px] font-semibold tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2.5 py-1 rounded-full mb-4">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price.startsWith("S") ? "" : "R$"}
                    {plan.price}
                  </span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-400">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.highlighted ? "text-emerald-400" : "text-neutral-600"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium text-blue-400 tracking-widest uppercase mb-4">
            Perguntas frequentes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Tire suas dúvidas.
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
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

      {/* Bottom Details */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <FloatingOrb className="top-0 left-1/2 -translate-x-1/2" color="bg-violet-600" size="w-96 h-96" />
        <div className="max-w-4xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium text-violet-400 tracking-widest uppercase mb-4">
                Por que a AOA?
              </p>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Cada minuto sem responder é um cliente perdido.
              </h2>
              <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
                <p>
                  O dono de uma empresa de serviços não pode ficar no celular o dia
                  inteiro. Ele está instalando um equipamento, consertando um
                  encanamento, subindo no telhado. Enquanto isso, clientes mandam
                  mensagem no WhatsApp e ninguém responde.
                </p>
                <p>
                  <span className="text-white font-medium">40% desses clientes desistem</span>{" "}
                  e vão pro concorrente que respondeu mais rápido.
                </p>
                <p>
                  A AOA resolve isso colocando uma IA inteligente no seu WhatsApp que
                  responde como se fosse sua recepcionista: educada, rápida,
                  conhece seus preços e serviços, agenda o atendimento e ainda
                  cobra o sinal.
                </p>
                <p>
                  Você continua fazendo o que sabe — o serviço — enquanto a IA
                  cuida de trazer os clientes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  title: "Aumente seu faturamento",
                  desc: "Recupere os 40% de clientes que você perde por não responder a tempo.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  icon: Clock,
                  title: "Economize seu tempo",
                  desc: "Para de responder mensagem no almoço, no trânsito, no meio do serviço. A IA faz isso por você.",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10 border-blue-500/20",
                },
                {
                  icon: Users,
                  title: "Atendimento profissional",
                  desc: "Seu cliente recebe um atendimento organizado, rápido e personalizado. Impressão de empresa grande.",
                  color: "text-violet-400",
                  bg: "bg-violet-500/10 border-violet-500/20",
                },
                {
                  icon: DollarSign,
                  title: "Cobre sinal automático",
                  desc: "Cliente qualificado já recebe o link de pagamento. Nada de calote ou desistência.",
                  color: "text-amber-400",
                  bg: "bg-amber-500/10 border-amber-500/20",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-5 rounded-xl border ${item.bg}`}
                >
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
      <section id="cta" className="px-6 py-24 border-t border-white/5 relative">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute -inset-20 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Comece a recuperar clientes hoje.
            </h2>
            <p className="text-neutral-500 mb-8">
              14 dias grátis. Sem cartão de crédito. Setup em 5 minutos.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/login";
              }}
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
                Começar
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
              <span className="text-xs text-neutral-600">
                Analyze. Optimize. Automate.
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-500">
              <a href="#recursos" className="hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#precos" className="hover:text-white transition-colors">
                Preços
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
              <a href="/login" className="hover:text-white transition-colors">
                Login
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <p className="text-xs text-neutral-700">
              © 2026 AOA. Todos os direitos reservados.
            </p>
            <p className="text-xs text-neutral-700">
              Feito com IA para quem faz com as mãos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
