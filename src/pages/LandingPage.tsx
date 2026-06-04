import axios from "axios";
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Headset,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Smartphone,
  Sparkles,
  Send,
  ShieldCheck,
  Users,
  X,
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

const aboutPills = [
  "Agenda centralizada",
  "Equipe sincronizada",
  "Atendimento organizado",
  "Receita sob controle",
] as const;

const softwareFeatures = [
  {
    icon: LayoutDashboard,
    title: "Painel simples e direto",
    description:
      "Visualize rapidamente os dados mais importantes da operação com informações em fácil alcance no dia a dia.",
  },
  {
    icon: CalendarDays,
    title: "Gestão de agenda",
    description:
      "Acompanhe agenda do dia, agendamentos e cancelamentos com mais clareza e menos ruído operacional.",
  },
  {
    icon: CircleDollarSign,
    title: "Gestão de receita",
    description:
      "Registre transações de serviços e acompanhe a movimentação financeira com mais organização.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Gestão do negócio",
    description:
      "Controle estoque, serviços, profissionais e clientes em um só ambiente, com visão mais unificada da empresa.",
  },
] as const;

const carouselFeatures = [
  {
    icon: Smartphone,
    title: "Atendimento com IA via Whatsapp",
    description:
      "Conte com a IA para responder no WhatsApp e reduzir a pressão de ter que acompanhar e responder tudo manualmente o tempo todo.",
  },
  ...softwareFeatures,
] as const;

const firstPlatformHighlight = platformHighlights[0];
const secondPlatformHighlight = platformHighlights[1];

const faqs = [
  {
    question: "O Sked é indicado para quais tipos de empresa?",
    answer:
      "Ele foi pensado para operações que dependem de agenda, atendimento, equipe e acompanhamento da rotina, especialmente negócios de serviços, como barbearias, salões, consultórios e negócios similares.",
  },
  {
    question: "Preciso usar várias ferramentas junto com o sistema?",
    answer:
      "A proposta é justamente reduzir essa dependência, concentrando os principais processos da operação em um só lugar.",
  },
  {
    question: "O sistema ajuda só no agendamento?",
    answer:
      "Não. Além da agenda, ele apoia a gestão de profissionais, serviços, produtos, comunicação e visão de receita.",
  },
  {
    question: "A equipe consegue se adaptar rápido?",
    answer:
      "Sim. O foco do produto é simplificar a rotina, então a experiência foi pensada para ser direta e fácil de incorporar no dia a dia.",
  },
] as const;

