import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  avatar?: string;
}

const appointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    service: 'Corte de Cabelo',
    time: '09:00',
    status: 'confirmed',
  },
  {
    id: '2',
    clientName: 'João Santos',
    service: 'Massagem Relaxante',
    time: '10:30',
    status: 'confirmed',
  },
  {
    id: '3',
    clientName: 'Ana Paula',
    service: 'Manicure',
    time: '11:00',
    status: 'pending',
  },
  {
    id: '4',
    clientName: 'Carlos Oliveira',
    service: 'Consulta Odontológica',
    time: '14:00',
    status: 'confirmed',
  },
  {
    id: '5',
    clientName: 'Beatriz Costa',
    service: 'Depilação',
    time: '15:30',
    status: 'pending',
  },
];

export function AppointmentList() {
  const getStatusBadge = (status: Appointment['status']) => {
      const statusConfig = {
        confirmed: { label: 'Confirmado', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
        pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
        cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
        completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20' },
      };
      
      const config = statusConfig[status];
      return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
    };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Próximos Agendamentos</h3>
        <a href="#" className="text-primary hover:underline">Ver todos</a>
      </div>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
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
              <span className="text-sm">{appointment.time}</span>
            </div>
            
            {getStatusBadge(appointment.status)}            
          </div>
        ))}
      </div>
    </Card>
  );
}