import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { LoadingPage } from "@/pages/LoadingPage";
import { socket } from "@/services/socket";
import { MobileDashboardHeader } from "./MobileDashboardHeader";
import { PageHeader, type NotificationItem } from "./PageHeader";
import { Sidebar } from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/auth": "Acesso",
  "/dashboard": "Painel",
  "/daily-schedule": "Agenda do Dia",
  "/appointments": "Agendamentos",
  "/cancellations": "Cancelamentos",
  "/revenue": "Receitas",
  "/inventory": "Estoque",
  "/services": "Serviços",
  "/professionals": "Profissionais",
  "/customers": "Clientes",
  "/settings": "Configurações Gerais",
};

const formatDailyScheduleSubtitle = (date = new Date()) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

const defaultPageHeaders: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Painel",
    subtitle: "Bem-vindo de volta! Aqui está o resumo de hoje.",
  },
  "/daily-schedule": {
    title: "Agenda do Dia",
    subtitle: formatDailyScheduleSubtitle(),
  },
  "/appointments": { title: "Agendamentos" },
  "/cancellations": {
    title: "Análise de Cancelamentos",
    subtitle: "Insights e estatísticas sobre cancelamentos",
  },
  "/revenue": {
    title: "Receitas",
    subtitle: "Acompanhe e gerencie as receitas do seu negócio",
  },
  "/inventory": {
    title: "Gerenciamento de Estoque",
    subtitle: "Controle seus produtos, quantidades e valores",
  },
  "/services": {
    title: "Serviços",
    subtitle: "Gerencie os serviços oferecidos pelo seu negócio",
  },
  "/professionals": {
    title: "Profissionais",
    subtitle: "Gerencie os profissionais do seu negócio",
  },
  "/customers": {
    title: "Clientes",
    subtitle: "Gerencie sua base de clientes",
  },
  "/settings": {
    title: "Configurações Gerais",
    subtitle: "Personalize e configure seu sistema de agendamento",
  },
};

const NOTIFICATION_SOUND_SRC = "/notification.mp3";
const NOTIFICATIONS_STORAGE_PREFIX = "sked:notifications";
const SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const realtimeEvents = [
  "appointment:created",
  "appointment:updated",
  "appointment:deleted",
  "appointment:canceled",
  "payment:created",
  "payment:updated",
  "payment:confirmed",
  "service:created",
  "service:updated",
  "service:deleted",
  "professional:created",
  "professional:updated",
  "professional:deleted",
  "customer:created",
  "customer:updated",
  "customer:deleted",
  "product:low-stock",
  "product:out-of-stock",
  "product:restocked",
  "company:updated",
  "dashboard:updated",
];

const validNotificationTypes = new Set<NotificationItem["type"]>([
  "appointment",
  "cancellation",
  "payment",
  "reminder",
  "success",
]);

const getDocumentTitle = (pathname: string) => {
  const pageTitle = pageTitles[pathname] ?? "Sked";

  return pageTitle === "Sked" ? pageTitle : `Sked - ${pageTitle}`;
};

const getDefaultPageHeader = (pathname: string) =>
  defaultPageHeaders[pathname] ?? { title: pageTitles[pathname] ?? "Sked" };

const getNotificationsStorageKey = (companyId?: string | null) =>
  `${NOTIFICATIONS_STORAGE_PREFIX}:${companyId || "anonymous"}`;