type ContactForm = {
  message: string;
};

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
  const url = import.meta.env.VITE_BASE_URL;
  const carouselAnimationDuration = 360;
  const carouselAutoAdvanceDelay = 5000;
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [previousWordIndex, setPreviousWordIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredPlatformCard, setHoveredPlatformCard] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState<"left" | "right">("right");
  const [exitingCarouselIndex, setExitingCarouselIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
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
  const carouselTimeoutRef = useRef<number | null>(null);

  const activeStep = conversationSteps[conversationStep];
  const activeCarouselFeature = carouselFeatures[activeCarouselIndex];
  const exitingCarouselFeature =
    exitingCarouselIndex !== null ? carouselFeatures[exitingCarouselIndex] : null;

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

  useEffect(() => {
    return () => {
      if (carouselTimeoutRef.current !== null) {
        window.clearTimeout(carouselTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCarouselDirection("right");
      setExitingCarouselIndex((currentExitingIndex) => {
        if (currentExitingIndex !== null) {
          return currentExitingIndex;
        }

        return activeCarouselIndex;
      });
      setActiveCarouselIndex((currentIndex) =>
        currentIndex === carouselFeatures.length - 1 ? 0 : currentIndex + 1,
      );

      if (carouselTimeoutRef.current !== null) {
        window.clearTimeout(carouselTimeoutRef.current);
      }

      carouselTimeoutRef.current = window.setTimeout(() => {
        setExitingCarouselIndex(null);
        carouselTimeoutRef.current = null;
      }, carouselAnimationDuration);
    }, carouselAutoAdvanceDelay);

    return () => window.clearInterval(intervalId);
  }, [activeCarouselIndex]);

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

  const handleContactChange = (
    field: keyof ContactForm,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setContactForm((current) => ({ ...current, [field]: value }));
  };

  const handleContactSubmit = async () => {
    if (!contactForm.message.trim()) {
      setContactSuccess("");
      setContactError("Escreva uma mensagem antes de enviar.");
      return;
    }

    setContactLoading(true);
    setContactError("");
    setContactSuccess("");

    try {
      await axios.post(`${url}/contact`, {
        message: contactForm.message,
      });

      setContactForm({
        message: "",
      });
      setContactSuccess("Mensagem enviada com sucesso.");
    } catch (error: any) {
      setContactError(
        error?.response?.data?.message || "Não foi possível enviar sua mensagem agora.",
      );
    } finally {
      setContactLoading(false);
    }
  };

  const changeCarouselItem = (nextIndex: number, direction: "left" | "right") => {
    if (nextIndex === activeCarouselIndex) {
      return;
    }

    if (carouselTimeoutRef.current !== null) {
      window.clearTimeout(carouselTimeoutRef.current);
    }

    setCarouselDirection(direction);
    setExitingCarouselIndex(activeCarouselIndex);
    setActiveCarouselIndex(nextIndex);

    carouselTimeoutRef.current = window.setTimeout(() => {
      setExitingCarouselIndex(null);
      carouselTimeoutRef.current = null;
    }, carouselAnimationDuration);
  };

  const goToPreviousCarouselItem = () => {
    changeCarouselItem(
      activeCarouselIndex === 0 ? carouselFeatures.length - 1 : activeCarouselIndex - 1,
      "left",
    );
  };

  const goToNextCarouselItem = () => {
    changeCarouselItem(
      activeCarouselIndex === carouselFeatures.length - 1 ? 0 : activeCarouselIndex + 1,
      "right",
    );
  };

  return (
    <main className="scrollbar-custom h-screen overflow-x-hidden overflow-y-auto bg-white text-[#080D0D]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-3 py-4 sm:px-4 sm:py-5 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex items-center gap-3">
            <img
              src={skedLogo}
              alt="Sked"
              className="h-11 w-auto sm:h-12"
            />
          </div>

          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[#080D0D] transition hover:border-[#00A676] hover:text-[#00A676]"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav className="hidden items-center gap-3 sm:flex">
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

        <div
          className={`${mobileMenuOpen ? "block" : "hidden"} border-t border-black/10 px-3 pb-4 pt-3 sm:hidden`}
        >
          <nav className="flex flex-col gap-3">
            <Link
              to="/auth?mode=register"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-[#00A676] px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#009166]"
            >
              Registrar minha empresa
            </Link>
            <Link
              to="/auth?mode=login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-center text-sm font-medium text-[#080D0D] transition hover:border-[#00A676] hover:text-[#00A676]"
            >
              Já sou cliente
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1920px] items-start gap-10 overflow-hidden bg-white px-3 pb-12 pt-8 sm:gap-12 sm:px-4 sm:pb-16 sm:pt-12 lg:min-h-[calc(100vh-89px)] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-24 lg:px-6 lg:pb-0 lg:pt-14 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-28 xl:px-8 2xl:px-10">
        <div className="w-full">
          <div className="tracking-[-0.06em]">
            <h2 className="text-[2rem] font-semibold text-[#080D0D] sm:text-[3.1rem] lg:text-[4rem] xl:text-[4.5rem]">
              Seus agendamentos mais
            </h2>
            <h1 className="relative mt-2 min-h-[1.3em] overflow-hidden text-[2.55rem] font-semibold text-[#00A676] sm:text-[4.1rem] lg:text-[5.15rem] xl:text-[5.9rem]">
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

          <div className="mt-12 sm:mt-20 lg:mt-32">
            <p className="text-base leading-7 text-black/65 sm:text-lg">
              Ajude sua empresa a organizar agenda, equipe, atendimento e comunicação, tudo em um
              só lugar.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:mt-12 md:mt-16 md:flex-row md:items-stretch md:justify-between md:gap-4">
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
          <div className="relative h-[620px] w-full max-w-[340px] rounded-[2.5rem] border border-black/10 bg-[#111716] p-[10px] shadow-[0_28px_90px_rgba(8,13,13,0.2)] sm:h-[700px] sm:rounded-[3rem]">
            <div className="absolute left-1/2 top-[10px] h-7 w-32 -translate-x-1/2 rounded-full bg-black" />

            <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#e9f0ee] sm:rounded-[2.45rem]">
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
        <div className="mx-auto grid w-full max-w-[1920px] gap-10 px-3 py-16 sm:px-4 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16 lg:px-6 lg:py-24 xl:px-8 2xl:px-10">
          <div>
            <div className="flex items-center gap-3 text-[#00A676]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A676]/14">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em]">
                Sobre a plataforma
              </p>
            </div>
            <h2 className="mt-5 max-w-4xl text-[2rem] font-semibold tracking-[-0.06em] text-white sm:text-[3rem] lg:text-[3.6rem]">
              Um software pensado para empresas que querem crescer com menos improviso.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
              O Sked reúne agenda, atendimento, equipe e gestão em um fluxo mais simples, claro e
              previsível.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {aboutPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/78"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div
              onMouseEnter={() => setHoveredPlatformCard(firstPlatformHighlight.title)}
              onMouseLeave={() => setHoveredPlatformCard(null)}
              className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform duration-300 ease-out ${
                hoveredPlatformCard === null
                  ? "scale-100"
                  : hoveredPlatformCard === firstPlatformHighlight.title
                    ? "scale-[1.05]"
                    : "scale-[0.94]"
              }`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A676]/18 text-[#00A676]">
                <firstPlatformHighlight.icon className="h-6 w-6" strokeWidth={2.1} />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                {firstPlatformHighlight.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {firstPlatformHighlight.description}
              </p>
            </div>

            <div
              onMouseEnter={() => setHoveredPlatformCard("Feito para a rotina real")}
              onMouseLeave={() => setHoveredPlatformCard(null)}
              className={`rounded-[2rem] border border-[#00A676]/20 bg-[linear-gradient(135deg,rgba(0,166,118,0.16),rgba(255,255,255,0.03))] p-6 transition-transform duration-300 ease-out ${
                hoveredPlatformCard === null
                  ? "scale-100"
                  : hoveredPlatformCard === "Feito para a rotina real"
                    ? "scale-[1.05]"
                    : "scale-[0.94]"
              }`}
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7BE0BF]">
                Feito para a rotina real
              </p>
              <p className="mt-4 text-base leading-7 text-white/78">
                Do primeiro contato com o cliente até a análise da receita, o sistema foi pensado
                para acompanhar a operação inteira sem deixar a gestão pesada.
              </p>
            </div>

            <div
              onMouseEnter={() => setHoveredPlatformCard(secondPlatformHighlight.title)}
              onMouseLeave={() => setHoveredPlatformCard(null)}
              className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform duration-300 ease-out ${
                hoveredPlatformCard === null
                  ? "scale-100"
                  : hoveredPlatformCard === secondPlatformHighlight.title
                    ? "scale-[1.05]"
                    : "scale-[0.94]"
              }`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A676]/18 text-[#00A676]">
                <secondPlatformHighlight.icon className="h-6 w-6" strokeWidth={2.1} />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                {secondPlatformHighlight.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {secondPlatformHighlight.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-3 py-16 sm:px-4 sm:py-20 lg:px-6 lg:py-24 xl:px-8 2xl:px-10">
          <div className="w-full">
            <div className="flex items-center gap-3 text-[#00A676]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A676]/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em]">
                O que o software oferece
              </p>
            </div>
            <h2 className="mt-5 max-w-5xl text-[1.95rem] font-semibold tracking-[-0.06em] text-[#080D0D] sm:text-[2.8rem] lg:text-[3.2rem]">
              Recursos para acompanhar a operação inteira com mais clareza.
            </h2>
            <p className="mt-4 max-w-4xl text-base leading-7 text-black/65 sm:text-lg">
              Tudo foi pensado para reduzir improviso e concentrar o essencial da rotina em um só
              ambiente.
            </p>
          </div>

          <div className="mt-12 px-1 py-4 sm:px-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={goToPreviousCarouselItem}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#080D0D] transition hover:border-[#00A676] hover:text-[#00A676]"
                aria-label="Ver recurso anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="relative min-h-[220px] min-w-0 flex-1 overflow-hidden text-center sm:min-h-[200px]">
                {exitingCarouselFeature ? (
                  <div
                    key={`out-${exitingCarouselFeature.title}-${activeCarouselFeature.title}`}
                    className={`absolute inset-0 ${
                      carouselDirection === "right"
                        ? "animate-[carousel-slide-out-left_360ms_ease-in_forwards]"
                        : "animate-[carousel-slide-out-right_360ms_ease-in_forwards]"
                    }`}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A676]/12 text-[#00A676]">
                      <exitingCarouselFeature.icon className="h-7 w-7" strokeWidth={2.1} />
                    </div>
                    <h3 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.04em] text-[#080D0D] sm:text-[1.8rem]">
                      {exitingCarouselFeature.title}
                    </h3>
                    <p className="mx-auto mt-4 max-w-4xl text-sm leading-7 text-black/65 sm:text-lg">
                      {exitingCarouselFeature.description}
                    </p>
                  </div>
                ) : null}

                <div
                  key={`in-${activeCarouselFeature.title}-${carouselDirection}`}
                  className={`absolute inset-0 ${
                    carouselDirection === "right"
                      ? "animate-[carousel-slide-in-right_360ms_ease-out_forwards]"
                      : "animate-[carousel-slide-in-left_360ms_ease-out_forwards]"
                  }`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A676]/12 text-[#00A676]">
                    <activeCarouselFeature.icon className="h-7 w-7" strokeWidth={2.1} />
                  </div>
                  <h3 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.04em] text-[#080D0D] sm:text-[1.8rem]">
                    {activeCarouselFeature.title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-4xl text-sm leading-7 text-black/65 sm:text-lg">
                    {activeCarouselFeature.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={goToNextCarouselItem}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#080D0D] transition hover:border-[#00A676] hover:text-[#00A676]"
                aria-label="Ver próximo recurso"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {carouselFeatures.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() =>
                    changeCarouselItem(index, index > activeCarouselIndex ? "right" : "left")
                  }
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeCarouselIndex ? "w-8 bg-[#00A676]" : "w-2.5 bg-black/15 hover:bg-black/30"
                  }`}
                  aria-label={`Ir para ${feature.title}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="bg-[#080D0D] text-white">
        <div className="mx-auto w-full max-w-[1920px] px-3 py-16 sm:px-4 sm:py-20 lg:px-6 lg:py-24 xl:px-8 2xl:px-10">
          <div className="w-full">
            <div className="flex items-center gap-3 text-[#00A676]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A676]/14">
                <CircleHelp className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em]">
                FAQ
              </p>
            </div>
            <h2 className="mt-5 text-[1.95rem] font-semibold tracking-[-0.06em] text-white sm:text-[2.8rem] lg:text-[3.2rem]">
              Respostas para algumas dúvidas frequentes.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
              O essencial para entender como o Sked se encaixa na rotina do seu negócio.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A676]/18 text-[#00A676]">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white text-[#080D0D]">
        <div className="mx-auto grid w-full max-w-[1920px] gap-10 px-3 py-16 sm:px-4 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,1.05fr)] lg:gap-16 lg:px-6 lg:py-24 xl:px-8 2xl:px-10">
          <div>
            <div className="flex items-center gap-3 text-[#00A676]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A676]/10">
                <Headset className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em]">
                Contato
              </p>
            </div>
            <h2 className="mt-5 text-[1.95rem] font-semibold tracking-[-0.06em] text-[#080D0D] sm:text-[2.8rem] lg:text-[3.2rem]">
              Fale conosco!
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-black/65 sm:text-lg">
              Encontrou um bug, ficou com alguma dúvida ou quer compartilhar um feedback? Envie
              sua mensagem por aqui.
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#F7F8F8] p-6 shadow-[0_24px_60px_rgba(8,13,13,0.08)] sm:p-8">
            <div className="grid gap-4">
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm text-black/65">
                  Mensagem
                </label>
                <textarea
                  id="contact-message"
                  value={contactForm.message}
                  onChange={(event) => handleContactChange("message", event)}
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#080D0D] outline-none transition placeholder:text-black/35 focus:border-[#00A676]"
                  placeholder="Escreva sua mensagem aqui"
                  required
                />
              </div>

              {contactError ? (
                <p className="text-sm text-[#ff9a9a]">{contactError}</p>
              ) : null}

              {contactSuccess ? (
                <p className="text-sm text-[#7BE0BF]">{contactSuccess}</p>
              ) : null}

              <button
                type="button"
                onClick={handleContactSubmit}
                disabled={contactLoading}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#00A676] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#009166] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {contactLoading ? "Enviando..." : (
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Enviar mensagem
                  </span>
                )}
              </button>
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

        @keyframes carousel-slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes carousel-slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes carousel-slide-out-left {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }

        @keyframes carousel-slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </main>
  );
}
