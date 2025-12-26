# Fase 6: Kanban Board - Core Feature

**Duração Estimada:** 3 horas  
**Pré-requisito:** Fase 5 concluída  
**Objetivo:** Implementar Kanban Board com Drag & Drop fluido  
**Status:** 🟡 Pendente

---

## Visão Geral

Esta é a **funcionalidade principal** do CRM. Criaremos:
1. **LeadCard** - Card individual do lead
2. **KanbanColumn** - Coluna do Kanban
3. **KanbanBoard** - Board completo com Drag & Drop
4. **Kanban Page** - Página do pipeline

---

## 6.1 Criar Componente LeadCard

### Arquivo: `src/components/kanban/LeadCard.tsx`

**Criar pasta e arquivo:**

```bash
mkdir -p src/components/kanban
touch src/components/kanban/LeadCard.tsx
```

**Conteúdo:**

```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/app/actions/leads';
import { formatCurrency, formatRelativeDate, getScoreColor } from '@/lib/utils';
import { Building2, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

export function LeadCard({ lead, isDragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
        isDragging && 'opacity-50'
      )}
    >
      <CardContent className="p-4">
        {/* Header com Nome e AI Score */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Building2 className="h-3 w-3 mr-1" />
              <span className="truncate">{lead.company}</span>
            </div>
          </div>
          <Badge 
            className={cn(
              'ml-2 text-white',
              getScoreColor(lead.aiScore)
            )}
          >
            {lead.aiScore}
          </Badge>
        </div>

        {/* Valor */}
        <div className="mb-3">
          <p className="text-lg font-bold text-primary">
            {formatCurrency(lead.value)}
          </p>
        </div>

        {/* Contatos (se existirem) */}
        {(lead.email || lead.phone) && (
          <div className="space-y-1 mb-3 text-xs text-muted-foreground">
            {lead.email && (
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                <span>{lead.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer com último contato */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Último contato: {formatRelativeDate(lead.lastContact)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Características do LeadCard

- **Draggable** (pode ser arrastado)
- **AI Score Badge** com cores (vermelho/amarelo/verde)
- **Valor em destaque**
- **Contatos opcionais** (email/telefone)
- **Último contato** (data relativa)

---

## 6.2 Criar Componente KanbanColumn

### Arquivo: `src/components/kanban/KanbanColumn.tsx`

**Criar arquivo:**

```bash
touch src/components/kanban/KanbanColumn.tsx
```

**Conteúdo:**

```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LeadStatus } from '@/app/actions/leads';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

const columnColors: Record<LeadStatus, string> = {
  prospect: 'border-t-blue-500',
  qualified: 'border-t-yellow-500',
  proposal: 'border-t-orange-500',
  closed: 'border-t-green-500',
};

export function KanbanColumn({ id, title, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card className={cn('flex flex-col h-full border-t-4', columnColors[id])}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          <span className="text-muted-foreground">({leads.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent 
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 min-h-[200px] transition-colors',
          isOver && 'bg-accent/50'
        )}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
```

### Características do KanbanColumn

- **Droppable** (aceita cards arrastados)
- **Borda colorida** no topo (azul/amarelo/laranja/verde)
- **Contador de leads** no header
- **Highlight ao hover** (durante drag)

---

## 6.3 Criar Componente KanbanBoard

### Arquivo: `src/components/kanban/KanbanBoard.tsx`

**Criar arquivo:**

```bash
touch src/components/kanban/KanbanBoard.tsx
```

**Conteúdo:**

```typescript
'use client';

import { useState, useOptimistic } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { updateLeadStatus, type Lead, type LeadStatus } from '@/app/actions/leads';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { useRouter } from 'next/navigation';

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: 'prospect', title: 'Prospect' },
  { id: 'qualified', title: 'Qualificado' },
  { id: 'proposal', title: 'Proposta' },
  { id: 'closed', title: 'Fechado' },
];

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Optimistic Updates para UI instantânea
  const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
    initialLeads,
    (state, { leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) => {
      return state.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
    }
  );

  // Configurar sensores para drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimento antes de iniciar drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    
    // Atualização otimista (UI instantânea)
    updateOptimisticLeads({ leadId, newStatus });
    
    // Atualização no servidor (background)
    try {
      await updateLeadStatus({ id: leadId, status: newStatus });
      router.refresh(); // Atualizar métricas do dashboard
    } catch (error) {
      console.error('Failed to update lead:', error);
      // TODO: Adicionar toast de erro e reverter estado
    }
    
    setActiveId(null);
  };

  const activeLead = optimisticLeads.find(lead => lead.id === activeId);

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map(column => {
          const columnLeads = optimisticLeads.filter(
            lead => lead.status === column.id
          );
          
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              leads={columnLeads}
            />
          );
        })}
      </div>
      
      {/* Overlay durante drag */}
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### Características do KanbanBoard

