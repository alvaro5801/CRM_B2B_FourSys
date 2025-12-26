# Component Specifications - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎨 Especificações Completas

---

## 📋 Introdução

Este documento contém **especificações técnicas detalhadas** de todos os componentes novos e atualizados para Multi-tenancy.

---

## 🎨 COMPONENTE 1: TenantBadge

### Propósito
Indicador visual persistente do tenant ativo, sempre visível no header.

### Props
```typescript
interface TenantBadgeProps {
  tenantName: string;        // "FourSys Ltda"
  tenantSlug: string;        // "foursys"
  isActive: boolean;         // true
  onClick?: () => void;      // Opcional: abrir tenant selector
  className?: string;
}
```

### Estados
- **Default:** Badge visível com nome do tenant
- **Hover:** Leve elevação, cursor pointer (se onClick)
- **Active:** Border destacada
- **Loading:** Skeleton durante troca de tenant

### Comportamento
- Sempre visível no header (desktop e mobile)
- Click abre TenantSelector (se multi-tenant user)
- Animação de fade ao trocar tenant
- Tooltip mostra slug completo ao hover

### Acessibilidade
- `role="button"` (se clicável)
- `aria-label="Tenant atual: FourSys Ltda"`
- Contraste 4.5:1 mínimo

---

## 🔄 COMPONENTE 2: TenantSelector

### Propósito
Dropdown para usuários multi-tenant trocarem de contexto.

### Props
```typescript
interface TenantSelectorProps {
  tenants: Tenant[];
  activeTenantId: string;
  onSelect: (tenantId: string) => Promise<void>;
  isLoading?: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  leadsCount: number;
  usersCount: number;
}
```

### Estados
- **Closed:** Apenas TenantBadge visível
- **Open:** Dropdown com lista de tenants
- **Loading:** Spinner durante troca
- **Error:** Mensagem de erro se falha

### Comportamento
- Abre ao click no TenantBadge
- Busca por nome/slug (se > 5 tenants)
- Fecha ao selecionar ou click fora
- Animação de slide-down (300ms)
- Loading overlay durante troca

### Validações
- Não permitir trocar se há mudanças não salvas
- Confirmar se operação em andamento

### Acessibilidade
- `role="listbox"`
- Navegação por teclado (↑↓ Enter)
- `aria-activedescendant` para item focado
- Escape fecha dropdown

---

## 📝 COMPONENTE 3: SignupStepper

### Propósito
Wizard de cadastro em 3 etapas com indicador de progresso.

### Props
```typescript
interface SignupStepperProps {
  currentStep: 1 | 2 | 3;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

interface Step {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}
```

### Estados por Step
- **Completed:** Círculo verde com checkmark
- **Current:** Círculo azul com número, pulsando
- **Upcoming:** Círculo cinza com número

### Comportamento
- Mostrar progresso visual claro
- Permitir voltar para steps anteriores
- Não permitir pular steps
- Animação de transição entre steps
- Validação antes de avançar

### Responsividade
- **Desktop:** Horizontal, 3 círculos + conectores
- **Mobile:** Vertical compacto ou apenas "Step X de 3"

---

## 📧 COMPONENTE 4: UserInviteModal

### Propósito
Modal para admin convidar novos usuários ao tenant.

### Props
```typescript
interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteData) => Promise<void>;
  tenantId: string;
}

interface InviteData {
  email: string;
  role: 'admin' | 'user' | 'viewer';
}
```

### Campos do Formulário
1. **Email** (required)
   - Validação: formato de email
   - Validação: não pode ser email já existente no tenant
   
2. **Role** (required, default: 'user')
   - Select com 3 opções
   - Descrição de cada role

### Estados
- **Idle:** Form vazio, pronto para input
- **Validating:** Verificando email único
- **Submitting:** Enviando convite
- **Success:** Toast + fechar modal
- **Error:** Mensagem de erro inline

### Comportamento
- Abrir com animação scale-in
- Fechar com Escape ou click fora
- Validação em tempo real
- Limpar form ao fechar
- Focus no campo email ao abrir

---

## 🏢 COMPONENTE 5: TenantCard (Admin Dashboard)

### Propósito
Card de tenant na listagem do admin dashboard.

### Props
```typescript
interface TenantCardProps {
  tenant: TenantWithStats;
  onClick: () => void;
  onDeactivate: (tenantId: string) => Promise<void>;
}

interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  leadsCount: number;
  usersCount: number;
  createdAt: Date;
  isActive: boolean;
}
```

### Layout
```
┌────────────────────────────────────────┐
│ 🏢 FourSys Ltda            ✅ Ativo    │
│    foursys                              │
│                                         │
│ 📋 12 leads  •  👥 3 users             │
│ Criado em 25/12/2025                   │
│                                         │
│ [Ver Detalhes]  [Desativar]            │
└────────────────────────────────────────┘
```

