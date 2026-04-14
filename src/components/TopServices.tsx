import { Card } from './ui/card';
import { TrendingUp } from 'lucide-react';

interface ServicesItem {
  name: string
  total: number
}

interface TopServicesProps {
  services: ServicesItem[]
}

export function TopServices({services}: TopServicesProps) {
  const maxTotal = Math.max(...services.map(d => d.total));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Serviços Mais Agendados</h3>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{service.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{service.total} agendamentos</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(service.total / maxTotal) * 50}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}