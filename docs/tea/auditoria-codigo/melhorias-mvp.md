# 💡 Melhorias Recomendadas para MVP

**Data:** 25/12/2025  
**QA Engineer:** TEA Agent  
**Status:** 📝 Recomendações  
**Prioridade:** P2-P3 (Opcional para MVP, Recomendado para Produção)

---

## 📋 Visão Geral

Este documento lista melhorias que não são críticas para o MVP funcionar, mas que aumentariam significativamente a qualidade, usabilidade e manutenibilidade do sistema.

---

## 🎨 Melhorias de UX/UI

### 1. Confirmação ao Mover para "Fechado"

**Prioridade:** P2 (Média)  
**Tempo:** 1 hora  
**Impacto:** Previne movimentos acidentais

#### Descrição

Adicionar modal de confirmação quando usuário move lead para coluna "Fechado", pois é uma ação importante.

#### Implementação

```typescript
// src/components/kanban/KanbanBoard.tsx

const handleDragEnd = async (event: DragEndEvent) => {
  // ... código existente ...
  
  // Se movendo para "closed", pedir confirmação
  if (newStatus === 'closed') {
    const confirmed = await showConfirmDialog({
      title: 'Fechar Lead?',
      description: `Tem certeza que deseja marcar "${lead.name}" como fechado?`,
      confirmText: 'Sim, Fechar',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) {
      setActiveId(null);
      return;
    }
  }
  
  // Continuar com atualização...
};
```

---

### 2. Undo/Redo ao Mover Lead

**Prioridade:** P3 (Baixa)  
**Tempo:** 2-3 horas  
**Impacto:** Melhor UX, permite desfazer erros

#### Descrição

Adicionar botão "Desfazer" no toast após mover lead, permitindo reverter a ação.

#### Implementação

```typescript
// src/components/kanban/KanbanBoard.tsx

const handleDragEnd = async (event: DragEndEvent) => {
  // ... atualização otimista ...
  
  const previousStatus = lead.status;
  
  try {
    await updateLeadStatus({ id: leadId, status: newStatus });
    
    toast.success('Lead movido!', {
      description: `Movido para ${STATUS_LABELS[newStatus]}.`,
      duration: 5000, // Mais tempo para permitir undo
      action: {
        label: 'Desfazer',
        onClick: async () => {
          // Reverter para status anterior
          updateOptimisticLeads({ leadId, newStatus: previousStatus });
          await updateLeadStatus({ id: leadId, status: previousStatus });
          toast.success('Ação desfeita!');
        },
      },
    });
  } catch (error) {
    // ... tratamento de erro ...
  }
};
```

---

### 3. Filtros no Kanban

**Prioridade:** P2 (Média)  
**Tempo:** 3-4 horas  
**Impacto:** Facilita encontrar leads específicos

#### Descrição

Adicionar filtros por AI Score, valor e data de último contato.

#### Implementação

```typescript
// src/components/kanban/KanbanFilters.tsx

export function KanbanFilters() {
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    minValue: 0,
    maxValue: Infinity,
    lastContactDays: null,
  });
  
  return (
    <div className="flex gap-4 mb-4">
      <Select
        value={filters.minScore.toString()}
        onValueChange={(value) => setFilters({ ...filters, minScore: parseInt(value) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="AI Score Mínimo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Todos</SelectItem>
          <SelectItem value="40">Médio (40+)</SelectItem>
          <SelectItem value="70">Alto (70+)</SelectItem>
          <SelectItem value="85">Muito Alto (85+)</SelectItem>
        </SelectContent>
      </Select>
      
      <Input
        type="number"
        placeholder="Valor Mínimo"
        onChange={(e) => setFilters({ ...filters, minValue: parseFloat(e.target.value) || 0 })}
      />
      
      <Select
        value={filters.lastContactDays?.toString() || 'all'}
        onValueChange={(value) => setFilters({ 
          ...filters, 
          lastContactDays: value === 'all' ? null : parseInt(value) 
        })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Último Contato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="7">Últimos 7 dias</SelectItem>
          <SelectItem value="30">Últimos 30 dias</SelectItem>
          <SelectItem value="90">Últimos 90 dias</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        onClick={() => setFilters({
          minScore: 0,
          maxScore: 100,
          minValue: 0,
          maxValue: Infinity,
          lastContactDays: null,
        })}
      >
        Limpar Filtros
      </Button>
    </div>
  );
}
```

---

### 4. Busca de Leads

**Prioridade:** P2 (Média)  
**Tempo:** 2 horas  
**Impacto:** Encontrar leads rapidamente

