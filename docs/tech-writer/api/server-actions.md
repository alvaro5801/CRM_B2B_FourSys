# Server Actions - Referência Completa da API

**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Autor:** Paige (Senior Technical Writer) 📚

---

## 📋 Visão Geral

O CRM FourSys utiliza **Next.js Server Actions** como estratégia de backend, eliminando a necessidade de rotas API REST. Todas as operações são realizadas através de funções server-side type-safe com isolamento automático por tenant.

### Localização dos Arquivos

- `src/app/actions/leads.ts` - Gestão de Leads
- `src/app/actions/auth.ts` - Autenticação
- `src/app/actions/tenants.ts` - Gestão de Tenants
- `src/app/actions/users.ts` - Gestão de Usuários

---

## 🔐 Leads Management

### SA001 - getLeads()

Obter todos os leads do tenant atual.

**Assinatura:**

```typescript
export async function getLeads(): Promise<ActionResult<Lead[]>>
```

**Retorno:**

```typescript
{
  data: Lead[],      // Array de leads ou []
  success: boolean,  // true ou false
  error?: string     // Mensagem de erro (se houver)
}
```

**Comportamento:**
- Filtra automaticamente por `tenantId` da sessão
- Ordena por `aiScore` (desc) e `createdAt` (desc)
- Retorna array vazio se usuário não autenticado

**Exemplo:**

```typescript
const result = await getLeads();
if (result.success) {
  console.log(result.data); // Lead[]
} else {
  console.error(result.error);
}
```

---

### SA002 - createLead()

Criar novo lead.

**Assinatura:**

```typescript
export async function createLead(data: CreateLeadInput): Promise<Lead>
```

**Parâmetros:**

```typescript
interface CreateLeadInput {
  name: string;        // Nome do cliente (min 3 caracteres)
  company: string;     // Nome da empresa (min 2 caracteres)
  status: LeadStatus;  // 'prospect' | 'qualified' | 'proposal' | 'closed'
  value: number;       // Valor em R$ (não negativo)
  email?: string;      // Email (opcional, validação de formato)
  phone?: string;      // Telefone (opcional)
}
```

**Validações:**
- Status deve ser válido
- Valor não pode ser negativo
- Email e telefone únicos por tenant

**Erros:**
- `"Status inválido"` - Status não permitido
- `"Valor não pode ser negativo"` - Valor < 0
- `"Já existe um lead cadastrado com este e-mail. Lead: João Silva"` - Duplicata

**Exemplo:**

```typescript
try {
  const lead = await createLead({
    name: "João Silva",
    company: "Tech Solutions",
    status: "prospect",
    value: 15000,
    email: "joao@tech.com",
    phone: "(11) 98765-4321"
  });
  toast.success(`Lead ${lead.name} criado!`);
} catch (error) {
  toast.error(error.message);
}
```

---

### SA003 - updateLeadStatus()

Atualizar status do lead (usado no drag & drop).

**Assinatura:**

```typescript
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead>
```

**Parâmetros:**

```typescript
interface UpdateLeadStatusInput {
  id: string;          // ID do lead
  status: LeadStatus;  // Novo status
}
```

**Validações:**
- Lead pertence ao tenant atual
- Status é válido

**Comportamento:**
- Atualiza `lastContact` para data atual
- Revalida cache das páginas

---

### SA004 - getDashboardMetrics()

Obter métricas do dashboard.

**Assinatura:**

```typescript
export async function getDashboardMetrics(): Promise<ActionResult<DashboardMetrics>>
```

**Retorno:**

```typescript
interface DashboardMetrics {
  pipelineTotal: number;    // Soma dos valores de leads não fechados
  activeLeads: number;      // Contagem de leads não fechados
  conversionRate: number;   // Taxa de conversão (23.5% fixo)
}
```

**Exemplo:**

```typescript
const result = await getDashboardMetrics();
if (result.success) {
  console.log(`Pipeline: R$ ${result.data.pipelineTotal}`);
  console.log(`Leads Ativos: ${result.data.activeLeads}`);
}
```

---

### SA005 - updateLead()

Atualizar dados do lead.

**Assinatura:**

```typescript
export async function updateLead(input: UpdateLeadInput): Promise<Lead>
```

**Parâmetros:**

```typescript
interface UpdateLeadInput {
  id: string;          // ID do lead (obrigatório)
  name?: string;       // Campos opcionais
  company?: string;
  status?: LeadStatus;
  value?: number;
  email?: string;
  phone?: string;
}
```

**Validações:**
- Lead pertence ao tenant
- Email/telefone não duplicados (se fornecidos)
- Valor não negativo (se fornecido)

---

### SA006 - deleteLead()

Deletar lead.

**Assinatura:**

```typescript
export async function deleteLead(id: string): Promise<void>
```

**Validações:**
- Lead pertence ao tenant atual

**Exemplo:**

