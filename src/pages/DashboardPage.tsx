import { StatCard } from '../components/StatCard';
import { AppointmentList } from '../components/AppointmentList';
import { RevenueChart } from '../components/RevenueChart';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { TopServices } from '../components/TopServices';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Painel" 
        subtitle="Bem-vindo de volta! Aqui está o resumo de hoje." 
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Agendamentos Hoje"
            value={24}
            icon={Calendar}
            trend={{ value: '+8% vs ontem', isPositive: true }}
            iconBgColor="bg-primary"
          />
          <StatCard
            title="Total de Clientes"
            value={1.247}
            icon={Users}
            trend={{ value: '+15% vs mês passado', isPositive: true }}
            iconBgColor="bg-foreground"
          />
          <StatCard
            title="Receita Mensal"
            value="R$ 7.200"
            icon={DollarSign}
            trend={{ value: '+22% vs mês passado', isPositive: true }}
            iconBgColor="bg-primary"
          />
          <StatCard
            title="Taxa de Cancelamento"
            value="3.2%"
            icon={Clock}
            trend={{ value: '-1.5% vs mês passado', isPositive: true }}
            iconBgColor="bg-destructive"
          />
        </div>

        {/* Weekly Schedule */}
        <WeeklySchedule />

        {/* Charts and Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <TopServices />
        </div>

        {/* Appointments List */}
        <AppointmentList />
      </div>
    </div>
  );
}