import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Calendar, Download, Eye, Info } from 'lucide-react';

interface ProfessionalCommission {
  id: string;
  name: string;
  avatar: string;
  totalServices: number;
  totalRevenue: string;
  commissionRate: number;
  totalCommission: string;
  paidCommission: string;
  pendingCommission: string;
  lastPayment: string;
  status: 'active' | 'inactive';
}

const mockProfessionals: ProfessionalCommission[] = [
  {
    id: '1',
    name: 'João Barbeiro',
    avatar: 'JB',
    totalServices: 48,
    totalRevenue: 'R$ 3.850,00',
    commissionRate: 40,
    totalCommission: 'R$ 1.540,00',
    paidCommission: 'R$ 1.200,00',
    pendingCommission: 'R$ 340,00',
    lastPayment: '2024-03-25',
    status: 'active',
  },
  {
    id: '2',
    name: 'Maria Estética',
    avatar: 'ME',
    totalServices: 42,
    totalRevenue: 'R$ 3.200,00',
    commissionRate: 45,
    totalCommission: 'R$ 1.440,00',
    paidCommission: 'R$ 1.100,00',
    pendingCommission: 'R$ 340,00',
    lastPayment: '2024-03-25',
    status: 'active',
  },
  {
    id: '3',
    name: 'Ana Terapeuta',
    avatar: 'AT',
    totalServices: 36,
    totalRevenue: 'R$ 2.900,00',
    commissionRate: 50,
    totalCommission: 'R$ 1.450,00',
    paidCommission: 'R$ 1.000,00',
    pendingCommission: 'R$ 450,00',
    lastPayment: '2024-03-25',
    status: 'active',
  },
  {
    id: '4',
    name: 'Carla Manicure',
    avatar: 'CM',
    totalServices: 52,
    totalRevenue: 'R$ 2.400,00',
    commissionRate: 35,
    totalCommission: 'R$ 840,00',
    paidCommission: 'R$ 600,00',
    pendingCommission: 'R$ 240,00',
    lastPayment: '2024-03-25',
    status: 'active',
  },
  {
    id: '5',
    name: 'Dr. Pedro',
    avatar: 'DP',
    totalServices: 28,
    totalRevenue: 'R$ 1.150,00',
    commissionRate: 30,
    totalCommission: 'R$ 345,00',
    paidCommission: 'R$ 250,00',
    pendingCommission: 'R$ 95,00',
    lastPayment: '2024-03-25',
    status: 'active',
  },
];

// TODO ver o pq disso
// const commissionEvolution = [
//   { date: '26/03', paid: 850, pending: 320 },
//   { date: '27/03', paid: 920, pending: 380 },
//   { date: '28/03', paid: 1100, pending: 420 },
//   { date: '29/03', paid: 980, pending: 450 },
//   { date: '30/03', paid: 1250, pending: 520 },
//   { date: '31/03', paid: 1400, pending: 480 },
//   { date: 'Hoje', paid: 1520, pending: 465 },
// ];

// const commissionByProfessional = [
//   { name: 'João', total: 1540, paid: 1200, pending: 340 },
//   { name: 'Maria', total: 1440, paid: 1100, pending: 340 },
//   { name: 'Ana', total: 1450, paid: 1000, pending: 450 },
//   { name: 'Carla', total: 840, paid: 600, pending: 240 },
//   { name: 'Pedro', total: 345, paid: 250, pending: 95 },
// ];

export function CommissionsPage() {
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProfessionals = mockProfessionals.filter((prof) => {
    if (filterStatus === 'pending') {
      return parseFloat(prof.pendingCommission.replace('R$ ', '').replace('.', '').replace(',', '.')) > 0;
    }
    if (filterStatus === 'paid') {
      return parseFloat(prof.paidCommission.replace('R$ ', '').replace('.', '').replace(',', '.')) > 0;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Comissões" 
        subtitle="Gerencie e acompanhe as comissões dos profissionais"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 flex-shrink-0">
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-custom">
          {/* Info Banner */}
          <Card className="p-4 bg-primary/10 border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary mb-1">Informações sobre Comissões</h4>
                <p className="text-sm text-primary/90">
                  As comissões são calculadas automaticamente com base nos serviços realizados. 
                  Acompanhe o resumo detalhado de cada profissional e suas comissões totais, pagas e pendentes.
                </p>
              </div>
            </div>
          </Card>

          {/* Professionals Commission Table */}
          <Card className="overflow-hidden gap-0">
            <div className="py-3 px-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Comissões dos Profissionais</h3>
                  <p className="text-sm text-muted-foreground">Resumo detalhado de comissões por profissional</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Com Pendentes</SelectItem>
                      <SelectItem value="paid">Somente Pagas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="[&>thead]:border-t-0">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Profissional</TableHead>
                    <TableHead className="font-semibold text-foreground">Serviços</TableHead>
                    <TableHead className="font-semibold text-foreground">Receita Total</TableHead>
                    <TableHead className="font-semibold text-foreground">Taxa</TableHead>
                    <TableHead className="font-semibold text-foreground">Comissão Total</TableHead>
                    <TableHead className="font-semibold text-foreground">Paga</TableHead>
                    <TableHead className="font-semibold text-foreground">Pendente</TableHead>
                    <TableHead className="font-semibold text-foreground">Último Pagamento</TableHead>
                    <TableHead className="font-semibold text-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((professional) => {
                    const hasPending = parseFloat(professional.pendingCommission.replace('R$ ', '').replace('.', '').replace(',', '.')) > 0;
                    
                    return (
                      <TableRow key={professional.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-semibold text-sm">{professional.avatar}</span>
                            </div>
                            <div>
                              <div className="font-medium">{professional.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${professional.status === 'active' ? 'bg-primary' : 'bg-gray-400'}`} />
                                {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{professional.totalServices}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-primary">{professional.totalRevenue}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            {professional.commissionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{professional.totalCommission}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {professional.paidCommission}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasPending ? (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              {professional.pendingCommission}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">R$ 0,00</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(professional.lastPayment + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}