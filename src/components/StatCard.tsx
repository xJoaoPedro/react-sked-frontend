import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number,
    inverted?: boolean,
  };
}

export function StatCard({ title, value, icon: Icon, trend}: StatCardProps) {
  let trendElement = null;
  let iconBgColor = 'bg-foreground';

  if (trend?.value !== undefined) {
    if (trend?.value > 0) {
    trendElement = (
      <p className={`text-sm ${trend?.inverted ? 'text-destructive' : 'text-primary'}`}>
        ↑ +{trend.value}% em relação ao mês passado
      </p>
    );

    iconBgColor = trend?.inverted ? 'bg-destructive' : 'bg-primary'
  } else if (trend?.value < 0) {
    trendElement = (
      <p className={`text-sm ${trend?.inverted ? 'text-primary' : 'text-destructive'}`}>
        ↓ {trend.value}% em relação ao mês passado
      </p>
    );

    iconBgColor = trend?.inverted ? 'bg-primary' : 'bg-destructive'
  } else {
    trendElement = (
      <p className="text-sm text-gray-500">
        • 0% em relação ao mês passado
      </p>
    );

    iconBgColor = 'bg-gray-500'
  } 
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-foreground mb-2">{value}</h3>
          {trendElement}
        </div>
        <div className={`${iconBgColor} p-4 rounded-lg`}>
          <Icon className="w-6 h-6 text-popover" />
        </div>
      </div>
    </Card>
  );
}