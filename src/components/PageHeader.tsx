import { Bell, Calendar, X, DollarSign, Wallet, AlertCircle, CheckCircle, Clock, Trash2, Package, AlertTriangle, CircleX, Wrench, UserCog, Users, Building2, RefreshCw, CalendarPlus2, CalendarSync, CalendarX2, UserPlus, UserRoundX, ShieldCheck, QrCode, LoaderCircle, MessageCircleMore } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/parsers";
import { CustomDropdown } from "./CustomDropdown";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onDeleteNotification: (id: string) => void;
  evolutionConnection?: {
    connected: boolean;
    status?: string | null;
    instanceName?: string | null;
    rawConnected?: boolean;
    companyPhone?: string | null;
    connectedPhone?: string | null;
    phoneMatchesCompany?: boolean | null;
    phoneMismatch?: boolean;
  } | null;
  onEvolutionConnectionUpdated?: () => Promise<unknown> | void;
  onEvolutionConnectionNotification?: (notification: NotificationItem, playSound?: boolean) => void;
  // TODO global search: reativar props da busca quando a barra voltar.
  // searchResults?: GlobalSearchItem[];
  // searchValue?: string;
  // onSearchChange?: (value: string) => void;
  // onSearchResultSelect?: (item: GlobalSearchItem, query: string) => void;
}

export interface NotificationItem {
  id: string;
  type: "appointment" | "cancellation" | "payment" | "reminder" | "success";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  eventName?: string;
}

// TODO global search: reativar este tipo junto com a barra.
// export interface GlobalSearchItem {
//   id: string;
//   path: string;
//   pageTitle: string;
//   title: string;
//   description?: string;
// }

const ProductStatusIcon = ({
  accentIcon,
  accentClassName,
}: {
  accentIcon: ReactNode;
  accentClassName: string;
}) => (
  <div className="relative flex items-center justify-center">
    <Package className={`w-5 h-5 ${accentClassName}`} />
    <span className="absolute -right-1 -bottom-1 rounded-full bg-white">
      {accentIcon}
    </span>
  </div>
);

