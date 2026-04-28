import { PageHeader } from "../components/PageHeader";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Calendar, TrendingDown, DollarSign, User, Clock, MessageSquare, Download, Filter, ChevronDown, ChevronUp, FileText, Table2, FileJson, } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as XLSX from "xlsx";
import { toast } from "sonner"
import { api } from "@/lib/api";
import { formatDate, formatPrice, formatTime } from "@/lib/parsers";
import { useOutletContext } from "react-router-dom";

interface Cancellation {
  id: string;
  date: string;
  time: string;
  clientName: string;
  service: string;
  professional: string;
  reason: string;
  cancelledBy: "client" | "business";
  price: string;
  noticePeriod: string; // Ex: "2 dias", "1 hora"
}

const mockCancellations: Cancellation[] = [
  {
    id: "AGD-006",
    date: "2024-03-26",
    time: "16:00",
    clientName: "Rafael Mendes",
    service: "Barba",
    professional: "João Barbeiro",
    reason: "Imprevisto pessoal",
    cancelledBy: "client",
    price: "R$ 30,00",
    noticePeriod: "2 dias",
  },
  {
    id: "AGD-012",
    date: "2024-03-27",
    time: "14:30",
    clientName: "Amanda Costa",
    service: "Manicure",
    professional: "Carla Manicure",
    reason: "Profissional indisponível",
    cancelledBy: "business",
    price: "R$ 40,00",
    noticePeriod: "1 dia",
  },
  {
    id: "AGD-015",
    date: "2024-03-28",
    time: "10:00",
    clientName: "Lucas Silva",
    service: "Corte de Cabelo",
    professional: "João Barbeiro",
    reason: "Mudança de horário",
    cancelledBy: "client",
    price: "R$ 50,00",
    noticePeriod: "3 horas",
  },
  {
    id: "AGD-018",
    date: "2024-03-25",
    time: "11:00",
    clientName: "Patricia Lima",
    service: "Limpeza de Pele",
    professional: "Maria Estética",
    reason: "Doença",
    cancelledBy: "client",
    price: "R$ 150,00",
    noticePeriod: "1 hora",
  },
  {
    id: "AGD-020",
    date: "2024-03-24",
    time: "15:00",
    clientName: "Ricardo Santos",
    service: "Massagem Relaxante",
    professional: "Ana Terapeuta",
    reason: "Preço elevado",
    cancelledBy: "client",
    price: "R$ 120,00",
    noticePeriod: "5 dias",
  },
];

export function CancellationsPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterReason, setFilterReason] = useState("all");

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

    setDataState(dados.cancellations);

    console.log(dados.cancellations);
  }, [dados])
  
  
  // TODO VERIFICAR USO E REMOVER
  // useEffect(() => {
  //   if (!initialized) return

  //   fetchData()
  // }, [initialized, page, filterId, filterDate, filterService, filterClient, filterStatus, filterTimeStart, filterTimeEnd])

  if (data === null) return <div>Carregando...</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Análise de Cancelamentos" subtitle="Insights e estatísticas sobre cancelamentos" />
      
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 scrollbar-custom">
        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 flex-shrink-0">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[180px] bg-transparent p-4 border border-border text-foreground hover:bg-primary hover:text-popover">
              <SelectValue className="hover:bg-white" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
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
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-destructive" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20"
                >
                  Último mês
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

            <Card className="p-6">
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
                  PH
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Antecedência Média
                </p>
              </div>
            </Card>
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
                  <Tooltip
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
                  <Tooltip formatter={(value, _, props) => {
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

          {/* TODO IMPLEMENTAR QUANDO IMPLEMENTAR O MOTIVO */}
          {/* Recent Cancellations Table */}
          {/* <Card className="overflow-hidden gap-0 p-0">
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
                <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="bg-transparent p-4 text-foreground hover:bg-primary hover:text-popover">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os motivos</SelectItem>
                    {cancellationReasons.map((reason) => (
                      <SelectItem key={reason.name} value={reason.name}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Data/Hora
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Serviço
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Motivo
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Cancelado Por
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Antecedência
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCancellations.map((cancellation) => (
                    <TableRow
                      key={cancellation.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-sm font-semibold text-destructive">
                        {cancellation.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(
                                cancellation.date + "T00:00:00",
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {cancellation.time}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-destructive" />
                          </div>
                          <span className="font-medium">
                            {cancellation.clientName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{cancellation.service}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{cancellation.reason}</span>
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
                        <span className="text-sm">
                          {cancellation.noticePeriod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-destructive">
                          {cancellation.price}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
