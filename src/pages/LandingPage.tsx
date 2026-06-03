import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  MessageSquareText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import skedLogo from "@/assets/skedLogo.svg";

const heroWords = [
  "automatizados",
  "inteligentes",
  "rápidos",
  "organizados",
  "eficientes",
  "lucrativos",
];

const featureCards = [
  {
    icon: CalendarDays,
    title: "Agendamentos no automático",
    description:
      "Receba pedidos, confirme horários e reduza o tempo gasto com atendimento manual no dia a dia.",
  },
  {
    icon: Users,
    title: "Seu negócio organizado",
    description:
      "Administre agendamentos, profissionais, serviços, produtos e receita de forma simples e unificada.",
  },
  {
    icon: MessageSquareText,
    title: "Mais presença, menos faltas",
    description:
      "Centralize a comunicação com clientes e mantenha a operação mais estável com um processo simples de seguir.",
  },
] as const;

const platformHighlights = [
  {
    icon: BarChart3,
    title: "Visão clara da operação",
    description:
      "Acompanhe desempenho, receita e rotina do negócio sem depender de controles espalhados.",
  },
  {
    icon: ShieldCheck,
    title: "Processo mais confiável",
    description:
      "Padronize a operação com uma base única para agenda, equipe, atendimento e gestão.",
  },
] as const;

const conversationSteps = [
  {
    prompt: "oi, quero agendar um serviço",
    reply: "Claro. Me diga com quem você quer agendar, o dia e o horário ideal para você.",
    userTime: "09:42",
    companyTime: "09:43",
  },
  {
    prompt: "quero com Pessoa X amanhã as 10",
    reply: "Temos disponibilidade amanhã às 10 com Pessoa X. Posso confirmar seu agendamento?",
    userTime: "09:44",
    companyTime: "09:44",
  },
  {
    prompt: "sim",
    reply: "Perfeito. Seu agendamento foi confirmado com sucesso.",
    userTime: "09:45",
    companyTime: "09:45",
  },
] as const;

