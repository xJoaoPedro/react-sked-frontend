import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { PageHeader } from '../components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { BarChart3, Calendar, DollarSign, XCircle, Percent, Users, UserCog, Scissors, FileText, Download, Eye, TrendingUp, Plus, Clock, LucideIcon } from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

const reportTypes: ReportCard[] = [
  {
    id: 'general',
    title: 'Relatório Geral',
    description: 'Visão consolidada completa do negócio com todas as métricas principais',
    icon: BarChart3,
    color: 'text-purple-600 bg-purple-600/10 border-purple-600/20',
    category: 'Geral'
  },
  {
    id: 'appointments',
    title: 'Relatório de Agendamentos',
    description: 'Análise detalhada por período, profissional, serviço e status',
    icon: Calendar,
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    category: 'Operacional'
  },
  {
    id: 'financial',
    title: 'Relatório Financeiro',
    description: 'Receitas, formas de pagamento, ticket médio e análise de faturamento',
    icon: DollarSign,
    color: 'text-[#00A676] bg-[#00A676]/10 border-[#00A676]/20',
    category: 'Financeiro'
  },
  {
    id: 'cancellations',
    title: 'Relatório de Cancelamentos',
    description: 'Motivos, taxa de cancelamento e análise de perdas financeiras',
    icon: XCircle,
    color: 'text-[#E63946] bg-[#E63946]/10 border-[#E63946]/20',
    category: 'Operacional'
  },
  {
    id: 'commissions',
    title: 'Relatório de Comissões',
    description: 'Comissões detalhadas por profissional, período e status de pagamento',
    icon: Percent,
    color: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20',
    category: 'Financeiro'
  },
  {
    id: 'clients',
    title: 'Relatório de Clientes',
    description: 'Novos vs recorrentes, frequência, retenção e comportamento',
    icon: Users,
    color: 'text-indigo-600 bg-indigo-600/10 border-indigo-600/20',
    category: 'Clientes'
  },
  {
    id: 'professionals',
    title: 'Relatório de Profissionais',
    description: 'Performance, produtividade, avaliações e métricas individuais',
    icon: UserCog,
    color: 'text-orange-600 bg-orange-600/10 border-orange-600/20',
    category: 'Gestão'
  },
  {
    id: 'services',
    title: 'Relatório de Serviços',
    description: 'Serviços mais vendidos, horários de pico e duração média',
    icon: Scissors,
    color: 'text-pink-600 bg-pink-600/10 border-pink-600/20',
    category: 'Operacional'
  },
];

// TODO verificar
// const categories = ['Todos', 'Geral', 'Operacional', 'Financeiro', 'Clientes', 'Gestão'];

// Mock data for report history
const reportHistory = [
  {
    id: 1,
    name: 'Relatório Financeiro - Março 2025',
    type: 'Financeiro',
    period: 'Último mês',
    format: 'PDF',
    generatedAt: '2025-03-25 14:30',
    status: 'completed',
    size: '2.4 MB'
  },
  {
    id: 2,
    name: 'Relatório de Agendamentos - Q1 2025',
    type: 'Agendamentos',
    period: 'Último trimestre',
    format: 'Excel',
    generatedAt: '2025-03-24 09:15',
    status: 'completed',
    size: '1.8 MB'
  },
  {
    id: 3,
    name: 'Relatório de Clientes - Fevereiro 2025',
    type: 'Clientes',
    period: 'Último mês',
    format: 'PDF',
    generatedAt: '2025-03-20 16:45',
    status: 'completed',
    size: '1.2 MB'
  },
  {
    id: 4,
    name: 'Relatório Geral - Semana 12',
    type: 'Geral',
    period: 'Últimos 7 dias',
    format: 'CSV',
    generatedAt: '2025-03-18 11:20',
    status: 'completed',
    size: '850 KB'
  },
  {
    id: 5,
    name: 'Relatório de Comissões - Março 2025',
    type: 'Comissões',
    period: 'Último mês',
    format: 'Excel',
    generatedAt: '2025-03-15 13:00',
    status: 'completed',
    size: '3.1 MB'
  },
];