```typescript
if (confirm("Excluir lead?")) {
  try {
    await deleteLead(leadId);
    toast.success("Lead excluído!");
  } catch (error) {
    toast.error("Erro ao excluir");
  }
}
```

---

## 🔐 Authentication

### SA-AUTH001 - signup()

Criar tenant e primeiro usuário admin.

**Assinatura:**

```typescript
export async function signup(data: SignupInput)
```

**Parâmetros:**

```typescript
interface SignupInput {
  companyName: string;  // Nome da empresa (min 2 caracteres)
  name: string;         // Nome do usuário (min 2 caracteres)
  email: string;        // Email (único no sistema)
  password: string;     // Senha (min 8 caracteres)
}
```

**Comportamento:**
- Cria Tenant com slug único
- Cria User admin com senha hasheada (bcrypt)
- Executa em transação (rollback se falhar)

**Erros:**
- `"Este email já está cadastrado"` - Email duplicado
- `"Senha deve ter pelo menos 8 caracteres"` - Senha curta

---

### SA-AUTH002 - login()

Autenticar usuário.

**Assinatura:**

```typescript
export async function login(data: LoginInput)
```

**Parâmetros:**

```typescript
interface LoginInput {
  email: string;
  password: string;
}
```

**Comportamento:**
- Valida credenciais
- Cria sessão com `tenantId` embutido
- Redireciona para dashboard

**Erros:**
- `"Email ou senha incorretos"` - Credenciais inválidas

---

## 🏢 Tenants

### SA-T001 - getCurrentTenant()

Obter tenant atual da sessão.

**Assinatura:**

```typescript
export async function getCurrentTenant(): Promise<Tenant | null>
```

**Retorno:**

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### SA-T002 - getTenantStats()

Obter tenant com estatísticas.

**Assinatura:**

```typescript
export async function getTenantStats()
```

**Retorno:**

```typescript
{
  tenant: Tenant,
  _count: {
    leads: number,
    users: number
  }
}
```

---

## 👥 Users

### SA-U001 - getTenantUsers()

Listar usuários do tenant.

**Assinatura:**

```typescript
export async function getTenantUsers(): Promise<ActionResult<SafeUser[]>>
```

**Retorno:**

```typescript
interface SafeUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // password NUNCA é retornado
}
```

**Comportamento:**
- Lista apenas usuários do tenant atual
- **NUNCA** retorna campo `password`

---

### SA-U002 - createUser()

Criar novo usuário no tenant.

**Assinatura:**

```typescript
export async function createUser(data: CreateUserInput): Promise<SafeUser>
```

**Parâmetros:**

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;  // 'admin' | 'user' | 'viewer'
}
```

**Validações:**
- Email único no sistema
- Senha hasheada com bcrypt
- Associado automaticamente ao tenant atual

---

## 🔒 Padrões de Segurança

### 1. Obter tenantId da Sessão

**SEMPRE** use `requireTenant()`:

```typescript
export async function myAction() {
  const tenantId = await requireTenant();
  // ... usar tenantId
}
```

### 2. Filtrar por Tenant

**SEMPRE** filtre queries:

```typescript
const leads = await prisma.lead.findMany({
  where: { tenantId }  // ← OBRIGATÓRIO
});
```

### 3. Validar Propriedade

Antes de update/delete:

```typescript
const existing = await prisma.lead.findUnique({
  where: { id },
  select: { tenantId: true }
});

if (existing.tenantId !== tenantId) {
  throw new Error('Acesso negado');
}
```

### 4. Double-Check no WHERE

```typescript
await prisma.lead.update({
  where: { 
    id,
    tenantId  // ← DOUBLE-CHECK
  },
  data: { ... }
});
```

---

## 🎯 Tratamento de Erros

### Padrão de Retorno

```typescript
export interface ActionResult<T> {
  data?: T;
  error?: string;
  success?: boolean;
}
```

### Exemplo de Implementação

```typescript
export async function myAction(): Promise<ActionResult<Data>> {
  try {
    const tenantId = await requireTenant();
    const data = await fetchData(tenantId);
    
    return {
      data,
      success: true
    };
  } catch (error) {
    return {
      error: 'Mensagem amigável',
      success: false
    };
  }
}
```

### Uso no Cliente

```typescript
const result = await myAction();

if (result.success) {
  // Sucesso
  console.log(result.data);
} else {
  // Erro
  toast.error(result.error);
}
```

---

## 📚 Referências

### Arquivos Relacionados

- `src/app/actions/leads.ts`
- `src/app/actions/auth.ts`
- `src/app/actions/tenants.ts`
- `src/app/actions/users.ts`
- `src/lib/auth.ts` - `requireTenant()`

### Documentação Relacionada

- [Multi-Tenancy](../architecture/multi-tenancy.md)
- [Database](../architecture/database.md)
- [Leads Management](../features/leads-management.md)

---

**Documentado por:** Paige (Senior Technical Writer) 📚  
**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Status:** ✅ Completo

