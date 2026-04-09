import { useState } from 'react';

import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Filter, X, Calendar, Download, Eye, Edit, Trash2, Clock, User, DollarSign, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  service: string;
  professional: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 'AGD-001',
    date: '2024-03-25',
    time: '09:00',
    clientName: 'Maria Silva',
    service: 'Corte de Cabelo',
    professional: 'João Barbeiro',
    status: 'confirmed',
    price: 'R$ 50,00',
  },
  {
    id: 'AGD-002',
    date: '2024-03-25',
    time: '10:30',
    clientName: 'João Santos',
    service: 'Massagem Relaxante',
    professional: 'Ana Terapeuta',
    status: 'confirmed',
    price: 'R$ 120,00',
  },
  {
    id: 'AGD-003',
    date: '2024-03-25',
    time: '11:00',
    clientName: 'Ana Paula',
    service: 'Manicure',
    professional: 'Carla Manicure',
    status: 'pending',
    price: 'R$ 40,00',
  },
  {
    id: 'AGD-004',
    date: '2024-03-24',
    time: '14:00',
    clientName: 'Carlos Oliveira',
    service: 'Consulta Odontológica',
    professional: 'Dr. Pedro',
    status: 'completed',
    price: 'R$ 200,00',
  },
  {
    id: 'AGD-005',
    date: '2024-03-26',
    time: '15:30',
    clientName: 'Beatriz Costa',
    service: 'Depilação',
    professional: 'Maria Estética',
    status: 'pending',
    price: 'R$ 80,00',
  },
  {
    id: 'AGD-006',
    date: '2024-03-26',
    time: '16:00',
    clientName: 'Rafael Mendes',
    service: 'Barba',
    professional: 'João Barbeiro',
    status: 'cancelled',
    price: 'R$ 30,00',
  },
  {
    id: 'AGD-007',
    date: '2024-03-27',
    time: '09:30',
    clientName: 'Juliana Alves',
    service: 'Limpeza de Pele',
    professional: 'Maria Estética',
    status: 'confirmed',
    price: 'R$ 150,00',
  },
  {
    id: 'AGD-008',
    date: '2024-03-27',
    time: '13:00',
    clientName: 'Pedro Rocha',
    service: 'Corte de Cabelo',
    professional: 'João Barbeiro',
    status: 'confirmed',
    price: 'R$ 50,00',
  },
  {
    id: 'AGD-009',
    date: '2024-03-24',
    time: '10:00',
    clientName: 'Fernanda Lima',
    service: 'Massagem Relaxante',
    professional: 'Ana Terapeuta',
    status: 'completed',
    price: 'R$ 120,00',
  },
  {
    id: 'AGD-010',
    date: '2024-03-28',
    time: '11:30',
    clientName: 'Roberto Carlos',
    service: 'Consulta Odontológica',
    professional: 'Dr. Pedro',
    status: 'pending',
    price: 'R$ 200,00',
  },
];

const services = [
  'Corte de Cabelo',
  'Barba',
  'Manicure',
  'Depilação',
  'Massagem Relaxante',
  'Limpeza de Pele',
  'Consulta Odontológica',
];

const statusList = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
];

export function AppointmentsPage() {
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filterId, setFilterId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTimeStart, setFilterTimeStart] = useState('');
  const [filterTimeEnd, setFilterTimeEnd] = useState('');

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
      pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
      cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
      completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20' },
    };
    
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
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

  // Apply filters
  const filteredAppointments = mockAppointments.filter((appointment) => {
    // ID filter
    if (filterId && !appointment.id.toLowerCase().includes(filterId.toLowerCase())) {
      return false;
    }
    
    // Date filter
    if (filterDate && appointment.date !== filterDate) {
      return false;
    }
    
    // Service filter
    if (filterService !== 'all' && appointment.service !== filterService) {
      return false;
    }
    
    // Client name filter
    if (filterClient && !appointment.clientName.toLowerCase().includes(filterClient.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }
    
    // Time range filter
    if (filterTimeStart && appointment.time < filterTimeStart) {
      return false;
    }
    if (filterTimeEnd && appointment.time > filterTimeEnd) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Agendamentos" 
        subtitle={`${filteredAppointments.length} de ${mockAppointments.length} agendamentos`}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 scrollbar-custom">
        {/* Action Buttons */}
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
          <Button className={`p-4 border border-border bg-default text-foreground hover:bg-primary hover:text-popover`}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="flex-1 space-y-6">
          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filtros Avançados</h3>
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ID Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ID do Agendamento</label>
                  <Input
                    placeholder="Ex: AGD-001"
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                  />
                </div>

                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Data</label>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
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
                        <SelectItem key={service} value={service}>
                          {service}
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

                {/* Time Start Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Horário Inicial</label>
                  <Input
                    type="time"
                    value={filterTimeStart}
                    onChange={(e) => setFilterTimeStart(e.target.value)}
                  />
                </div>

                {/* Time End Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Horário Final</label>
                  <Input
                    type="time"
                    value={filterTimeEnd}
                    onChange={(e) => setFilterTimeEnd(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Appointments Table */}
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Data</TableHead>
                    <TableHead className="font-semibold text-foreground">Horário</TableHead>
                    <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground">Serviço</TableHead>
                    <TableHead className="font-semibold text-foreground">Profissional</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Valor</TableHead>
                    <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
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
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm font-semibold text-primary">
                          {appointment.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(appointment.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{appointment.clientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{appointment.service}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{appointment.professional}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <DollarSign className="w-4 h-4 text-primary" />
                            {appointment.price}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button 
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-primary/10 hover:text-primary"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" sideOffset={4} className="bg-primary fill-primary">
                                Visualizar
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button  
                                    size="sm"
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
                            
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button  
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                                Excluir
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination or Summary */}
            {filteredAppointments.length > 0 && (
              <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium text-foreground">{filteredAppointments.length}</span> de{' '}
                  <span className="font-medium text-foreground">{mockAppointments.length}</span> agendamentos
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Anterior</Button>
                  <Button variant="outline" size="sm" disabled>Próximo</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}