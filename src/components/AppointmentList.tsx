import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty"
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled';
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
      return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
    };

    console.log(appointments.length)
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Próximos Agendamentos</h3>
      </div>
      
      <div className="space-y-4 overflow-y-auto max-h-[700px] scrollbar-custom">
        {appointments.length > 0 ? appointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{appointment.clientName}</p>
              <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {new Date(appointment.time).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            
            {getStatusBadge(appointment.status)}
          </div>
        )) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>Sem agendamentos futuros.</EmptyTitle>
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
