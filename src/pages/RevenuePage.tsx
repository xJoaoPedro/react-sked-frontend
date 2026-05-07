import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { TrendingUp, Calendar, Download, DollarSign, CreditCard, Wallet, PiggyBank, ChevronUp, FileJson, Table2, FileText, ChevronDown, TrendingDown, Clock, User, MessageSquare, Banknote, QrCode, Eye, Edit, Trash2, ChartColumn, ChartSpline, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { formatDate, formatLimitText, formatPrice, formatTime } from '@/lib/parsers';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { LoadingPage } from './LoadingPage';

const period = {
  'week': "Esta semana",
  'month': "Este mês",
  '3months': "Último trimestre",
  'year': "Este ano"
}

const method = {
  PIX: 'Pix',
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
};

const paymentIcons = {
  PIX: QrCode,
  CREDIT: CreditCard,
  DEBIT: CreditCard,
  CASH: Banknote,
};

export function RevenuePage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [receivedPercentage, setReceivedPercentage] = useState(0);
  const [pendingPercentage, setPendingPercentage] = useState(0);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [total, setTotal] = useState(1);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTableData = async () => {
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/revenue`, {params: { page, limit, filterPeriod }})).data.data;

    setDataState((prev) => ({
      ...prev,
      recentPayments: response.data,
    }));
    setTotal(response.total);
    setTotalPages(response.totalPages);
  }

  const fetchPageData = async () => {
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/revenue/summary`, {params: { page, limit, filterPeriod }})).data.data;

    setDataState(response);
    setTotal(response.totalTransactions);
    setPage(1);
    setTotalPages(Math.ceil(response.totalTransactions / limit));
    setTotalRevenue(response.revenuePending + response.revenueReceived);
    setReceivedPercentage(totalRevenue > 0 ? (response.revenueReceived / totalRevenue) * 100 : 0);
    setPendingPercentage(totalRevenue > 0 ? (response.revenuePending / totalRevenue) * 100 : 0);
  }

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.revenue);
    setTotal(dados.revenue.totalRevenue);
    setTotalPages(Math.ceil(dados.revenue.totalTransactions / limit));
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

  if (data === null) return <LoadingPage />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Receitas" 
        subtitle="Acompanhe e gerencie as receitas do seu negócio"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
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

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                <h3 className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</h3>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {((data.revenueReceived / (data.revenuePending + data.revenueReceived)) * 100) > 50 ? (<TrendingUp className="w-3 h-3 mr-1" />) : (<TrendingDown className="w-3 h-3 mr-1" />)}
                  {data.revenuePending + data.revenueReceived > 0 ? ((data.revenueReceived / (data.revenuePending + data.revenueReceived)) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recebida</p>
                <h3 className="text-2xl font-bold text-foreground">{formatPrice(data.revenueReceived)}</h3>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  {((data.revenuePending / (data.revenuePending + data.revenueReceived)) * 100) > 50 ? (<TrendingUp className="w-3 h-3 mr-1" />) : (<TrendingDown className="w-3 h-3 mr-1" />)}
                  {data.revenuePending + data.revenueReceived > 0 ? ((data.revenuePending / (data.revenuePending + data.revenueReceived)) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pendente</p>
                <h3 className="text-2xl font-bold text-foreground">{formatPrice(data.revenuePending)}</h3> 
              </div>
            </Card>
            
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {data.totalTransactions} transações
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-foreground">{formatPrice(data.avgTicket)}</h3>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Evolution Chart */}
            <Card className="p-6 gap-0 h-96">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Evolução de Receitas</h3>
                <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              </div>

              {data.revenueByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.revenueByMonth}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00A676" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00A676" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                      tickFormatter={(value) => `${formatPrice(value, false)}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${formatPrice(value)}`, 'Receita']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#00A676" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ChartSpline  />
                    </EmptyMedia>
                    <EmptyTitle className='text-muted-foreground'>Não há profissionais com cancelamentos para listar!</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
            </Card>

            {/* Payment Methods Chart */}
            <Card className="p-6 gap-0 h-96">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Receitas por Forma de Pagamento</h3>
                <p className="text-sm text-muted-foreground">Distribuição do período</p>
              </div>

              {data.revenueByPayment.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.revenueByPayment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="method"
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                      tickFormatter={(value) => `${method[value]}`}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                      tickFormatter={(value) => `${formatPrice(value, false)}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${formatPrice(value)}`, 'Valor']}
                      labelFormatter={(label) => `${method[label]}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total" fill="#00A676" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ChartColumn  />
                    </EmptyMedia>
                    <EmptyTitle className='text-muted-foreground'>Não há transações para listar.</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
              
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="overflow-hidden gap-0 p-0">
            <div className="px-6 pt-6 pb-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Transações do período <span className='text-primary/60'>({period[filterPeriod]})</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize as transações por cliente, serviço e método de pagamento
                  </p>
                </div>

                {/* TODO IMPLEMENTAR FUTURAMENTE */}
                {/* <div className="flex items-center gap-3">
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="w-[180px] bg-transparent p-4 border border-border text-foreground hover:bg-primary hover:text-popover">
                      <SelectValue className="hover:bg-white" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] bg-transparent p-4 border border-border text-foreground hover:bg-primary hover:text-popover">
                      <SelectValue className="hover:bg-white" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </div>
            
            <div>
              <Table className="w-full">
                <TableHeader className="table table-fixed z-10 w-full">
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground w-[100px]">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Data/Hora</TableHead>
                    <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground">Serviço</TableHead>
                    <TableHead className="font-semibold text-foreground">Profissional</TableHead>                    
                    <TableHead className="font-semibold text-foreground">Forma de Pagamento</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Valor</TableHead>
                    <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <div className="h-[500px] flex overflow-y-auto">
                  <TableBody className="block overflow-y-auto">
                    {data.recentPayments.length === 0 ? (
                      <TableRow className='table table-fixed w-full h-full'>
                        <TableCell colSpan={9} className="w-32 text-center py-16">
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <DollarSign  />
                              </EmptyMedia>
                              <EmptyTitle className='text-muted-foreground'>Não há transações para listar.</EmptyTitle>
                            </EmptyHeader>
                          </Empty>
                        </TableCell>
                      </TableRow>
                      ) : (
                      data.recentPayments.map((payment) => {
                        const Icon = paymentIcons[payment.paymentMethod] || Wallet;
                        
                        return (
                        <TableRow key={payment.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                          <TableCell className="w-[100px] font-mono text-sm font-semibold text-primary">{payment.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(payment.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{formatTime(payment.date)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">{payment.clientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{payment.serviceName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">{payment.professionalName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm">{formatLimitText(method[payment.paymentMethod], 24)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                payment.status === "COMPLETED"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              }

                            >
                              {payment.status === "COMPLETED"
                                ? "Pago"
                                : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <DollarSign className="w-4 h-4 text-[#00A676]" />
                              <span className="text-sm font-semibold">{formatPrice(payment.value, false)}</span>
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
                      )})
                    )}
                  </TableBody>
                </div>
              </Table>
            </div>

            {/* Pagination or Summary */}
            {data.recentPayments.length > 0 && (
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
                  transações
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
                    className="bg-primary hover:bg-primary/90"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(Number(page) - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
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