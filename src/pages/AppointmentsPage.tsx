import { useEffect, useRef, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Filter, X, Calendar, Download, Eye, Edit, Trash2, Clock, User, DollarSign, FileText, Table2, ChevronDown, ChevronUp, FileJson, Plus, Check, Search, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker as CalendarDatePicker } from '@/components/ui/datepicker';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import * as XLSX from "xlsx";
import { toast } from "sonner"
import { api } from "@/lib/api";
import { formatDate, formatPhone, formatPrice, formatTime } from '@/lib/parsers';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { LoadingPage } from './LoadingPage';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useLayoutOutletContext } from '@/hooks/useLayoutOutletContext';
import { showRequestErrorToast } from '@/lib/errorHandlers';
import { RevenueTransactionDialog } from '@/components/RevenueTransactionDialog';

const statusList = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
];

const appointmentStatusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
];

export function AppointmentsPage() {
  const { dados, refreshDados } = useLayoutOutletContext();
  const latestFetchIdRef = useRef(0);
  const hasBootstrappedRef = useRef(false);
  const existingClientDropdownRef = useRef<HTMLDivElement | null>(null);
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [pendingRevenueAppointment, setPendingRevenueAppointment] = useState(null);
  const [clientMode, setClientMode] = useState<'new' | 'existing'>('new');
  const [existingClientSearch, setExistingClientSearch] = useState('');
  const [existingClientPopoverOpen, setExistingClientPopoverOpen] = useState(false);
  const [occupiedAppointments, setOccupiedAppointments] = useState([]);
  const [total, setTotal] = useState(1);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    company_id: localStorage.getItem('companyId'),
    client_id: '',
    client_name: '',
    client_email: '',
    client_contact: '',
    employee_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'PENDING',
  });
  const [filterId, setFilterId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterClient, setFilterClient] = useState('');
  const [filterProfessional, setFilterProfessional] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTimeStart, setFilterTimeStart] = useState('');
  const [filterTimeEnd, setFilterTimeEnd] = useState('');
  const customers = dados?.customers?.customers || [];
  const selectedExistingCustomer = customers.find(
    (customer) => String(customer.id) === String(formData.client_id),
  );
  const filteredCustomers = customers.filter((customer) => {
    const normalizedSearch = existingClientSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const phone = formatPhone(customer.phone ?? customer.contact ?? '').toLowerCase();

    return (
      customer.name?.toLowerCase().includes(normalizedSearch) ||
      phone.includes(normalizedSearch)
    );
  });

  usePageHeader("Agendamentos", data ? `${data.length} de ${total} agendamentos` : "Gerencie os agendamentos em tempo real", );

  const fetchData = async () => {
    const fetchId = latestFetchIdRef.current + 1;
    latestFetchIdRef.current = fetchId;

    const requestedPage = page;
    const response = (
      await api.get(`/companies/${localStorage.getItem('companyId')}/appointments`, {
        params: buildQuery(),
      })
    ).data.data;

    if (fetchId !== latestFetchIdRef.current) {
      return;
    }

    setDataState(response.data);
    setTotal(response.total);
    setTotalPages(response.totalPages);

    const resolvedPage = Number(response.page) || requestedPage;
    if (resolvedPage !== requestedPage) {
      setPage(resolvedPage);
    }
  }

  const resetForm = () => {
    setFormData({
      company_id: localStorage.getItem('companyId'),
      client_id: '',
      client_name: '',
      client_email: '',
      client_contact: '',
      employee_id: '',
      service_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'PENDING',
    });
    setClientMode('new');
    setExistingClientSearch('');
    setExistingClientPopoverOpen(false);
    setEditingAppointment(null);
  };

  const toLocalDateInput = (value) => {
    if (!value) return '';

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const timeToDate = (time) => {
    if (!time) return null;

    const [h, m] = time.split(':').map(Number);
    return new Date(2000, 0, 1, h, m, 0, 0);
  };

  const dateToTime = (date) => {
    if (!date) return '';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const getTodayDateKey = () => toLocalDateInput(new Date());

  const isPastAppointmentDate =
    !!formData.appointment_date && formData.appointment_date < getTodayDateKey();
  const isTodayAppointmentDate = formData.appointment_date === getTodayDateKey();

  const getCurrentSelectableTime = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const nextSlotMinutes = Math.ceil(totalMinutes / 30) * 30;
    const hours = Math.floor(nextSlotMinutes / 60);
    const minutes = nextSlotMinutes % 60;

    return new Date(2000, 0, 1, hours, minutes, 0, 0);
  };

  const getAppointmentMinTime = () => {
    if (editingAppointment || !isTodayAppointmentDate) {
      return new Date(2000, 0, 1, 6, 0, 0);
    }

    const currentSelectableTime = getCurrentSelectableTime();
    const openingTime = new Date(2000, 0, 1, 6, 0, 0);

    return currentSelectableTime > openingTime ? currentSelectableTime : openingTime;
  };

  const isTimeBeforeMinimum = (time: string) => {
    if (!time || editingAppointment || !isTodayAppointmentDate) return false;

    const selectedTime = timeToDate(time);
    if (!selectedTime) return false;

    return selectedTime < getAppointmentMinTime();
  };

  const isAppointmentDateTimeInvalid = () => {
    if (editingAppointment) return false;
    if (isPastAppointmentDate) return true;

    return isTimeBeforeMinimum(formData.appointment_time);
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

  const getAppointmentWeekDay = (dateKey) => {
    if (!dateKey) return null;

    return new Date(`${dateKey}T12:00:00`).getDay();
  };

  const toMinutes = (timeValue) => {
    if (!timeValue) return null;

    if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
      const [hours, minutes] = timeValue.split(':').map(Number);

      return hours * 60 + minutes;
    }

    const normalizedTime =
      typeof timeValue === 'string' && timeValue.includes('T')
        ? formatTime(timeValue)
        : formatTime(timeValue);

    if (!normalizedTime) return null;

    const [hours, minutes] = normalizedTime.split(':').map(Number);

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
    const weekDay = getAppointmentWeekDay(formData.appointment_date);
    const service = getSelectedService();

    if (!professional || weekDay === null || !service) {
      return [];
    }

    const durationMinutes = Number(service.duration_minutes || 0);
    const minimumSelectableMinutes = editingAppointment || !isTodayAppointmentDate
      ? 0
      : (() => {
          const minTime = getAppointmentMinTime();
          return minTime.getHours() * 60 + minTime.getMinutes();
        })();

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

  const buildStartAt = () => {
    const startAt = new Date(`${formData.appointment_date}T${formData.appointment_time}:00`);

    if (Number.isNaN(startAt.getTime())) {
      throw new Error('Selecione uma data e horário válidos.');
    }

    return startAt;
  };

  const buildAppointmentPayload = () => {
    const selectedService = getSelectedService();

    if (!selectedService) {
      throw new Error('Selecione um serviço válido.');
    }

    const startAt = buildStartAt();

    return {
      company_id: formData.company_id,
      client_id: Number(formData.client_id),
      employee_id: Number(formData.employee_id),
      service_id: Number(formData.service_id),
      start_time: startAt.toISOString(),
      status: formData.status,
    };
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (appointment) => {
    setClientMode('existing');
    setEditingAppointment(appointment);
    setFormData({
      company_id: localStorage.getItem('companyId'),
      client_id: String(appointment.client?.id ?? ''),
      client_name: appointment.client?.name ?? '',
      client_email: appointment.client?.email ?? '',
      client_contact: appointment.client?.phone ?? appointment.client?.contact ?? '',
      employee_id: String(appointment.employee?.id ?? ''),
      service_id: String(appointment.service?.id ?? ''),
      appointment_date: toLocalDateInput(appointment.start_time),
      appointment_time: formatTime(appointment.start_time),
      status: appointment.status ?? 'PENDING',
    });
    setIsDialogOpen(true);
  };

  const openRevenueDialogForAppointment = (appointment) => {
    if (!appointment) return;

    setPendingRevenueAppointment({
      appointmentId: appointment.id,
      clientId: appointment.client?.id ?? appointment.client_id ?? null,
      clientName: appointment.client?.name ?? null,
      employeeId: appointment.employee?.id ?? appointment.employee_id ?? null,
      professionalName: appointment.employee?.name ?? null,
      serviceId: appointment.service?.id ?? appointment.service_id ?? null,
      serviceName: appointment.service?.name ?? null,
      amount: Number(appointment.service?.price ?? 0),
      occurredAt: appointment.start_time,
    });
    setIsRevenueDialogOpen(true);
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
      client_name: selectedCustomer?.name ?? '',
      client_contact: selectedCustomer?.phone ?? selectedCustomer?.contact ?? '',
      client_email: '',
    }));
    setExistingClientSearch('');
    setExistingClientPopoverOpen(false);
  };

  const handleSubmitAppointment = async () => {
    try {
      let clientId = Number(formData.client_id);
      const startAt = buildStartAt();
      const shouldUseExistingClient = !editingAppointment && clientMode === 'existing';

      if (editingAppointment) {
        const clientPayload = {
          company_id: formData.company_id,
          name: formData.client_name,
          phone: formData.client_contact,
        };

        if (clientId) {
          await api.patch(`/customers/${clientId}`, clientPayload);
        }
      } else if (!shouldUseExistingClient) {
        const clientPayload = {
          company_id: formData.company_id,
          name: formData.client_name,
          phone: formData.client_contact,
        };

        const createdCustomer = (await api.post('/customers', clientPayload)).data.data;
        clientId = createdCustomer.id;
      }

      setFormData((prev) => ({ ...prev, client_id: String(clientId) }));

      const payload = buildAppointmentPayload();
      payload.client_id = clientId;
      payload.start_time = startAt.toISOString();

      if (editingAppointment) {
        const updatedAppointment = (
          await api.patch(`/appointments/${editingAppointment.id}`, payload)
        ).data.data;
        toast.success('Agendamento alterado com sucesso!');
        const shouldOpenRevenueDialog =
          payload.status === 'COMPLETED' && editingAppointment.status !== 'COMPLETED';

        if (shouldOpenRevenueDialog) {
          openRevenueDialogForAppointment(updatedAppointment);
        }
      } else {
        const createdAppointment = (await api.post('/appointments', payload)).data.data;
        toast.success('Agendamento criado com sucesso!');
        if (payload.status === 'COMPLETED') {
          openRevenueDialogForAppointment(createdAppointment);
        }
      }

      setIsDialogOpen(false);
      resetForm();
      await Promise.all([fetchData(), refreshDados()]);
    } catch (error) {
      showRequestErrorToast(error, 'Não foi possível salvar o agendamento.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Agendamento deletado com sucesso!');
      await Promise.all([fetchData(), refreshDados()]);
    } catch (error) {
      showRequestErrorToast(error, 'Não foi possível deletar o agendamento.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      CONFIRMED: { label: 'Confirmado', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
      PENDING: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
      CANCELED: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
      COMPLETED: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20' },
      NO_SHOW: { label: 'Não compareceu', className: 'bg-gray-500/10 text-gray-600 border border-gray-500/20 hover:bg-gray-500/' }
    };
    
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const clearFilters = () => {
    setFilterId('');
    setFilterDate('');
    setFilterService('all');
    setFilterClient('');
    setFilterProfessional('all');
    setFilterStatus('all');
    setFilterTimeStart('');
    setFilterTimeEnd('');
  };

  const hasActiveFilters = () => {
    return filterId || filterDate || filterService !== 'all' || filterClient ||
           filterProfessional !== 'all' ||
           filterStatus !== 'all' || filterTimeStart || filterTimeEnd;
  };

  const activeFilterCount = [
    filterId,
    filterDate,
    filterService !== 'all',
    filterClient,
    filterProfessional !== 'all',
    filterStatus !== 'all',
    filterTimeStart,
    filterTimeEnd,
  ].filter(Boolean).length;

  const buildQuery = () => {
    return {
      page,
      limit,
      ...(filterId && { id: filterId }),
      ...(filterDate && { date: filterDate }),
      ...(filterService !== 'all' && { service: filterService }),
      ...(filterClient && { client: filterClient }),
      ...(filterProfessional !== 'all' && { employeeId: filterProfessional }),
      ...(filterStatus !== 'all' && { status: filterStatus }),
      ...(filterTimeStart && { timeStart: filterTimeStart }),
      ...(filterTimeEnd && { timeEnd: filterTimeEnd }),      
    }
  }

  const fetchAllAppointmentsForExport = async () => {
    const companyId = localStorage.getItem('companyId');
    const response = (
      await api.get(`/companies/${companyId}/appointments/export`, {
        params: {
          ...(filterId && { id: filterId }),
          ...(filterDate && { date: filterDate }),
          ...(filterService !== 'all' && { service: filterService }),
          ...(filterClient && { client: filterClient }),
          ...(filterProfessional !== 'all' && { employeeId: filterProfessional }),
          ...(filterStatus !== 'all' && { status: filterStatus }),
          ...(filterTimeStart && { timeStart: filterTimeStart }),
          ...(filterTimeEnd && { timeEnd: filterTimeEnd }),
        },
      })
    ).data.data;

    return response || [];
  };

  const exportCSV = async () => {
    const headers = ["ID", "Data", "Horário", "Cliente", "Serviço", "Profissional", "Status", "Valor"];
    const allAppointments = await fetchAllAppointmentsForExport();

    const rows = allAppointments.map((a) => [
      a.id,
      formatDate(a.start_time),
      formatTime(a.start_time),
      a.client?.name,
      a.service?.name,
      a.employee?.name,
      a.status,
      a.service?.price,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "agendamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Agendamentos exportados em CSV com sucesso!")
  };

  const exportExcel = async () => {
    const allAppointments = await fetchAllAppointmentsForExport();
    const dataToExport = allAppointments.map((a) => ({
      ID: a.id,
      cliente: a.client.name,
      servico: a.service.name,
      funcionario: a.employee.name,
      status: a.status,
      data: formatDate(a.start_time),
      horario: formatTime(a.start_time),
      preco: a.service.price,
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agendamentos")

    XLSX.writeFile(workbook, "agendamentos.xlsx")
    toast.success("Agendamentos exportados em Excel com sucesso!")
  }

  const exportJson = async () => {
    const allAppointments = await fetchAllAppointmentsForExport();
    const dataToExport = allAppointments.map((a) => ({
      id: a.id,
      cliente: a.client.name,
      servico: a.service.name,
      funcionario: a.employee.name,
      status: a.status,
      data: formatDate(a.start_time),
      horario: formatTime(a.start_time),
      preco: a.service.price,
    }))

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "agendamentos.json"
    a.click()

    URL.revokeObjectURL(url)
    toast.success("Agendamentos exportados em JSON com sucesso!")
  }

  const exportData = async (type) => {
    try {
      switch (type) {
        case 'csv':
          await exportCSV();
          break;
        case 'excel':
          await exportExcel();
          break;
        case 'json':
          await exportJson();
          break;
        default:
          toast.error("Erro no formato de exportação.")
          break;
      }
    } catch (error) {
      showRequestErrorToast(error, 'Não foi possível exportar os agendamentos.');
    }
  };

  useEffect(() => {
    if (!dados) return;

    if (!hasBootstrappedRef.current) {
      setDataState(dados.appointments?.data || [])
      setPage(Number(dados.appointments?.page) || 1)
      setTotal(dados.appointments?.total || 0)
      setTotalPages(dados.appointments?.totalPages || 1)
      hasBootstrappedRef.current = true
    }

    setProfessionals(dados.professionals || [])
    setServices(dados.services || [])
    setInitialized(true)
  }, [dados])

  useEffect(() => {
    if (!initialized || !hasBootstrappedRef.current) return

    fetchData()
  }, [dados])

  useEffect(() => {
    if (!initialized) return

    fetchData()
  }, [initialized, page, filterId, filterDate, filterService, filterClient, filterProfessional, filterStatus, filterTimeStart, filterTimeEnd])

  useEffect(() => {
    if (!existingClientPopoverOpen) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!existingClientDropdownRef.current) return;
      if (existingClientDropdownRef.current.contains(event.target as Node)) return;

      setExistingClientPopoverOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDownOutside);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
    };
  }, [existingClientPopoverOpen]);

  useEffect(() => {
    if (!formData.appointment_time) return;
    if (isSelectedTimeAvailable()) return;

    setFormData((prev) => ({
      ...prev,
      appointment_time: '',
    }));
  }, [formData.employee_id, formData.appointment_date, formData.service_id]);

  useEffect(() => {
    if (!formData.service_id || !formData.employee_id) return;

    const selectedProfessionalStillAvailable = availableProfessionals.some(
      (professional) => String(professional.id) === String(formData.employee_id),
    );

    if (!selectedProfessionalStillAvailable) {
      setFormData((prev) => ({
        ...prev,
        employee_id: '',
        appointment_time: '',
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
        service_id: '',
        appointment_time: '',
      }));
    }
  }, [formData.employee_id, formData.service_id]);

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');

    if (!companyId || !formData.employee_id || !formData.appointment_date) {
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
              date: formData.appointment_date,
              employeeId: formData.employee_id,
              ...(editingAppointment?.id && { excludeId: editingAppointment.id }),
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
  }, [formData.employee_id, formData.appointment_date, editingAppointment?.id]);

  if (data === null) return <LoadingPage />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 scrollbar-custom">
        <div className="flex items-center justify-end gap-3 flex-shrink-0">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 border border-border ${showFilters ? 'bg-primary hover:bg-primary/70 text-popover' : 'bg-default text-foreground hover:bg-primary hover:text-popover'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
            {hasActiveFilters() && (
              <Badge className="ml-2 bg-destructive text-popover hover:bg-destructive">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Popover open={exportOpen} onOpenChange={setExportOpen}>
            <PopoverTrigger asChild>
              <Button className={`p-4 border border-border bg-default text-foreground hover:bg-primary hover:text-popover`}>
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Exportar</span>
                {exportOpen ? (
                  <ChevronUp className="hidden h-4 w-4 md:inline" />
                ) : (
                  <ChevronDown className="hidden h-4 w-4 md:inline" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent side="bottom" align="end" className="w-52 p-2">
              <div className="flex flex-col gap-1">
                <Button className={`p-4 justify-start bg-default text-foreground hover:bg-primary hover:text-popover`} onClick={() => exportData('csv')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>

                <Button className={`p-4 justify-start bg-default text-foreground hover:bg-primary hover:text-popover`} onClick={() => exportData('excel')}>
                  <Table2 className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>

                <Button className={`p-4 justify-start bg-default text-foreground hover:bg-primary hover:text-popover`} onClick={() => exportData('json')}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/70 text-popover">
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Novo Agendamento</span>
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {showFilters && (
            <Card className="w-full shrink-0 gap-0 p-5 lg:flex lg:h-full lg:max-w-[320px] lg:flex-col">
              <div className="relative border-b border-border pb-4">
                <Badge
                  variant="outline"
                  className="absolute top-0 right-0 bg-muted text-muted-foreground"
                >
                  {activeFilterCount} ativo{activeFilterCount === 1 ? '' : 's'}
                </Badge>

                <div className="space-y-1 pr-24">
                  <h3 className="font-semibold leading-none">Filtros Avançados</h3>
                  <p className="text-sm text-muted-foreground">
                    Refine a listagem por período, cliente, serviço e status.
                  </p>
                </div>

                <Button
                  className="mx-auto mt-4 flex border border-border bg-default px-3 text-foreground hover:bg-primary hover:text-popover"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                <div className="space-y-2">
                  <Label htmlFor="appointment-filter-id">ID do Agendamento</Label>
                  <Input
                    id="appointment-filter-id"
                    placeholder="Buscar por ID"
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data</Label>
                  <CalendarDatePicker
                    value={filterDate ? new Date(`${filterDate}T12:00:00`) : undefined}
                    onChange={(date) => {
                      if (!date) return setFilterDate("")

                      setFilterDate(toLocalDateInput(date))
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intervalo de Horário</Label>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
                      <DatePicker
                        selected={timeToDate(filterTimeStart)}
                        onChange={(date) => setFilterTimeStart(dateToTime(date))}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="HH:mm"
                        locale={ptBR}
                        placeholderText="Início"
                        isClearable
                        minTime={new Date(2000, 0, 1, 0, 0, 0)}
                        maxTime={timeToDate(filterTimeEnd) || new Date(2000, 0, 1, 23, 59, 0)}
                        popperClassName="z-50"
                        className="h-8 w-full min-w-0 rounded-lg border border-input bg-gray-200/50 px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground hover:bg-gray-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>
                    <div className="min-w-0 flex-1 [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
                      <DatePicker
                        selected={timeToDate(filterTimeEnd)}
                        onChange={(date) => setFilterTimeEnd(dateToTime(date))}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="HH:mm"
                        locale={ptBR}
                        placeholderText="Fim"
                        isClearable
                        minTime={timeToDate(filterTimeStart) || new Date(2000, 0, 1, 0, 0, 0)}
                        maxTime={new Date(2000, 0, 1, 23, 59, 0)}
                        popperClassName="z-50"
                        className="h-8 w-full min-w-0 rounded-lg border border-input bg-gray-200/50 px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground hover:bg-gray-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-filter-client">Nome do Cliente</Label>
                  <Input
                    id="appointment-filter-client"
                    placeholder="Buscar por nome..."
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Serviço</Label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      <SelectItem value="all">Todos os Serviços</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      <SelectItem value="all">Todos os Profissionais</SelectItem>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={String(professional.id)}>
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      <SelectItem value="all">Todos os Status</SelectItem>
                      {statusList.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </Card>
          )}

          <Card className="flex-1 gap-0 overflow-hidden py-0">
            <div className="h-[700px] overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-muted [&_tr]:border-b">
                  <tr className="border-b transition-colors">
                    <th className="h-10 w-[100px] px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">ID</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Data</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Horário</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Cliente</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Serviço</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Profissional</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Status</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Valor</th>
                    <th className="h-10 px-2 ps-3 text-left align-middle font-semibold whitespace-nowrap text-foreground">Ações</th>
                  </tr>
                </thead>

                <tbody className="[&_tr:last-child]:border-0">
                  {data.length === 0 ? (
                    <tr className="border-b transition-colors">
                      <td colSpan={9} className="w-32 p-2 align-middle whitespace-nowrap text-center py-16">
                        <div className="w-full h-96 flex flex-col justify-center items-center gap-2 text-muted-foreground">
                          <Calendar className="w-12 h-12 opacity-20" />
                          <p className="font-medium">
                            {hasActiveFilters() 
                              ? 'Nenhum agendamento encontrado com os filtros aplicados.' 
                              : 'Nenhum agendamento cadastrado.'}
                          </p>
                          {hasActiveFilters() && (
                            <Button variant="link" onClick={clearFilters} className="text-primary">
                              Limpar filtros
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((appointment) => (
                      <tr key={appointment.id} className="border-b transition-colors hover:bg-muted/30">
                        <td className="w-[100px] p-2 align-middle whitespace-nowrap font-mono text-sm font-semibold text-primary">
                          {appointment.id}
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(appointment.start_time)}</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{formatTime(appointment.start_time)}</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{appointment.client.name}</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <span className="text-muted-foreground">{appointment.service.name}</span>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <span className="text-sm">{appointment.employee.name}</span>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">{getStatusBadge(appointment.status)}</td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <DollarSign className="w-4 h-4 text-primary" />
                            {formatPrice(appointment.service.price, false)}
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button  
                                    size="sm"
                                    onClick={() => openEditDialog(appointment)}
                                    className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-blue-500/10 hover:text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" sideOffset={4} className="bg-blue-500 fill-blue-500">
                                Editar
                              </TooltipContent>
                            </Tooltip>
                            
                            <Popover>
                              <Tooltip disableHoverableContent>
                                <TooltipTrigger asChild>
                                  <div>
                                    <PopoverTrigger asChild>
                                      <Button  
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </PopoverTrigger>
                                  </div>
                                </TooltipTrigger>

                                <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                                  Excluir
                                </TooltipContent>
                              </Tooltip>

                              <PopoverContent side="left">
                                <p className="text-sm mb-2">Tem certeza que deseja excluir este agendamento?</p>

                                <div className="flex justify-end gap-2">
                                  <PopoverClose asChild>
                                    <Button size="sm" className="text-sm bg-transparent text-foreground hover:bg-transparent hover:text-destructive">
                                      Cancelar
                                    </Button>
                                  </PopoverClose>

                                  <Button
                                    size="sm"
                                    className="text-sm bg-destructive text-white hover:bg-destructive/60"
                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                  >
                                    Confirmar
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination or Summary */}
            {data.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">
                      Mostrando{' '}
                      <span className="font-medium text-foreground">
                        {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium text-foreground">
                        {total}
                      </span>{' '}
                      agendamentos
                    </span>
                    <span className="sm:hidden">
                      <span className="font-medium text-foreground">
                        {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
                      </span>{' '}
                      /{' '}
                      <span className="font-medium text-foreground">{total}</span>{' '}
                      agendamentos
                    </span>
                  </p>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="px-1 text-sm sm:px-3">
                    <Input 
                      type="number" 
                      min="1" 
                      max={totalPages} 
                      value={page} 
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value <= 0) setPage(1)
                        else if (value > totalPages) setPage(totalPages)
                        else setPage(Number(e.target.value ))
                      }}
                      className='w-fit'
                    /> / {totalPages}
                    </span>

                    <Button
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(Number(page) - 1)}
                    >
                      <span className="sm:hidden">‹</span>
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <Button
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(Number(page) + 1)}
                    >
                      <span className="sm:hidden">›</span>
                      <span className="hidden sm:inline">Próximo</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
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
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingAppointment
                ? 'Atualize os dados do agendamento.'
                : 'Preencha as informações para criar um novo agendamento.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            {!editingAppointment && (
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
                    variant={clientMode === 'new' ? 'default' : 'secondary'}
                    className="justify-center"
                    onClick={() => {
                      setClientMode('new');
                      setFormData((prev) => ({
                        ...prev,
                        client_id: '',
                        client_name: '',
                        client_email: '',
                        client_contact: '',
                      }));
                    }}
                  >
                    Novo cliente
                  </Button>
                  <Button
                    type="button"
                    variant={clientMode === 'existing' ? 'default' : 'secondary'}
                    className="justify-center"
                    onClick={() => {
                      setClientMode('existing');
                      setFormData((prev) => ({
                        ...prev,
                        client_id: '',
                        client_name: '',
                        client_email: '',
                        client_contact: '',
                      }));
                    }}
                  >
                    Cliente existente
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Dados do cliente</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Preencha as informações de contato para identificar o agendamento.
                </p>
              </div>

              {!editingAppointment && clientMode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="appointment-existing-client">Cliente</Label>
                  <div className="relative" ref={existingClientDropdownRef}>
                    <Button
                      type="button"
                      id="appointment-existing-client"
                      aria-expanded={existingClientPopoverOpen}
                      aria-haspopup="listbox"
                      onClick={() => setExistingClientPopoverOpen((current) => !current)}
                      className="h-10 w-full justify-between border border-input bg-muted px-3 font-normal text-foreground hover:bg-muted"
                    >
                      <span className="truncate text-left">
                        {selectedExistingCustomer
                          ? `${selectedExistingCustomer.name} - ${formatPhone(selectedExistingCustomer.phone ?? selectedExistingCustomer.contact ?? '')}`
                          : 'Selecione um cliente'}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>

                    {existingClientPopoverOpen && (
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
                                        {formatPhone(customer.phone ?? customer.contact ?? '')}
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
                    <Label htmlFor="appointment-client-name">Nome do cliente</Label>
                    <Input
                      id="appointment-client-name"
                      placeholder="Nome do cliente"
                      value={formData.client_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointment-client-email">E-mail do cliente</Label>
                    <Input
                      id="appointment-client-email"
                      type="email"
                      placeholder="cliente@email.com"
                      value={formData.client_email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, client_email: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointment-client-phone">Telefone do cliente</Label>
                    <Input
                      id="appointment-client-phone"
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
                  Selecione serviço, profissional, data, horário e status.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointment-service">Serviço</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, service_id: value }))
                    }
                  >
                    <SelectTrigger id="appointment-service">
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
                  <Label htmlFor="appointment-professional">Profissional</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, employee_id: value }))
                    }
                  >
                    <SelectTrigger id="appointment-professional">
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
                  <Label htmlFor="appointment-date">Data</Label>
                  <CalendarDatePicker
                    value={formData.appointment_date ? new Date(`${formData.appointment_date}T12:00:00`) : undefined}
                    onChange={(date) =>
                      setFormData((prev) => {
                        const nextDate = date ? toLocalDateInput(date) : '';
                        const isPast = !!nextDate && nextDate < getTodayDateKey();
                        const isToday = nextDate === getTodayDateKey();
                        const selectedTime = prev.appointment_time ? timeToDate(prev.appointment_time) : null;
                        const shouldResetTime =
                          !editingAppointment &&
                          selectedTime !== null &&
                          (isPast || (isToday && selectedTime < getAppointmentMinTime()));

                        return {
                          ...prev,
                          appointment_date: nextDate,
                          appointment_time: shouldResetTime ? '' : prev.appointment_time,
                        };
                      })
                    }
                  />
                  {isPastAppointmentDate && (
                    <p className="text-xs text-destructive">
                      Esse profissional não possui horário disponível nessa data para a duração do serviço.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="appointment-time">Horário</Label>
                    {formData.employee_id && formData.appointment_date && formData.service_id && !isPastAppointmentDate && hasProfessionalAvailability() && (
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
                      (!editingAppointment && isPastAppointmentDate) ||
                      !formData.employee_id ||
                      !formData.appointment_date ||
                      !formData.service_id ||
                      !hasProfessionalAvailability()
                    }
                  >
                    <SelectTrigger id="appointment-time">
                      <SelectValue
                        placeholder={
                          !formData.service_id
                            ? 'Selecione um serviço'
                            : !formData.employee_id
                              ? 'Selecione um profissional'
                              : !formData.appointment_date
                                ? 'Selecione uma data'
                                : hasProfessionalAvailability()
                                  ? 'Selecione um horário'
                                  : 'Sem horários disponíveis'
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
                  {formData.employee_id && formData.appointment_date && formData.service_id && !hasProfessionalAvailability() && (
                    <p className="text-xs text-destructive">
                      Esse profissional não possui horário disponível nessa data para a duração do serviço.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="appointment-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger id="appointment-status">
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
              onClick={handleSubmitAppointment}
              disabled={
                (editingAppointment || clientMode === 'new'
                  ? (!formData.client_name || !formData.client_contact)
                  : !formData.client_id) ||
                !formData.employee_id ||
                !formData.service_id ||
                !formData.appointment_date ||
                !formData.appointment_time ||
                isAppointmentDateTimeInvalid()
              }
            >
              {editingAppointment ? 'Salvar alterações' : 'Criar agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RevenueTransactionDialog
        companyId={localStorage.getItem('companyId') ?? ''}
        open={isRevenueDialogOpen}
        onOpenChange={(open) => {
          setIsRevenueDialogOpen(open);
          if (!open) {
            setPendingRevenueAppointment(null);
          }
        }}
        appointmentContext={pendingRevenueAppointment}
        onCreated={async () => {
          await Promise.all([fetchData(), refreshDados()]);
        }}
      />
    </div>
  );
}
