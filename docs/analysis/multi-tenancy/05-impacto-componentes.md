# Impacto nos Componentes

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. VISÃO GERAL

**Boa Notícia:** A maioria dos componentes **NÃO precisa de alteração** pois o isolamento acontece na camada de dados (Server Actions).

**Complexidade Geral:** 🟢 Baixa  
**Prioridade:** Média (alterações são opcionais para UX)

---

## 2. COMPONENTES SEM IMPACTO DIRETO

Estes componentes apenas renderizam dados recebidos como props. Como as Server Actions já retornam dados filtrados por tenant, **nenhuma alteração é necessária**.

### 2.1 Componentes do Kanban

✅ **`src/components/kanban/KanbanBoard.tsx`**
- **Motivo:** Recebe `initialLeads` já filtrados por tenant
- **Alteração:** Nenhuma

✅ **`src/components/kanban/KanbanColumn.tsx`**
- **Motivo:** Apenas renderiza coluna com leads recebidos
- **Alteração:** Nenhuma

✅ **`src/components/kanban/LeadCard.tsx`**
- **Motivo:** Apenas renderiza dados do lead
- **Alteração:** Nenhuma

### 2.2 Componentes do Dashboard

✅ **`src/components/dashboard/DashboardGrid.tsx`**
- **Motivo:** Recebe métricas já calculadas por tenant
- **Alteração:** Nenhuma

✅ **`src/components/dashboard/MetricCard.tsx`**
- **Motivo:** Apenas renderiza card de métrica
- **Alteração:** Nenhuma

✅ **`src/components/dashboard/SalesChart.tsx`**
- **Motivo:** Renderiza gráfico com dados mockados
- **Alteração:** Nenhuma

### 2.3 Componentes UI

✅ **Todos os componentes em `src/components/ui/`**
- `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, etc.
- **Motivo:** Componentes genéricos sem lógica de negócio
- **Alteração:** Nenhuma

---

## 3. COMPONENTES COM IMPACTO INDIRETO

### 3.1 CreateLeadModal

📄 **`src/components/kanban/CreateLeadModal.tsx`**

**Impacto:** Nenhuma alteração necessária no código atual.

**Motivo:** O `tenantId` é adicionado automaticamente na Server Action `createLead()`. O formulário não precisa enviar este campo.

#### Alteração Opcional (UX):

Exibir nome do tenant no modal para contexto visual:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getCurrentTenant } from '@/app/actions/tenants';

export function CreateLeadModal() {
  const [tenantName, setTenantName] = useState<string>('');
  
  useEffect(() => {
    getCurrentTenant().then(tenant => {
      if (tenant) setTenantName(tenant.name);
    });
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo Lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
          <DialogDescription>
            Criando lead para: <strong>{tenantName}</strong>
          </DialogDescription>
        </DialogHeader>
        {/* ... resto do formulário ... */}
      </DialogContent>
    </Dialog>
  );
}
```

**Benefício:** Usuário sabe para qual organização está criando o lead.

---

### 3.2 Sidebar

📄 **`src/components/layout/Sidebar.tsx`**

**Impacto:** Adicionar indicador visual do tenant atual (recomendado para UX).

#### Implementação Sugerida:

```typescript
import { getCurrentTenant } from '@/app/actions/tenants';

export async function Sidebar() {
  const tenant = await getCurrentTenant();
  
  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Indicador de Tenant no Topo */}
      {tenant && (
        <div className="border-b border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-400">Organização</p>
          <p className="text-sm font-semibold truncate">{tenant.name}</p>
        </div>
      )}
      
      {/* ... resto da sidebar ... */}
    </div>
  );
}
```

**Benefício:** Usuário sempre sabe qual tenant está acessando.

---

## 4. COMPONENTES NOVOS NECESSÁRIOS

### 4.1 TenantSelector (Opcional)

**Quando Criar:**
- Se um usuário pode pertencer a múltiplos tenants
- Se implementar funcionalidade de "trocar de organização"

📄 **`src/components/layout/TenantSelector.tsx`** (NOVO)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TenantSelectorProps {
  tenants: Array<{ id: string; name: string }>;
  currentTenantId: string;
}