#### Descrição

Adicionar campo de busca por nome, empresa ou email.

#### Implementação

```typescript
// src/components/kanban/LeadSearch.tsx

export function LeadSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  
  const handleSearch = useDeferredValue(query);
  
  useEffect(() => {
    onSearch(handleSearch);
  }, [handleSearch, onSearch]);
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por nome, empresa ou email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => setQuery('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Uso no KanbanBoard
const [searchQuery, setSearchQuery] = useState('');

const filteredLeads = optimisticLeads.filter(lead => {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  return (
    lead.name.toLowerCase().includes(query) ||
    lead.company.toLowerCase().includes(query) ||
    lead.email?.toLowerCase().includes(query)
  );
});
```

---

### 5. Animação de Confetti ao Fechar Lead

**Prioridade:** P3 (Baixa)  
**Tempo:** 1 hora  
**Impacto:** Celebra conquista, melhora UX

#### Descrição

Mostrar animação de confetti quando lead é movido para "Fechado".

#### Implementação

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

```typescript
// src/lib/confetti.ts
import confetti from 'canvas-confetti';

export function celebrateClosedLead() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
  });
}

// No KanbanBoard
if (newStatus === 'closed') {
  await updateLeadStatus({ id: leadId, status: newStatus });
  celebrateClosedLead(); // 🎉
  toast.success('🎉 Lead fechado com sucesso!', {
    description: 'Parabéns pela venda!',
  });
}
```

---

## 📊 Melhorias de Dashboard

### 6. Gráfico com Dados Reais

**Prioridade:** P1 (Alta)  
**Tempo:** 2-3 horas  
**Impacto:** Dashboard mostra dados reais

#### Descrição

Substituir dados mockados do gráfico por dados reais do banco.

#### Implementação

```typescript
// src/app/actions/leads.ts

export async function getSalesChartData(): Promise<ChartData[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const closedLeads = await prisma.lead.findMany({
    where: {
      status: 'closed',
      updatedAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });
  
  // Agrupar por dia
  const dataByDay = closedLeads.reduce((acc, lead) => {
    const day = lead.updatedAt.toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day] += lead.value;
    return acc;
  }, {} as Record<string, number>);
  
  // Converter para array
  return Object.entries(dataByDay).map(([date, value]) => ({
    date,
    value,
  }));
}
```

---

### 7. Métricas Adicionais

**Prioridade:** P2 (Média)  
**Tempo:** 2 horas  
**Impacto:** Mais insights para usuário

#### Descrição

Adicionar métricas como:
- Ticket médio
- Tempo médio de fechamento
- Taxa de conversão real (calculada)
- Leads por status

#### Implementação

```typescript
// src/app/actions/leads.ts

export interface ExtendedDashboardMetrics extends DashboardMetrics {
  averageTicket: number;
  averageClosingTime: number; // em dias
  realConversionRate: number;
  leadsByStatus: Record<LeadStatus, number>;
}

export async function getExtendedDashboardMetrics(): Promise<ExtendedDashboardMetrics> {
  const [
    pipelineResult,
    activeLeads,
    closedLeads,
    allLeads,
  ] = await Promise.all([
    prisma.lead.aggregate({
      where: { status: { not: 'closed' } },
      _sum: { value: true },
    }),
    prisma.lead.count({
      where: { status: { not: 'closed' } },
    }),
    prisma.lead.findMany({
      where: { status: 'closed' },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);
  
  // Calcular ticket médio
  const averageTicket = closedLeads.length > 0
    ? closedLeads.reduce((sum, lead) => sum + lead.value, 0) / closedLeads.length
    : 0;
  
  // Calcular tempo médio de fechamento
  const closingTimes = closedLeads.map(lead => {
    const created = new Date(lead.createdAt);
    const closed = new Date(lead.updatedAt);
    return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // dias
  });
  const averageClosingTime = closingTimes.length > 0
    ? closingTimes.reduce((sum, time) => sum + time, 0) / closingTimes.length
    : 0;
  
  // Calcular taxa de conversão real
  const totalLeads = activeLeads + closedLeads.length;
  const realConversionRate = totalLeads > 0
    ? (closedLeads.length / totalLeads) * 100
    : 0;
  
  // Agrupar por status
  const leadsByStatus = allLeads.reduce((acc, { status, _count }) => {
    acc[status as LeadStatus] = _count;
    return acc;
  }, {} as Record<LeadStatus, number>);
  
  return {
    pipelineTotal: pipelineResult._sum.value || 0,
    activeLeads,
    conversionRate: realConversionRate,
    averageTicket,
    averageClosingTime,
    realConversionRate,
    leadsByStatus,
  };
}
```

