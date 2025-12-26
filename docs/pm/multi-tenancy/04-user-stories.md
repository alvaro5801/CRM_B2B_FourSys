# User Stories & Epics - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Pronto para Sprint Planning

---

## ESTRUTURA DE ÉPICOS

### Hierarquia
```
TEMA: Multi-tenancy
├── EPIC 1: Isolamento de Dados
│   ├── US001: Schema com tenantId
│   ├── US002: Server Actions com filtro
│   ├── US003: Validação de propriedade
│   └── US004: Testes de isolamento
│
├── EPIC 2: Autenticação e Onboarding
│   ├── US005: Signup self-service
│   ├── US006: Login com tenant context
│   ├── US007: Gestão de usuários
│   └── US008: Convites de equipe
│
├── EPIC 3: Migração e Segurança
│   ├── US009: Migração de dados existentes
│   ├── US010: Auditoria de segurança
│   └── US011: Monitoramento de isolamento
│
└── EPIC 4: Gestão de Tenants (Opcional)
    ├── US012: Dashboard de admin
    ├── US013: Tenant Selector
    └── US014: Estatísticas de uso
```

---

## EPIC 1: ISOLAMENTO DE DADOS

**Objetivo:** Garantir que cada tenant veja apenas seus próprios dados  
**Valor de Negócio:** Segurança e compliance  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 34 pontos  
**Sprint:** Sprint 1

---

### US001 - Schema com tenantId

**Como** desenvolvedor  
**Quero** adicionar campo tenantId ao schema  
**Para que** possamos identificar a qual tenant cada lead pertence

**Critérios de Aceitação:**
- [ ] Model `Tenant` criado no schema
- [ ] Campo `tenantId` adicionado ao model `Lead`
- [ ] Relação `tenant` configurada
- [ ] Índices criados: `[tenantId]`, `[tenantId, status]`, `[tenantId, aiScore]`
- [ ] Migration executada com sucesso
- [ ] Prisma Studio mostra nova estrutura

**Tarefas Técnicas:**
1. Editar `prisma/schema.prisma`
2. Adicionar model Tenant
3. Adicionar tenantId ao Lead
4. Adicionar índices
5. Executar `npx prisma migrate dev`
6. Validar no Prisma Studio

**Estimativa:** 5 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** Nenhuma

---

### US002 - Server Actions com filtro

**Como** desenvolvedor  
**Quero** adicionar filtro de tenant em todas as Server Actions  
**Para que** queries retornem apenas dados do tenant atual

**Critérios de Aceitação:**
- [ ] Função `getCurrentTenantId()` implementada
- [ ] `getLeads()` filtra por tenantId
- [ ] `createLead()` adiciona tenantId automaticamente
- [ ] `updateLeadStatus()` valida propriedade
- [ ] `getDashboardMetrics()` calcula apenas para tenant
- [ ] `deleteLead()` valida propriedade
- [ ] Nenhuma query sem filtro de tenant

**Tarefas Técnicas:**
1. Criar função `getCurrentTenantId()` em `leads.ts`
2. Modificar `getLeads()` - adicionar where
3. Modificar `createLead()` - adicionar tenantId
4. Modificar `updateLeadStatus()` - validar propriedade
5. Modificar `getDashboardMetrics()` - filtrar por tenant
6. Modificar `deleteLead()` - validar propriedade
7. Code review focado em segurança

**Estimativa:** 13 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US001

---

### US003 - Validação de propriedade

**Como** desenvolvedor  
**Quero** validar que usuário possui o recurso antes de operações  
**Para que** não haja vulnerabilidades IDOR

**Critérios de Aceitação:**
- [ ] Todas as operações de update validam propriedade
- [ ] Todas as operações de delete validam propriedade
- [ ] Erro claro quando acesso negado
- [ ] Logs de tentativas de acesso inválido

**Tarefas Técnicas:**
1. Adicionar `findFirst` antes de update
2. Adicionar `findFirst` antes de delete
3. Lançar erro se não encontrado
4. Adicionar logging de tentativas inválidas
5. Testar com IDs de outros tenants