const getEventVisualConfig = (notification: NotificationItem) => {
  switch (notification.eventName) {
    case "appointment:created":
      return {
        icon: <CalendarPlus2 className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "appointment:updated":
      return {
        icon: <CalendarSync className="w-5 h-5 text-yellow-600" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "appointment:canceled":
    case "appointment:deleted":
      return {
        icon: <CalendarX2 className="w-5 h-5 text-destructive" />,
        containerClassName: "bg-destructive/10 border-destructive/20",
      };
    case "payment:created":
    case "payment:confirmed":
      return {
        icon: <Wallet className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "payment:updated":
      return {
        icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "service:created":
      return {
        icon: <Wrench className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "service:updated":
      return {
        icon: <Wrench className="w-5 h-5 text-yellow-600" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "service:deleted":
      return {
        icon: <Wrench className="w-5 h-5 text-destructive" />,
        containerClassName: "bg-destructive/10 border-destructive/20",
      };
    case "professional:created":
      return {
        icon: <UserPlus className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "professional:updated":
      return {
        icon: <UserCog className="w-5 h-5 text-yellow-600" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "professional:deleted":
      return {
        icon: <UserRoundX className="w-5 h-5 text-destructive" />,
        containerClassName: "bg-destructive/10 border-destructive/20",
      };
    case "customer:created":
      return {
        icon: <Users className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "customer:updated":
      return {
        icon: <Users className="w-5 h-5 text-yellow-600" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "customer:deleted":
      return {
        icon: <Users className="w-5 h-5 text-destructive" />,
        containerClassName: "bg-destructive/10 border-destructive/20",
      };
    case "whatsapp:human-handoff-requested":
    case "whatsapp:human-handoff-message":
      return {
        icon: <MessageCircleMore className="w-5 h-5 text-yellow-500" />,
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "product:restocked":
      return {
        icon: (
          <ProductStatusIcon
            accentClassName="text-primary"
            accentIcon={<CheckCircle className="w-3.5 h-3.5 text-primary" />}
          />
        ),
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "product:low-stock":
      return {
        icon: (
          <ProductStatusIcon
            accentClassName="text-yellow-600"
            accentIcon={<AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />}
          />
        ),
        containerClassName: "bg-yellow-500/10 border-yellow-500/20",
      };
    case "product:out-of-stock":
      return {
        icon: (
          <ProductStatusIcon
            accentClassName="text-destructive"
            accentIcon={<CircleX className="w-3.5 h-3.5 text-destructive" />}
          />
        ),
        containerClassName: "bg-destructive/10 border-destructive/20",
      };
    case "company:updated":
      return {
        icon: <Building2 className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "dashboard:updated":
      return {
        icon: <RefreshCw className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    case "notification":
      return {
        icon: <ShieldCheck className="w-5 h-5 text-primary" />,
        containerClassName: "bg-primary/10 border-primary/20",
      };
    default:
      return null;
  }
};

const getDefaultNotificationIcon = (notification: NotificationItem) => {
  switch (notification.type) {
    case "appointment":
      return <Calendar className="w-5 h-5 text-primary" />;
    case "cancellation":
      return <X className="w-5 h-5 text-destructive" />;
    case "payment":
      return <DollarSign className="w-5 h-5 text-primary" />;
    case "reminder":
      return <Clock className="w-5 h-5 text-foreground" />;
    case "success":
      return <CheckCircle className="w-5 h-5 text-primary" />;
    default:
      return <AlertCircle className="w-5 h-5 text-foreground" />;
  }
};

const getDefaultNotificationIconContainerClassName = (notification: NotificationItem) => {
  switch (notification.type) {
    case "appointment":
      return "bg-primary/10 border-primary/20";
    case "cancellation":
      return "bg-destructive/10 border-destructive/20";
    case "payment":
      return "bg-primary/10 border-primary/20";
    case "reminder":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "success":
      return "bg-primary/10 border-primary/20";
    default:
      return notification.isRead ? "bg-muted border-transparent" : "bg-white border-primary/20";
  }
};

const getNotificationIcon = (notification: NotificationItem) =>
  getEventVisualConfig(notification)?.icon ?? getDefaultNotificationIcon(notification);

const getNotificationIconContainerClassName = (notification: NotificationItem) =>
  getEventVisualConfig(notification)?.containerClassName ??
  getDefaultNotificationIconContainerClassName(notification);

export function PageHeader({
  title,
  subtitle,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  onDeleteNotification,
  evolutionConnection,
  onEvolutionConnectionUpdated,
  onEvolutionConnectionNotification,
  // TODO global search: reativar props da busca quando a barra voltar.
  // searchResults = [],
  // searchValue = "",
  // onSearchChange,
  // onSearchResultSelect,
}: PageHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [displayQrCode, setDisplayQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(evolutionConnection?.status ?? null,);
  const [companyPhone, setCompanyPhone] = useState<string | null>(evolutionConnection?.companyPhone ?? null,);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(evolutionConnection?.connectedPhone ?? null,);
  const [phoneMismatch, setPhoneMismatch] = useState<boolean>(Boolean(evolutionConnection?.phoneMismatch),);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const companyId = localStorage.getItem("companyId");
  const shouldShowQrButton = Boolean(companyId) && evolutionConnection?.connected === false;
  const hasShownMismatchToastRef = useRef(false);
  const hasHandledSuccessRef = useRef(false);

  useEffect(() => {
    setConnectionStatus(evolutionConnection?.status ?? null);
    setCompanyPhone(evolutionConnection?.companyPhone ?? null);
    setConnectedPhone(evolutionConnection?.connectedPhone ?? null);
    setPhoneMismatch(Boolean(evolutionConnection?.phoneMismatch));
  }, [
    evolutionConnection?.status,
    evolutionConnection?.companyPhone,
    evolutionConnection?.connectedPhone,
    evolutionConnection?.phoneMismatch,
  ]);

  useEffect(() => {
    if (!qrCode) {
      setDisplayQrCode(null);
      return;
    }

    let active = true;
    const image = new Image();

    image.onload = () => {
      if (!active) return;

      const canvas = document.createElement("canvas");
      const width = image.naturalWidth || image.width || 512;
      const height = image.naturalHeight || image.height || 512;
      const context = canvas.getContext("2d");

      if (!context) {
        setDisplayQrCode(qrCode);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const green = { r: 0, g: 168, b: 107 };

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha === 0) continue;

        const red = data[index];
        const greenChannel = data[index + 1];
        const blue = data[index + 2];
        const luminance = 0.2126 * red + 0.7152 * greenChannel + 0.0722 * blue;

        if (luminance > 200) {
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
          continue;
        }

        data[index] = green.r;
        data[index + 1] = green.g;
        data[index + 2] = green.b;
      }

      context.putImageData(imageData, 0, 0);
      setDisplayQrCode(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      if (active) {
        setDisplayQrCode(qrCode);
      }
    };

    image.src = qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`;

    return () => {
      active = false;
    };
  }, [qrCode]);

  useEffect(() => {
    if (!isQrModalOpen || !companyId) return;

    hasShownMismatchToastRef.current = false;
    hasHandledSuccessRef.current = false;

    let active = true;
    let intervalId: number | null = null;

    const loadConnection = async (connect = false) => {
      setIsLoadingQr(true);

      try {
        const response = connect
          ? await api.post(`/companies/${companyId}/evolution/connect`)
          : await api.get(`/companies/${companyId}/evolution/status`);
        const data = response.data.data;

        if (!active) return;

        setQrCode((currentQrCode) => data?.qrCode || currentQrCode || null);
        setConnectionStatus(data?.state || null);
        setCompanyPhone(data?.companyPhone || null);
        setConnectedPhone(data?.connectedPhone || null);
        setPhoneMismatch(Boolean(data?.phoneMismatch));

        if (data?.phoneMismatch && !hasShownMismatchToastRef.current) {
          hasShownMismatchToastRef.current = true;
          toast.error("Número divergente", {
            description: "O QR foi escaneado com um número diferente do telefone cadastrado da empresa.",
          });
        }

        if (data?.connected) {
          if (!hasHandledSuccessRef.current) {
            hasHandledSuccessRef.current = true;

            onEvolutionConnectionNotification?.(
              {
                id: `evolution-connected-${Date.now()}`,
                type: "success",
                title: "WhatsApp conectado",
                message: "Em alguns minutos, seu número atenderá automaticamente pelo chat inteligente.",
                time: new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date()),
                isRead: false,
                eventName: "notification",
              },
              false,
            );

            toast.success("WhatsApp conectado com sucesso", {
              description: "Em alguns minutos, seu número atenderá automaticamente pelo chat inteligente.",
            });
          }

          window.clearInterval(intervalId ?? undefined);
          setIsQrModalOpen(false);
          await onEvolutionConnectionUpdated?.();
        }
      } finally {
        if (active) {
          setIsLoadingQr(false);
        }
      }
    };

    loadConnection(true).catch(() => null);

    intervalId = window.setInterval(() => {
      loadConnection(false).catch(() => null);
    }, 4000);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [companyId, isQrModalOpen, onEvolutionConnectionUpdated]);

  // TODO global search: reativar seleção/navegação da busca quando a barra voltar.
  // const handleSearchSelect = (item: GlobalSearchItem) => {
  //   onSearchResultSelect?.(item, searchValue);
  //   setIsSearchOpen(false);
  //   navigate(item.path);
  // };

  return (
    <>
    <header className="bg-white border-b border-border px-5 py-2 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {shouldShowQrButton && (
            <Button
              type="button"
              className="shrink-0 gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setIsQrModalOpen(true)}
            >
              <QrCode className="w-4 h-4" />
              Conectar WhatsApp
            </Button>
          )}

          {/* TODO global search: barra comentada para reimplementacao futura. */}

          <CustomDropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            trigger={
              <Button
                size="icon"
                className="relative bg-transparent text-muted-foreground hover:bg-primary hover:text-popover"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive rounded-full text-[10px] text-popover font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            }
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Notificações</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                </p>
              </div>
              {(unreadCount > 0 || notifications.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={unreadCount > 0 ? onMarkAllAsRead : onClearNotifications}
                  className="text-xs h-7"
                >
                  {unreadCount > 0 ? "Marcar todas como lidas" : "Limpar notificações"}
                </Button>
              )}
            </div>

            <div className="max-h-[480px] overflow-y-auto scrollbar-custom">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group ${
                        !notification.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${getNotificationIconContainerClassName(notification)}`}
                          >
                            {getNotificationIcon(notification)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={() => onDeleteNotification(notification.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs h-6 text-primary hover:text-primary hover:bg-primary/10"
                              >
                                Marcar como lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CustomDropdown>
        </div>
      </div>
    </header>
    <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quase lá!</DialogTitle>
          <DialogDescription>
            Para conectar o Whatsapp, escaneie este QR Code com o número {companyPhone ? formatPhone(companyPhone) : "da empresa"} para ativar o seu chat inteligente!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
            {displayQrCode ? (
              <img
                src={displayQrCode}
                alt="QR Code para conectar WhatsApp"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : isLoadingQr ? (
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <div className="px-6 text-center text-sm text-muted-foreground">
                Estamos preparando o QR Code para conexão.
              </div>
            )}
          </div>

          <div className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Status atual: {phoneMismatch ? "número divergente" : connectionStatus === "open" ? "conectado" : "aguardando conexão"}
            </p>
            <p className="mt-1">
              Abra o WhatsApp nesse número, vá em aparelhos conectados e escaneie o código acima.
            </p>
            {phoneMismatch && (
              <p className="mt-2 text-destructive">
                O WhatsApp conectado não corresponde ao telefone cadastrado da empresa.
              </p>
            )}
            {(companyPhone || connectedPhone) && (
              <p className="mt-2">
                Cadastrado: {formatPhone(companyPhone) || "não informado"} | Conectado: {formatPhone(connectedPhone) || "ainda não identificado"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
