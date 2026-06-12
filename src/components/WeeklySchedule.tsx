import { Card } from './ui/card';
import { getDateKeyInTimeZone } from '@/lib/parsers';

interface DashboardProps {
  weekStats: {
    day: string;
    date: string;
    appointments: number;
    isToday?: boolean;
  }[];
}

const dayMap = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

const weekStatsMapper = (item) => {
  const dow = Number(item.dow)
  const dateOnly = getDateKeyInTimeZone(item.date)
  const day = Number(dateOnly.split("-")[2])

  const today = getDateKeyInTimeZone(new Date())

  return {
    day: dayMap[dow],
    date: String(day),
    appointments: item.appointments,
    isToday: dateOnly === today,
  }
}


export function WeeklySchedule({ weekStats }: DashboardProps) {
  const weekDays = weekStats.map(weekStatsMapper)
  
  const maxAppointments = Math.max(...weekDays.map(d => d.appointments), 0);

  return (
    <Card className="gap-0 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">Visão Semanal</h3>
      
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-7">
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className={`rounded-lg border-2 p-3 transition-all sm:p-4 sm:text-center ${
              day.isToday 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 sm:block">
              <div className="min-w-0 flex-1 sm:mb-3">
                <p className="mb-1 text-xs text-muted-foreground sm:text-sm">{day.day}</p>
                <p className={`text-xl font-semibold sm:text-2xl ${
                  day.isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {day.date}
                </p>
              </div>

              <div className="min-w-0 flex-[1.3] space-y-1 sm:flex-none">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: day.appointments === 0 || maxAppointments === 0 ? '0' : `${(day.appointments / maxAppointments) * 100}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-muted-foreground sm:mt-2 sm:text-center sm:text-xs">
                  {day.appointments} agend.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
