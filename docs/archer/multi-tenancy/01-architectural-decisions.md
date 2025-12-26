# Decisões Arquiteturais (ADRs)

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Aprovado

---

## Introdução

Este documento registra as **Architectural Decision Records (ADRs)** para a implementação de Multi-tenancy no CRM B2B FourSys. Cada decisão é documentada com contexto, alternativas consideradas e justificativa.

---

## ADR-001: Modelo de Multi-tenancy

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Precisamos escolher um modelo de multi-tenancy que balance custo, complexidade, segurança e escalabilidade para um MVP SaaS.

### Decisão
**Shared Database, Shared Schema** com Row-Level Security (campo `tenantId` em todas as tabelas).

### Alternativas Consideradas

#### Opção A: Database por Tenant
**Descrição:** Cada tenant tem seu próprio banco de dados físico.

**Prós:**
- ✅ Isolamento físico total
- ✅ Fácil backup/restore por tenant
- ✅ Customizações de schema possíveis
- ✅ Compliance simplificado

**Contras:**
- ❌ Alto custo operacional
- ❌ Complexidade de migrations (N databases)
- ❌ Difícil agregar dados cross-tenant
- ❌ Overhead de gerenciamento

**Por que NÃO escolhemos:** Complexidade e custo inviáveis para MVP.

---

#### Opção B: Schema por Tenant
**Descrição:** Cada tenant tem seu próprio schema dentro do mesmo database.

**Prós:**
- ✅ Isolamento lógico forte
- ✅ Backup por schema possível
- ✅ Custo moderado

**Contras:**
- ❌ Complexidade de migrations (N schemas)
- ❌ Limites de conexão por schema
- ❌ Suporte limitado em alguns databases

**Por que NÃO escolhemos:** Complexidade de migrations e overhead de gerenciamento.

---

#### Opção C: Shared Database, Shared Schema ✅ (ESCOLHIDA)
**Descrição:** Todos os tenants compartilham database e schema, com isolamento via `tenantId`.

**Prós:**
- ✅ Simplicidade de implementação
- ✅ Custo mínimo (uma instância)
- ✅ Migrations aplicadas uma vez
- ✅ Fácil agregar dados cross-tenant
- ✅ Adequado para MVP

**Contras:**
- ⚠️ Risco de data leakage (mitigável)
- ⚠️ Performance compartilhada
- ⚠️ Compliance pode exigir isolamento físico

**Por que escolhemos:** Melhor custo-benefício para MVP, com mitigações claras para os riscos.

### Consequências

**Positivas:**
- Redução de custos de 90%
- Manutenção simplificada
- Escalabilidade inicial garantida

**Negativas:**
- Requer validação rigorosa em todas as queries
- Necessidade de testes de segurança extensivos
- Alguns clientes enterprise podem exigir database dedicado (futuro)

### Mitigações
1. Code review obrigatório focado em segurança
2. Testes automatizados de isolamento
3. Middleware de validação automática (futuro)
4. Plano de migração para database dedicado (clientes premium)

---

## ADR-002: Estratégia de Identificação de Tenant

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Precisamos decidir como identificar o tenant atual em cada requisição.

### Decisão
**Sessão de Autenticação** (tenantId no token JWT/sessão).

### Alternativas Consideradas

#### Opção A: Sessão de Autenticação ✅ (ESCOLHIDA)
**Descrição:** `tenantId` armazenado no token JWT ou sessão do usuário.

**Implementação:**
```typescript
async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado ou sem tenant');
  }
  return session.user.tenantId;
}
```

**Prós:**
- ✅ Seguro (impossível spoofing)
- ✅ Padrão de mercado
- ✅ Integração simples com NextAuth.js

**Contras:**
- ⚠️ Requer sistema de autenticação completo

**Por que escolhemos:** Segurança e padrão de mercado.

---

#### Opção B: Subdomain
**Descrição:** Tenant identificado pelo subdomain (e.g., `tenant1.crm.com`).

**Implementação:**
```typescript
async function getCurrentTenantId(): Promise<string> {
  const host = headers().get('host');
  const subdomain = host.split('.')[0];
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: subdomain }
  });
  
  return tenant.id;
}
```

**Prós:**
- ✅ UX excelente (cada cliente tem sua URL)
- ✅ Branding claro

**Contras:**
- ❌ Requer configuração de DNS/Wildcard
- ❌ Complexidade de deploy
- ❌ Usuário multi-tenant precisa trocar de URL

**Por que NÃO escolhemos:** Complexidade de infra para MVP. Pode ser adicionado no futuro.

---

#### Opção C: Header HTTP
**Descrição:** Tenant enviado via header `X-Tenant-ID`.

**Implementação:**
```typescript
async function getCurrentTenantId(): Promise<string> {
  const tenantId = headers().get('x-tenant-id');
  if (!tenantId) {
    throw new Error('Tenant ID não fornecido');
  }
  return tenantId;
}
```

**Prós:**
- ✅ Simples para testes

