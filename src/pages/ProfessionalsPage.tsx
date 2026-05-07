import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/PageHeader';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Plus, Edit, Trash2, User, Upload, Search, UserX, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { LoadingPage } from './LoadingPage';
import { getTimePartsInTimeZone } from '@/lib/parsers';

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
  const { dados, refreshDados } = useOutletContext();
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

  if (data === null) return <LoadingPage />

  const filteredProfessionals = data.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Profissionais"
        subtitle="Gerencie os profissionais do seu negócio"
      />

      {/* Content */}
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

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar profissional
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[1400px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Profissional</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          {/* <Label
                            htmlFor="photo-upload"
                            className="cursor-pointer block"
                          >
                            TODO IMPLEMENTAR FUTURAMENTE
                            <div className="w-48 h-64 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                              {formData.photo ? (
                                <img
                                  src={formData.photo}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-12 h-12 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Clique para carregar foto</span>
                                </div>
                              )}
                            </div>
                          </Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          /> */}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                              id="name"
                              placeholder="Ex: João Silva"
                              value={formData.name}
                              onChange={e =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="joao@exemplo.com"
                              value={formData.email}
                              onChange={e =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor="edit-specialty">Serviços</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button className='bg-gray-200/50 hover:bg-gray-200 text-muted-foreground w-full justify-start'>
                                  {formData.services.length <= 0 ? 'Selecionar serviços' : `Serviços selecionados: ${formData.services.length}`} 
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent className="w-64" side='bottom' align='start'>
                                <div className="flex flex-col gap-0">
                                  {services.map((service) => (
                                    <label key={service.id} className="flex items-center gap-2 group hover:bg-primary p-2 rounded-sm">
                                      <Checkbox
                                        checked={formData.services.includes(service.id)}
                                        onCheckedChange={() => toggle(service.id)}
                                      />
                                      <span className='text-foreground group-hover:text-white'>{service.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              placeholder="(00) 00000-0000"
                              value={formData.phone}
                              onChange={e =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>


                      <div className="space-y-3 w-fit">
                        <h3 className="font-semibold text-lg">Agenda</h3>
                        <div className="border border-border rounded-lg overflow-hidden">
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
                                    <div className="flex items-center gap-2">
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

                                        className="w-20 p-1 border border-primary rounded-md"
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

                                        className="w-20 p-1 border border-primary rounded-md"
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="secondary"
                        className='hover:bg-destructive'
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
                      <TableCell>{professional.phone}</TableCell>
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
                            <DialogContent className="sm:max-w-[1400px]">
                              <DialogHeader>
                                <DialogTitle>Editar Profissional</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-6 py-4">

                                <div className="flex gap-6">
      
                                  <div className="flex-shrink-0">
                                    {/* TODO IMPLEMENTAR FUTURAMENTE */}
                                    {/* <Label
                                      htmlFor="edit-photo-upload"
                                      className="cursor-pointer block"
                                    >
                                      <div className="w-48 h-64 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                                        {formData.photo ? (
                                          <img
                                            src={formData.photo}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-12 h-12 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Clique para carregar foto</span>
                                          </div>
                                        )}
                                      </div>
                                    </Label>
                                    <Input
                                      id="edit-photo-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={handlePhotoUpload}
                                      className="hidden"
                                    /> */}
                                  </div>

                                  <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Nome completo</Label>
                                      <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={e =>
                                          setFormData({
                                            ...formData,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">E-mail</Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        value={formData.email}
                                        onChange={e =>
                                          setFormData({
                                            ...formData,
                                            email: e.target.value,
                                          })
                                        }
                                      />
                                    </div>


                                    <div className='space-y-2'>
                                      <Label htmlFor="edit-specialty">Serviços</Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button className='bg-gray-200/50 hover:bg-gray-200 text-muted-foreground w-full justify-start'>
                                            {formData.services.length <= 0 ? 'Selecionar serviços' : `Serviços selecionados: ${formData.services.length}`} 
                                          </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-64" side='bottom' align='start'>
                                          <div className="flex flex-col gap-0">
                                            {services.map((service) => (
                                              <label key={service.id} className="flex items-center gap-2 group hover:bg-primary p-2 rounded-sm">
                                                <Checkbox
                                                  checked={formData.services.includes(service.id)}
                                                  onCheckedChange={() => toggle(service.id)}
                                                />
                                                <span className='text-foreground group-hover:text-white'>{service.name}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-phone">Telefone</Label>
                                      <Input
                                        id="edit-phone"
                                        value={formData.phone}
                                        onChange={e =>
                                          setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3 w-fit">
                                  <h3 className="font-semibold text-lg">Agenda</h3>
                                  <div className="border border-border rounded-lg overflow-hidden">
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
                                              <div className="flex items-center gap-2">
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

                                                  className="w-20 p-1 border border-primary rounded-md"
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

                                                  className="w-20 p-1 border border-primary rounded-md"
                                                />
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="secondary"
                                  className='hover:bg-destructive'
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