/* TODO global search: funcoes da barra global comentadas para reimplementacao futura.
const SEARCH_RESULT_LIMIT = 12;

const normalizeSearchText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const splitSearchTerms = (value: string) =>
  normalizeSearchText(value)
    .split(/\s+/)
    .filter(Boolean);

const appendSearchValues = (value: unknown, values: string[]) => {
  if (value === null || value === undefined) return;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const normalizedValue = String(value).trim();

    if (normalizedValue) {
      values.push(normalizedValue);
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendSearchValues(item, values));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (["id", "created_at", "updated_at", "createdAt", "updatedAt", "photo", "password", "token"].includes(key)) {
        return;
      }

      appendSearchValues(nestedValue, values);
    });
  }
};

const buildSearchText = (...parts: unknown[]) => {
  const values: string[] = [];

  parts.forEach((part) => appendSearchValues(part, values));

  return values.join(" ");
};

const getSearchCollection = (value: any, ...keys: string[]) => {
  if (Array.isArray(value)) return value;

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  return [];
};

const GLOBAL_SEARCH_HIGHLIGHT_SELECTOR = "mark[data-global-search-highlight='true']";

const clearGlobalSearchHighlights = (root: HTMLElement | null) => {
  if (!root) return;

  root.querySelectorAll(GLOBAL_SEARCH_HIGHLIGHT_SELECTOR).forEach((highlight) => {
    const parent = highlight.parentNode;

    if (!parent) return;

    parent.replaceChild(document.createTextNode(highlight.textContent || ""), highlight);
    parent.normalize();
  });
};

const getNormalizedTextWithIndexMap = (value: string) => {
  let normalized = "";
  const indexMap: number[] = [];

  Array.from(value).forEach((char, index) => {
    const normalizedChar = char
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    Array.from(normalizedChar).forEach((normalizedPart) => {
      normalized += normalizedPart;
      indexMap.push(index);
    });
  });

  return { normalized, indexMap };
};

const mergeRanges = (ranges: Array<[number, number]>) => {
  const sortedRanges = [...ranges].sort((first, second) => first[0] - second[0]);
  const mergedRanges: Array<[number, number]> = [];

  sortedRanges.forEach(([start, end]) => {
    const lastRange = mergedRanges[mergedRanges.length - 1];

    if (!lastRange || start > lastRange[1]) {
      mergedRanges.push([start, end]);
      return;
    }

    lastRange[1] = Math.max(lastRange[1], end);
  });

  return mergedRanges;
};

const getHighlightRanges = (text: string, terms: string[]) => {
  const { normalized, indexMap } = getNormalizedTextWithIndexMap(text);
  const ranges: Array<[number, number]> = [];

  terms.forEach((term) => {
    let searchFrom = 0;
    let foundIndex = normalized.indexOf(term, searchFrom);

    while (foundIndex !== -1) {
      const start = indexMap[foundIndex];
      const end = indexMap[foundIndex + term.length - 1] + 1;

      if (Number.isFinite(start) && Number.isFinite(end)) {
        ranges.push([start, end]);
      }

      searchFrom = foundIndex + term.length;
      foundIndex = normalized.indexOf(term, searchFrom);
    }
  });

  return mergeRanges(ranges);
};

const shouldSkipHighlightNode = (node: Text) => {
  const parent = node.parentElement;

  if (!parent) return true;

  return Boolean(
    parent.closest(
      `${GLOBAL_SEARCH_HIGHLIGHT_SELECTOR}, input, textarea, select, button, script, style, [contenteditable="true"]`,
    ),
  );
};

const applyGlobalSearchHighlights = (root: HTMLElement | null, query: string) => {
  if (!root) return;

  clearGlobalSearchHighlights(root);

  const terms = splitSearchTerms(query);
  if (terms.length === 0) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    if (currentNode instanceof Text && currentNode.textContent?.trim() && !shouldSkipHighlightNode(currentNode)) {
      textNodes.push(currentNode);
    }

    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.textContent || "";
    const ranges = getHighlightRanges(text, terms);

    if (ranges.length === 0) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    ranges.forEach(([start, end]) => {
      if (start > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
      }

      const mark = document.createElement("mark");
      mark.dataset.globalSearchHighlight = "true";
      mark.className = "global-search-highlight";
      mark.textContent = text.slice(start, end);
      fragment.appendChild(mark);

      cursor = end;
    });

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  root
    .querySelector(GLOBAL_SEARCH_HIGHLIGHT_SELECTOR)
    ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
};

const createSearchEntry = ({
  id,
  path,
  pageTitle,
  title,
  description,
  searchText,
}: GlobalSearchItem & { searchText: string }) => ({
  id,
  path,
  pageTitle,
  title,
  description,
  searchText: normalizeSearchText(searchText),
});

const buildGlobalSearchIndex = (dados: any) => {
  if (!dados) return [];

  const entries = [
    createSearchEntry({
      id: "page-dashboard",
      path: "/dashboard",
      pageTitle: "Painel",
      title: "Painel",
      description: "Resumo geral do negócio",
      searchText: buildSearchText("painel dashboard resumo", dados.dashboard),
    }),
    createSearchEntry({
      id: "page-daily-schedule",
      path: "/daily-schedule",
      pageTitle: "Agenda do Dia",
      title: "Agenda do Dia",
      description: "Agenda diária e horários",
      searchText: buildSearchText("agenda do dia horarios", dados.dailySchedules),
    }),
    createSearchEntry({
      id: "page-appointments",
      path: "/appointments",
      pageTitle: "Agendamentos",
      title: "Agendamentos",
      description: "Todos os agendamentos",
      searchText: buildSearchText("agendamentos marcacoes", dados.appointments),
    }),
    createSearchEntry({
      id: "page-cancellations",
      path: "/cancellations",
      pageTitle: "Cancelamentos",
      title: "Cancelamentos",
      description: "Análise de cancelamentos",
      searchText: buildSearchText("cancelamentos faltas", dados.cancellations),
    }),
    createSearchEntry({
      id: "page-revenue",
      path: "/revenue",
      pageTitle: "Receitas",
      title: "Receitas",
      description: "Receitas e transações",
      searchText: buildSearchText("receitas faturamento transacoes", dados.revenue),
    }),
    createSearchEntry({
      id: "page-inventory",
      path: "/inventory",
      pageTitle: "Estoque",
      title: "Estoque",
      description: "Produtos e quantidades",
      searchText: buildSearchText("estoque produtos inventario", dados.products),
    }),
    createSearchEntry({
      id: "page-services",
      path: "/services",
      pageTitle: "Serviços",
      title: "Serviços",
      description: "Serviços cadastrados",
      searchText: buildSearchText("servicos procedimentos", dados.services),
    }),
    createSearchEntry({
      id: "page-professionals",
      path: "/professionals",
      pageTitle: "Profissionais",
      title: "Profissionais",
      description: "Equipe e profissionais",
      searchText: buildSearchText("profissionais equipe funcionarios", dados.professionals),
    }),
    createSearchEntry({
      id: "page-customers",
      path: "/customers",
      pageTitle: "Clientes",
      title: "Clientes",
      description: "Base de clientes",
      searchText: buildSearchText("clientes contatos", dados.customers),
    }),
    createSearchEntry({
      id: "page-settings",
      path: "/settings",
      pageTitle: "Configurações Gerais",
      title: "Configurações Gerais",
      description: "Dados da empresa e preferências",
      searchText: buildSearchText("configuracoes empresa preferencias whatsapp", dados.settings),
    }),
  ];

  const appointments = getSearchCollection(dados.appointments, "data", "appointments");
  const cancellations = getSearchCollection(dados.cancellations, "data", "cancellations");
  const revenues = getSearchCollection(dados.revenue, "data", "recentPayments", "transactions");
  const products = getSearchCollection(dados.products, "products", "data");
  const services = getSearchCollection(dados.services, "services", "data");
  const professionals = getSearchCollection(dados.professionals, "professionals", "data");
  const customers = getSearchCollection(dados.customers, "customers", "data");
  const dailyAppointments = getSearchCollection(dados.dailySchedules, "appointments", "data");

  appointments.forEach((appointment: any) => {
    entries.push(
      createSearchEntry({
        id: `appointment-${appointment.id}`,
        path: "/appointments",
        pageTitle: "Agendamentos",
        title: `${appointment.client?.name || "Cliente"} - ${appointment.service?.name || "Serviço"}`,
        description: `${appointment.employee?.name || "Profissional"} • ${appointment.status || "Status não informado"}`,
        searchText: buildSearchText(appointment),
      }),
    );
  });

  cancellations.forEach((appointment: any) => {
    entries.push(
      createSearchEntry({
        id: `cancellation-${appointment.id}`,
        path: "/cancellations",
        pageTitle: "Cancelamentos",
        title: `${appointment.client?.name || "Cliente"} - ${appointment.service?.name || "Serviço"}`,
        description: appointment.cancel_reason || appointment.status || "Cancelamento",
        searchText: buildSearchText(appointment),
      }),
    );
  });

  revenues.forEach((transaction: any) => {
    entries.push(
      createSearchEntry({
        id: `revenue-${transaction.id}`,
        path: "/revenue",
        pageTitle: "Receitas",
        title: transaction.client_name || transaction.description || "Transação",
        description: transaction.service_name || transaction.payment_method || transaction.status || "Receita",
        searchText: buildSearchText(transaction),
      }),
    );
  });

  dailyAppointments.forEach((appointment: any) => {
    entries.push(
      createSearchEntry({
        id: `daily-appointment-${appointment.id}`,
        path: "/daily-schedule",
        pageTitle: "Agenda do Dia",
        title: `${appointment.client?.name || "Cliente"} - ${appointment.service?.name || "Serviço"}`,
        description: `${appointment.employee?.name || "Profissional"} • ${appointment.status || "Status não informado"}`,
        searchText: buildSearchText(appointment),
      }),
    );
  });

  products.forEach((product: any) => {
    entries.push(
      createSearchEntry({
        id: `product-${product.id}`,
        path: "/inventory",
        pageTitle: "Estoque",
        title: product.name || "Produto",
        description: product.category || product.description || "Produto em estoque",
        searchText: buildSearchText(product),
      }),
    );
  });

  services.forEach((service: any) => {
    entries.push(
      createSearchEntry({
        id: `service-${service.id}`,
        path: "/services",
        pageTitle: "Serviços",
        title: service.name || "Serviço",
        description: service.description || service.category || "Serviço cadastrado",
        searchText: buildSearchText(service),
      }),
    );
  });

  professionals.forEach((professional: any) => {
    entries.push(
      createSearchEntry({
        id: `professional-${professional.id}`,
        path: "/professionals",
        pageTitle: "Profissionais",
        title: professional.name || "Profissional",
        description: professional.email || professional.role || professional.phone || "Profissional cadastrado",
        searchText: buildSearchText(professional),
      }),
    );
  });

  customers.forEach((customer: any) => {
    entries.push(
      createSearchEntry({
        id: `customer-${customer.id}`,
        path: "/customers",
        pageTitle: "Clientes",
        title: customer.name || "Cliente",
        description: customer.email || customer.contact || customer.phone || "Cliente cadastrado",
        searchText: buildSearchText(customer),
      }),
    );
  });

  entries.push(
    createSearchEntry({
      id: "settings-company",
      path: "/settings",
      pageTitle: "Configurações Gerais",
      title: dados.settings?.fantasy_name || dados.settings?.email || "Dados da empresa",
      description: dados.settings?.phone || dados.settings?.email || "Configurações da empresa",
      searchText: buildSearchText(dados.settings),
    }),
  );

  return entries;
};
*/