**Estimativa:** 8 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US002

---

### US004 - Testes de isolamento

**Como** QA Engineer  
**Quero** testes automatizados de isolamento  
**Para que** garantamos zero data leakage

**Critérios de Aceitação:**
- [ ] Teste: Tenant A não vê leads do Tenant B
- [ ] Teste: Tenant A não atualiza leads do Tenant B
- [ ] Teste: Tenant A não deleta leads do Tenant B
- [ ] Teste: Dashboard mostra apenas dados do tenant
- [ ] Teste: Tentativa de IDOR falha
- [ ] Todos os testes passam em CI/CD

**Tarefas Técnicas:**
1. Criar `tests/security/isolation.test.ts`
2. Setup: criar 2 tenants + leads
3. Implementar teste de listagem
4. Implementar teste de IDOR (update)
5. Implementar teste de IDOR (delete)
6. Implementar teste de dashboard
7. Adicionar ao CI/CD

**Estimativa:** 8 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US003

---

## EPIC 2: AUTENTICAÇÃO E ONBOARDING

**Objetivo:** Permitir signup self-service e login com tenant context  
**Valor de Negócio:** Onboarding automático, redução de CAC  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 34 pontos  
**Sprint:** Sprint 2

---

### US005 - Signup self-service

**Como** gestor de vendas  
**Quero** me cadastrar no CRM sem aprovação manual  
**Para que** possa começar a usar imediatamente

**Critérios de Aceitação:**
- [ ] Página `/signup` funcional
- [ ] Formulário com: nome empresa, email, senha, nome completo
- [ ] Validação de email único
- [ ] Validação de slug único (gerado do nome da empresa)
- [ ] Tenant criado automaticamente
- [ ] Primeiro usuário é admin
- [ ] Redirecionamento para dashboard
- [ ] Tempo total < 5 minutos

**Tarefas Técnicas:**
1. Criar página `app/signup/page.tsx`
2. Criar componente SignupForm
3. Criar Server Action `signupUser()`
4. Implementar criação de Tenant
5. Implementar criação de User
6. Implementar hash de senha (bcrypt)
7. Gerar sessão com tenantId
8. Testar fluxo end-to-end

**Estimativa:** 13 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US001

---

### US006 - Login com tenant context

**Como** usuário cadastrado  
**Quero** fazer login e acessar dados da minha empresa  
**Para que** possa gerenciar meus leads

**Critérios de Aceitação:**
- [ ] Página `/login` funcional
- [ ] Formulário com email + senha
- [ ] Validação de credenciais
- [ ] Busca de tenantId do usuário
- [ ] Sessão contém tenantId
- [ ] Redirecionamento para dashboard
- [ ] Dashboard mostra dados do tenant correto

**Tarefas Técnicas:**
1. Instalar NextAuth.js
2. Configurar `app/api/auth/[...nextauth]/route.ts`
3. Criar página `app/login/page.tsx`
4. Implementar CredentialsProvider
5. Adicionar tenantId ao token JWT
6. Atualizar `getCurrentTenantId()` para usar sessão
7. Testar login/logout

**Estimativa:** 13 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US005

---

### US007 - Gestão de usuários

**Como** admin do tenant  
**Quero** ver e gerenciar usuários da minha empresa  
**Para que** possa controlar quem tem acesso

**Critérios de Aceitação:**
- [ ] Página `/settings/users` funcional
- [ ] Listagem de usuários do tenant
- [ ] Desativar usuário (soft delete)
- [ ] Reativar usuário
- [ ] Ver último acesso
- [ ] Apenas admin tem acesso

**Tarefas Técnicas:**
1. Criar página `app/settings/users/page.tsx`
2. Criar Server Action `getUsers()`
3. Criar Server Action `toggleUserStatus()`
4. Implementar validação de role (admin)
5. Criar componente UserList
6. Testar permissões

**Estimativa:** 5 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US006

---

### US008 - Convites de equipe