**Contras:**
- ❌ **INSEGURO:** Cliente pode enviar qualquer tenantId
- ❌ Não recomendado para produção

**Por que NÃO escolhemos:** Vulnerabilidade crítica de segurança.

### Consequências

**Positivas:**
- Segurança garantida
- Padrão de mercado
- Fácil integração com NextAuth.js

**Negativas:**
- Requer implementação de autenticação completa
- Complexidade adicional no MVP

### Plano de Implementação
1. **Fase 1 (MVP):** Hardcoded `tenantId` para validar isolamento
2. **Fase 2:** Integração com NextAuth.js
3. **Fase 3 (Futuro):** Adicionar subdomain como opção

---

## ADR-003: Biblioteca de Autenticação

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Precisamos escolher uma biblioteca de autenticação para Next.js 14+.

### Decisão
**NextAuth.js v5** (Auth.js)

### Alternativas Consideradas

#### Opção A: NextAuth.js v5 ✅ (ESCOLHIDA)
**Descrição:** Biblioteca de autenticação oficial para Next.js.

**Prós:**
- ✅ Integração nativa com Next.js
- ✅ Suporte a múltiplos providers
- ✅ JWT customizável (adicionar `tenantId`)
- ✅ Comunidade ativa
- ✅ Open-source e gratuito

**Contras:**
- ⚠️ Curva de aprendizado moderada
- ⚠️ Configuração inicial complexa

**Por que escolhemos:** Melhor integração com Next.js e gratuito.

---

#### Opção B: Clerk
**Descrição:** Plataforma de autenticação completa (SaaS).

**Prós:**
- ✅ Setup extremamente rápido
- ✅ UI pronta
- ✅ Suporte a multi-tenancy nativo

**Contras:**
- ❌ **Custo:** $25/mês + $0.02/usuário
- ❌ Vendor lock-in
- ❌ Menos customizável

**Por que NÃO escolhemos:** Custo recorrente inviável para MVP.

---

#### Opção C: Custom Auth
**Descrição:** Implementar autenticação do zero.

**Prós:**
- ✅ Controle total
- ✅ Sem dependências externas

**Contras:**
- ❌ Alto risco de vulnerabilidades
- ❌ Tempo de desenvolvimento (20+ horas)
- ❌ Manutenção complexa

**Por que NÃO escolhemos:** Reinventar a roda é arriscado e demorado.

### Consequências

**Positivas:**
- Autenticação robusta e testada
- Gratuito e open-source
- Flexibilidade para customizações

**Negativas:**
- Curva de aprendizado
- Configuração inicial complexa

### Implementação
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!valid) return null;
        
        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId, // ← CRÍTICO
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId; // ← Adicionar ao token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.tenantId = token.tenantId; // ← Adicionar à sessão
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## ADR-004: Estratégia de Onboarding

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Precisamos decidir como novos tenants são criados.

### Decisão
**Self-Service Signup** com criação automática de tenant.

### Alternativas Consideradas

#### Opção A: Self-Service Signup ✅ (ESCOLHIDA)
**Descrição:** Usuário se cadastra e tenant é criado automaticamente.

**Fluxo:**
1. Usuário acessa `/signup`
2. Preenche dados da empresa + dados pessoais
3. Sistema cria automaticamente:
   - Novo `Tenant` (nome, slug único)
   - Primeiro `User` (admin do tenant)
4. Usuário é redirecionado para dashboard

**Prós:**
- ✅ Escalável (sem intervenção manual)
- ✅ Conversão rápida (< 5 minutos)
- ✅ Modelo SaaS moderno

**Contras:**
- ⚠️ Requer validação de email
- ⚠️ Possibilidade de spam/abuse

**Por que escolhemos:** Escalabilidade e conversão rápida.

---

#### Opção B: Admin Cria Tenants
**Descrição:** Admin global cria tenants manualmente.

**Fluxo:**
1. Admin acessa painel administrativo
2. Cria novo tenant manualmente
3. Convida usuários por email
4. Usuários criam senha e acessam

**Prós:**
- ✅ Controle total
- ✅ Validação manual

**Contras:**
- ❌ Não escalável
- ❌ Gargalo operacional

**Por que NÃO escolhemos:** Não escalável para modelo SaaS.

### Consequências

**Positivas:**
- Onboarding instantâneo
- Sem gargalo operacional
- Crescimento acelerado

**Negativas:**
- Necessidade de validação de email
- Risco de spam (mitigável com CAPTCHA)

### Mitigações
1. CAPTCHA no signup
2. Validação de email obrigatória
3. Rate limiting
4. Monitoramento de signups suspeitos

---

## ADR-005: Multi-tenant por Usuário

### Status
⏳ **PLANEJADO** - Fase 3

### Contexto
Decidir se um usuário pode pertencer a múltiplos tenants.

### Decisão (Preliminar)
**Sim, via Tenant Selector** (implementação em Fase 3).

### Alternativas Consideradas

#### Opção A: Tenant Selector ✅ (ESCOLHIDA)
**Descrição:** Usuário escolhe tenant ativo via dropdown.

