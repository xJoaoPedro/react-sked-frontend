import { Card } from './ui/card';
import { TrendingUp } from 'lucide-react';

const services = [
  { name: 'Corte de Cabelo', count: 145, percentage: 32, trend: '+12%' },
  { name: 'Massagem', count: 98, percentage: 22, trend: '+8%' },
  { name: 'Manicure', count: 87, percentage: 19, trend: '+5%' },
  { name: 'Consulta', count: 76, percentage: 17, trend: '+15%' },
  { name: 'Depilação', count: 45, percentage: 10, trend: '-3%' },
];

export function TopServices() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Serviços Mais Agendados</h3>
        <TrendingUp className="w-5 h-5 text-[#00A676]" />
      </div>
      
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{service.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{service.count} agendamentos</span>
                <span className={`text-sm ${
                  service.trend.startsWith('+') ? 'text-[#00A676]' : 'text-[#E63946]'
                }`}>
                  {service.trend}
                </span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-[#00A676] rounded-full transition-all"
                style={{ width: `${service.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}