**Como** admin do tenant  
**Quero** convidar membros da equipe por email  
**Para que** possam usar o CRM

**Critérios de Aceitação:**
- [ ] Botão "Convidar Usuário" em `/settings/users`
- [ ] Modal com campo de email
- [ ] Email de convite enviado
- [ ] Link de ativação único
- [ ] Usuário define senha ao ativar
- [ ] Usuário associado ao tenant correto

**Tarefas Técnicas:**
1. Criar Server Action `inviteUser()`
2. Gerar token de convite único
3. Enviar email (usar Resend ou similar)
4. Criar página `/invite/[token]`
5. Validar token
6. Criar usuário ao ativar
7. Testar fluxo completo

**Estimativa:** 8 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US007

---

## EPIC 3: MIGRAÇÃO E SEGURANÇA

**Objetivo:** Migrar dados existentes e garantir segurança  
**Valor de Negócio:** Proteção de dados, compliance  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 21 pontos  
**Sprint:** Sprint 1

---

### US009 - Migração de dados existentes

**Como** desenvolvedor  
**Quero** migrar leads existentes para tenant default  
**Para que** não haja perda de dados

**Critérios de Aceitação:**
- [ ] Backup do banco criado
- [ ] Tenant "FourSys (Default)" criado
- [ ] Todos os leads órfãos associados ao tenant default
- [ ] Nenhum lead com tenantId NULL
- [ ] Contagem de leads antes/depois igual
- [ ] Rollback testado

**Tarefas Técnicas:**
1. Fazer backup: `pg_dump` ou similar
2. Criar script `prisma/migrations/assign-default-tenant.ts`
3. Implementar criação de tenant default
4. Implementar update de leads órfãos
5. Executar script
6. Validar com `SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL`
7. Testar rollback

**Estimativa:** 5 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US001

---

### US010 - Auditoria de segurança

**Como** security engineer  
**Quero** auditar código para vulnerabilidades  
**Para que** garantamos zero data leakage

**Critérios de Aceitação:**
- [ ] Code review de todas as Server Actions
- [ ] Checklist de segurança preenchido
- [ ] Nenhuma query sem filtro de tenant
- [ ] Nenhum tenantId aceito do cliente
- [ ] Validação de propriedade em todas as operações
- [ ] Relatório de auditoria gerado

**Tarefas Técnicas:**
1. Revisar `src/app/actions/leads.ts`
2. Verificar filtros de tenant
3. Verificar validações de propriedade
4. Verificar que tenantId vem da sessão
5. Executar testes de penetração
6. Documentar findings
7. Corrigir vulnerabilidades encontradas

**Estimativa:** 8 pontos  
**Prioridade:** 🔴 Crítica  
**Dependências:** US002, US003

---

### US011 - Monitoramento de isolamento

**Como** DevOps  
**Quero** monitorar tentativas de acesso cruzado  
**Para que** possamos detectar ataques

**Critérios de Aceitação:**
- [ ] Logs de tentativas de acesso inválido
- [ ] Alertas quando tentativa detectada
- [ ] Dashboard de segurança
- [ ] Métricas de isolamento
- [ ] Integração com Sentry ou similar

**Tarefas Técnicas:**
1. Adicionar logging em validações de propriedade
2. Criar função `detectCrossTenantAccess()`
3. Integrar com Sentry
4. Criar alertas no Slack/Email
5. Criar dashboard de segurança
6. Testar com tentativas simuladas

**Estimativa:** 8 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US010

---

## EPIC 4: GESTÃO DE TENANTS (OPCIONAL)

**Objetivo:** Ferramentas para admin global gerenciar tenants  
**Valor de Negócio:** Operações eficientes  
**Prioridade:** 🟡 Média  
**Estimativa Total:** 21 pontos  
**Sprint:** Sprint 3 (Opcional)

---

### US012 - Dashboard de admin

**Como** admin global  
**Quero** ver todos os tenants e suas estatísticas  
**Para que** possa monitorar uso do sistema

