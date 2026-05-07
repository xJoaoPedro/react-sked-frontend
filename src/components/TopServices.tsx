import { Card } from './ui/card';
import { ChartBar, ListX, TrendingUp } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';

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
    <Card className="p-6 justify-start gap-0 h-96">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Serviços Mais Agendados</h3>
        {services.length > 0 ? <TrendingUp className="w-5 h-5 text-primary" /> : <ListX className="w-5 h-5 text-primary" /> }
        
      </div>

      {services.length > 0 ? (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
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
                  style={{ width: `${service.total > 0 ? (service.total / maxTotal) * 50 : 0 }%`}}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartBar />
            </EmptyMedia>
            <EmptyTitle className='text-muted-foreground'>Não há serviços criados para listar.</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </Card>
  );
}
