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
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary text-popover';
      case 'pending':
        return 'bg-yellow-500 text-popover';
      case 'cancelled':
        return 'bg-destructive text-popover';
      default:
        return 'bg-gray-500 text-popover';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
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
            
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}