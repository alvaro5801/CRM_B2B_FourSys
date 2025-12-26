# Fase 5: Dashboard - Métricas e Gráficos

**Duração Estimada:** 2 horas  
**Pré-requisito:** Fase 4 concluída  
**Objetivo:** Criar dashboard com cards de métricas e gráfico de vendas  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, criaremos:
1. **MetricCard** - Card individual de métrica
2. **SalesChart** - Gráfico de linha (Recharts)
3. **Dashboard Page** - Página principal com métricas

---

## 5.1 Criar Componente MetricCard

### Arquivo: `src/components/dashboard/MetricCard.tsx`

**Criar pasta e arquivo:**

```bash
mkdir -p src/components/dashboard
touch src/components/dashboard/MetricCard.tsx
```

**Conteúdo:**

```typescript
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: MetricCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            'text-xs mt-1',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Características do MetricCard

- **Ícone no canto superior direito**
- **Valor em destaque** (grande e bold)
- **Descrição opcional** (texto secundário)
- **Trend opcional** (seta e percentual)

---

## 5.2 Criar Componente SalesChart

### Arquivo: `src/components/dashboard/SalesChart.tsx`

**Criar arquivo:**

```bash
touch src/components/dashboard/SalesChart.tsx
```

**Conteúdo:**

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dados mockados para o gráfico (últimos 30 dias)
const generateMockData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Math.floor(Math.random() * 15000) + 5000
    });
  }
  
  return data;
};

const chartData = generateMockData();

export function SalesChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Vendas nos Últimos 30 Dias</CardTitle>
        <CardDescription>
          Evolução do pipeline de vendas
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
                          <span className="font-bold">
                            R$ {payload[0].value?.toLocaleString('pt-BR')}
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
              activeDot={{
                r: 6,
                style: { fill: "hsl(var(--primary))" }
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Características do SalesChart

- **30 pontos de dados** (últimos 30 dias)
- **Dados mockados** (aleatórios entre 5k e 20k)
- **Tooltip customizado** (mostra data e valor)
- **Responsivo** (adapta ao tamanho do container)
- **Animação suave** ao carregar

---

## 5.3 Criar Página Dashboard

### Arquivo: `src/app/page.tsx`

**Substituir conteúdo completo:**

```typescript
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { getDashboardMetrics } from './actions/leads';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Pipeline Total"
          value={formatCurrency(metrics.pipelineTotal)}
          icon={DollarSign}
          description="Valor total de leads ativos"
        />
        <MetricCard
          title="Leads Ativos"
          value={metrics.activeLeads}
          icon={Users}
          description="Leads em negociação"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          description="Média de fechamento"
        />
      </div>

      {/* Gráfico */}
      <div className="grid gap-4 md:grid-cols-1">
        <SalesChart />
      </div>
    </div>
  );
}
```

---

## 5.4 Layout do Dashboard

### Estrutura Visual

```
┌─────────────────────────────────────────────────────┐
│ Dashboard                                           │
├─────────────────┬─────────────────┬─────────────────┤
│ Pipeline Total  │ Leads Ativos    │ Taxa Conversão  │
│ R$ 150.000,00   │ 12              │ 23,5%           │
│ 💰              │ 👥              │ 📈              │
├─────────────────────────────────────────────────────┤
│                                                     │
│           Vendas nos Últimos 30 Dias                │
│                                                     │
│           [Gráfico de Linha]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5.5 Testar Dashboard

### Iniciar Servidor

```bash
npm run dev
```

### Abrir Dashboard

```
http://localhost:3000
```

### Verificações

- [ ] 3 cards de métricas aparecem
- [ ] Valores são carregados do banco
- [ ] Valores formatados corretamente (R$, números)
- [ ] Gráfico renderiza sem erros
- [ ] Gráfico mostra 30 pontos
- [ ] Tooltip funciona ao passar mouse
- [ ] Layout responsivo (testar redimensionar janela)

---

## 5.6 Responsividade

### Desktop (> 768px)

- 3 colunas de cards
- Gráfico ocupa largura total

### Tablet (768px)

- 2 colunas de cards
- Gráfico ocupa largura total

### Mobile (< 640px)

- 1 coluna de cards (empilhados)
- Gráfico ocupa largura total

### Testar

```bash
# Abrir DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Testar em diferentes tamanhos
```

---

## 5.7 Adicionar Metadata (SEO)

### Arquivo: `src/app/page.tsx`

**Adicionar no topo (antes do component):**

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | CRM FourSys',
  description: 'Visão geral das métricas de vendas',
};

export default async function DashboardPage() {
  // ... código existente
}
```

---

## Checklist de Conclusão

### Componentes Criados
- [ ] `MetricCard.tsx` criado
- [ ] `SalesChart.tsx` criado
- [ ] Dashboard page atualizada

### MetricCard
- [ ] Props configuráveis (title, value, icon, description)
- [ ] Trend opcional implementado
- [ ] Ícone no canto superior direito
- [ ] Valor em destaque

### SalesChart
- [ ] Recharts instalado e funcionando
- [ ] 30 pontos de dados gerados
- [ ] Tooltip customizado
- [ ] Responsivo
- [ ] Animação suave

### Dashboard Page
- [ ] 3 MetricCards renderizando
- [ ] Métricas carregando do banco (getDashboardMetrics)
- [ ] Valores formatados corretamente
- [ ] SalesChart renderizando
- [ ] Layout responsivo

### Integração
- [ ] Server Actions funcionando
- [ ] Formatação de moeda aplicada
- [ ] Sem erros no console
- [ ] Sem erros TypeScript

### SEO
- [ ] Metadata configurado
- [ ] Title e description definidos

---

## Troubleshooting

### Erro: "Module not found: recharts"

```bash
npm install recharts
```

### Erro: Gráfico não renderiza

```typescript
// Verificar se 'use client' está no topo de SalesChart.tsx
'use client';
```

### Erro: Métricas retornam 0

```bash
# Verificar se banco tem dados
npm run db:studio

# Se vazio, popular novamente
npm run db:seed
```

### Erro: Layout quebrado em mobile

```typescript
// Verificar classes Tailwind
<div className="grid gap-4 md:grid-cols-3">
  // md:grid-cols-3 = 3 colunas em telas médias+
  // Padrão = 1 coluna em mobile
</div>
```

---

## Melhorias Futuras (Pós-MVP)

1. **Filtros de Data** - Selecionar período do gráfico
2. **Mais Gráficos** - Pizza, barras, etc.
3. **Exportar Dados** - CSV, PDF
4. **Atualização em Tempo Real** - WebSockets
5. **Comparação de Períodos** - Mês anterior, ano anterior

---

## Próxima Fase

➡️ **Fase 6: Kanban Board - Core Feature**
- Criar LeadCard component
- Criar KanbanColumn component
- Criar KanbanBoard com Drag & Drop
- Implementar Optimistic Updates

**Arquivo:** `docs/design/fase-06-kanban-board.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

