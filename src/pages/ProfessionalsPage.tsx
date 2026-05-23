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
      <div className="h-full rounded-2xl border border-border bg-card p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Informações do profissional</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Preencha os dados principais e vincule os serviços atendidos por esse profissional.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="professional-name">Nome completo</Label>
            <Input
              id="professional-name"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-services">Serviços</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="professional-services"
                  className={`w-full justify-start border border-input ${
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
            <Label htmlFor="professional-email">E-mail</Label>
            <Input
              id="professional-email"
              type="email"
              placeholder="joao@exemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-phone">Telefone</Label>
            <Input
              id="professional-phone"
              type="tel"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              value={formatPhone(formData.phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalScheduleForm = () => (
    <div className="h-full rounded-2xl border border-border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Agenda</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Defina os horários disponíveis por dia da semana.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[140px]">Dia</TableHead>
              <TableHead>Horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weekDays.map(day => (
              <TableRow key={day.id}>
                <TableCell className="font-medium">
                  {day.label}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
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
                      className="w-20 rounded-md border border-primary p-1"
                    />
                    <span className="text-xs text-muted-foreground">até</span>
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
                      className="w-20 rounded-md border border-primary p-1"
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
        <Card className="overflow-hidden m-6 gap-0">
          <div className="py-3 px-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Profissionais</h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} profissionais cadastrados
                </p>
              </div>

              <div className='flex gap-3 items-center'>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar profissionais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar profissional
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[960px]">
                    <DialogHeader>
                      <DialogTitle className="px-6 pt-6">Novo Profissional</DialogTitle>
                      <DialogDescription className="px-6">
                        Cadastre os dados do profissional e configure sua agenda de atendimento.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid max-h-[calc(90vh-140px)] gap-4 overflow-y-auto px-6 pb-6 md:auto-rows-fr md:grid-cols-2 md:items-stretch">
                      {renderProfessionalDetailsForm()}
                      {renderProfessionalScheduleForm()}
                    </div>

                    <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-6 py-4 sm:justify-end">
                      <Button
                        className='bg-transparent text-foreground hover:bg-destructive hover:text-white'
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/90"
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

          <div>
            <Table className="w-full">
              <TableHeader className="table table-fixed z-10">
                <TableRow className="table w-full table-fixed bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-foreground">Telefone</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <div className="h-[600px] flex-1 flex overflow-y-auto">
                <TableBody className="block overflow-y-auto">
                  {filteredProfessionals.length === 0 ? (
                    <TableRow className='table table-fixed w-full h-full'>
                      <TableCell colSpan={18} className="w-32 text-center py-16">
                        <div className="w-full h-96 flex flex-col justify-center items-center gap-2 text-muted-foreground">
                          <UserX className="w-12 h-12 opacity-20" />
                          <p className="font-medium">Nenhum funcionário encontrado.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (filteredProfessionals.map((professional) => (
                    <TableRow key={professional.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{professional.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{professional.email}</TableCell>
                      <TableCell>{formatPhone(professional.phone)}</TableCell>
                      <TableCell>
                        {getStatusBadge(professional.status)}
                      </TableCell>
                      <TableCell>
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
                            <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[960px]">
                              <DialogHeader>
                                <DialogTitle className="px-6 pt-6">Editar Profissional</DialogTitle>
                                <DialogDescription className="px-6">
                                  Atualize os dados do profissional e ajuste sua agenda de atendimento.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid max-h-[calc(90vh-140px)] gap-4 overflow-y-auto px-6 pb-6 md:auto-rows-fr md:grid-cols-2 md:items-stretch">
                                {renderProfessionalDetailsForm()}
                                {renderProfessionalScheduleForm()}
                              </div>

                              <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-6 py-4 sm:justify-end">
                                <Button
                                  className='bg-transparent text-foreground hover:bg-destructive hover:text-white'
                                  onClick={() => {
                                    setEditingProfessional(null);
                                    resetForm();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  className="bg-primary hover:bg-primary/90"
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

                            <PopoverContent side="left">
                              <p className="text-sm mb-2">Tem certeza que deseja excluir este serviço?</p>

                              <div className="flex justify-end gap-2">
                                <PopoverClose asChild>
                                  <Button size="sm" className="text-sm bg-transparent text-foreground hover:bg-transparent hover:text-destructive">Cancelar</Button>
                                </PopoverClose>
                                
                                <Button
                                  size="sm"
                                  className="text-sm bg-destructive text-white hover:bg-destructive/60"
                                  onClick={() => handleDeleteProfessional(professional.id)}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </div>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