const formatNotificationDateTime = (value?: string | Date) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const inferNotificationType = (
  eventName: string,
  payload?: Record<string, unknown>,
): NotificationItem["type"] => {
  const payloadType = typeof payload?.type === "string" ? payload.type : undefined;

  if (payloadType && validNotificationTypes.has(payloadType as NotificationItem["type"])) {
    return payloadType as NotificationItem["type"];
  }

  if (eventName.includes("cancel")) return "cancellation";
  if (eventName.includes("payment")) return "payment";
  if (eventName.includes("appointment")) return "appointment";
  if (eventName.includes("reminder")) return "reminder";

  return "success";
};

const buildNotificationTitle = (eventName: string, type: NotificationItem["type"]) => {
  if (eventName === "notification") return "Nova notificação";
  if (type === "appointment") return "Atualização de agendamento";
  if (type === "cancellation") return "Cancelamento recebido";
  if (type === "payment") return "Atualização de pagamento";
  if (type === "reminder") return "Lembrete";
  return "Atualização recebida";
};

const buildNotificationMessage = (eventName: string, payload?: Record<string, unknown>) => {
  const clientName =
    typeof payload?.client_name === "string"
      ? payload.client_name
      : typeof payload?.clientName === "string"
        ? payload.clientName
        : typeof payload?.name === "string"
          ? payload.name
          : undefined;

  const serviceName =
    typeof payload?.service_name === "string"
      ? payload.service_name
      : typeof payload?.serviceName === "string"
        ? payload.serviceName
        : undefined;

  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.description === "string") return payload.description;

  if (eventName.includes("appointment") && clientName) {
    return serviceName
      ? `${clientName} teve uma atualização no serviço ${serviceName}.`
      : `${clientName} teve uma atualização no agendamento.`;
  }

  if (eventName.includes("payment") && clientName) {
    return `Houve uma atualização de pagamento para ${clientName}.`;
  }

  if (eventName.includes("cancel") && clientName) {
    return `${clientName} cancelou um agendamento.`;
  }

  return "Uma nova atualização em tempo real foi recebida.";
};