---

## 🔧 Melhorias Técnicas

### 8. Loading States Melhores

**Prioridade:** P2 (Média)  
**Tempo:** 2 horas  
**Impacto:** Melhor feedback visual

#### Descrição

Adicionar skeletons e loading states mais elaborados.

#### Implementação

```typescript
// src/components/ui/skeleton.tsx

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// src/components/kanban/KanbanSkeleton.tsx

export function KanbanSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="space-y-4">
          <Skeleton className="h-8 w-32" />
          {[1, 2, 3].map((card) => (
            <Skeleton key={card} className="h-32 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Uso
<Suspense fallback={<KanbanSkeleton />}>
  <KanbanBoard initialLeads={leads} />
</Suspense>
```

---

### 9. Error Boundaries

**Prioridade:** P1 (Alta)  
**Tempo:** 1-2 horas  
**Impacto:** Previne quebra total da aplicação

#### Descrição

Adicionar Error Boundaries para capturar erros de renderização.

#### Implementação

```typescript
// src/components/error-boundary.tsx

'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Enviar para Sentry, etc.
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Uso no layout
<ErrorBoundary>
  <KanbanBoard initialLeads={leads} />
</ErrorBoundary>
```

---

### 10. Debounce em Operações

**Prioridade:** P2 (Média)  
**Tempo:** 1 hora  
**Impacto:** Reduz requests desnecessários

#### Descrição

Adicionar debounce em busca e outras operações frequentes.

#### Implementação

```typescript
// src/lib/hooks/useDebounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Uso na busca
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  // Buscar apenas após 300ms sem digitar
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 📱 Melhorias Mobile

### 11. Gestos Touch para Mobile

**Prioridade:** P2 (Média)  
**Tempo:** 2-3 horas  
**Impacto:** Melhor UX em mobile

#### Descrição

Adicionar swipe gestures para ações rápidas em mobile.

#### Implementação

```bash
npm install framer-motion
```

```typescript
// src/components/kanban/SwipeableLeadCard.tsx

import { motion, PanInfo } from 'framer-motion';

export function SwipeableLeadCard({ lead }: { lead: Lead }) {
  const handleDragEnd = (event: any, info: PanInfo) => {
    // Swipe para direita = próximo status
    if (info.offset.x > 100) {
      moveToNextStatus(lead);
    }
    // Swipe para esquerda = status anterior
    else if (info.offset.x < -100) {
      moveToPreviousStatus(lead);
    }
  };
  
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <LeadCard lead={lead} />
    </motion.div>
  );
}
```

---

## 📈 Resumo de Prioridades

| Melhoria | Prioridade | Tempo | Impacto | Fase |
|----------|------------|-------|---------|------|
| Error Boundaries | P1 | 1-2h | Alto | MVP |
| Gráfico Real | P1 | 2-3h | Alto | MVP |
| Confirmação Fechar | P2 | 1h | Médio | Pós-MVP |
| Filtros Kanban | P2 | 3-4h | Médio | Pós-MVP |
| Busca | P2 | 2h | Médio | Pós-MVP |
| Loading States | P2 | 2h | Médio | Pós-MVP |
| Métricas Extras | P2 | 2h | Médio | Pós-MVP |
| Debounce | P2 | 1h | Baixo | Pós-MVP |
| Gestos Mobile | P2 | 2-3h | Médio | Pós-MVP |
| Undo/Redo | P3 | 2-3h | Baixo | Futuro |
| Confetti | P3 | 1h | Baixo | Futuro |

**Tempo Total:** ~20-30 horas

---

## 🎯 Roadmap Sugerido

### Sprint 1 (Pós-MVP Imediato)
- Error Boundaries
- Gráfico com dados reais
- **Tempo:** 3-5 horas

### Sprint 2 (Primeira Semana)
- Confirmação ao fechar
- Busca de leads
- Loading states melhores
- **Tempo:** 5 horas

### Sprint 3 (Segundo Mês)
- Filtros no Kanban
- Métricas adicionais
- Debounce
- **Tempo:** 6-7 horas

### Sprint 4 (Futuro)
- Undo/Redo
- Confetti
- Gestos mobile
- **Tempo:** 5-7 horas

---

## 📞 Contato

**QA Engineer:** TEA Agent  
**Para sugestões:** tea@foursys.com  
**Última Atualização:** 25/12/2025

---

**Próximo Documento:** [Melhorias para Produção](./melhorias-producao.md)