export function TenantSelector({ tenants, currentTenantId }: TenantSelectorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTenantChange = async (tenantId: string) => {
    setIsLoading(true);
    
    try {
      // Chamar API para trocar tenant na sessão
      const response = await fetch('/api/tenant/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao trocar tenant');
      }
      
      // Recarregar página para atualizar dados
      router.refresh();
    } catch (error) {
      console.error('Error switching tenant:', error);
      alert('Erro ao trocar de organização');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (tenants.length <= 1) {
    return null; // Não mostrar selector se usuário tem apenas 1 tenant
  }
  
  return (
    <div className="px-4 py-3 border-b border-gray-700">
      <label className="text-xs text-gray-400 block mb-2">
        Organização
      </label>
      <Select
        value={currentTenantId}
        onValueChange={handleTenantChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tenants.map(tenant => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### API Route Necessária:

📄 **`src/app/api/tenant/switch/route.ts`** (NOVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const { tenantId } = await request.json();
    
    // Validar que usuário pertence ao tenant
    const userTenants = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    });
    
    if (userTenants?.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // Atualizar sessão com novo tenantId
    // (Implementação depende do sistema de auth usado)
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error switching tenant:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

---

### 4.2 TenantBadge (Opcional)

**Quando Criar:**
- Para exibir tenant em múltiplos lugares
- Componente reutilizável

📄 **`src/components/tenant/TenantBadge.tsx`** (NOVO)

```typescript
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TenantBadgeProps {
  tenantName: string;
  variant?: 'default' | 'secondary' | 'outline';
}

export function TenantBadge({ tenantName, variant = 'secondary' }: TenantBadgeProps) {
  return (
    <Badge variant={variant} className="gap-1">
      <Building2 className="h-3 w-3" />
      {tenantName}
    </Badge>
  );
}
```

**Uso:**
```typescript
<TenantBadge tenantName="FourSys" />
```

---

## 5. PÁGINAS

### 5.1 Dashboard (`src/app/page.tsx`)

**Impacto:** Nenhuma alteração necessária.

**Motivo:** A página já chama `getDashboardMetrics()` que retorna métricas filtradas por tenant.

### 5.2 Kanban (`src/app/kanban/page.tsx`)

**Impacto:** Nenhuma alteração necessária.

**Motivo:** A página já chama `getLeads()` que retorna leads filtrados por tenant.

### 5.3 Layout Raiz (`src/app/layout.tsx`)

**Impacto:** Adicionar contexto de tenant (opcional).

#### Implementação Sugerida:

```typescript
import { getCurrentTenant } from '@/app/actions/tenants';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();
  
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex h-screen">
          <Sidebar tenant={tenant} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

---

## 6. VALIDAÇÕES

📄 **`src/lib/validations/lead.ts`**

**Impacto:** Nenhuma alteração necessária.

**Motivo:** O `tenantId` é adicionado automaticamente nas Server Actions, não vem do formulário.

**🔒 SEGURANÇA:** Nunca aceitar `tenantId` como input do cliente (evita spoofing).

---

## 7. RESUMO DE ALTERAÇÕES

### 7.1 Obrigatórias
**Nenhuma alteração obrigatória em componentes.**

### 7.2 Recomendadas (UX)

| Componente | Alteração | Benefício |
|------------|-----------|-----------|
| `Sidebar.tsx` | Exibir nome do tenant | Usuário sabe qual organização está acessando |
| `CreateLeadModal.tsx` | Exibir tenant no modal | Contexto visual ao criar lead |

### 7.3 Opcionais (Funcionalidade Avançada)

| Componente | Quando Criar | Complexidade |
|------------|--------------|--------------|
| `TenantSelector.tsx` | Usuário multi-tenant | 🟡 Média |
| `TenantBadge.tsx` | Componente reutilizável | 🟢 Baixa |
| API `/tenant/switch` | Trocar de tenant | 🟡 Média |

---

## 8. CHECKLIST DE IMPLEMENTAÇÃO

### 8.1 Fase 1: Básico (Sem Alterações)
- [ ] Verificar que componentes funcionam sem alteração
- [ ] Testar Kanban com dados filtrados
- [ ] Testar Dashboard com métricas filtradas

### 8.2 Fase 2: UX Recomendada
- [ ] Adicionar indicador de tenant na Sidebar
- [ ] (Opcional) Exibir tenant no CreateLeadModal

### 8.3 Fase 3: Funcionalidade Avançada (Opcional)
- [ ] Criar TenantSelector
- [ ] Criar API de troca de tenant
- [ ] Implementar lógica de multi-tenant por usuário

---

## 9. TESTES RECOMENDADOS

### 9.1 Testes de Componentes

```typescript
// tests/components/Sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar with Multi-tenancy', () => {
  it('deve exibir nome do tenant', async () => {
    const mockTenant = {
      id: '1',
      name: 'FourSys',
      slug: 'foursys',
    };
    
    render(<Sidebar tenant={mockTenant} />);
    
    expect(screen.getByText('Organização')).toBeInTheDocument();
    expect(screen.getByText('FourSys')).toBeInTheDocument();
  });
});
```

---

**Próximo Documento:** [06-impacto-seed.md](06-impacto-seed.md)



