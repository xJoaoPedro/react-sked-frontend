import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarX, ChevronDown,Check, Search, Scissors, UserRound, Hand, Heart, Brain, Stethoscope, Smile, Dumbbell, Star, Car, Wrench, Home, PawPrint, Briefcase, GraduationCap, MoreHorizontal, Clock3, } from "lucide-react";
import { api } from "@/lib/api";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty";
import { LoadingPage } from "./LoadingPage";
import { formatPhone, formatTime, getDateKeyInTimeZone, getTimePartsInTimeZone, isSameDayInTimeZone, } from "@/lib/parsers";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { toast } from "sonner";
import { showRequestErrorToast } from "@/lib/errorHandlers";
import { RevenueTransactionDialog } from "@/components/RevenueTransactionDialog";

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

const serviceCategoryIcons = {
  HAIR: Scissors,
  BEARD: UserRound,
  AESTHETIC: Star,
  NAILS: Hand,
  MASSAGE: Heart,
  THERAPY: Brain,
  HEALTH: Stethoscope,
  DENTAL: Smile,
  FITNESS: Dumbbell,
  BEAUTY: Star,
  AUTOMOTIVE: Car,
  TECHNICAL: Wrench,
  HOME_SERVICE: Home,
  PET: PawPrint,
  CONSULTING: Briefcase,
  EDUCATION: GraduationCap,
  OTHER: MoreHorizontal,
};

