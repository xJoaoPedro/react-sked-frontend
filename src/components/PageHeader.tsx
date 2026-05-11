import { Bell, Search, Calendar, X, DollarSign, Wallet, AlertCircle, CheckCircle, Clock, Trash2, Package, AlertTriangle, CircleX, Wrench, UserCog, Users, Building2, RefreshCw, CalendarPlus2, CalendarSync, CalendarX2, UserPlus, UserRoundX, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CustomDropdown } from "./CustomDropdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onDeleteNotification: (id: string) => void;
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
}: PageHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <header className="bg-white border-b border-border px-5 py-2 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Buscar agendamentos, clientes..."
              className="pl-10"
            />
          </div>

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
  );
}
