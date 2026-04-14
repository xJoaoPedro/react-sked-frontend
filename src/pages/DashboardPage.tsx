import { StatCard } from "../components/StatCard";
import { AppointmentList } from "../components/AppointmentList";
import { RevenueChart } from "../components/RevenueChart";
import { WeeklySchedule } from "../components/WeeklySchedule";
import { TopServices } from "../components/TopServices";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";

export function DashboardPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null)


  useEffect(() => {
    if (dados === null) return;

    setDataState(dados.dashboard)
  }, [dados, data]);

  if (data === null) return <div>Carregando...</div>

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
            value={3}
            icon={Calendar}
          />
          <StatCard
            title="Total de Clientes"
            value={data.totalClients}
            icon={Users}
            trend={{ value: data.clientsPercentage.toFixed(1) }}
          />
          <StatCard
            title="Receita Mensal"
            value={`R$ ${data.monthlyRevenue}`}
            icon={DollarSign}
            trend={{ value: data.revenuePercentage.toFixed(1)}}
          />
          <StatCard
            title="Taxa de Cancelamento"
            value={`${data.cancelRate.toFixed(1)}%`}
            icon={Clock}
            trend={{ value: data.cancelPercentage.toFixed(1), inverted: true}}
          />
        </div>

        {/* Weekly Schedule */}
        <WeeklySchedule weekStats={data.weekStats} />

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
