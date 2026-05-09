import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  CalendarX,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LoadingPage } from "./LoadingPage";
import {
  formatPhone,
  formatTime,
  getDateKeyInTimeZone,
  getTimePartsInTimeZone,
  isSameDayInTimeZone,
} from "@/lib/parsers";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { showRequestErrorToast } from "@/lib/errorHandlers";

const timeSlots = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

const appointmentStatusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELED", label: "Cancelado" },
];

export function DailySchedulePage() {
  const { dados, refreshDados } = useLayoutOutletContext();
  const [data, setDataState] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientMode, setClientMode] = useState<"new" | "existing">("new");
  const [formData, setFormData] = useState({
    company_id: localStorage.getItem("companyId"),
    client_id: "",
    client_name: "",
    client_email: "",
    client_contact: "",
    employee_id: "",
    service_id: "",
    appointment_time: "",
    status: "PENDING",
  });

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

  const professionals = dados?.professionals || [];
  const services = dados?.services || [];
  const customers = dados?.customers?.customers || [];

  const resetForm = () => {
    setFormData({
      company_id: localStorage.getItem("companyId"),
      client_id: "",
      client_name: "",
      client_email: "",
      client_contact: "",
      employee_id: "",
      service_id: "",
      appointment_time: "",
      status: "PENDING",
    });
    setClientMode("new");
  };

  const timeToDate = (time) => {
    if (!time) return null;

    const [h, m] = time.split(":").map(Number);
    return new Date(2000, 0, 1, h, m, 0, 0);
  };

  const dateToTime = (date) => {
    if (!date) return "";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const getTodayDateKey = () => getDateKeyInTimeZone(new Date());
  const selectedDateKey = getDateKeyInTimeZone(selectedDate);
  const isTodaySelectedDate = selectedDateKey === getTodayDateKey();

  const getCurrentSelectableTime = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const nextSlotMinutes = Math.ceil(totalMinutes / 30) * 30;
    const hours = Math.floor(nextSlotMinutes / 60);
    const minutes = nextSlotMinutes % 60;

    return new Date(2000, 0, 1, hours, minutes, 0, 0);
  };

  const getAppointmentMinTime = () => {
    const currentSelectableTime = getCurrentSelectableTime();
    const openingTime = new Date(2000, 0, 1, 6, 0, 0);

    if (!isTodaySelectedDate) {
      return openingTime;
    }

    return currentSelectableTime > openingTime ? currentSelectableTime : openingTime;
  };

  const getSelectedService = () =>
    services.find((service) => String(service.id) === String(formData.service_id));

  const getSelectedProfessional = () =>
    professionals.find(
      (professional) => String(professional.id) === String(formData.employee_id),
    );

  const toMinutes = (timeValue) => {
    if (!timeValue) return null;

    if (typeof timeValue === "string" && /^\d{2}:\d{2}$/.test(timeValue)) {
      const [hours, minutes] = timeValue.split(":").map(Number);

      return hours * 60 + minutes;
    }

    const normalizedTime = formatTime(timeValue);

    if (!normalizedTime) return null;

    const [hours, minutes] = normalizedTime.split(":").map(Number);

    return hours * 60 + minutes;
  };

  const toTimeOption = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return new Date(2000, 0, 1, hours, minutes, 0, 0);
  };

  const getAvailableTimeOptions = () => {
    const professional = getSelectedProfessional();
    const service = getSelectedService();

    if (!professional || !service) {
      return [];
    }

    const weekDay = new Date(`${selectedDateKey}T12:00:00`).getDay();
    const durationMinutes = Number(service.duration_minutes || 0);
    const minimumSelectableMinutes = isTodaySelectedDate
      ? (() => {
          const minTime = getAppointmentMinTime();
          return minTime.getHours() * 60 + minTime.getMinutes();
        })()
      : 0;

    return (professional.scheduleOpenings || [])
      .filter((opening) => Number(opening.week_day) === weekDay)
      .flatMap((opening) => {
        const openingStartMinutes = toMinutes(opening.start_time);
        const openingEndMinutes = toMinutes(opening.end_time);

        if (
          openingStartMinutes === null ||
          openingEndMinutes === null ||
          durationMinutes <= 0
        ) {
          return [];
        }

        const firstAvailableMinute = Math.max(openingStartMinutes, minimumSelectableMinutes);
        const alignedStartMinute = Math.ceil(firstAvailableMinute / 30) * 30;
        const slots = [];

        for (
          let minutes = alignedStartMinute;
          minutes + durationMinutes <= openingEndMinutes;
          minutes += 30
        ) {
          slots.push(toTimeOption(minutes));
        }

        return slots;
      });
  };

  const hasProfessionalAvailability = () => getAvailableTimeOptions().length > 0;

  const isSelectedTimeAvailable = () => {
    if (!formData.appointment_time) return true;

    const selectedTime = dateToTime(timeToDate(formData.appointment_time));

    return getAvailableTimeOptions().some((timeOption) => dateToTime(timeOption) === selectedTime);
  };

  useEffect(() => {
    if (!formData.appointment_time) return;
    if (isSelectedTimeAvailable()) return;

    setFormData((prev) => ({
      ...prev,
      appointment_time: "",
    }));
  }, [formData.employee_id, formData.service_id, selectedDateKey]);

  const buildStartAt = () => {
    const startAt = new Date(`${selectedDateKey}T${formData.appointment_time}:00`);

    if (Number.isNaN(startAt.getTime())) {
      throw new Error("Selecione um horario valido.");
    }

    return startAt;
  };

  const handleClientPhoneChange = (value) => {
    const cleanedPhone = value.replace(/\D/g, "").slice(0, 11);

    setFormData((prev) => ({ ...prev, client_contact: cleanedPhone }));
  };

  const handleExistingClientChange = (clientId) => {
    const selectedCustomer = customers.find(
      (customer) => String(customer.id) === String(clientId),
    );

    setFormData((prev) => ({
      ...prev,
      client_id: String(clientId),
      client_name: selectedCustomer?.name ?? "",
      client_contact: selectedCustomer?.phone ?? selectedCustomer?.contact ?? "",
      client_email: "",
    }));
  };

  const handleCreateAppointment = async () => {
    try {
      let clientId = Number(formData.client_id);
      const startAt = buildStartAt();
      const shouldUseExistingClient = clientMode === "existing";

      if (!shouldUseExistingClient) {
        const clientPayload = {
          company_id: formData.company_id,
          name: formData.client_name,
          phone: formData.client_contact,
        };

        const createdCustomer = (await api.post("/customers", clientPayload)).data.data;
        clientId = createdCustomer.id;
      }

      await api.post("/appointments", {
        company_id: formData.company_id,
        client_id: clientId,
        employee_id: Number(formData.employee_id),
        service_id: Number(formData.service_id),
        start_time: startAt.toISOString(),
        status: formData.status,
      });

      toast.success("Agendamento criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      await Promise.all([updateAppointments(selectedDate), refreshDados()]);
    } catch (error) {
      showRequestErrorToast(error, "Nao foi possivel criar o agendamento.");
    }
  };

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
      case "CONFIRMED":
        return "bg-primary border-primary";
      case "PENDING":
        return "bg-yellow-500 border-yellow-500";
      case "CANCELED":
        return "bg-destructive border-destructive";
      default:
        return "bg-gray-500";
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

          <Button
            className="bg-primary hover:bg-primary/70 text-popover"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
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
              <div className="border-r border-border sticky left-0 bg-background z-20">
                <div className="h-12 border-b border-border sticky top-0 bg-white z-20" />
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

              {data.professionals.map((professional) => {
                const professionalAppointments = filteredAppointments.filter(
                  (apt) => apt.employee_id === professional.id,
                );

                return (
                  <div
                    key={professional.id}
                    className="border-r border-border last:border-r-0 min-w-0"
                  >
                    <div className="h-12 border-b border-border bg-background flex items-center justify-center px-4 sticky top-0 z-10">
                      <span className="font-medium text-sm truncate">{professional.name}</span>
                    </div>

                    <div className="relative">
                      {timeSlots.map((time) => (
                        <div
                          key={time}
                          className="h-16 border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
                        />
                      ))}

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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo agendamento em{" "}
              {formatDate(selectedDate)}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label>Cliente</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={clientMode === "new" ? "default" : "secondary"}
                    className="justify-center"
                    onClick={() => {
                      setClientMode("new");
                      setFormData((prev) => ({
                        ...prev,
                        client_id: "",
                        client_name: "",
                        client_email: "",
                        client_contact: "",
                      }));
                    }}
                  >
                    Novo
                  </Button>
                  <Button
                    type="button"
                    variant={clientMode === "existing" ? "default" : "secondary"}
                    className="justify-center"
                    onClick={() => {
                      setClientMode("existing");
                      setFormData((prev) => ({
                        ...prev,
                        client_id: "",
                        client_name: "",
                        client_email: "",
                        client_contact: "",
                      }));
                    }}
                  >
                    Existente
                  </Button>
                </div>
              </div>
            </div>

            {clientMode === "existing" ? (
              <div className="col-span-2 space-y-2">
                <Select value={formData.client_id} onValueChange={handleExistingClientChange}>
                  <SelectTrigger id="daily-appointment-existing-client">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name} - {formatPhone(customer.phone ?? customer.contact ?? "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="daily-appointment-client-name">Nome do cliente</Label>
                  <Input
                    id="daily-appointment-client-name"
                    placeholder="Nome do cliente"
                    value={formData.client_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-appointment-client-email">E-mail do cliente</Label>
                  <Input
                    id="daily-appointment-client-email"
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.client_email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client_email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-appointment-client-phone">Telefone do cliente</Label>
                  <Input
                    id="daily-appointment-client-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="(11) 99999-9999"
                    value={formatPhone(formData.client_contact)}
                    onChange={(e) => handleClientPhoneChange(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="daily-appointment-service">Serviço</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, service_id: value }))
                }
              >
                <SelectTrigger id="daily-appointment-service">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-appointment-professional">Profissional</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, employee_id: value }))
                }
              >
                <SelectTrigger id="daily-appointment-professional">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={String(professional.id)}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="daily-appointment-date">Data</Label>
              <Input
                id="daily-appointment-date"
                value={formatDate(selectedDate)}
                disabled
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="daily-appointment-time">Horário</Label>
              <DatePicker
                selected={timeToDate(formData.appointment_time)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointment_time: dateToTime(date),
                  }))
                }
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                includeTimes={getAvailableTimeOptions()}
                dateFormat="HH:mm"
                locale={ptBR}
                placeholderText="HH:mm"
                isClearable
                disabled={
                  !formData.employee_id ||
                  !formData.service_id ||
                  !hasProfessionalAvailability()
                }
                minTime={getAppointmentMinTime()}
                maxTime={new Date(2000, 0, 1, 23, 59, 0)}
                className="w-full rounded-md border border-primary px-3 py-2 text-sm"
              />
              {formData.employee_id && formData.service_id && !hasProfessionalAvailability() && (
                <p className="text-xs text-destructive">
                  Esse profissional nao possui horario disponivel nessa data para a duracao do servico.
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="daily-appointment-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="daily-appointment-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentStatusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              size="sm"
              className="text-sm bg-transparent text-foreground hover:bg-transparent hover:text-destructive"
              type="button"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateAppointment}
              disabled={
                (clientMode === "new"
                  ? (!formData.client_name || !formData.client_contact)
                  : !formData.client_id) ||
                !formData.employee_id ||
                !formData.service_id ||
                !formData.appointment_time
              }
            >
              Criar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
