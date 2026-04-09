import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { TrendingUp, Calendar, Download, DollarSign, CreditCard, Wallet, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueTransaction {
  id: string;
  date: string;
  time: string;
  client: string;
  professional: string;
  service: string;
  paymentMethod: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const mockTransactions: RevenueTransaction[] = [
  {
    id: '1',
    date: '2024-03-31',
    time: '09:00',
    client: 'Carlos Silva',
    professional: 'João Barbeiro',
    service: 'Corte + Barba',
    paymentMethod: 'Cartão de Crédito',
    amount: 'R$ 85,00',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-03-31',
    time: '10:30',
    client: 'Ana Santos',
    professional: 'Maria Estética',
    service: 'Limpeza de Pele',
    paymentMethod: 'Pix',
    amount: 'R$ 120,00',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-03-31',
    time: '11:00',
    client: 'Pedro Oliveira',
    professional: 'Ana Terapeuta',
    service: 'Massagem Relaxante',
    paymentMethod: 'Dinheiro',
    amount: 'R$ 150,00',
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-03-31',
    time: '14:00',
    client: 'Juliana Costa',
    professional: 'Carla Manicure',
    service: 'Manicure + Pedicure',
    paymentMethod: 'Cartão de Débito',
    amount: 'R$ 60,00',
    status: 'completed',
  },
  {
    id: '5',
    date: '2024-03-31',
    time: '15:30',
    client: 'Roberto Lima',
    professional: 'João Barbeiro',
    service: 'Corte Simples',
    paymentMethod: 'Pix',
    amount: 'R$ 45,00',
    status: 'completed',
  },
  {
    id: '6',
    date: '2024-03-31',
    time: '16:00',
    client: 'Fernanda Souza',
    professional: 'Maria Estética',
    service: 'Design de Sobrancelhas',
    paymentMethod: 'Cartão de Crédito',
    amount: 'R$ 50,00',
    status: 'pending',
  },
];

const revenueEvolution = [
  { date: '26/03', value: 2850 },
  { date: '27/03', value: 3200 },
  { date: '28/03', value: 3650 },
  { date: '29/03', value: 3100 },
  { date: '30/03', value: 4200 },
  { date: '31/03', value: 3850 },
  { date: 'Hoje', value: 510 },
];

const revenueByPaymentMethod = [
  { method: 'Pix', value: 1850, percentage: 36 },
  { method: 'Crédito', value: 1450, percentage: 28 },
  { method: 'Débito', value: 1200, percentage: 24 },
  { method: 'Dinheiro', value: 600, percentage: 12 },
];

export function RevenuePage() {
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (filterStatus !== 'all' && transaction.status !== filterStatus) {
      return false;
    }
    if (filterPayment !== 'all' && transaction.paymentMethod !== filterPayment) {
      return false;
    }
    return true;
  });

  const totalRevenue = 'R$ 5.100,00';
  const pendingRevenue = 'R$ 50,00';
  const completedRevenue = 'R$ 5.050,00';
  const averageTicket = 'R$ 85,00';

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
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                <h3 className="text-2xl font-bold text-foreground">{totalRevenue}</h3>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recebida</p>
                <h3 className="text-2xl font-bold text-foreground">{completedRevenue}</h3>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  1
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pendente</p>
                <h3 className="text-2xl font-bold text-foreground">{pendingRevenue}</h3>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  6 transações
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-foreground">{averageTicket}</h3>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Evolution Chart */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Evolução de Receitas</h3>
                <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueEvolution}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A676" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00A676" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00A676" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Payment Methods Chart */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Receitas por Forma de Pagamento</h3>
                <p className="text-sm text-muted-foreground">Distribuição do período</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByPaymentMethod}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="method" 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#00A676" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="overflow-hidden gap-0">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Transações Recentes</h3>
                  <p className="text-sm text-muted-foreground">Histórico detalhado de receitas</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pagamento" />
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
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Data/Hora</TableHead>
                    <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground">Profissional</TableHead>
                    <TableHead className="font-semibold text-foreground">Serviço</TableHead>
                    <TableHead className="font-semibold text-foreground">Forma de Pagamento</TableHead>
                    <TableHead className="font-semibold text-foreground">Valor</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.time}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{transaction.client}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.professional}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.service}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {transaction.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-primary">{transaction.amount}</span>
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'completed' && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Concluída
                          </Badge>
                        )}
                        {transaction.status === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            Pendente
                          </Badge>
                        )}
                        {transaction.status === 'cancelled' && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            Cancelada
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}