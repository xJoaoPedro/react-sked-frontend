import { StatCard } from "../components/StatCard";
import { AppointmentList } from "../components/AppointmentList";
import { RevenueChart } from "../components/RevenueChart";
import { WeeklySchedule } from "../components/WeeklySchedule";
import { TopServices } from "../components/TopServices";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { dateKeyToIsoString, formatPrice, getDateKeyInTimeZone } from "@/lib/parsers";
import { LoadingPage } from "./LoadingPage";
import { api } from "@/lib/api";

export function DashboardPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);

  useEffect(() => {
    if (dados === null) return;

    const dashboard = dados.dashboard;
    const dailyAppointments = Array.isArray(dados?.dailySchedules?.appointments)
      ? dados.dailySchedules.appointments
      : null;

    if (!dashboard) {
      setDataState(null);
      return;
    }

    if (!dailyAppointments) {
      setDataState(dashboard);
      return;
    }

    const todayKey = getDateKeyInTimeZone(new Date());
    const totalToday = dailyAppointments.filter((appointment) =>
      getDateKeyInTimeZone(appointment.start_time) === todayKey,
    ).length;

    const weekStats = Array.isArray(dashboard.weekStats)
      ? dashboard.weekStats.map((item) =>
          getDateKeyInTimeZone(item.date) === todayKey
            ? { ...item, appointments: totalToday }
            : item,
        )
      : [];

    setDataState({
      ...dashboard,
      totalToday,
      weekStats,
    });
  }, [dados]);

  useEffect(() => {
    if (!dados?.dashboard || !dados?.dailySchedules?.id) return;
    if (!Array.isArray(dados.dashboard.weekStats) || dados.dashboard.weekStats.length === 0) return;

    let isActive = true;

    async function syncWeekStats() {
      try {
        const scheduleId = dados.dailySchedules.id;
        const weekStatsWithCounts = await Promise.all(
          dados.dashboard.weekStats.map(async (item) => {
            const requestDate = dateKeyToIsoString(getDateKeyInTimeZone(item.date));
            const response = (
              await api.get(`/appointments/${scheduleId}/${requestDate}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              })
            ).data.data;

            const appointmentCount = Array.isArray(response)
              ? response.filter((appointment) =>
                  getDateKeyInTimeZone(appointment.start_time) === getDateKeyInTimeZone(item.date),
                ).length
              : 0;

            return {
              ...item,
              appointments: appointmentCount,
            };
          }),
        );

        if (!isActive) return;

        const todayKey = getDateKeyInTimeZone(new Date());
        const todayCount =
          weekStatsWithCounts.find((item) => getDateKeyInTimeZone(item.date) === todayKey)
            ?.appointments ?? 0;

        setDataState((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            totalToday: todayCount,
            weekStats: weekStatsWithCounts,
          };
        });
      } catch (error) {
        console.error("Erro ao sincronizar weekStats:", error);
      }
    }

    syncWeekStats();

    return () => {
      isActive = false;
    };
  }, [dados]);

  if (data === null) return <LoadingPage />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={`Painel ${dados?.settings?.fantasy_name ?? ""}`}
        subtitle="Bem-vindo de volta! Aqui está o resumo de hoje."
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Agendamentos Hoje"
            value={data.totalToday}
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
            value={formatPrice(data.monthlyRevenue)}
            icon={DollarSign}
            trend={{ value: data.revenuePercentage.toFixed(1) }}
          />
          <StatCard
            title="Taxa de Cancelamento"
            value={`${data.cancelRate.toFixed(1)}%`}
            icon={Clock}
            trend={{ value: data.cancelPercentage.toFixed(1), inverted: true }}
          />
        </div>

        {/* Weekly Schedule */}
        <WeeklySchedule weekStats={data.weekStats} />

        {/* Charts and Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart revenue={data.revenueLastMonths} />
          <TopServices services={data.topServices} />
        </div>

        {/* Appointments List */}
        <AppointmentList appointments={data.nextAppointments} />
      </div>
    </div>
  );
}
