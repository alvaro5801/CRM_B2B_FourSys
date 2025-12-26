# Arquitetura Proposta - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. MODELO DE MULTI-TENANCY

### 1.1 Tipo Escolhido
**Shared Database, Shared Schema** (Row-Level Security)

### 1.2 Justificativa

#### Vantagens ✅
- **Menor Complexidade:** Uma única instância de banco de dados
- **Facilita Manutenção:** Migrations aplicadas uma vez para todos
- **Custo Reduzido:** Infraestrutura compartilhada
- **Adequado para MVP:** Crescimento inicial sem overhead
- **Migração Simples:** Adicionar campo `tenantId` às tabelas existentes

#### Desvantagens ⚠️
- **Risco de Data Leakage:** Requer validação rigorosa em todas as queries
- **Performance Compartilhada:** Um tenant pode impactar outros
- **Compliance:** Alguns clientes podem exigir isolamento físico

---

## 2. ALTERNATIVAS DESCARTADAS

### 2.1 Database por Tenant
**Descrição:** Cada tenant tem seu próprio banco de dados.

#### Por que NÃO escolhemos:
- ❌ **Overhead Operacional:** Gerenciar centenas de databases
- ❌ **Complexidade de Migrations:** Aplicar em cada database
- ❌ **Custo de Infraestrutura:** Múltiplas instâncias
- ❌ **Dificuldade de Agregação:** Relatórios cross-tenant complexos

#### Quando Considerar:
- Clientes enterprise com requisitos de compliance rígidos
- Necessidade de isolamento físico total
- Customizações de schema por tenant

---

### 2.2 Schema por Tenant
**Descrição:** Cada tenant tem seu próprio schema dentro do mesmo database.

#### Por que NÃO escolhemos:
- ❌ **Complexidade de Migrations:** Aplicar em múltiplos schemas
- ❌ **Limites de Conexão:** Cada schema pode precisar de conexão dedicada
- ❌ **Suporte Limitado:** Nem todos os databases suportam bem
- ❌ **Overhead de Gerenciamento:** Criar/deletar schemas dinamicamente

#### Quando Considerar:
- Meio-termo entre isolamento e custo
- Necessidade de customizações moderadas por tenant

---

## 3. ESTRATÉGIA DE IDENTIFICAÇÃO DO TENANT

### 3.1 Opção 1: Sessão de Autenticação (Recomendado)

#### Como Funciona:
```typescript
// 1. Usuário faz login
// 2. Token JWT/Session contém tenantId
// 3. Server Actions extraem tenantId da sessão

async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession();
  return session.user.tenantId;
}
```

#### Vantagens ✅
- **Seguro:** Impossível spoofing (tenantId não vem do cliente)
- **Padrão de Mercado:** Usado por SaaS modernos
- **Integração Simples:** NextAuth.js, Clerk, Auth0

#### Desvantagens ⚠️
- Requer sistema de autenticação completo
- Complexidade adicional no MVP

---

### 3.2 Opção 2: Subdomain

#### Como Funciona:
```typescript
// tenant1.crm.foursys.com → tenantId = "tenant1"
// tenant2.crm.foursys.com → tenantId = "tenant2"

async function getCurrentTenantId(): Promise<string> {
  const host = headers().get('host');
  const subdomain = host.split('.')[0];
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: subdomain }
  });
  
  return tenant.id;
}
```

#### Vantagens ✅
- **UX Excelente:** Cada cliente tem sua URL
- **Branding:** Possibilidade de domínio customizado
- **Isolamento Visual:** Claro qual tenant está acessando

#### Desvantagens ⚠️
- Requer configuração de DNS/Wildcard
- Complexidade de deploy
- Usuário multi-tenant precisa trocar de URL

---

### 3.3 Opção 3: Header HTTP (Fallback/Testes)

#### Como Funciona:
```typescript
async function getCurrentTenantId(): Promise<string> {
  const tenantId = headers().get('x-tenant-id');
  
  if (!tenantId) {
    throw new Error('Tenant ID não fornecido');
  }
  
  return tenantId;
}
```

#### Vantagens ✅
- **Simples para Testes:** Fácil de implementar no MVP
- **Flexível:** Cliente pode enviar via header

#### Desvantagens ⚠️
- **INSEGURO:** Cliente pode enviar qualquer tenantId (spoofing)
- **Não Recomendado para Produção**
- Apenas para desenvolvimento/testes

---

## 4. ARQUITETURA DE DADOS

### 4.1 Diagrama de Relacionamentos

```
┌─────────────────┐
│     Tenant      │
│─────────────────│
│ id (PK)         │
│ name            │
│ slug (unique)   │
│ domain          │
│ isActive        │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────┐
    │                     │
┌───▼──────────┐   ┌──────▼─────┐
│     Lead     │   │    User    │
│──────────────│   │────────────│
│ id (PK)      │   │ id (PK)    │
│ tenantId (FK)│   │ tenantId   │
│ name         │   │ email      │
│ company      │   │ name       │
│ status       │   │ role       │
│ value        │   │ isActive   │
│ aiScore      │   └────────────┘
│ email        │
│ phone        │
└──────────────┘
```

### 4.2 Índices Críticos

