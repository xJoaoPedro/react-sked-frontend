import { Card } from './ui/card';

const weekDays = [
  { day: 'Seg', date: '27', appointments: 8 },
  { day: 'Ter', date: '28', appointments: 12 },
  { day: 'Qua', date: '29', appointments: 10 },
  { day: 'Qui', date: '30', appointments: 15 },
  { day: 'Sex', date: '31', appointments: 14, isToday: true },
  { day: 'Sáb', date: '1', appointments: 6 },
  { day: 'Dom', date: '2', appointments: 3 },
];

export function WeeklySchedule() {
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
                ? 'border-[#00A676] bg-[#00A676]/5' 
                : 'border-border hover:border-[#00A676]/50'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-1">{day.day}</p>
            <p className={`text-2xl font-semibold mb-3 ${
              day.isToday ? 'text-[#00A676]' : 'text-foreground'
            }`}>
              {day.date}
            </p>
            
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-[#00A676] rounded-full transition-all"
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