**Critérios de Aceitação:**
- [ ] Página `/admin/tenants` funcional
- [ ] Listagem paginada de tenants
- [ ] Estatísticas: leads, usuários, último acesso
- [ ] Busca por nome/slug
- [ ] Ordenação por data, leads, usuários
- [ ] Apenas admin global tem acesso

**Tarefas Técnicas:**
1. Criar página `app/admin/tenants/page.tsx`
2. Criar Server Action `getAllTenants()`
3. Criar Server Action `getTenantStats()`
4. Implementar paginação
5. Implementar busca
6. Implementar ordenação
7. Validar permissões

**Estimativa:** 8 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US006

---

### US013 - Tenant Selector

**Como** usuário multi-tenant  
**Quero** trocar entre tenants facilmente  
**Para que** possa gerenciar múltiplas empresas

**Critérios de Aceitação:**
- [ ] Dropdown de seleção de tenant na sidebar
- [ ] Listagem de tenants do usuário
- [ ] Troca de tenant sem logout
- [ ] Dashboard atualiza automaticamente
- [ ] Tenant atual destacado

**Tarefas Técnicas:**
1. Criar componente `TenantSelector`
2. Criar Server Action `getUserTenants()`
3. Criar Server Action `switchTenant()`
4. Atualizar sessão com novo tenantId
5. Revalidar dados do dashboard
6. Adicionar à sidebar
7. Testar troca de tenant

**Estimativa:** 8 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US012

---

### US014 - Estatísticas de uso

**Como** admin global  
**Quero** ver estatísticas de uso por tenant  
**Para que** possa identificar clientes power users

**Critérios de Aceitação:**
- [ ] Página `/admin/tenants/[id]/stats` funcional
- [ ] Gráfico de leads criados por mês
- [ ] Gráfico de usuários ativos
- [ ] Métricas de engajamento
- [ ] Exportação de dados

**Tarefas Técnicas:**
1. Criar página de estatísticas
2. Criar Server Action `getTenantDetailedStats()`
3. Implementar queries de agregação
4. Criar gráficos com Recharts
5. Implementar exportação CSV
6. Testar performance

**Estimativa:** 5 pontos  
**Prioridade:** 🟡 Média  
**Dependências:** US012

---

## RESUMO DE ESTIMATIVAS

| Epic | User Stories | Pontos | Sprint |
|------|--------------|--------|--------|
| **Epic 1: Isolamento de Dados** | 4 | 34 | Sprint 1 |
| **Epic 2: Autenticação e Onboarding** | 4 | 39 | Sprint 2 |
| **Epic 3: Migração e Segurança** | 3 | 21 | Sprint 1 |
| **Epic 4: Gestão de Tenants** | 3 | 21 | Sprint 3 |
| **TOTAL** | **14** | **115** | **3 Sprints** |

---

## PRIORIZAÇÃO

### Must Have (Sprint 1-2)
- ✅ Epic 1: Isolamento de Dados
- ✅ Epic 2: Autenticação e Onboarding
- ✅ Epic 3: Migração e Segurança

### Should Have (Sprint 3)
- ⏳ Epic 4: Gestão de Tenants

### Could Have (Futuro)
- 📋 Subdomain routing
- 📋 White-label
- 📋 Customizações por tenant

---

## DEFINITION OF DONE (DoD)

Uma User Story está **DONE** quando:
- ✅ Código implementado e revisado
- ✅ Testes unitários passando
- ✅ Testes de integração passando
- ✅ Code review aprovado (focado em segurança)
- ✅ Documentação atualizada
- ✅ Testado em staging
- ✅ Critérios de aceitação validados
- ✅ Sem bugs críticos

---

## PRÓXIMOS PASSOS

1. **Sprint Planning:** Priorizar US001-US004 + US009 para Sprint 1
2. **Grooming:** Refinar estimativas com a equipe
3. **Kickoff:** Iniciar Sprint 1 imediatamente

---

**Próximo Documento:** [05-gtm-strategy.md](05-gtm-strategy.md)

