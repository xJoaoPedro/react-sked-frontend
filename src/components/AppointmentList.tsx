import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty"
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '@/lib/parsers';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  dateTime: string | Date;
  status: 'confirmed' | 'pending' | 'canceled' | 'completed';
  avatar?: string;
}

interface AppointmentProps {
  appointments : Appointment[]
}

export function AppointmentList({appointments}: AppointmentProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: Appointment['status']) => {
      const statusConfig = {
        confirmed: { label: 'Confirmado', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
        pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
        canceled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
        completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20' },
      };
      
      const config = statusConfig[status];
      return (
        <Badge
          variant="outline"
          className={`${config.className} max-w-full whitespace-nowrap text-xs sm:text-sm`}
        >
          {config.label}
        </Badge>
      );
    };
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Próximos Agendamentos</h3>
      </div>
      
      <div className="space-y-4 overflow-y-auto max-h-96 pr-2 scrollbar-custom">
        {appointments.length > 0 ? appointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{appointment.clientName}</p>
                    <p className="truncate text-sm text-muted-foreground">{appointment.service}</p>
                  </div>

                  <div className="self-start sm:self-auto">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm leading-snug break-words">
                    {formatDate(appointment.dateTime)}, {formatTime(appointment.dateTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle className='text-muted-foreground'>Sem agendamentos futuros.</EmptyTitle>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={() => navigate("/appointments")}>Criar agendamento</Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </Card>
  );
}
