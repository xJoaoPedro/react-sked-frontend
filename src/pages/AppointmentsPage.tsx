import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Filter, X, Calendar, Download, Eye, Edit, Trash2, Clock, User, DollarSign, FileText, Table2, ChevronDown, ChevronUp, FileJson, Plus, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker as CalendarDatePicker } from '@/components/ui/datepicker';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import * as XLSX from "xlsx";
import { toast } from "sonner"
import { api } from "@/lib/api";
import { formatDate, formatPhone, formatPrice, formatTime } from '@/lib/parsers';
import { LoadingPage } from './LoadingPage';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { usePageHeader } from '@/hooks/usePageHeader';
import { useLayoutOutletContext } from '@/hooks/useLayoutOutletContext';

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
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTimeStart, setFilterTimeStart] = useState('');
  const [filterTimeEnd, setFilterTimeEnd] = useState('');

  usePageHeader("Agendamentos", data ? `${data.length} de ${total} agendamentos` : "Gerencie os agendamentos em tempo real", );

  const fetchData = async () => {
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/appointments`, {params: buildQuery()})).data.data;

    setDataState(response.data);
    setPage(Number(response.page));
    setTotal(response.total);
    setTotalPages(response.totalPages);
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
    setEditingAppointment(appointment);
    setFormData({
      company_id: localStorage.getItem('companyId'),
      client_id: String(appointment.client?.id ?? ''),
      client_name: appointment.client?.name ?? '',
      client_email: appointment.client?.email ?? '',
      client_contact: appointment.client?.contact ?? '',
      employee_id: String(appointment.employee?.id ?? ''),
      service_id: String(appointment.service?.id ?? ''),
      appointment_date: toLocalDateInput(appointment.start_time),
      appointment_time: formatTime(appointment.start_time),
      status: appointment.status ?? 'PENDING',
    });
    setIsDialogOpen(true);
  };

  const handleClientPhoneChange = (value) => {
    const cleanedPhone = value.replace(/\D/g, "").slice(0, 11);

    setFormData((prev) => ({ ...prev, client_contact: cleanedPhone }));
  };

  const handleSubmitAppointment = async () => {
    try {
      let clientId = Number(formData.client_id);
      const startAt = buildStartAt();
      const clientPayload = {
        company_id: formData.company_id,
        name: formData.client_name,
        email: formData.client_email,
        phone: formData.client_contact,
      };

      if (editingAppointment && clientId) {
        await api.patch(`/customers/${clientId}`, clientPayload);
      } else {
        const createdCustomer = (await api.post('/customers', clientPayload)).data.data;
        clientId = createdCustomer.id;
      }

      setFormData((prev) => ({ ...prev, client_id: String(clientId) }));

      const payload = buildAppointmentPayload();
      payload.client_id = clientId;
      payload.start_time = startAt.toISOString();

      if (editingAppointment) {
        await api.patch(`/appointments/${editingAppointment.id}`, payload);
        toast.success('Agendamento alterado com sucesso!');
      } else {
        await api.post('/appointments', payload);
        toast.success('Agendamento criado com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
      await Promise.all([fetchData(), refreshDados()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Não foi possível salvar o agendamento.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Agendamento deletado com sucesso!');
      await Promise.all([fetchData(), refreshDados()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Não foi possível deletar o agendamento.');
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
    setFilterStatus('all');
    setFilterTimeStart('');
    setFilterTimeEnd('');
  };

  const hasActiveFilters = () => {
    return filterId || filterDate || filterService !== 'all' || filterClient || 
           filterStatus !== 'all' || filterTimeStart || filterTimeEnd;
  };

  const buildQuery = () => {
    return {
      page,
      limit,
      ...(filterId && { id: filterId }),
      ...(filterDate && { date: filterDate }),
      ...(filterService !== 'all' && { service: filterService }),
      ...(filterClient && { client: filterClient }),
      ...(filterStatus !== 'all' && { status: filterStatus }),
      ...(filterTimeStart && { timeStart: filterTimeStart }),
      ...(filterTimeEnd && { timeEnd: filterTimeEnd }),      
    }
  }

  const exportCSV = () => {
    const headers = ["ID", "Data", "Horário", "Cliente", "Serviço", "Profissional", "Status", "Valor"];

    const rows = data.map((a) => [
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

  const exportExcel = () => {
    const dataToExport = data.map((a) => ({
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

  const exportJson = () => {
    const dataToExport = data.map((a) => ({
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

  const exportData = (type) => {
    switch (type) {
      case 'csv':
        exportCSV();
        break;
      case 'excel':
        exportExcel();
        break;
      case 'json':
        exportJson();
        break;
      default:
        toast.error("Erro no formato de exportação.")
        break;
    }
  };

  useEffect(() => {
    if (!dados) return;

    setPage(Number(dados.appointments?.page) || 1)
    setTotal(dados.appointments?.total || 0)
    setProfessionals(dados.professionals || [])
    setServices(dados.services || [])
    setTotalPages(dados.appointments?.totalPages || 1)
    setInitialized(true)
  }, [dados])

  useEffect(() => {
    if (!initialized) return

    fetchData()
  }, [initialized, page, filterId, filterDate, filterService, filterClient, filterStatus, filterTimeStart, filterTimeEnd])

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
                {[filterId, filterDate, filterService !== 'all', filterClient, 
                  filterStatus !== 'all', filterTimeStart, filterTimeEnd]
                  .filter(Boolean).length}
              </Badge>
            )}
          </Button>

          <Popover open={exportOpen} onOpenChange={setExportOpen}>
            <PopoverTrigger asChild>
              <Button className={`p-4 border border-border bg-default text-foreground hover:bg-primary hover:text-popover`}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
                {exportOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
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
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="flex">
          {showFilters && (
            <Card className="p-6 mr-1">
              <h3 className="font-semibold">Filtros Avançados</h3>

              <Button className={`p-4 border border-border bg-default text-foreground hover:bg-primary hover:text-popover`} onClick={clearFilters} disabled={!hasActiveFilters()}>
                <X className="w-4 h-4 mr-2" />
                Limpar filtros
              </Button>             
              
              <div className="grid grid-cols-1 gap-6">
                {/* ID Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ID do Agendamento</label>
                  <Input
                    placeholder="Buscar por ID"
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                  />
                </div>

                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Data</label>
                  <CalendarDatePicker
                    value={filterDate ? new Date(`${filterDate}T12:00:00`) : undefined}
                    onChange={(date) => {
                      if (!date) return setFilterDate("")

                      setFilterDate(toLocalDateInput(date))
                    }}
                  />
                </div>

                {/* Service Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Serviço</label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Serviços</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Name Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome do Cliente</label>
                  <Input
                    placeholder="Buscar por nome..."
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
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

          <Card className="overflow-hidden py-0 flex-1 gap-0">
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
              <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Mostrando{' '}
                  <span className="font-medium text-foreground">
                    {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium text-foreground">
                    {total}
                  </span>{' '}
                  agendamentos
                </p>

                <div className="flex items-center gap-2">
                  <span className="px-3 text-sm">
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
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(Number(page) + 1)}
                  >
                    Próximo
                  </Button>
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
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment
                ? 'Atualize os dados do agendamento.'
                : 'Preencha as informações para criar um novo agendamento.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
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
                <SelectContent>
                  {professionals.map((professional) => (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-time">Horário</Label>
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
                dateFormat="HH:mm"
                locale={ptBR}
                placeholderText="HH:mm"
                isClearable
                disabled={!editingAppointment && isPastAppointmentDate}
                minTime={getAppointmentMinTime()}
                maxTime={new Date(2000, 0, 1, 23, 59, 0)}
                className="w-full rounded-md border border-primary px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-2 space-y-2">
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
              onClick={handleSubmitAppointment}
              disabled={
                !formData.client_name ||
                !formData.client_contact ||
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
    </div>
  );
}
