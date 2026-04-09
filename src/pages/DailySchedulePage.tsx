import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/PageHeader';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  professional: string;
}

const professionals = [
  { id: 'joao', name: 'João Barbeiro' },
  { id: 'ana', name: 'Ana Terapeuta' },
  { id: 'carla', name: 'Carla Manicure' },
  { id: 'pedro', name: 'Dr. Pedro' },
  { id: 'maria', name: 'Maria Estética' },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    service: 'Corte de Cabelo',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    professional: 'João Barbeiro',
  },
  {
    id: '2',
    clientName: 'João Santos',
    service: 'Massagem Relaxante',
    startTime: '10:30',
    endTime: '11:30',
    status: 'confirmed',
    professional: 'Ana Terapeuta',
  },
  {
    id: '3',
    clientName: 'Ana Paula',
    service: 'Manicure',
    startTime: '11:00',
    endTime: '12:00',
    status: 'pending',
    professional: 'Carla Manicure',
  },
  {
    id: '4',
    clientName: 'Carlos Oliveira',
    service: 'Consulta Odontológica',
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    professional: 'Dr. Pedro',
  },
  {
    id: '5',
    clientName: 'Beatriz Costa',
    service: 'Depilação',
    startTime: '15:30',
    endTime: '16:00',
    status: 'pending',
    professional: 'Maria Estética',
  },
  {
    id: '6',
    clientName: 'Rafael Mendes',
    service: 'Barba',
    startTime: '16:00',
    endTime: '16:30',
    status: 'cancelled',
    professional: 'João Barbeiro',
  },
  {
    id: '7',
    clientName: 'Luciana Ferreira',
    service: 'Massagem',
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    professional: 'Ana Terapeuta',
  },
  {
    id: '8',
    clientName: 'Pedro Alves',
    service: 'Pedicure',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    professional: 'Carla Manicure',
  },
];

const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00'
];

export function DailySchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary border-primary';
      case 'pending':
        return 'bg-yellow-500 border-yellow-500';
      case 'cancelled':
        return 'bg-destructive border-destructive';
      default:
        return 'bg-gray-500 border-gray-500';
    }
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const firstSlotMinutes = timeToMinutes(timeSlots[0]);
    
    const top = ((startMinutes - firstSlotMinutes) / 30) * 64; // 64px per 30min slot
    const height = ((endMinutes - startMinutes) / 30) * 64;
    
    return { top, height };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Agenda do Dia" 
        subtitle={formatDate(selectedDate)}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button onClick={goToToday} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
            <div className="flex items-center gap-1 border border-border rounded-lg">
              <Button onClick={previousDay} variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button onClick={nextDay} variant="ghost" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <Button className="bg-primary hover:bg-[#008c63] text-popover">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Schedule Grid - with both vertical and horizontal scroll */}
        <Card className="flex-1 overflow-auto scrollbar-custom">
          <div className="flex min-w-max h-full">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r border-border sticky left-0 bg-white z-10">
              <div className="h-12 border-b border-border" /> {/* Header spacer */}
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1"
                >
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
              ))}
            </div>

            {/* Professional columns */}
            {professionals.map((professional) => {
              const professionalAppointments = mockAppointments.filter(
                apt => apt.professional === professional.name
              );

              return (
                <div key={professional.id} className="w-[350px] flex-shrink-0 border-r border-border last:border-r-0">
                  {/* Professional header */}
                  <div className="h-12 border-b border-border bg-muted/30 flex items-center justify-center px-4">
                    <span className="font-medium text-sm truncate">{professional.name}</span>
                  </div>

                  {/* Grid lines */}
                  <div className="relative">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="h-16 border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
                      />
                    ))}

                    {/* Appointments overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {professionalAppointments.map((appointment) => {
                        const { top, height } = getAppointmentPosition(
                          appointment.startTime,
                          appointment.endTime
                        );
                        
                        return (
                          <div
                            key={appointment.id}
                            className={`absolute left-1 right-1 ${getStatusColor(
                              appointment.status
                            )} text-popover rounded-lg p-2 shadow-sm border-l-4 pointer-events-auto cursor-pointer hover:shadow-md transition-shadow`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            <div className="text-xs font-semibold truncate">
                              {appointment.clientName}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {appointment.service}
                            </div>
                            <div className="text-xs opacity-90 mt-1">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm text-muted-foreground">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-sm text-muted-foreground">Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