### Estados
- **Active:** Border verde, badge "Ativo"
- **Inactive:** Border cinza, badge "Inativo"
- **Hover:** Elevação, border azul
- **Loading:** Skeleton durante ação

---

## 📊 COMPONENTE 6: ActivityLog

### Propósito
Feed de atividades do tenant (audit log).

### Props
```typescript
interface ActivityLogProps {
  activities: Activity[];
  tenantId?: string;  // Se omitido, mostra todas
  limit?: number;     // Default: 10
  showLoadMore?: boolean;
}

interface Activity {
  id: string;
  type: 'lead_created' | 'lead_moved' | 'lead_closed' | 'user_invited';
  userName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### Layout de Item
```
┌────────────────────────────────────────┐
│ 👤 João Silva                          │
│ moveu "Tech Solutions" para Proposta   │
│ há 2 horas                             │
└────────────────────────────────────────┘
```

### Comportamento
- Auto-refresh a cada 30s (opcional)
- Infinite scroll ou "Load More"
- Filtro por tipo de atividade
- Busca por usuário

---

## 🔄 COMPONENTES ATUALIZADOS

### Sidebar (Atualizado)

**Mudanças:**
- Adicionar TenantBadge no topo
- Espaçamento ajustado
- Indicador visual de tenant ativo

```tsx
<Sidebar>
  <TenantBadge {...tenant} />
  <Nav>
    <NavItem>Dashboard</NavItem>
    <NavItem>Kanban</NavItem>
    <NavItem>Settings</NavItem>
  </Nav>
</Sidebar>
```

---

### Header (Atualizado)

**Mudanças:**
- TenantSelector no canto superior direito
- User menu ao lado
- Breadcrumbs com contexto de tenant

```tsx
<Header>
  <Logo />
  <Breadcrumbs />
  <Spacer />
  <TenantSelector {...props} />
  <UserMenu />
</Header>
```

---

### LeadCard (Atualizado)

**Mudanças:**
- Adicionar indicador de tenant (admin view)
- Manter design atual para tenant-scoped view

```tsx
<LeadCard>
  {isAdminView && <TenantBadge mini />}
  <LeadName />
  <Company />
  <Value />
  <AIScore />
</LeadCard>
```

---

### Dashboard (Atualizado)

**Mudanças:**
- Todas as métricas filtradas por tenant
- TenantBadge visível
- Empty state se tenant sem dados

```tsx
<Dashboard>
  <TenantBadge />
  <MetricsGrid tenantId={tenantId} />
  <SalesChart tenantId={tenantId} />
  <ActivityFeed tenantId={tenantId} />
</Dashboard>
```

---

### KanbanBoard (Atualizado)

**Mudanças:**
- Todas as colunas filtradas por tenant
- Drag & drop apenas dentro do tenant
- Empty state por coluna

```tsx
<KanbanBoard>
  <TenantBadge />
  <CreateLeadButton />
  <Columns>
    {columns.map(col => (
      <KanbanColumn 
        leads={leads.filter(l => l.tenantId === currentTenantId)}
      />
    ))}
  </Columns>
</KanbanBoard>
```

---

## 🎯 Padrões de Design

### Loading States
```tsx
// Skeleton
<Skeleton className="h-12 w-full" />

// Spinner
<Spinner size="md" />

// Inline Loading
<Button disabled>
  <Spinner size="sm" className="mr-2" />
  Carregando...
</Button>
```

### Empty States
```tsx
<EmptyState
  icon={Inbox}
  title="Nenhum lead encontrado"
  description="Comece criando seu primeiro lead"
  action={<Button>Criar Lead</Button>}
/>
```

### Error States
```tsx
<Alert variant="danger">
  <AlertTitle>Erro ao carregar dados</AlertTitle>
  <AlertDescription>
    Não foi possível carregar os tenants. Tente novamente.
  </AlertDescription>
  <Button onClick={retry}>Tentar Novamente</Button>
</Alert>
```

---

## ♿ Acessibilidade

### Checklist por Componente
- [ ] Contraste de cores 4.5:1 mínimo
- [ ] Navegação por teclado funcional
- [ ] Focus states visíveis
- [ ] ARIA labels descritivos
- [ ] Screen reader friendly
- [ ] Sem dependência apenas de cor

### Testes
- NVDA/JAWS (screen readers)
- Navegação apenas por teclado
- Zoom 200% (responsividade)
- Color blindness simulators

---

**Próximo Documento:** [05-interaction-patterns.md](05-interaction-patterns.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Especificações Completas



