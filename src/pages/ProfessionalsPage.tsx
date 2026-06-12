import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Plus, Edit, Trash2, User, Upload, Search, UserX, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { LoadingPage } from './LoadingPage';
import { formatPhone, getTimePartsInTimeZone } from '@/lib/parsers';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useLayoutOutletContext } from '@/hooks/useLayoutOutletContext';

interface WorkSchedule {
  [key: string]: {
    manha: { start: string; end: string };
    tarde: { start: string; end: string };
    noite: { start: string; end: string };
  };
}

interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  specialty: string;
  status: 'active' | 'inactive';
  schedule?: WorkSchedule;
}

const weekDays = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Segunda' },
  { id: 2, label: 'Terça' },
  { id: 3, label: 'Quarta' },
  { id: 4, label: 'Quinta' },
  { id: 5, label: 'Sexta' },
  { id: 6, label: 'Sábado' },
];

export function ProfessionalsPage() {
  const { dados, refreshDados } = useLayoutOutletContext();
  const [data, setDataState] = useState(null);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [formData, setFormData] = useState({
    company_id: localStorage.getItem('companyId'),
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER',
    services: [],
    scheduleOpenings: [],
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  usePageHeader("Profissionais", "Gerencie os profissionais do seu negócio" );


  useEffect(() => {
    if (!dados) return;

    fetchServices();
    setDataState(dados.professionals);
  }, [dados])

  const openEditDialog = (professional) => {
    setEditingProfessional(professional);
    setFormData({
      company_id: localStorage.getItem('companyId'),
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER',
      services: professional.services || [],
      scheduleOpenings: professional.scheduleOpenings || [],
      status: professional.status,
    });
  };

  const resetForm = () => {
    setFormData({
      company_id: localStorage.getItem('companyId'),
      name: '',
      email: '',
      phone: '',
      role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER',
      services: [],
      scheduleOpenings: [],
      status: 'ACTIVE',
    });
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    setFormData((prev) => ({
      ...prev,
      phone: digits,
    }));
  };

  const handleEditProfessional = async (id) => {
    if (!editingProfessional) return;

    await api.patch(`/professionals/${id}`, formData)
    
    toast.success('Funcionário editado com sucesso!')
    await Promise.all([fetchProfessionals(), refreshDados()]);
    setEditingProfessional(null);
    resetForm();
  };

  const handleDeleteProfessional = async (id) => {
    await api.delete(`/professionals/${id}`)

    const newData = (await api.get(`/companies/${localStorage.getItem('companyId')}/professionals`)).data.data
    await refreshDados();
    toast.success('Funcionário deletado com sucesso!');
    setDataState(newData);
  };

  const fetchServices = async () => {
    const services = (await api.get(`/companies/${localStorage.getItem('companyId')}/services`)).data.data

    setServices(services);
  }

  const fetchProfessionals = async () => {
    const professionals = (await api.get(`/companies/${localStorage.getItem('companyId')}/professionals`)).data.data

    setDataState(professionals);
  }

  const getStatusBadge = (service) => {
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:cursor-default' },
      disabled: { label: 'Inativo', className: 'bg-gray-400/10 text-gray-500 border border-gray-400/20 hover:bg-gray-400/20 hover:cursor-default' },
    };
  
    const config = statusConfig[service.toLowerCase()];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const toggle = (id) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }))
  }
  
  const getOpening = (day) => {
    return formData.scheduleOpenings.find(o => o.week_day === day)
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const normalizeTime = (value?: string | Date | null) => {
    if (!value) return '';

    if (value instanceof Date) {
      return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
    }

    if (value.includes('T')) {
      const { hours, minutes } = getTimePartsInTimeZone(value);
      return `${pad(hours)}:${pad(minutes)}`;
    }

    if (value.length >= 5) return value.slice(0, 5);

    return value;
  };

  const timeToDate = (time?: string) => {
    if (!time) return null;

    const [h, m] = time.split(':').map(Number);
    return new Date(2000, 0, 1, h, m, 0, 0);
  };

  const dateToTime = (date: Date | null) => {
    if (!date) return '';
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatTime = normalizeTime;

  // TODO IMPLEMENTAR FUTURAMENTE
  // const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormData({ ...formData, photo: reader.result as string });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleScheduleChange = (
    day: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setFormData(prev => {
      const exists = prev.scheduleOpenings.find(o => o.week_day === day);

      const updated = exists
        ? prev.scheduleOpenings.map(o =>
            o.week_day === day
              ? { ...o, [field]: value }
              : o
          )
        : [
            ...prev.scheduleOpenings,
            {
              week_day: day,
              start_time: field === 'start_time' ? value : '08:00',
              end_time: field === 'end_time' ? value : '12:00',
            },
          ];

      return {
        ...prev,
        scheduleOpenings: updated,
      };
    });
  };

  const handleAddProfessional = async () => {
    const response = (await api.post('/professionals', formData)).data.data

    toast.success('Funcionário adicionado com sucesso')
    await Promise.all([fetchProfessionals(), refreshDados()]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const renderProfessionalDetailsForm = () => (
    <div className="h-full">
      <div className="h-full rounded-2xl border border-border bg-card p-2.5 sm:p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">Informações do profissional</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Preencha os dados principais e vincule os serviços atendidos por esse profissional.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="professional-name" className="text-[11px] sm:text-sm">Nome completo</Label>
            <Input
              id="professional-name"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-8 text-[11px] sm:h-10 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-services" className="text-[11px] sm:text-sm">Serviços</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="professional-services"
                  className={`h-8 w-full justify-start border border-input px-2.5 text-[11px] sm:h-10 sm:px-3 sm:text-sm ${
                    formData.services.length > 0
                      ? 'bg-gray-200/50 text-black hover:bg-gray-200'
                      : 'bg-gray-200/50 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {formData.services.length <= 0
                    ? 'Selecionar serviços'
                    : `Serviços selecionados: ${formData.services.length}`}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-64" side="bottom" align="start">
                <div className="flex max-h-72 flex-col gap-0 overflow-y-auto">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="group flex items-center gap-2 rounded-sm p-2 hover:bg-primary"
                    >
                      <Checkbox
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => toggle(service.id)}
                      />
                      <span className="text-foreground group-hover:text-white">
                        {service.name}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-email" className="text-[11px] sm:text-sm">E-mail</Label>
            <Input
              id="professional-email"
              type="email"
              placeholder="joao@exemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="h-8 text-[11px] sm:h-10 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-phone" className="text-[11px] sm:text-sm">Telefone</Label>
            <Input
              id="professional-phone"
              type="tel"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              value={formatPhone(formData.phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-8 text-[11px] sm:h-10 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalScheduleForm = () => (
    <div className="h-full rounded-2xl border border-border bg-card p-2.5 sm:p-4">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-foreground sm:text-sm">Agenda</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Defina os horários disponíveis por dia da semana.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[108px] text-[11px] sm:w-[140px] sm:text-sm">Dia</TableHead>
              <TableHead>Horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weekDays.map(day => (
              <TableRow key={day.id}>
                <TableCell className="text-[11px] font-medium sm:text-sm">
                  {day.label}
                </TableCell>
                <TableCell>
                  <div className="flex min-w-[150px] items-center justify-end gap-1.5 sm:min-w-0 sm:gap-2">
                    <DatePicker
                      selected={timeToDate(formatTime(getOpening(day.id)?.start_time))}
                      onChange={(date) =>
                        handleScheduleChange(day.id, 'start_time', dateToTime(date))
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      dateFormat="HH:mm"
                      locale={ptBR}
                      placeholderText="HH:mm"
                      isClearable
                      minTime={new Date(2000, 0, 1, 6, 0, 0)}
                      maxTime={
                        timeToDate(formatTime(getOpening(day.id)?.end_time)) ||
                        new Date(2000, 0, 1, 23, 59, 0)
                      }
                      className="w-16 rounded-md border border-primary p-1 text-[11px] sm:w-20 sm:text-sm"
                    />
                    <span className="text-[11px] text-muted-foreground sm:text-xs">até</span>
                    <DatePicker
                      selected={timeToDate(formatTime(getOpening(day.id)?.end_time))}
                      onChange={(date) =>
                        handleScheduleChange(day.id, 'end_time', dateToTime(date))
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      dateFormat="HH:mm"
                      locale={ptBR}
                      placeholderText="HH:mm"
                      isClearable
                      minTime={
                        timeToDate(formatTime(getOpening(day.id)?.start_time)) ||
                        new Date(2000, 0, 1, 0, 0, 0)
                      }
                      maxTime={new Date(2000, 0, 1, 23, 59, 0)}
                      className="w-16 rounded-md border border-primary p-1 text-[11px] sm:w-20 sm:text-sm"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (data === null) return <LoadingPage />

  const filteredProfessionals = data.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {/* Professionals Table */}
        <Card className="m-4 gap-0 overflow-hidden sm:m-6">
          <div className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Profissionais</h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} profissionais cadastrados
                </p>
              </div>

              <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
                <div className="relative min-w-0 flex-1 sm:max-w-64 md:max-w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar profissionais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-10 text-xs sm:h-10 sm:text-sm"
                  />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary px-3 hover:bg-primary/90 sm:px-4">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cadastrar profissional</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-[960px]">
                    <DialogHeader className="border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                      <DialogTitle className="text-lg sm:text-xl">Novo Profissional</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Cadastre os dados do profissional e configure sua agenda de atendimento.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:auto-rows-fr lg:grid-cols-2 lg:items-stretch scrollbar-custom">
                      {renderProfessionalDetailsForm()}
                      {renderProfessionalScheduleForm()}
                    </div>

                    <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
                      <Button
                        className='h-9 text-xs bg-transparent text-foreground hover:bg-destructive hover:text-white sm:h-10 sm:text-sm'
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="h-9 text-xs bg-primary hover:bg-primary/90 sm:h-10 sm:text-sm"
                        onClick={handleAddProfessional}
                        disabled={!formData.name || !formData.email || !formData.phone}
                      >
                        Adicionar Profissional
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="h-[600px] overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-muted [&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Nome</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Email</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Telefone</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Status</th>
                  <th className="h-10 px-2 ps-3 text-left align-middle font-semibold whitespace-nowrap text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredProfessionals.length === 0 ? (
                  <tr className="border-b transition-colors">
                    <td colSpan={5} className="w-32 p-2 py-16 text-center align-middle whitespace-nowrap">
                      <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <UserX className="h-12 w-12 opacity-20" />
                        <p className="font-medium">Nenhum funcionário encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (filteredProfessionals.map((professional) => (
                  <tr key={professional.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="py-3 p-2 align-middle whitespace-nowrap font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{professional.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">{professional.email}</td>
                      <td className="p-2 align-middle whitespace-nowrap">{formatPhone(professional.phone)}</td>
                      <td className="p-2 align-middle whitespace-nowrap">
                        {getStatusBadge(professional.status)}
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">
                        <div className="flex gap-2">
                          <Dialog 
                            open={editingProfessional?.id === professional.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingProfessional(null);
                                resetForm();
                              }
                            }}
                          >
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => openEditDialog(professional)}
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-blue-500/10 hover:text-blue-600"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={4} className="bg-blue-500 fill-blue-500">
                                Editar
                              </TooltipContent>
                            </Tooltip>
                            <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-[960px]">
                              <DialogHeader className="border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                                <DialogTitle className="text-lg sm:text-xl">Editar Profissional</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  Atualize os dados do profissional e ajuste sua agenda de atendimento.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:auto-rows-fr lg:grid-cols-2 lg:items-stretch scrollbar-custom">
                                {renderProfessionalDetailsForm()}
                                {renderProfessionalScheduleForm()}
                              </div>

                              <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
                                <Button
                                  className='h-9 text-xs bg-transparent text-foreground hover:bg-destructive hover:text-white sm:h-10 sm:text-sm'
                                  onClick={() => {
                                    setEditingProfessional(null);
                                    resetForm();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  className="h-9 text-xs bg-primary hover:bg-primary/90 sm:h-10 sm:text-sm"
                                  onClick={() => handleEditProfessional(professional.id)}
                                >
                                  Salvar Alterações
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Popover>
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
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

                            <PopoverContent side="left" className="w-64 p-3 sm:w-80 sm:p-4">
                              <p className="mb-2 text-xs sm:text-sm">Tem certeza que deseja excluir este profissional?</p>

                              <div className="flex justify-end gap-2">
                                <PopoverClose asChild>
                                  <Button size="sm" className="h-8 px-2 text-xs bg-transparent text-foreground hover:bg-transparent hover:text-destructive sm:h-9 sm:px-3 sm:text-sm">Cancelar</Button>
                                </PopoverClose>
                                
                                <Button
                                  size="sm"
                                  className="h-8 px-2 text-xs bg-destructive text-white hover:bg-destructive/60 sm:h-9 sm:px-3 sm:text-sm"
                                  onClick={() => handleDeleteProfessional(professional.id)}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
