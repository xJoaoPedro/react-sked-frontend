import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";
import { LoadingPage } from "@/pages/LoadingPage";
import { socket } from "@/services/socket";
import { PageHeader, type NotificationItem } from "./PageHeader";
import { Sidebar } from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/login": "Login",
  "/dashboard": "Painel",
  "/daily-schedule": "Agenda do Dia",
  "/appointments": "Agendamentos",
  "/cancellations": "Análise de Cancelamentos",
  "/revenue": "Receitas",
  "/inventory": "Gerenciamento de Estoque",
  "/services": "Serviços",
  "/professionals": "Profissionais",
  "/customers": "Clientes",
  "/settings": "Configurações Gerais",
};

const defaultPageHeaders: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Painel",
    subtitle: "Bem-vindo de volta! Aqui está o resumo de hoje.",
  },
  "/daily-schedule": { title: "Agenda do Dia" },
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
  "product:created",
  "product:updated",
  "product:deleted",
  "product:low-stock",
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

const formatRelativeNotificationTime = (value?: string | Date) => {
  if (!value) return "Agora";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "Agora";

  const diffInMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffInMinutes < 1) return "Agora";
  if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;

  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;

  const diffInDays = Math.round(diffInHours / 24);
  return `Há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
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

const normalizeNotification = (eventName: string, rawPayload?: unknown): NotificationItem | null => {
  const payload =
    rawPayload && typeof rawPayload === "object"
      ? ((rawPayload as Record<string, unknown>).notification as Record<string, unknown>) ||
        (rawPayload as Record<string, unknown>)
      : undefined;

  if (!payload) return null;

  const type = inferNotificationType(eventName, payload);
  const title =
    typeof payload.title === "string" ? payload.title : buildNotificationTitle(eventName, type);

  return {
    id:
      typeof payload.id === "string" || typeof payload.id === "number"
        ? String(payload.id)
        : `${eventName}-${Date.now()}`,
    type,
    title,
    message: buildNotificationMessage(eventName, payload),
    time: formatRelativeNotificationTime(
      typeof payload.created_at === "string"
        ? payload.created_at
        : typeof payload.createdAt === "string"
          ? payload.createdAt
          : new Date(),
    ),
    isRead: Boolean(payload.isRead),
  };
};

export function Layout() {
  const location = useLocation();
  const [dados, setDados] = useState(null);
  const [pageHeader, setPageHeaderState] = useState(() =>
    getDefaultPageHeader(location.pathname),
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const refreshTimeoutRef = useRef<number | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

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

    const handleConnect = () => {
      if (companyId) {
        socket.emit("company:join", { companyId });
      }
    };

    const handleSocketNotification = (payload: unknown) => {
      prependNotification(normalizeNotification("notification", payload));
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

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!dados ? (
        <LoadingPage />
      ) : (
        <>
          <Sidebar dados={dados.settings} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <PageHeader
              title={pageHeader.title}
              subtitle={pageHeader.subtitle}
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onDeleteNotification={deleteNotification}
            />
            <Outlet
              context={{
                dados,
                updateDados,
                refreshDados,
                setPageHeader,
                notifications,
              }}
            />
          </main>
        </>
      )}
    </div>
  );
}
