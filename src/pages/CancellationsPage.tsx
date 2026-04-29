import { PageHeader } from "../components/PageHeader";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Calendar, TrendingDown, DollarSign, User, Clock, MessageSquare, Download, Filter, ChevronDown, ChevronUp, FileText, Table2, FileJson, Eye, Edit, Trash2, } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as XLSX from "xlsx";
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from "@/lib/api";
import { formatDate, formatLimitText, formatPrice, formatTime } from "@/lib/parsers";
import { useOutletContext } from "react-router-dom";
import { Input } from "@/components/ui/input";

const period = {
  'week': "Esta semana",
  'month': "Este mês",
  '3months': "Último trimestre",
  'year': "Este ano"
}

const reasons = {
  NO_SHOW: 'Não comparecimento',
  SCHEDULE_CONFLICT: 'Conflito de agenda',
  ILLNESS: 'Doença',
  EMERGENCY: 'Emergência',
  PROFESSIONAL_UNAVAILABLE: 'Profissional indisponível',
  OTHER: 'Outro'
}

export function CancellationsPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [total, setTotal] = useState(1);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // TODO IMPLEMENTAR FUTURAMENTE
  // const exportCSV = () => {
  //   const headers = ["ID", "Data", "Horário", "Cliente", "Serviço", "Profissional", "Status", "Valor"];

  //   const rows = data.map((a) => [
  //     a.id,
  //     formatDate(a.start_time),
  //     formatTime(a.start_time),
  //     a.client?.name,
  //     a.service?.name,
  //     a.employee?.name,
  //     a.status,
  //     a.service?.price,
  //   ]);

  //   const csvContent = [
  //     headers.join(","),
  //     ...rows.map((r) => r.join(",")),
  //   ].join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");

  //   link.href = url;
  //   link.setAttribute("download", "agendamentos.csv");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   toast.success("Agendamentos exportados em CSV com sucesso!")
  // };

  // const exportExcel = () => {
  //   const dataToExport = data.map((a) => ({
  //     ID: a.id,
  //     cliente: a.client.name,
  //     servico: a.service.name,
  //     funcionario: a.employee.name,
  //     status: a.status,
  //     data: formatDate(a.start_time),
  //     horario: formatTime(a.start_time),
  //     preco: a.service.price,
  //   }))

  //   const worksheet = XLSX.utils.json_to_sheet(dataToExport)

  //   const workbook = XLSX.utils.book_new()
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Agendamentos")

  //   XLSX.writeFile(workbook, "agendamentos.xlsx")
  //   toast.success("Agendamentos exportados em Excel com sucesso!")
  // }

  // const exportJson = () => {
  //   const dataToExport = data.map((a) => ({
  //     id: a.id,
  //     cliente: a.client.name,
  //     servico: a.service.name,
  //     funcionario: a.employee.name,
  //     status: a.status,
  //     data: formatDate(a.start_time),
  //     horario: formatTime(a.start_time),
  //     preco: a.service.price,
  //   }))

  //   const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
  //     type: "application/json",
  //   })

  //   const url = URL.createObjectURL(blob)

  //   const a = document.createElement("a")
  //   a.href = url
  //   a.download = "agendamentos.json"
  //   a.click()

  //   URL.revokeObjectURL(url)
  //   toast.success("Agendamentos exportados em JSON com sucesso!")
  // }

  // const exportData = (type) => {
  //   switch (type) {
  //     case 'csv':
  //       exportCSV();
  //       break;
  //     case 'excel':
  //       exportExcel();
  //       break;
  //     case 'json':
  //       exportJson();
  //       break;
  //     default:
  //       toast.error("Erro no formato de exportação.")
  //       break;
  //   }
  // };

  const fetchTableData = async () => {
    const response = (await api.get(`/api/companies/${localStorage.getItem('companyId')}/cancellations`, {params: { page, limit, }})).data.data;

    setDataState((prev) => ({
      ...prev,
      recentCancellations: response.data,
    }));
    setPage(Number(response.page));
    setTotal(response.total);
    setTotalPages(response.totalPages);
  }

  const fetchPageData = async () => {
    const response = (await api.get(`/api/companies/${localStorage.getItem('companyId')}/cancellations/summary`, {params: { time: filterPeriod }})).data.data;

    setDataState(response);
    setTotal(response.totalCancellations);
  }

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.cancellations);
    setTotal(dados.cancellations.totalCancellations);
    setTotalPages(Math.ceil(dados.cancellations.totalCancellations / limit));
    setInitialized(true)
  }, [dados])
  
  useEffect(() => {
    if (!initialized) return

    fetchTableData()
  }, [initialized, page])

  useEffect(() => {
    if (!initialized) return

    fetchPageData();

  }, [initialized, filterPeriod])

  if (data === null) return <div>Carregando...</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Análise de Cancelamentos" subtitle="Insights e estatísticas sobre cancelamentos" />
      
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 scrollbar-custom-destructive">
        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 flex-shrink-0">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[180px] bg-transparent p-4 border border-border text-foreground hover:bg-primary hover:text-popover">
              <SelectValue className="hover:bg-white" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="3months">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          {/* TODO IMPLEMENTAR FUTURAMENTE */}
          {/* <Popover open={exportOpen} onOpenChange={setExportOpen}>
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
          </Popover> */}
        </div>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-destructive" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20"
                >
                  {period[filterPeriod]}
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {data.totalCancellations}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total de Cancelamentos
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                >
                  -{data.cancelRate.toFixed(1)}%
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {data.cancelRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Taxa de Cancelamento
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-destructive" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20"
                >
                  Perda
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(data.lostRevenue)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receita Perdida
                </p>
              </div>
            </Card>

            {/* TODO IMPLEMENTAR FUTURAMENTE */}
            {/* <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-600 border-blue-500/20"
                >
                  Média
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  PH IMPLEMENTAR FUTURAMENTE
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Antecedência Média
                </p>
              </div>
            </Card> */}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cancellation Trend */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">
                  Tendência de Cancelamentos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Evolução mensal dos cancelamentos
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.cancellationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <RechartsTooltip
                    labelFormatter={(label, payload) => `${label} ${payload[0]?.payload?.year ? `,${payload[0].payload.year}` : ""}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#E63946"
                    strokeWidth={2}
                    name="Total"
                    dot={{ fill: "#E63946", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Reasons Pie Chart */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">
                  Motivos de Cancelamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Distribuição por motivo
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.cancellationsByReason.map(
                      (
                        entry: { reason: string; total?: number; percentage?: number; color?: string },
                      ) => ({
                        ...entry,
                        total: Number(entry.total ?? entry.percentage ?? 0),
                      })
                    )}
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      ({ payload, percent }: { payload?: { reason?: string; name?: string }; percent: number }) =>
                        `${payload?.reason ?? payload?.name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {data.cancellationsByReason.map(
                      (
                        entry: { reason: string; total: number; percentage?: number; color?: string },
                        index: number
                      ) => {
                        const COLORS = ['#00A676', '#E63946', '#FFB800', '#6B7280', '#3B82F6', '#8B5CF6'];
                        return <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      }
                    )}
                  </Pie>
                  <RechartsTooltip formatter={(value, _, props) => {
                    return [`${props.payload.total} cancelamentos`, props.payload.reason]}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Analysis by Service and Professional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Service */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">
                  Cancelamentos por Serviço
                </h3>
                <p className="text-sm text-muted-foreground">
                  Serviços com mais cancelamentos
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.cancellationsByService} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis
                    dataKey="service"
                    type="category"
                    width={120}
                    stroke="#6B7280"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#E63946"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* By Professional */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">
                  Taxa por Profissional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Percentual de cancelamento por profissional
                </p>
              </div>
              <div className="space-y-4">
                {data.cancellationsByProfessional.map((prof) => {
                  return (
                    <div key={prof.professional}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {prof.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {prof.cancellations}/{prof.total} ({prof.rate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-destructive h-2 rounded-full transition-all"
                          style={{ width: `${prof.rate.toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Cancellations Table */}
          <Card className="overflow-hidden gap-0 p-0">
            <div className="px-6 pt-6 pb-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Cancelamentos Recentes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Últimos cancelamentos com detalhes
                  </p>
                </div>

                {/* TODO IMPLEMENTAR FUTURAMENTE */}
                {/* <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="bg-transparent p-4 text-foreground hover:bg-primary hover:text-popover w-64">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os motivos</SelectItem>
                    {data.cancellationsByReason.map((reason) => (
                      <SelectItem key={reason.reason} value={reason.reason}>
                        {reason.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <div>
              <Table className="w-full">
                <TableHeader className="table table-fixed z-10">
                  <TableRow className="table w-full table-fixed bg-muted/50">
                    <TableHead className="font-semibold text-foreground w-[100px]">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Data/Hora</TableHead>
                    <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground">Serviço</TableHead>
                    <TableHead className="font-semibold text-foreground">Profissional</TableHead>
                    <TableHead className="font-semibold text-foreground">Motivo</TableHead>
                    <TableHead className="font-semibold text-foreground">Cancelado por</TableHead>
                    <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <div className="max-h-[500px] flex overflow-y-auto">
                  <TableBody className="block overflow-y-auto">
                    {data.recentCancellations.length === 0 ? (
                      <TableRow className='table table-fixed w-full h-full'>
                        <TableCell colSpan={9} className="w-32 text-center py-16">
                          <div className="w-full h-96 flex flex-col justify-center items-center gap-2 text-muted-foreground">
                            <Calendar className="w-12 h-12 opacity-20" />
                            <p className="font-medium">
                              Nenhum cancelamento recente encontrado.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentCancellations.map((cancellation) => (
                        <TableRow key={cancellation.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                          <TableCell className="w-[100px] font-mono text-sm font-semibold text-destructive">{cancellation.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(cancellation.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{formatTime(cancellation.date)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-destructive" />
                              </div>
                              <span className="font-medium">{cancellation.clientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{cancellation.serviceName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-destructive" />
                              </div>
                              <span className="font-medium">{cancellation.professionalName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{formatLimitText(reasons[cancellation.reason], 24)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                cancellation.cancelledBy === "client"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                              }
                            >
                              {cancellation.cancelledBy === "client"
                                ? "Cliente"
                                : "Estabelecimento"}
                            </Badge>
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
                </div>                
              </Table>
            </div>

            {/* Pagination or Summary */}
            {data.recentCancellations.length > 0 && (
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
                    className="bg-destructive hover:bg-destructive/90"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(Number(page) - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    className="bg-destructive hover:bg-destructive/90"
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
