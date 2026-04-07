import { Bell, Search, Calendar, X, DollarSign, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { CustomDropdown } from './CustomDropdown';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: number;
  type: 'appointment' | 'cancellation' | 'payment' | 'reminder' | 'success';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'appointment',
    title: 'Novo agendamento',
    message: 'Ana Paula agendou Corte e Escova para hoje às 14:30',
    time: 'Há 5 minutos',
    isRead: false,
  },
  {
    id: 2,
    type: 'cancellation',
    title: 'Cancelamento',
    message: 'Carlos Eduardo cancelou o agendamento de amanhã',
    time: 'Há 15 minutos',
    isRead: false,
  },
  {
    id: 3,
    type: 'payment',
    title: 'Pagamento recebido',
    message: 'Pagamento de R$ 180,00 confirmado - Beatriz Costa',
    time: 'Há 1 hora',
    isRead: false,
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Lembrete de agendamento',
    message: 'Você tem 8 agendamentos confirmados para amanhã',
    time: 'Há 2 horas',
    isRead: true,
  },
  {
    id: 5,
    type: 'success',
    title: 'Agendamento concluído',
    message: 'Fernanda Lima avaliou o serviço com 5 estrelas',
    time: 'Há 3 horas',
    isRead: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="w-5 h-5 text-[#00A676]" />;
    case 'cancellation':
      return <X className="w-5 h-5 text-[#E63946]" />;
    case 'payment':
      return <DollarSign className="w-5 h-5 text-[#00A676]" />;
    case 'reminder':
      return <Clock className="w-5 h-5 text-[#080D0D]" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-[#00A676]" />;
    default:
      return <AlertCircle className="w-5 h-5 text-[#080D0D]" />;
  }
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="bg-white border-b border-border px-5 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
          {subtitle && <p className="text-muted-foreground capitalize">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar agendamentos, clientes..." 
              className="pl-10 bg-input-background"
            />
          </div>
          
          {/* Notifications Dropdown */}
          <CustomDropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            trigger={
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#E63946] rounded-full text-[10px] text-white font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            }
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Notificações</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-7"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[480px] overflow-y-auto scrollbar-custom">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group ${
                        !notification.isRead ? 'bg-[#00A676]/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            !notification.isRead ? 'bg-white border-2 border-[#00A676]/20' : 'bg-muted'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-[#E63946]" />
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
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs h-6 text-[#00A676] hover:text-[#00A676] hover:bg-[#00A676]/10"
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