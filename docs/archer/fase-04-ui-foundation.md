# Fase 4: UI Foundation - Shadcn Components

**Duração Estimada:** 30 minutos  
**Pré-requisito:** Fase 3 concluída  
**Objetivo:** Criar componentes UI auxiliares reutilizáveis  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, criaremos:
- Utilitários de formatação (moeda, data, scores)
- Componente Loading
- Componente EmptyState

Estes componentes serão usados em todo o projeto.

---

## 4.1 Criar Utilitários de Formatação

### Arquivo: `src/lib/utils.ts`

**Este arquivo já existe** (criado pelo Shadcn/ui). Vamos **adicionar** funções ao final.

**Editar e adicionar ao final:**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// FORMATAÇÃO
// ============================================

/**
 * Formatar valor monetário em R$
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 15.000,00")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formatar data no padrão brasileiro
 * @param date - Date ou string ISO
 * @returns String formatada (ex: "25/12/2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

/**
 * Formatar data relativa
 * @param date - Date ou string ISO
 * @returns String relativa (ex: "Há 2 dias", "Ontem", "Hoje")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `Há ${diffInDays} dias`;
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`;
  return formatDate(d);
}

// ============================================
// AI SCORE
// ============================================

/**
 * Obter cor do badge baseado no AI Score
 * @param score - Score de 0 a 100
 * @returns Classe Tailwind de cor
 */
export function getScoreColor(score: number): string {
  if (score <= 40) return 'bg-red-500';    // Baixa prioridade
  if (score <= 70) return 'bg-yellow-500'; // Média prioridade
  return 'bg-green-500';                    // Alta prioridade
}

/**
 * Obter label do AI Score
 * @param score - Score de 0 a 100
 * @returns Label descritivo
 */
export function getScoreLabel(score: number): string {
  if (score <= 40) return 'Baixa';
  if (score <= 70) return 'Média';
  return 'Alta';
}
```

### Testar Funções (Console do Navegador)

```typescript
// Abrir console no navegador e testar:
import { formatCurrency, formatRelativeDate, getScoreColor } from '@/lib/utils';

formatCurrency(15000);           // "R$ 15.000,00"
formatRelativeDate(new Date());  // "Hoje"
getScoreColor(85);               // "bg-green-500"
```

---

## 4.2 Criar Componente de Loading

### Arquivo: `src/components/ui/loading.tsx`

**Criar arquivo:**

```typescript
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
    </div>
  );
}
```

### Uso do Componente

```typescript
// Loading pequeno (inline)
<Loading size="sm" />

// Loading médio (padrão)
<Loading />

// Loading grande (página inteira)
<Loading size="lg" className="h-screen" />
```

---

## 4.3 Criar Componente de Empty State

### Arquivo: `src/components/ui/empty-state.tsx`

**Criar arquivo:**

```typescript
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
```

### Uso do Componente

```typescript
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

// Exemplo: Kanban vazio
<EmptyState
  icon={Inbox}
  title="Nenhum lead encontrado"
  description="Comece criando seu primeiro lead para visualizar no pipeline."
  action={<Button>Criar Lead</Button>}
/>
```

---

## 4.4 Criar Página de Teste (Opcional)

### Arquivo: `src/app/test-ui/page.tsx`

```typescript
import { Inbox, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatRelativeDate, getScoreColor } from '@/lib/utils';