export function DailySchedulePage() {
  const { dados, refreshDados } = useLayoutOutletContext();
  const existingClientDropdownRef = useRef<HTMLDivElement | null>(null);
  const [data, setDataState] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [pendingRevenueAppointment, setPendingRevenueAppointment] = useState(null);
  const [clientMode, setClientMode] = useState<"new" | "existing">("new");
  const [existingClientSearch, setExistingClientSearch] = useState("");
  const [existingClientDropdownOpen, setExistingClientDropdownOpen] = useState(false);
  const [occupiedAppointments, setOccupiedAppointments] = useState([]);
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

    setDataState((prev) => {
      const nextDailySchedule = dados.dailySchedules || null;
      const selectedDateKey = getDateKeyInTimeZone(selectedDate);
      const todayDateKey = getDateKeyInTimeZone(new Date());
      const shouldUseRealtimeAppointments = selectedDateKey === todayDateKey;

      if (!nextDailySchedule) {
        return prev;
      }

      if (!prev) {
        return nextDailySchedule;
      }

      return {
        ...nextDailySchedule,
        appointments: shouldUseRealtimeAppointments
          ? nextDailySchedule.appointments
          : (prev.appointments ?? nextDailySchedule.appointments),
      };
    });
  }, [dados, selectedDate]);

  const professionals = dados?.professionals || [];
  const services = dados?.services || [];
  const customers = dados?.customers?.customers || [];
  const selectedExistingCustomer = customers.find(
    (customer) => String(customer.id) === String(formData.client_id),
  );
  const filteredCustomers = customers.filter((customer) => {
    const normalizedSearch = existingClientSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const phone = formatPhone(customer.phone ?? customer.contact ?? "").toLowerCase();

    return (
      customer.name?.toLowerCase().includes(normalizedSearch) ||
      phone.includes(normalizedSearch)
    );
  });

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
    setExistingClientSearch("");
    setExistingClientDropdownOpen(false);
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

  const getProfessionalServiceIds = (professional) =>
    (professional?.services || []).map((serviceId) => String(serviceId));

  const availableProfessionals = formData.service_id
    ? professionals.filter((professional) =>
        getProfessionalServiceIds(professional).includes(String(formData.service_id)),
      )
    : professionals;

  const availableServices = formData.employee_id
    ? services.filter((service) =>
        getProfessionalServiceIds(getSelectedProfessional()).includes(String(service.id)),
      )
    : services;

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

  const hasTimeConflict = (slotStartMinutes, durationMinutes) => {
    const slotEndMinutes = slotStartMinutes + durationMinutes;

    return occupiedAppointments.some((appointment) => {
      const occupiedStartMinutes = toMinutes(appointment.start_time);
      const occupiedEndMinutes = toMinutes(appointment.end_time);

      if (occupiedStartMinutes === null || occupiedEndMinutes === null) {
        return false;
      }

      return slotStartMinutes < occupiedEndMinutes && slotEndMinutes > occupiedStartMinutes;
    });
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
          if (hasTimeConflict(minutes, durationMinutes)) {
            continue;
          }

          slots.push(toTimeOption(minutes));
        }

        return slots;
      });
  };

  const hasProfessionalAvailability = () => getAvailableTimeOptions().length > 0;
  const getTimeSelectOptions = () =>
    getAvailableTimeOptions().map((timeOption) => {
      const value = dateToTime(timeOption);

      return {
        value,
        label: value,
      };
    });

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

  useEffect(() => {
    if (!formData.service_id || !formData.employee_id) return;

    const selectedProfessionalStillAvailable = availableProfessionals.some(
      (professional) => String(professional.id) === String(formData.employee_id),
    );

    if (!selectedProfessionalStillAvailable) {
      setFormData((prev) => ({
        ...prev,
        employee_id: "",
        appointment_time: "",
      }));
    }
  }, [formData.service_id, formData.employee_id]);

  useEffect(() => {
    if (!formData.employee_id || !formData.service_id) return;

    const selectedServiceStillAvailable = availableServices.some(
      (service) => String(service.id) === String(formData.service_id),
    );

    if (!selectedServiceStillAvailable) {
      setFormData((prev) => ({
        ...prev,
        service_id: "",
        appointment_time: "",
      }));
    }
  }, [formData.employee_id, formData.service_id]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");

    if (!companyId || !formData.employee_id) {
      setOccupiedAppointments([]);
      return;
    }

    let isActive = true;

    const fetchOccupiedAppointments = async () => {
      try {
        const response = (
          await api.get(`/companies/${companyId}/appointments`, {
            params: {
              page: 1,
              limit: 500,
              date: selectedDateKey,
              employeeId: formData.employee_id,
            },
          })
        ).data.data;

        if (!isActive) return;

        setOccupiedAppointments(response.data || []);
      } catch {
        if (!isActive) return;
        setOccupiedAppointments([]);
      }
    };

    fetchOccupiedAppointments();

    return () => {
      isActive = false;
    };
  }, [formData.employee_id, selectedDateKey]);

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
    setExistingClientSearch("");
    setExistingClientDropdownOpen(false);
  };

  const isPastSelectedDate = selectedDateKey < getTodayDateKey();

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

      const createdAppointment = (await api.post("/appointments", {
        company_id: formData.company_id,
        client_id: clientId,
        employee_id: Number(formData.employee_id),
        service_id: Number(formData.service_id),
        start_time: startAt.toISOString(),
        status: formData.status,
      })).data.data;

      toast.success("Agendamento criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      await refreshDados();
      await updateAppointments(selectedDate);

      if (formData.status === "COMPLETED") {
        setPendingRevenueAppointment({
          appointmentId: createdAppointment.id,
          clientId: createdAppointment.client?.id ?? clientId,
          clientName: createdAppointment.client?.name ?? formData.client_name,
          employeeId: createdAppointment.employee?.id ?? Number(formData.employee_id),
          professionalName: createdAppointment.employee?.name ?? null,
          serviceId: createdAppointment.service?.id ?? Number(formData.service_id),
          serviceName: createdAppointment.service?.name ?? null,
          amount: Number(createdAppointment.service?.price ?? 0),
          occurredAt: createdAppointment.start_time,
        });
        setIsRevenueDialogOpen(true);
      }
    } catch (error) {
      showRequestErrorToast(error, "Nao foi possivel criar o agendamento.");
    }
  };

  useEffect(() => {
    if (!existingClientDropdownOpen) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!existingClientDropdownRef.current) return;
      if (existingClientDropdownRef.current.contains(event.target as Node)) return;

      setExistingClientDropdownOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDownOutside);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
    };
  }, [existingClientDropdownOpen]);

  const updateAppointments = async (date) => {
    if (!data?.id) return;

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

  useEffect(() => {
    if (!dados || !data?.id) return;

    const selectedDateKey = getDateKeyInTimeZone(selectedDate);
    const todayDateKey = getDateKeyInTimeZone(new Date());

    if (selectedDateKey === todayDateKey) return;

    updateAppointments(selectedDate);
  }, [dados, selectedDate, data?.id]);

  if (data === null) return <LoadingPage />;

  const filteredAppointments = data.appointments.filter((apt) => {
    return isSameDayInTimeZone(apt.start_time, selectedDate);
  });

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

  const getServiceCategoryIcon = (category) =>
    serviceCategoryIcons[category] || MoreHorizontal;

  const getClientInitials = (name = "") =>
    String(name)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "C";

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
                          const ServiceIcon = getServiceCategoryIcon(appointment.service?.category);
                          const clientPhoto = appointment.client?.photo || appointment.client?.profilePictureUrl || null;
                          const isCompact = height < 60;
                          const shouldCenterContent = height <= 76;

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
                              <div className="absolute right-2 top-2">
                                <ServiceIcon className="h-3 w-3 opacity-90" />
                              </div>

                              <div className="flex h-full flex-col">
                                <div
                                  className={shouldCenterContent ? "flex flex-1 items-center pr-4" : "flex pr-4"}
                                >
                                  <div className="min-w-0 flex flex-1 items-center gap-2 self-center">
                                    <div className="mt-1 flex h-8 w-8 shrink-0 self-center items-center justify-center overflow-hidden rounded-full bg-white/20 ring-1 ring-white/20">
                                      {clientPhoto ? (
                                        <img
                                          src={clientPhoto}
                                          alt={appointment.client?.name || "Cliente"}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold">
                                          {getClientInitials(appointment.client?.name)}
                                        </div>
                                      )}
                                    </div>

                                    <div className="min-w-0 flex min-h-8 flex-col justify-center">
                                      <div className="text-xs font-semibold truncate leading-tight">
                                        {appointment.client.name}
                                      </div>
                                      {!isCompact ? (
                                        <div className="text-xs opacity-90 truncate leading-tight">
                                          {appointment.service?.name}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className={`flex justify-end ${shouldCenterContent ? "pt-0" : "mt-auto pt-1"}`}>
                                  <div className="flex items-center gap-1 text-xs font-semibold tracking-[0.01em]">
                                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">
                                      {formatDate(appointment.start_time, true)} -{" "}
                                      {formatDate(appointment.end_time, true)}
                                    </span>
                                  </div>
                                </div>
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
        <DialogContent className="gap-0 overflow-x-hidden border-border/60 bg-background p-0 shadow-2xl sm:max-w-[820px]">
          <DialogHeader className="border-b border-border bg-muted/30 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Preencha as informações para criar um novo agendamento em {formatDate(selectedDate)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3">
                <Label className="text-sm font-semibold text-foreground">Tipo de cliente</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha se deseja cadastrar um novo cliente ou usar um já existente.
                </p>
              </div>
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
                  Novo cliente
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
                  Cliente existente
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Dados do cliente</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Preencha as informações de contato para identificar o agendamento.
                </p>
              </div>

              {clientMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="daily-appointment-existing-client">Cliente</Label>
                  <div className="relative" ref={existingClientDropdownRef}>
                    <Button
                      type="button"
                      id="daily-appointment-existing-client"
                      aria-expanded={existingClientDropdownOpen}
                      aria-haspopup="listbox"
                      onClick={() => setExistingClientDropdownOpen((current) => !current)}
                      className="h-10 w-full justify-between border border-input bg-muted px-3 font-normal text-foreground hover:bg-muted"
                    >
                      <span className="truncate text-left">
                        {selectedExistingCustomer
                          ? `${selectedExistingCustomer.name} - ${formatPhone(selectedExistingCustomer.phone ?? selectedExistingCustomer.contact ?? "")}`
                          : "Selecione um cliente"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>

                    {existingClientDropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md ring-1 ring-foreground/10">
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={existingClientSearch}
                              onChange={(e) => setExistingClientSearch(e.target.value)}
                              placeholder="Buscar cliente..."
                              className="pl-9"
                            />
                          </div>

                          <div className="max-h-64 overflow-y-auto rounded-md border border-border overscroll-contain scrollbar-custom">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => {
                                const customerId = String(customer.id);
                                const isSelected = customerId === String(formData.client_id);

                                return (
                                  <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => handleExistingClientChange(customerId)}
                                    className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted/50"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-foreground">{customer.name}</p>
                                      <p className="truncate text-xs text-muted-foreground">
                                        {formatPhone(customer.phone ?? customer.contact ?? "")}
                                      </p>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                Nenhum cliente encontrado.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
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
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Detalhes do agendamento</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecione serviço, profissional, horário e status para a data escolhida.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <SelectContent className="max-h-96">
                      {availableServices.map((service) => (
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
                    <SelectContent className="max-h-96">
                      {availableProfessionals.map((professional) => (
                        <SelectItem key={professional.id} value={String(professional.id)}>
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-appointment-date">Data</Label>
                  <Input
                    id="daily-appointment-date"
                    value={formatDate(selectedDate)}
                    disabled
                  />
                  {isPastSelectedDate && (
                    <p className="text-xs text-destructive">
                      Esse profissional não possui horário disponível nessa data para a duração do serviço.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="daily-appointment-time">Horário</Label>
                    {formData.employee_id && formData.service_id && !isPastSelectedDate && hasProfessionalAvailability() && (
                      <span className="text-xs text-muted-foreground">
                        {getTimeSelectOptions().length} horários disponíveis
                      </span>
                    )}
                  </div>
                  <Select
                    value={formData.appointment_time || undefined}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        appointment_time: value,
                      }))
                    }
                    disabled={
                      isPastSelectedDate ||
                      !formData.employee_id ||
                      !formData.service_id ||
                      !hasProfessionalAvailability()
                    }
                  >
                    <SelectTrigger id="daily-appointment-time">
                      <SelectValue
                        placeholder={
                          !formData.service_id
                            ? "Selecione um serviço"
                            : !formData.employee_id
                              ? "Selecione um profissional"
                              : isPastSelectedDate
                                ? "Data indisponível"
                                : hasProfessionalAvailability()
                                  ? "Selecione um horário"
                                  : "Sem horários disponíveis"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      {getTimeSelectOptions().map((timeOption) => (
                        <SelectItem key={timeOption.value} value={timeOption.value}>
                          {timeOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.employee_id && formData.service_id && !isPastSelectedDate && !hasProfessionalAvailability() && (
                    <p className="text-xs text-destructive">
                      Esse profissional não possui horário disponível nessa data para a duração do serviço.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
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
                    <SelectContent className="max-h-96">
                      {appointmentStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-6 py-4">
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
                !formData.appointment_time ||
                isPastSelectedDate
              }
            >
              Criar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RevenueTransactionDialog
        companyId={localStorage.getItem("companyId") ?? ""}
        open={isRevenueDialogOpen}
        onOpenChange={(open) => {
          setIsRevenueDialogOpen(open);
          if (!open) {
            setPendingRevenueAppointment(null);
          }
        }}
        appointmentContext={pendingRevenueAppointment}
        onCreated={async () => {
          await Promise.all([refreshDados(), updateAppointments(selectedDate)]);
        }}
      />
    </div>
  );
}