```prisma
model Lead {
  // ... campos ...
  
  @@index([tenantId])              // Query básica
  @@index([tenantId, status])      // Kanban board
  @@index([tenantId, aiScore])     // Ordenação por score
  @@index([tenantId, createdAt])   // Ordenação por data
}
```

**Por que são críticos:**
- Sem índice em `tenantId`: Full table scan (lento)
- Índice composto `[tenantId, status]`: Otimiza Kanban
- Performance degradada sem índices adequados

---

## 5. FLUXO DE DADOS

### 5.1 Criação de Lead

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Envia dados do lead
       │    (SEM tenantId)
       ▼
┌──────────────────┐
│  Server Action   │
│  createLead()    │
├──────────────────┤
│ 2. Extrai        │
│    tenantId da   │
│    sessão        │
│                  │
│ 3. Adiciona      │
│    tenantId aos  │
│    dados         │
└──────┬───────────┘
       │
       │ 4. Persiste no DB
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  Lead {          │
│    tenantId: X   │
│    name: "..."   │
│    ...           │
│  }               │
└──────────────────┘
```

**Segurança:** Cliente NUNCA envia `tenantId`.

---

### 5.2 Listagem de Leads

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Requisita leads
       ▼
┌──────────────────┐
│  Server Action   │
│  getLeads()      │
├──────────────────┤
│ 2. Extrai        │
│    tenantId da   │
│    sessão        │
│                  │
│ 3. Query com     │
│    WHERE         │
│    tenantId = X  │
└──────┬───────────┘
       │
       │ 4. Retorna apenas
       │    leads do tenant
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  SELECT * FROM   │
│  Lead            │
│  WHERE           │
│  tenantId = X    │
└──────────────────┘
```

**Segurança:** Filtro automático por tenant.

---

## 6. ESTRATÉGIA DE ONBOARDING

### 6.1 Opção A: Self-Service (Recomendado para SaaS)

**Fluxo:**
1. Usuário acessa página de signup
2. Preenche dados da empresa + dados pessoais
3. Sistema cria automaticamente:
   - Novo `Tenant`
   - Primeiro `User` (admin)
4. Usuário é redirecionado para dashboard

**Vantagens:**
- ✅ Escalável
- ✅ Sem intervenção manual
- ✅ Conversão rápida

**Desvantagens:**
- ⚠️ Requer validação de email
- ⚠️ Possibilidade de spam/abuse

---

### 6.2 Opção B: Admin Cria Tenants

**Fluxo:**
1. Admin acessa painel administrativo
2. Cria novo tenant manualmente
3. Convida usuários por email
4. Usuários criam senha e acessam

**Vantagens:**
- ✅ Controle total
- ✅ Validação manual
- ✅ Adequado para B2B

**Desvantagens:**
- ⚠️ Não escalável
- ⚠️ Gargalo operacional

---

## 7. MULTI-TENANT POR USUÁRIO

### 7.1 Cenário: Usuário Pertence a Múltiplos Tenants

**Exemplo:**
- João é admin da empresa A
- João é consultor da empresa B
- João precisa acessar ambos os tenants

#### Solução 1: Tenant Selector
```typescript
// Usuário escolhe tenant ativo
<TenantSelector 
  tenants={user.tenants}
  currentTenantId={session.activeTenantId}
  onChange={switchTenant}
/>
```

#### Solução 2: Múltiplas Contas
- João tem conta separada em cada tenant
- Mais simples, menos flexível

---

## 8. CONSIDERAÇÕES DE COMPLIANCE

### 8.1 LGPD/GDPR

**Requisitos:**
- ✅ Isolamento de dados garantido
- ✅ Possibilidade de deletar tenant completo
- ✅ Exportação de dados por tenant
- ⚠️ Alguns clientes podem exigir database separado

### 8.2 Auditoria

**Recomendações:**
- Adicionar campo `tenantId` em logs
- Rastrear ações cross-tenant (se houver)
- Manter histórico de acessos

---

## 9. ESCALABILIDADE

### 9.1 Limites do Modelo Atual

**Shared Database, Shared Schema suporta:**
- ✅ 100-1000 tenants sem problemas
- ✅ Até 10M de registros totais
- ⚠️ Performance pode degradar com tenants muito grandes

### 9.2 Plano de Migração Futura

**Se crescer além dos limites:**
1. **Sharding por Tenant:** Distribuir tenants em múltiplos databases
2. **Tenant Premium:** Clientes grandes em database dedicado
3. **Read Replicas:** Para queries pesadas

---

## 10. DECISÕES ARQUITETURAIS FINAIS

### 10.1 Recomendações

| Decisão | Opção Recomendada | Justificativa |
|---------|-------------------|---------------|
| **Modelo de Multi-tenancy** | Shared DB, Shared Schema | Simplicidade + Custo |
| **Identificação de Tenant** | Sessão (NextAuth.js) | Segurança + Padrão |
| **Onboarding** | Self-Service | Escalabilidade |
| **Multi-tenant por Usuário** | Tenant Selector | Flexibilidade |

### 10.2 Próximas Decisões Necessárias

- [ ] Escolher biblioteca de autenticação (NextAuth.js vs Clerk)
- [ ] Definir fluxo de signup completo
- [ ] Decidir se implementa subdomain (opcional)

---

**Próximo Documento:** [03-impacto-schema.md](03-impacto-schema.md)