**Implementação:**
```typescript
// Componente TenantSelector
<Select
  value={currentTenantId}
  onValueChange={switchTenant}
>
  {userTenants.map(tenant => (
    <SelectItem key={tenant.id} value={tenant.id}>
      {tenant.name}
    </SelectItem>
  ))}
</Select>
```

**Prós:**
- ✅ Flexibilidade (consultores, agências)
- ✅ UX clara

**Contras:**
- ⚠️ Complexidade adicional

---

#### Opção B: Múltiplas Contas
**Descrição:** Usuário cria conta separada em cada tenant.

**Prós:**
- ✅ Simplicidade

**Contras:**
- ❌ UX ruim (múltiplos logins)

### Decisão Final
Implementar Tenant Selector em **Fase 3** (opcional).

---

## ADR-006: Estratégia de Migração de Dados

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Decidir como migrar leads existentes para o modelo multi-tenant.

### Decisão
**Criar Tenant Default** e associar todos os leads órfãos a ele.

### Implementação
```typescript
// prisma/migrations/assign-default-tenant.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Criando tenant default...');
  
  // 1. Criar tenant default
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'FourSys (Default)',
      slug: 'default',
      isActive: true,
    },
  });
  
  console.log('✅ Tenant default criado:', defaultTenant.id);
  
  // 2. Atualizar leads órfãos
  const result = await prisma.lead.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  
  console.log(`✅ ${result.count} leads associados ao tenant default`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Alternativas Consideradas

**Opção A:** Criar Tenant Default ✅ (escolhida)  
**Opção B:** Resetar database (apenas dev)  
**Opção C:** Migração manual por SQL

### Consequências

**Positivas:**
- Sem perda de dados
- Rollback possível

**Negativas:**
- Tenant default pode acumular dados órfãos

---

## ADR-007: Índices de Performance

### Status
✅ **APROVADO** - 25/12/2025

### Contexto
Definir índices necessários para performance adequada.

### Decisão
Criar **índices compostos** priorizando `tenantId`.

### Índices Obrigatórios
```prisma
model Lead {
  // ... campos ...
  
  @@index([tenantId])              // Query básica
  @@index([tenantId, status])      // Kanban board
  @@index([tenantId, aiScore])     // Ordenação por score
  @@index([tenantId, createdAt])   // Ordenação por data
}
```

### Justificativa
- `[tenantId]`: Essencial para queries básicas
- `[tenantId, status]`: Otimiza Kanban Board (filtro por coluna)
- `[tenantId, aiScore]`: Otimiza ordenação por score
- `[tenantId, createdAt]`: Otimiza ordenação por data

### Consequências

**Positivas:**
- Queries < 200ms
- Escalabilidade garantida

**Negativas:**
- Overhead de storage (~50 bytes por lead)
- Overhead de insert (~10-20ms)

**Trade-off:** Aceitável para garantir performance de leitura.

---

## ADR-008: Prisma Middleware (Futuro)

### Status
📋 **PLANEJADO** - Pós-MVP

### Contexto
Decidir se implementar middleware para filtro automático de tenant.

### Decisão (Preliminar)
**Sim, implementar em versão futura** para reduzir risco de esquecimento de filtro.

### Implementação Proposta
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  // Adicionar filtro de tenant automaticamente
  if (params.model === 'Lead') {
    const tenantId = await getCurrentTenantId();
    
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
    }
  }
  
  return next(params);
});

export { prisma };
```

### Prós
- ✅ Filtro automático (reduz risco)
- ✅ Defense in depth

### Contras
- ⚠️ Pode esconder bugs
- ⚠️ Complexidade adicional

### Decisão Final
Implementar **após MVP** quando sistema estiver estável.

---

## Resumo de Decisões

| ADR | Decisão | Status | Fase |
|-----|---------|--------|------|
| ADR-001 | Shared DB, Shared Schema | ✅ Aprovado | Fase 1 |
| ADR-002 | Sessão de Autenticação | ✅ Aprovado | Fase 2 |
| ADR-003 | NextAuth.js v5 | ✅ Aprovado | Fase 2 |
| ADR-004 | Self-Service Signup | ✅ Aprovado | Fase 2 |
| ADR-005 | Tenant Selector | ⏳ Planejado | Fase 3 |
| ADR-006 | Tenant Default | ✅ Aprovado | Fase 1 |
| ADR-007 | Índices Compostos | ✅ Aprovado | Fase 1 |
| ADR-008 | Prisma Middleware | 📋 Futuro | Pós-MVP |

---

## Revisões e Aprovações

| Stakeholder | Data | Status |
|-------------|------|--------|
| Arquiteto (Alex) | 25/12/2025 | ✅ Aprovado |
| Tech Lead | Pendente | ⏳ Aguardando |
| Security Engineer | Pendente | ⏳ Aguardando |
| Product Manager | Pendente | ⏳ Aguardando |

---

**Próximo Documento:** [02-data-architecture.md](02-data-architecture.md)

