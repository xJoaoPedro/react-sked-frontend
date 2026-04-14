import { Card } from './ui/card';

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
  const dateOnly = item.date.split("T")[0]
  const day = Number(dateOnly.split("-")[2])

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  })

  return {
    day: dayMap[dow],
    date: String(day),
    appointments: item.appointments,
    isToday: dateOnly === today,
  }
}


export function WeeklySchedule({ weekStats }: DashboardProps) {
  console.log(weekStats)

  const weekDays = weekStats.map(weekStatsMapper)
  
  const maxAppointments = Math.max(...weekDays.map(d => d.appointments));

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Visão Semanal</h3>
      
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className={`text-center p-4 rounded-lg border-2 transition-all ${
              day.isToday 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-1">{day.day}</p>
            <p className={`text-2xl font-semibold mb-3 ${
              day.isToday ? 'text-primary' : 'text-foreground'
            }`}>
              {day.date}
            </p>
            
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(day.appointments / maxAppointments) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {day.appointments} agend.
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
