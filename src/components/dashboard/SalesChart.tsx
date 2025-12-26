'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

// Dados mockados de 30 dias com tendência de crescimento
const generateMockData = () => {
  const data = [];
  const baseValue = 15000;
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Tendência de crescimento com variação aleatória
    const trend = (30 - i) * 500; // Crescimento linear
    const variation = Math.random() * 3000 - 1500; // Variação aleatória
    const value = Math.max(0, baseValue + trend + variation);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Math.round(value)
    });
  }
  
  return data;
};

export function SalesChart() {
  const [mockData, setMockData] = useState<Array<{ date: string; value: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMockData(generateMockData());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando gráfico...</div>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
        <LineChart
          data={mockData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Data
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.date}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Valor
                        </span>
                        <span className="font-bold font-mono">
                          {formatCurrency(payload[0].value || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--primary))"
            dot={false}
            activeDot={{
              r: 6,
              style: { fill: "hsl(var(--primary))" },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