- **Drag & Drop** fluido com @dnd-kit
- **Optimistic Updates** (UI instantânea)
- **4 colunas fixas** (Prospect → Qualificado → Proposta → Fechado)
- **Overlay durante drag** (card segue o mouse)
- **Atualização automática** do dashboard

---

## 6.4 Criar Página Kanban

### Arquivo: `src/app/kanban/page.tsx`

**Criar pasta e arquivo:**

```bash
mkdir -p src/app/kanban
touch src/app/kanban/page.tsx
```

**Conteúdo:**

```typescript
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeads } from '../actions/leads';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export const metadata = {
  title: 'Pipeline | CRM FourSys',
  description: 'Gestão visual de leads',
};

export default async function KanbanPage() {
  const leads = await getLeads();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
```

---

## 6.5 Testar Kanban Board

### Iniciar Servidor

```bash
npm run dev
```

### Abrir Kanban

```
http://localhost:3000/kanban
```

### Testes Funcionais

- [ ] 4 colunas aparecem
- [ ] Leads distribuídos nas colunas corretas
- [ ] Contador de leads em cada coluna
- [ ] AI Score badge com cores corretas
- [ ] **Arrastar lead** entre colunas funciona
- [ ] **UI atualiza instantaneamente** (optimistic)
- [ ] **Recarregar página** mantém mudanças (persistência)
- [ ] Dashboard atualiza após mover lead

---

## 6.6 Optimistic Updates Explicado

### O Que São?

Atualizar a UI **antes** da resposta do servidor.

### Fluxo Normal (Sem Optimistic)

```
1. User arrasta card
2. Espera servidor responder (500ms)
3. UI atualiza
❌ Latência percebida: 500ms
```

### Fluxo com Optimistic Updates

```
1. User arrasta card
2. UI atualiza IMEDIATAMENTE (0ms)
3. Servidor atualiza em background
✅ Latência percebida: 0ms
```

### Implementação

```typescript
const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
  initialLeads,
  (state, { leadId, newStatus }) => {
    // Atualiza estado local instantaneamente
    return state.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
  }
);

// Ao arrastar
updateOptimisticLeads({ leadId, newStatus }); // UI instantânea
await updateLeadStatus({ id, status });       // Servidor em background
```

---

## Checklist de Conclusão

### Componentes Criados
- [ ] `LeadCard.tsx` criado
- [ ] `KanbanColumn.tsx` criado
- [ ] `KanbanBoard.tsx` criado
- [ ] Kanban page criada

### LeadCard
- [ ] Draggable funcionando
- [ ] AI Score badge com cores
- [ ] Valor formatado
- [ ] Contatos opcionais exibidos
- [ ] Último contato exibido

### KanbanColumn
- [ ] Droppable funcionando
- [ ] Borda colorida no topo
- [ ] Contador de leads
- [ ] Highlight ao hover

### KanbanBoard
- [ ] Drag & Drop funcionando
- [ ] 4 colunas renderizando
- [ ] Optimistic updates funcionando
- [ ] Overlay durante drag
- [ ] Persistência após reload

### Kanban Page
- [ ] Página acessível em `/kanban`
- [ ] Leads carregando do banco
- [ ] Botão "Novo Lead" (ainda sem ação)
- [ ] Metadata configurado

### Integração
- [ ] Server Actions funcionando
- [ ] Dashboard atualiza após mudanças
- [ ] Sem erros no console
- [ ] Sem erros TypeScript

---

## Troubleshooting

### Erro: "Cannot find module '@dnd-kit/core'"

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Erro: Drag não funciona

```typescript
// Verificar se 'use client' está no topo dos componentes
'use client';
```

### Erro: Optimistic updates não funcionam

```typescript
// Verificar se useOptimistic está importado
import { useOptimistic } from 'react';

// Nota: Requer React 18+
```

### Erro: Cards não aparecem nas colunas

```bash
# Verificar se banco tem dados
npm run db:studio

# Verificar status dos leads (deve ser: prospect, qualified, proposal, closed)
```

---

## Próxima Fase

➡️ **Fase 7: Modal de Criação de Leads**
- Criar schema de validação (Zod)
- Criar modal de criação
- Integrar com Server Action
- Implementar validação em tempo real

**Arquivo:** `docs/design/fase-07-modal-criacao.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

