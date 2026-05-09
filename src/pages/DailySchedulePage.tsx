import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarX, } from "lucide-react";
import { api } from "@/lib/api";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { LoadingPage } from './LoadingPage';
import { getTimePartsInTimeZone, isSameDayInTimeZone } from "@/lib/parsers";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

export function DailySchedulePage() {
  const { dados } = useLayoutOutletContext();
  const [data, setDataState] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const formatDate = (date, schedule = false) => {
    const parsedDate = new Date(date);

    return schedule
      ? new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        }).format(parsedDate)
      : new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(parsedDate);
  };

  usePageHeader("Agenda do Dia", formatDate(selectedDate));

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.dailySchedules || []);
  }, [dados]);

  if (data === null) return <LoadingPage />;

  const filteredAppointments = data.appointments.filter((apt) => {
    return isSameDayInTimeZone(apt.start_time, selectedDate);
  });

  const updateAppointments = async (date) => {
    try {
      const response = (
        await api.get(`/appointments/${data.id}/${date.toISOString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ).data.data;

      setDataState((prev) => ({
        ...prev,
        appointments: response,
      }));
    } catch (error) {
      console.error("Erro ao atualizar agendamentos:", error);
    }
  };

  const previousDay = async () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);

    setSelectedDate(d);
    await updateAppointments(d);
  };

  const nextDay = async () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);

    setSelectedDate(d);
    await updateAppointments(d);
  };

  const goToToday = async () => {
    const d = new Date();

    setSelectedDate(d);
    await updateAppointments(d);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-primary border-primary";
      case "PENDING": return "bg-yellow-500 border-yellow-500";
      case "CANCELED": return "bg-destructive border-destructive";
      default: return "bg-gray-500";
    }
  };

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const getAppointmentPosition = (start, end) => {
    const s = getTimePartsInTimeZone(start);
    const e = getTimePartsInTimeZone(end);

    const startMinutes = s.hours * 60 + s.minutes;
    const endMinutes = e.hours * 60 + e.minutes;
    const base = timeToMinutes(timeSlots[0]);

    return {
      top: ((startMinutes - base) / 30) * 64,
      height: ((endMinutes - startMinutes) / 30) * 64,
    };
  };

  const shouldUseFixedColumns = data.professionals.length > 3;
  const gridTemplateColumns = shouldUseFixedColumns
    ? `96px repeat(${data.professionals.length}, 350px)`
    : `96px repeat(${data.professionals.length}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              onClick={goToToday}
              className="bg-transparent border border-border text-foreground hover:bg-primary hover:text-popover"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
            <div className="flex items-center border border-border rounded-lg">
              <Button
                onClick={previousDay}
                size="icon"
                className="bg-transparent text-foreground hover:text-popover"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button
                onClick={nextDay}
                size="icon"
                className="bg-transparent text-foreground hover:text-popover"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/70 text-popover">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {data.professionals.length > 0 ? (
          <Card className="flex-1 overflow-auto scrollbar-custom">
            <div
              className={shouldUseFixedColumns ? "inline-grid min-w-max" : "grid min-w-full"}
              style={{ gridTemplateColumns }}
            >
              {/* Time column */}
              <div className="border-r border-border sticky left-0 bg-background z-20">
                <div className="h-12 border-b border-border sticky top-0 bg-white z-20" />{" "}
                {/* Header spacer */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-16 border-b border-border flex items-start justify-end pr-3 pt-1"
                  >
                    <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Professional columns */}
              {data.professionals.map((professional) => {
                const professionalAppointments = filteredAppointments.filter(
                  (apt) => apt.employee_id === professional.id,
                );

                return (
                  <div
                    key={professional.id}
                    className="border-r border-border last:border-r-0 min-w-0"
                  >
                    {/* Professional header */}
                    <div className="h-12 border-b border-border bg-background flex items-center justify-center px-4 sticky top-0 z-10">
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
                            appointment.start_time,
                            appointment.end_time,
                          );

                          return (
                            <div
                              key={appointment.id}
                              className={`absolute left-1 right-1 ${getStatusColor(
                                appointment.status,
                              )} text-white rounded-lg p-2 shadow-sm border-l-4 pointer-events-auto cursor-pointer hover:shadow-md transition-shadow`}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                              }}
                            >
                              <div className="text-xs font-semibold truncate">
                                {appointment.client.name}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {appointment.service?.name}
                              </div>
                              <div className="text-xs opacity-90 mt-1">
                                {formatDate(appointment.start_time, true)} -{" "}
                                {formatDate(appointment.end_time, true)}
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
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarX />
              </EmptyMedia>
              <EmptyTitle className="text-muted-foreground">
                Não há informações de agendamentos no dia para listar.
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
