import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueItem {
  month: string
  total: number
}

interface RevenueProps {
  revenue: RevenueItem[]
}


const monthMap = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function RevenueChart({ revenue }: RevenueProps) {
  const data = revenue.map((item) => {
    const month = Number(item.month.split('-')[1]) - 1
    
    return {
      month: monthMap[month],
      receita: item.total
    }
  })
  
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