const extractNotificationPayload = (rawPayload?: unknown) => {
  if (!rawPayload || typeof rawPayload !== "object") return null;

  const payload = rawPayload as Record<string, unknown>;
  const notification =
    payload.notification && typeof payload.notification === "object"
      ? (payload.notification as Record<string, unknown>)
      : payload;

  return {
    payload: notification,
    eventName:
      typeof payload.event === "string"
        ? payload.event
        : typeof notification.event === "string"
          ? notification.event
          : "notification",
  };
};

const getToastVariant = (eventName: string, notificationType: NotificationItem["type"]) => {
  if (eventName === "product:out-of-stock") return "error";
  if (eventName === "product:low-stock") return "warning";
  if (eventName === "product:restocked") return "success";
  if (eventName.includes("cancel")) return "error";
  if (eventName.includes("updated") || eventName.includes("rescheduled")) return "warning";
  if (eventName.includes("created") || eventName.includes("payment")) return "success";

  if (notificationType === "cancellation") return "error";
  if (notificationType === "appointment") return "warning";

  return "success";
};

const normalizeNotification = (eventName: string, rawPayload?: unknown): NotificationItem | null => {
  const extractedPayload = extractNotificationPayload(rawPayload);
  const payload = extractedPayload?.payload;
  const normalizedEventName = extractedPayload?.eventName ?? eventName;

  if (!payload) return null;

  const type = inferNotificationType(normalizedEventName, payload);
  const title =
    typeof payload.title === "string" ? payload.title : buildNotificationTitle(normalizedEventName, type);

  const createdAt =
    typeof payload.created_at === "string"
      ? payload.created_at
      : typeof payload.createdAt === "string"
        ? payload.createdAt
        : new Date().toISOString();

  return {
    id:
      typeof payload.id === "string" || typeof payload.id === "number"
        ? String(payload.id)
        : `${normalizedEventName}-${Date.now()}`,
    eventName: normalizedEventName,
    type,
    title,
    message: buildNotificationMessage(normalizedEventName, payload),
    time: formatNotificationDateTime(createdAt),
    isRead: Boolean(payload.isRead),
  };
};

