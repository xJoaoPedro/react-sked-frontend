import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Filter, X, Calendar, Download, Eye, Edit, Trash2, Clock, User, DollarSign, FileText, Table2, ChevronDown, ChevronUp, FileJson, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker } from '@/components/ui/datepicker';
import { useOutletContext } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as XLSX from "xlsx";
import { toast } from "sonner"
import { api } from "@/lib/api";

const statusList = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
];

export function AppointmentsPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false)
  const [initialized, setInitialized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(1);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterId, setFilterId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTimeStart, setFilterTimeStart] = useState('');
  const [filterTimeEnd, setFilterTimeEnd] = useState('');

  const fetchData = async () => {
    const response = (await api.get(`/api/companies/${localStorage.getItem('companyId')}/appointments`, {params: buildQuery()})).data.data;

    setDataState(response.data);
    setPage(Number(response.page));
    setTotal(response.total);
    setTotalPages(response.totalPages);
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      CONFIRMED: { label: 'Confirmado', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
      PENDING: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
      CANCELED: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
      COMPLETED: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20' },
    };
    
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
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
    setServices(dados.services || [])
    setTotalPages(dados.appointments?.totalPages || 1)
    setInitialized(true)
  }, [dados])

  useEffect(() => {
    if (!initialized) return

    fetchData()
  }, [initialized, page, filterId, filterDate, filterService, filterClient, filterStatus, filterTimeStart, filterTimeEnd])

  if (data === null) return <div>Carregando...</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Agendamentos" 
        subtitle={`${data.length} de ${total} agendamentos`}
      />

      {/* Scrollable Content Area */}
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
        </div>

        <div className="flex overflow-y-auto">
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
                  <DatePicker
                    value={filterDate ? new Date(filterDate) : undefined}
                    onChange={(date) => {
                      if (!date) return setFilterDate("")

                      const iso = date.toISOString().split("T")[0]
                      setFilterDate(iso)
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
            <div className="overflow-x-auto flex-1 min-h-0">
              <Table className="w-full">
                <TableHeader className="table table-fixed z-10">
                  <TableRow className="table w-full table-fixed bg-muted/50">
                    <TableHead className="font-semibold text-foreground w-[100px]">ID</TableHead>
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
                <TableBody className="block overflow-y-auto">
                  {data.length === 0 ? (
                    <TableRow className='table table-fixed w-full h-full'>
                      <TableCell colSpan={9} className="w-32 text-center py-16">
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
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((appointment) => (
                      <TableRow key={appointment.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                        <TableCell className="w-[100px] font-mono text-sm font-semibold text-primary">
                          {appointment.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(appointment.start_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{formatTime(appointment.start_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{appointment.client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{appointment.service.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{appointment.employee.name}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <DollarSign className="w-4 h-4 text-primary" />
                            {formatPrice(appointment.service.price)}
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
    </div>
  );
}