export function ReportsPage() {
  const [selectedCategory] = useState('Todos');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('pdf');
  
  // Custom report states
  const [customReportName, setCustomReportName] = useState('');
  const [customPeriod, setCustomPeriod] = useState('month');
  const [customFormat, setCustomFormat] = useState('pdf');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'revenue',
    'appointments',
  ]);

  const filteredReports = selectedCategory === 'Todos' 
    ? reportTypes 
    : reportTypes.filter(report => report.category === selectedCategory);

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedReport, period, format);
    // Aqui você implementaria a lógica de geração do relatório
  };

  const handleGenerateCustomReport = () => {
    console.log('Generating custom report:', {
      name: customReportName,
      period: customPeriod,
      format: customFormat,
      metrics: selectedMetrics
    });
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Relatórios"
        subtitle="Gere relatórios detalhados e exporte análises do seu negócio"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {/* Reports Grid */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className="p-5 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${report.color}`}>
                    <report.icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-semibold text-base mb-2 text-foreground">
                    {report.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {report.description}
                  </p>

                  <Badge variant="outline" className="w-fit mb-4 text-xs">
                    {report.category}
                  </Badge>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-[#00A676] hover:bg-[#00A676]/90"
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <report.icon className="w-5 h-5 text-[#00A676]" />
                          {report.title}
                        </DialogTitle>
                        <DialogDescription>
                          Configure os parâmetros do relatório antes de gerar
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Período</label>
                          <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">Hoje</SelectItem>
                              <SelectItem value="yesterday">Ontem</SelectItem>
                              <SelectItem value="week">Últimos 7 dias</SelectItem>
                              <SelectItem value="month">Último mês</SelectItem>
                              <SelectItem value="quarter">Último trimestre</SelectItem>
                              <SelectItem value="year">Último ano</SelectItem>
                              <SelectItem value="custom">Período personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Formato de Exportação</label>
                          <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                              <SelectItem value="csv">CSV (.csv)</SelectItem>
                              <SelectItem value="json">JSON (.json)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900">
                              O relatório será gerado com base nos dados do período selecionado e 
                              poderá ser baixado no formato escolhido.
                            </p>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReport(null)}>
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-[#00A676] hover:bg-[#00A676]/90"
                          onClick={handleGenerateReport}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Gerar e Baixar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>

          {/* Custom Report Generator */}
          <div className="mt-8">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#00A676] to-[#00A676]/80 text-white py-4 px-6">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Relatório Personalizado</h2>
                </div>
                <p className="text-white/90 text-sm mt-1">
                  Crie relatórios customizados selecionando as métricas que deseja analisar
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportName">Nome do Relatório</Label>
                      <Input
                        id="reportName"
                        placeholder="Ex: Análise Mensal Completa"
                        value={customReportName}
                        onChange={(e) => setCustomReportName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customPeriod">Período</Label>
                      <Select value={customPeriod} onValueChange={setCustomPeriod}>
                        <SelectTrigger id="customPeriod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="yesterday">Ontem</SelectItem>
                          <SelectItem value="week">Últimos 7 dias</SelectItem>
                          <SelectItem value="month">Último mês</SelectItem>
                          <SelectItem value="quarter">Último trimestre</SelectItem>
                          <SelectItem value="year">Último ano</SelectItem>
                          <SelectItem value="custom">Período personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customFormat">Formato</Label>
                      <Select value={customFormat} onValueChange={setCustomFormat}>
                        <SelectTrigger id="customFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                          <SelectItem value="json">JSON (.json)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right column - Metrics */}
                  <div className="space-y-2">
                    <Label>Métricas a Incluir</Label>
                    <div className="space-y-3 border rounded-lg p-4 max-h-[280px] overflow-y-auto">
                      {[
                        { id: 'revenue', label: 'Receitas e Faturamento', icon: DollarSign },
                        { id: 'appointments', label: 'Agendamentos', icon: Calendar },
                        { id: 'cancellations', label: 'Cancelamentos', icon: XCircle },
                        { id: 'commissions', label: 'Comissões', icon: Percent },
                        { id: 'clients', label: 'Análise de Clientes', icon: Users },
                        { id: 'professionals', label: 'Performance de Profissionais', icon: UserCog },
                        { id: 'services', label: 'Serviços Mais Vendidos', icon: Scissors },
                        { id: 'growth', label: 'Crescimento e Tendências', icon: TrendingUp },
                      ].map((metric) => (
                        <div key={metric.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={metric.id}
                            checked={selectedMetrics.includes(metric.id)}
                            onCheckedChange={() => toggleMetric(metric.id)}
                          />
                          <label
                            htmlFor={metric.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                          >
                            <metric.icon className="w-4 h-4 text-muted-foreground" />
                            {metric.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    className="bg-[#00A676] hover:bg-[#00A676]/90"
                    onClick={handleGenerateCustomReport}
                    disabled={!customReportName || selectedMetrics.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório Personalizado
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Report History */}
          <div className="mt-8">
            <Card className="overflow-hidden gap-0">
              <div className="py-4 px-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Histórico de Relatórios</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Acesse relatórios gerados anteriormente
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {reportHistory.length} relatórios
                  </Badge>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nome do Relatório</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Data de Geração</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportHistory.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#00A676]" />
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.period}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {report.format}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {report.generatedAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {report.size}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[#00A676] border-[#00A676]/20 hover:bg-[#00A676] hover:bg-[#00A676] hover:text-[#]"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}