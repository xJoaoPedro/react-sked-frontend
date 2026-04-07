import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', receita: 4500 },
  { month: 'Fev', receita: 5200 },
  { month: 'Mar', receita: 4800 },
  { month: 'Abr', receita: 6100 },
  { month: 'Mai', receita: 5900 },
  { month: 'Jun', receita: 7200 },
];

export function RevenueChart() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Receita Mensal</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
          <XAxis 
            dataKey="month" 
            stroke="#6B6B6B"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#6B6B6B"
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #E8E8E8',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`R$ ${value}`, 'Receita']}
          />
          <Bar dataKey="receita" fill="#00A676" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