export default function TestUIPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Teste de Componentes UI</h1>

      {/* Formatação */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Formatação</h2>
        <div className="space-y-2">
          <p>Moeda: {formatCurrency(15000)}</p>
          <p>Data relativa: {formatRelativeDate(new Date())}</p>
          <p>Score baixo: <span className={`px-2 py-1 rounded ${getScoreColor(30)}`}>30</span></p>
          <p>Score médio: <span className={`px-2 py-1 rounded ${getScoreColor(60)}`}>60</span></p>
          <p>Score alto: <span className={`px-2 py-1 rounded ${getScoreColor(90)}`}>90</span></p>
        </div>
      </div>

      {/* Loading */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Loading</h2>
        <div className="flex gap-4 items-center">
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" />
        </div>
      </div>

      {/* Empty State */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Empty State</h2>
        <div className="border rounded-lg">
          <EmptyState
            icon={Inbox}
            title="Nenhum item encontrado"
            description="Não há itens para exibir no momento."
            action={<Button>Criar Item</Button>}
          />
        </div>
      </div>

      {/* Empty State com Erro */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Empty State - Erro</h2>
        <div className="border rounded-lg">
          <EmptyState
            icon={AlertCircle}
            title="Erro ao carregar dados"
            description="Ocorreu um erro ao buscar os dados. Tente novamente."
            action={<Button variant="outline">Tentar Novamente</Button>}
          />
        </div>
      </div>
    </div>
  );
}
```

### Testar

```bash
# Abrir no navegador
http://localhost:3000/test-ui

# Deve mostrar:
# - Exemplos de formatação
# - Loading em 3 tamanhos
# - Empty states
```

### Deletar Página de Teste (Após Validação)

```bash
rm -rf src/app/test-ui
```

---

## 4.5 Estrutura Final

### Verificar Arquivos Criados

```bash
# Listar arquivos
ls src/lib/utils.ts
ls src/components/ui/loading.tsx
ls src/components/ui/empty-state.tsx

# Estrutura esperada:
# src/
# ├── lib/
# │   └── utils.ts              ✅ Atualizado
# └── components/
#     └── ui/
#         ├── loading.tsx        ✅ Novo
#         └── empty-state.tsx    ✅ Novo
```

---

## Checklist de Conclusão

### Utilitários de Formatação
- [ ] `formatCurrency()` implementada
- [ ] `formatDate()` implementada
- [ ] `formatRelativeDate()` implementada
- [ ] `getScoreColor()` implementada
- [ ] `getScoreLabel()` implementada

### Componentes UI
- [ ] `Loading` component criado
- [ ] 3 tamanhos (sm, md, lg) funcionando
- [ ] `EmptyState` component criado
- [ ] Props configuráveis (icon, title, description, action)

### Testes
- [ ] Funções de formatação testadas
- [ ] Loading component testado
- [ ] EmptyState component testado
- [ ] Sem erros TypeScript
- [ ] Página de teste deletada (se criada)

### Integração
- [ ] Funções exportadas de `utils.ts`
- [ ] Componentes exportados corretamente
- [ ] Imports funcionando

---

## Exemplos de Uso Real

### Formatação de Moeda no Card

```typescript
import { formatCurrency } from '@/lib/utils';

<p className="text-2xl font-bold">
  {formatCurrency(lead.value)}
</p>
```

### Loading Durante Fetch

```typescript
import { Loading } from '@/components/ui/loading';

{isLoading ? (
  <Loading />
) : (
  <DataTable data={leads} />
)}
```

### Empty State no Kanban

```typescript
import { Inbox } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

{leads.length === 0 && (
  <EmptyState
    icon={Inbox}
    title="Nenhum lead nesta coluna"
    description="Arraste leads para cá ou crie um novo."
  />
)}
```

---

## Troubleshooting

### Erro: "Cannot find module 'lucide-react'"

```bash
npm install lucide-react
```

### Erro: TypeScript reclamando de tipos em Loading

```typescript
// Adicionar ao topo do arquivo
import { type HTMLAttributes } from 'react';
```

### Erro: Formatação de moeda não funciona

```typescript
// Verificar se Intl está disponível
console.log(typeof Intl); // Deve ser "object"
```

---

## Próxima Fase

➡️ **Fase 5: Dashboard - Métricas e Gráficos**
- Criar MetricCard component
- Criar SalesChart component
- Implementar Dashboard page

**Arquivo:** `docs/design/fase-05-dashboard.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