export function Layout() {
  const location = useLocation();
  const [dados, setDados] = useState(null);
  // TODO global search: reativar estados da busca quando a barra voltar.
  // const [searchValue, setSearchValue] = useState("");
  // const [activeHighlightQuery, setActiveHighlightQuery] = useState("");
  const [pageHeader, setPageHeaderState] = useState(() =>
    getDefaultPageHeader(location.pathname),
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const refreshTimeoutRef = useRef<number | null>(null);
  // TODO global search: reativar ref quando voltar o highlight da busca.
  // const outletContentRef = useRef<HTMLDivElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const lastSessionRefreshAtRef = useRef(0);

  // TODO global search: reativar indice, resultados e efeito de highlight quando a barra voltar.
  // const globalSearchIndex = buildGlobalSearchIndex(dados);
  // const searchTerms = splitSearchTerms(searchValue);
  // const filteredSearchResults: GlobalSearchItem[] =
  //   searchTerms.length === 0
  //     ? []
  //     : globalSearchIndex
  //         .filter((item) => searchTerms.some((term) => item.searchText.includes(term)))
  //         .slice(0, SEARCH_RESULT_LIMIT)
  //         .map(({ searchText: _searchText, ...item }) => item);
  //
  // const handleSearchChange = useCallback((value: string) => {
  //   setSearchValue(value);
  //   setActiveHighlightQuery("");
  // }, []);
  //
  // useEffect(() => {
  //   const root = outletContentRef.current;
  //
  //   clearGlobalSearchHighlights(root);
  //
  //   if (!activeHighlightQuery.trim()) return;
  //
  //   const timeoutId = window.setTimeout(() => {
  //     applyGlobalSearchHighlights(root, activeHighlightQuery);
  //   }, 120);
  //
  //   return () => {
  //     window.clearTimeout(timeoutId);
  //     clearGlobalSearchHighlights(root);
  //   };
  // }, [activeHighlightQuery, location.pathname, dados]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const storageKey = getNotificationsStorageKey(companyId);
    const storedNotifications = localStorage.getItem(storageKey);

    if (!storedNotifications) {
      setNotifications([]);
      return;
    }

    try {
      const parsedNotifications = JSON.parse(storedNotifications);

      if (Array.isArray(parsedNotifications)) {
        setNotifications(parsedNotifications);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const storageKey = getNotificationsStorageKey(companyId);

    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    verifyPermission();
  }, [location.pathname]);

  useEffect(() => {
    document.title = getDocumentTitle(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    setPageHeaderState(getDefaultPageHeader(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND_SRC);

    audio.preload = "auto";
    notificationSoundRef.current = audio;

    return () => {
      notificationSoundRef.current = null;
    };
  }, []);

  function verifyPermission() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
    }
  }

  const refreshDados = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    const id = localStorage.getItem("companyId");

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      return null;
    }

    const response = (await api.get(`/companies/${id}/data`)).data;

    setDados(response.data);
    return response.data;
  }, []);

  const updateDados = useCallback((valueOrUpdater) => {
    setDados((prev) =>
      typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater,
    );
  }, []);

  const setPageHeader = useCallback((header) => {
    setPageHeaderState(header);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const playNotificationSound = useCallback(() => {
    const audio = notificationSoundRef.current;

    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.warn("Nao foi possivel tocar o som da notificacao.", error);
    });
  }, []);

  const prependManualNotification = useCallback((notification: NotificationItem | null, playSound = true) => {
    if (!notification) return;

    setNotifications((prev) => {
      const nextNotifications = prev.filter((item) => item.id !== notification.id);

      return [notification, ...nextNotifications].slice(0, 30);
    });

    if (playSound) {
      playNotificationSound();
    }
  }, [playNotificationSound]);

  const refreshSession = useCallback(async (force = false) => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const now = Date.now();

    if (!force && now - lastSessionRefreshAtRef.current < SESSION_REFRESH_INTERVAL_MS) {
      return token;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const refreshedToken = response.data?.token;

      if (refreshedToken) {
        localStorage.setItem("token", refreshedToken);
        lastSessionRefreshAtRef.current = now;

        if (socket.auth && typeof socket.auth === "object") {
          socket.auth = {
            ...socket.auth,
            token: refreshedToken,
          };
        }

        return refreshedToken;
      }
    } catch (error) {
      console.error("Erro ao renovar sessao:", error);
    }

    return null;
  }, []);

  useEffect(() => {
    async function fetchData() {
      await refreshDados();
    }

    fetchData();

    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");

    if (!token) return;

    socket.auth = { token, companyId };

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshDados().catch((error) => {
          console.error("Erro ao atualizar dados em tempo real:", error);
        });
      }, 200);
    };

    const prependNotification = (notification: NotificationItem | null, playSound = true) => {
      if (!notification) return;

      setNotifications((prev) => {
        const nextNotifications = prev.filter((item) => item.id !== notification.id);

        return [notification, ...nextNotifications].slice(0, 30);
      });

      if (playSound) {
        playNotificationSound();
      }
    };

    const showRealtimeNotificationToast = (rawPayload: unknown) => {
      const extractedPayload = extractNotificationPayload(rawPayload);
      const eventName = extractedPayload?.eventName ?? "notification";
      const notification = normalizeNotification(eventName, rawPayload);

      if (!notification) return;

      const variant = getToastVariant(eventName, notification.type);
      const description = notification.message;
      const toastOptions = {
        id: `realtime-toast-${notification.id}`,
        description,
      };

      if (variant === "error") {
        toast.error(notification.title, toastOptions);
        return;
      }

      if (variant === "warning") {
        toast.warning(notification.title, toastOptions);
        return;
      }

      toast.success(notification.title, toastOptions);
    };

    const handleConnect = () => {
      if (companyId) {
        socket.emit("company:join", { companyId });
      }
    };

    const handleSocketNotification = (payload: unknown) => {
      prependNotification(normalizeNotification("notification", payload));
      showRealtimeNotificationToast(payload);
      scheduleRefresh();
    };

    const realtimeListeners = realtimeEvents.map((eventName) => {
      const listener = () => {
        scheduleRefresh();
      };

      socket.on(eventName, listener);
      return { eventName, listener };
    });

    socket.connect();
    socket.on("connect", handleConnect);
    socket.on("notification", handleSocketNotification);

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      socket.off("connect", handleConnect);
      socket.off("notification", handleSocketNotification);
      realtimeListeners.forEach(({ eventName, listener }) => {
        socket.off(eventName, listener);
      });
      socket.disconnect();
    };
  }, [playNotificationSound, refreshDados]);

  useEffect(() => {
    const activityEvents: Array<keyof WindowEventMap> = [ "pointerdown", "keydown", "focus", ];

    const handleActivity = () => {
      refreshSession().catch(() => null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSession().catch(() => null);
      }
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession]);

  if (!localStorage.getItem("token")) return <Navigate to="/auth" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!dados ? (
        <LoadingPage />
      ) : (
        <>
          <div className="hidden md:block">
            <Sidebar dados={dados.settings} />
          </div>
          <main className="flex-1 flex flex-col overflow-hidden">
            <MobileDashboardHeader title={pageHeader.title} dados={dados} refreshDados={refreshDados} />
            <div className="hidden md:block">
              <PageHeader
                title={pageHeader.title}
                subtitle={pageHeader.subtitle}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onClearNotifications={clearNotifications}
                onDeleteNotification={deleteNotification}
                evolutionConnection={dados?.settings?.evolution ?? null}
                onEvolutionConnectionUpdated={refreshDados}
                onEvolutionConnectionNotification={prependManualNotification}
                // TODO global search: reativar props quando a barra voltar.
                // searchResults={filteredSearchResults}
                // searchValue={searchValue}
                // onSearchChange={handleSearchChange}
                // onSearchResultSelect={(_item, query) => setActiveHighlightQuery(query)}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <Outlet
                context={{
                  dados,
                  updateDados,
                  refreshDados,
                  setPageHeader,
                  notifications,
                }}
              />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