export function LandingPage() {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [previousWordIndex, setPreviousWordIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      text: string;
      from: "user" | "company";
      time: string;
    }>
  >([]);
  const [isReplying, setIsReplying] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const activeStep = conversationSteps[conversationStep];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveWordIndex((currentIndex) => {
        setPreviousWordIndex(currentIndex);
        return (currentIndex + 1) % heroWords.length;
      });
    }, 2400);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isReplying) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const currentStep = conversationSteps[conversationStep];

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `company-${Date.now()}`,
          text: currentStep.reply,
          from: "company",
          time: currentStep.companyTime,
        },
      ]);
      setIsReplying(false);
      setConversationStep((current) => Math.min(current + 1, conversationSteps.length));

      if (conversationStep === conversationSteps.length - 1) {
        window.setTimeout(() => {
          setShowSuccessState(true);
        }, 700);
      }
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [conversationStep, isReplying]);

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isReplying, messages, showSuccessState]);

  const handleFakeTyping = (event: KeyboardEvent<HTMLInputElement>) => {
    if (showSuccessState || !activeStep) {
      return;
    }

    if (event.key === "Tab") {
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      setDraftMessage((currentDraft) => currentDraft.slice(0, -1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
      return;
    }

    if (event.key.length > 1) {
      return;
    }

    event.preventDefault();
    setDraftMessage(activeStep.prompt.slice(0, draftMessage.length + 1));
  };

  const handleSendMessage = () => {
    if (!draftMessage.trim() || isReplying || !activeStep || draftMessage !== activeStep.prompt) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        text: draftMessage,
        from: "user",
        time: activeStep.userTime,
      },
    ]);
    setDraftMessage("");
    setIsReplying(true);
  };

  return (
    <main className="min-h-screen bg-white text-[#080D0D]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-3 py-5 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex items-center gap-3">
            <img
              src={skedLogo}
              alt="Sked"
              className="h-11 w-auto sm:h-12"
            />
          </div>

          <nav className="flex items-center gap-3">
            <Link
              to="/auth?mode=register"
              className="rounded-full bg-[#00A676] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#009166]"
            >
              Registrar minha empresa
            </Link>
            <Link
              to="/auth?mode=login"
              className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-[#080D0D] transition hover:border-[#00A676] hover:text-[#00A676]"
            >
              Já sou cliente
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-89px)] w-full max-w-[1920px] items-start gap-12 bg-white px-3 pt-10 sm:px-4 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-24 lg:px-6 lg:pt-14 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-28 xl:px-8 2xl:px-10">
        <div className="w-full">
          <div className="tracking-[-0.06em]">
            <h2 className="text-[2.5rem] font-semibold text-[#080D0D] sm:text-[3.1rem] lg:text-[4rem] xl:text-[4.5rem]">
              Seus agendamentos mais
            </h2>
            <h1 className="relative mt-2 min-h-[1.25em] overflow-hidden text-[3.3rem] font-semibold text-[#00A676] sm:text-[4.1rem] lg:text-[5.15rem] xl:text-[5.9rem]">
              {previousWordIndex !== null ? (
                <span
                  key={`out-${previousWordIndex}-${activeWordIndex}`}
                  aria-hidden="true"
                  className="animate-[hero-word-out_260ms_ease-out_forwards] absolute inset-0 block w-fit whitespace-nowrap"
                >
                  {heroWords[previousWordIndex]}.
                </span>
              ) : null}
              <span
                key={`in-${activeWordIndex}`}
                className="animate-[hero-word-in_260ms_ease-out_forwards] absolute inset-0 block w-fit whitespace-nowrap"
              >
                {heroWords[activeWordIndex]}.
              </span>
            </h1>
          </div>

          <div className="mt-32">
            <p className="mt-4 text-base leading-7 text-black/65 sm:text-lg">
              Ajude sua empresa a organizar agenda, equipe, atendimento e comunicação, tudo em um
              só lugar.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between md:gap-4">
            {featureCards.map((card) => (
              <div
                key={card.title}
                onMouseEnter={() => setHoveredCard(card.title)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`rounded-[2rem] border border-black/10 bg-[#F7F8F8] p-6 shadow-[0_18px_40px_rgba(8,13,13,0.06)] transition-transform duration-300 ease-out md:w-[32.5%] ${
                  hoveredCard === null
                    ? "scale-100"
                    : hoveredCard === card.title
                      ? "scale-[1.05]"
                      : "scale-[0.94]"
                }`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A676]/12 text-[#00A676]">
                  <card.icon className="h-6 w-6" strokeWidth={2.1} />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#080D0D]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/65">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:-translate-x-8 xl:-translate-x-12">
          <div className="relative h-[700px] w-[340px] rounded-[3rem] border border-black/10 bg-[#111716] p-[10px] shadow-[0_28px_90px_rgba(8,13,13,0.2)]">
            <div className="absolute left-1/2 top-[10px] h-7 w-32 -translate-x-1/2 rounded-full bg-black" />

            <div className="relative flex h-full flex-col overflow-hidden rounded-[2.45rem] bg-[#e9f0ee]">
              <div className="flex items-center justify-between bg-[#103529] px-6 pb-2 pt-4 text-white">
                <div className="text-xs font-medium tracking-[0.08em]">09:41</div>
                <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold">
                  <span>5G</span>
                  <span className="h-2.5 w-6 rounded-sm border border-white/80 p-[1px]">
                    <span className="block h-full w-4 rounded-[2px] bg-white" />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#103529] px-4 py-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-sm font-semibold">
                  S
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Sua Empresa</p>
                  <p className="text-xs text-white/70">online agora</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/85">
                  <span>⌕</span>
                  <span>⋮</span>
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className="scrollbar-custom relative flex-1 overflow-y-auto bg-[#efeae2] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.46),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,53,41,0.08),transparent_24%)] px-3 py-4"
              >
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-medium text-[#667781] shadow-sm">
                    Hoje
                  </span>
                </div>

                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.from === "user"
                          ? "ml-auto max-w-[83%] rounded-[0.95rem] rounded-tr-[0.3rem] bg-[#d9fdd3] px-3.5 py-2.5 text-sm text-[#111b21] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                          : "max-w-[83%] rounded-[0.95rem] rounded-tl-[0.3rem] bg-white px-3.5 py-2.5 text-sm text-[#111b21] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                      }
                    >
                      <p>{message.text}</p>
                      <p className="mt-1 text-right text-[0.65rem] text-[#667781]">
                        {message.time}
                        {message.from === "user" ? (
                          <span className="ml-1 text-[#53bdeb]">✓✓</span>
                        ) : null}
                      </p>
                    </div>
                  ))}

                  {isReplying ? (
                    <div className="max-w-[83%] rounded-[0.95rem] rounded-tl-[0.3rem] bg-white px-3.5 py-3 text-sm text-[#667781] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                      digitando...
                    </div>
                  ) : null}
                </div>

              </div>

              <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-3">
                <input
                  value={draftMessage}
                  onChange={() => undefined}
                  onKeyDown={handleFakeTyping}
                  placeholder={isReplying ? "Aguardando resposta..." : "Clique e digite para testar"}
                  readOnly={showSuccessState || isReplying}
                  className="h-11 flex-1 rounded-full bg-white px-4 text-sm text-[#111b21] shadow-[inset_0_0_0_1px_rgba(17,27,33,0.06)] outline-none placeholder:text-[#667781] read-only:cursor-default read-only:bg-[#f6f7f8]"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!activeStep || draftMessage !== activeStep.prompt || isReplying || showSuccessState}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-lg text-white shadow-[0_8px_18px_rgba(0,168,132,0.22)] transition disabled:cursor-not-allowed disabled:bg-[#9fd8c8] disabled:text-white/80 disabled:shadow-none"
                >
                  ▷
                </button>
              </div>

              {showSuccessState ? (
                <div className="absolute inset-0 z-10 flex animate-[success-overlay-in_320ms_ease-out_forwards] flex-col items-center justify-center bg-[rgba(0,0,0,0.82)] px-8 text-center text-white backdrop-blur-[4px]">
                  <div className="flex h-20 w-20 animate-[success-content-in_420ms_ease-out_forwards] items-center justify-center rounded-full border border-[#19c28f]/45 bg-[#c8f4e7] shadow-[0_16px_40px_rgba(0,166,118,0.28)]">
                    <CalendarCheck className="h-10 w-10 text-[#00A676]" strokeWidth={2.2} />
                  </div>
                  <p className="mt-6 animate-[success-content-in_420ms_ease-out_forwards] text-2xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
                    Agendamento realizado com sucesso!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#080D0D] text-white">
        <div className="mx-auto grid w-full max-w-[1920px] gap-12 px-3 py-20 sm:px-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16 lg:px-6 lg:py-24 xl:px-8 2xl:px-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#00A676]">
              Sobre a plataforma
            </p>
            <h2 className="mt-5 max-w-4xl text-[2.4rem] font-semibold tracking-[-0.06em] text-white sm:text-[3rem] lg:text-[3.6rem]">
              Um software pensado para empresas que querem crescer com menos improviso.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
              O Sked concentra as partes mais importantes da rotina em um sistema simples de usar.
              Em vez de dividir a operação entre conversas, planilhas e controles paralelos, sua
              empresa passa a trabalhar com mais contexto, mais agilidade e mais previsibilidade.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
              Isso significa menos tempo apagando incêndios e mais tempo melhorando atendimento,
              equipe, serviços e resultado financeiro.
            </p>
          </div>

          <div className="grid gap-4">
            {platformHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A676]/18 text-[#00A676]">
                  <item.icon className="h-6 w-6" strokeWidth={2.1} />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  {item.description}
                </p>
              </div>
            ))}

            <div className="rounded-[2rem] border border-[#00A676]/20 bg-[linear-gradient(135deg,rgba(0,166,118,0.16),rgba(255,255,255,0.03))] p-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7BE0BF]">
                Feito para a rotina real
              </p>
              <p className="mt-4 text-base leading-7 text-white/78">
                Do primeiro contato com o cliente até a análise da receita, o sistema foi pensado
                para acompanhar a operação inteira sem deixar a gestão pesada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes hero-word-in {
          from {
            opacity: 0;
            transform: translateY(-45%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hero-word-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(45%);
          }
        }

        @keyframes success-overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes success-content-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}
