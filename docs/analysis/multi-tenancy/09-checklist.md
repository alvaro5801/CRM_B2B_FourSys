# Checklist de Implementação

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## FASE 1: SCHEMA E MIGRATIONS

**Tempo Estimado:** 2-3 horas  
**Risco:** 🟡 Médio  
**Prioridade:** 🔴 Crítica

### 1.1 Preparação
- [ ] Fazer backup completo do banco de dados atual
- [ ] Criar branch `feature/multi-tenancy`
- [ ] Verificar que não há migrations pendentes
- [ ] Documentar estado atual do banco

### 1.2 Alterações no Schema
- [ ] Abrir `prisma/schema.prisma`
- [ ] Adicionar model `Tenant` (ver [03-impacto-schema.md](03-impacto-schema.md#321-criar-model-tenant))
- [ ] Adicionar campo `tenantId` ao model `Lead`
- [ ] Adicionar relação `tenant` ao model `Lead`
- [ ] Adicionar índices:
  - [ ] `@@index([tenantId])`
  - [ ] `@@index([tenantId, status])`
  - [ ] `@@index([tenantId, aiScore])`
  - [ ] `@@index([tenantId, createdAt])`
- [ ] (Opcional) Adicionar model `User`

### 1.3 Criar Migration
- [ ] Executar: `npx prisma migrate dev --name add_multi_tenancy`
- [ ] Verificar arquivo de migration gerado
- [ ] Revisar SQL da migration

### 1.4 Migrar Dados Existentes
- [ ] Criar script `prisma/migrations/assign-default-tenant.ts`
- [ ] Implementar criação de tenant default
- [ ] Implementar atualização de leads órfãos
- [ ] Executar script de migração
- [ ] Verificar que todos os leads têm `tenantId`

### 1.5 Validação
- [ ] Abrir Prisma Studio: `npx prisma studio`
- [ ] Verificar tabela `Tenant` existe
- [ ] Verificar coluna `tenantId` em `Lead`
- [ ] Verificar índices criados
- [ ] Executar query: `SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL` (deve ser 0)

---

## FASE 2: SERVER ACTIONS

**Tempo Estimado:** 3-4 horas  
**Risco:** 🔴 Alto  
**Prioridade:** 🔴 Crítica

### 2.1 Função de Contexto
- [ ] Abrir `src/app/actions/leads.ts`
- [ ] Adicionar função `getCurrentTenantId()` no topo
- [ ] Implementar lógica temporária (hardcoded ou header)
- [ ] Adicionar comentário TODO para integração com auth

### 2.2 Modificar getLeads()
- [ ] Adicionar `const tenantId = await getCurrentTenantId()`
- [ ] Adicionar `where: { tenantId }` na query
- [ ] Testar manualmente

### 2.3 Modificar createLead()
- [ ] Adicionar `const tenantId = await getCurrentTenantId()`
- [ ] Adicionar `tenantId` aos dados do lead
- [ ] Verificar que `tenantId` NÃO vem do input
- [ ] Testar criação de lead

### 2.4 Modificar updateLeadStatus()
- [ ] Adicionar `const tenantId = await getCurrentTenantId()`
- [ ] Adicionar validação de propriedade (findFirst)
- [ ] Adicionar `tenantId` no where do update
- [ ] Testar atualização de lead

### 2.5 Modificar getDashboardMetrics()
- [ ] Adicionar `const tenantId = await getCurrentTenantId()`
- [ ] Adicionar `tenantId` no aggregate
- [ ] Adicionar `tenantId` no count
- [ ] Testar métricas do dashboard

### 2.6 Modificar deleteLead()
- [ ] Adicionar `const tenantId = await getCurrentTenantId()`
- [ ] Adicionar `tenantId` no where do delete
- [ ] Testar deleção de lead

### 2.7 Criar Novo Arquivo: tenants.ts
- [ ] Criar `src/app/actions/tenants.ts`
- [ ] Implementar `getCurrentTenant()`
- [ ] Implementar `updateTenantSettings()`
- [ ] Implementar `getTenantStats()`
- [ ] Testar funções

### 2.8 Validação
- [ ] Executar `npm run build` (deve compilar sem erros)
- [ ] Testar cada Server Action manualmente
- [ ] Verificar que dados são filtrados por tenant

---

## FASE 3: COMPONENTES (OPCIONAL)

**Tempo Estimado:** 1-2 horas  
**Risco:** 🟢 Baixo  
**Prioridade:** 🟡 Média

### 3.1 Sidebar
- [ ] Abrir `src/components/layout/Sidebar.tsx`
- [ ] Adicionar chamada a `getCurrentTenant()`
- [ ] Exibir nome do tenant no topo
- [ ] Testar visualmente

### 3.2 CreateLeadModal (Opcional)
- [ ] Abrir `src/components/kanban/CreateLeadModal.tsx`
- [ ] Adicionar exibição do tenant no DialogDescription
- [ ] Testar visualmente

### 3.3 TenantSelector (Opcional - Avançado)
- [ ] Criar `src/components/layout/TenantSelector.tsx`
- [ ] Implementar seleção de tenant
- [ ] Criar API route `/api/tenant/switch`
- [ ] Testar troca de tenant

---

## FASE 4: SEGURANÇA

**Tempo Estimado:** 2-3 horas  
**Risco:** 🔴 Alto  
**Prioridade:** 🔴 Crítica

### 4.1 Code Review
- [ ] Revisar TODAS as Server Actions
- [ ] Verificar que `tenantId` NUNCA vem do cliente
- [ ] Verificar que TODAS as queries têm `where: { tenantId }`
- [ ] Verificar validações de propriedade em update/delete

### 4.2 Testes de Segurança
- [ ] Criar `tests/security/isolation.test.ts`
- [ ] Testar isolamento de dados entre tenants
- [ ] Testar tentativa de IDOR (deve falhar)
- [ ] Testar tentativa de spoofing (deve falhar)
- [ ] Todos os testes devem passar

### 4.3 Prisma Middleware (Opcional - Avançado)
- [ ] Abrir `src/lib/prisma.ts`
- [ ] Implementar middleware de filtro automático
- [ ] Testar que filtro funciona
- [ ] Documentar comportamento

### 4.4 Auditoria (Opcional)
- [ ] Criar model `AuditLog`
- [ ] Implementar logging de acessos
- [ ] Implementar alertas de acesso cruzado

---

## FASE 5: SEED

**Tempo Estimado:** 1 hora  
**Risco:** 🟢 Baixo  
**Prioridade:** 🟡 Média

### 5.1 Atualizar Seed
- [ ] Abrir `prisma/seed.ts`
- [ ] Adicionar criação de tenants (3 exemplos)
- [ ] Adicionar `tenantId` a todos os leads
- [ ] Distribuir leads entre tenants
- [ ] Usar `upsert` para evitar duplicatas

### 5.2 Executar Seed
- [ ] Executar: `npm run db:reset`
- [ ] Verificar saída do seed (sem erros)
- [ ] Abrir Prisma Studio
- [ ] Verificar 3 tenants criados
- [ ] Verificar leads distribuídos entre tenants

---

## FASE 6: TESTES

**Tempo Estimado:** 2-3 horas  
**Risco:** 🟡 Médio  
**Prioridade:** 🔴 Crítica

### 6.1 Testes Unitários
- [ ] Criar `tests/actions/leads.test.ts`
- [ ] Testar `getLeads()` retorna apenas leads do tenant
- [ ] Testar `createLead()` adiciona tenantId correto
- [ ] Testar `updateLeadStatus()` valida propriedade
- [ ] Testar `getDashboardMetrics()` calcula por tenant
- [ ] Todos os testes devem passar

### 6.2 Testes de Integração
- [ ] Testar fluxo completo: criar lead → mover no Kanban → ver dashboard
- [ ] Testar com múltiplos tenants
- [ ] Verificar isolamento de dados

### 6.3 Testes Manuais
- [ ] Criar lead via interface
- [ ] Arrastar lead no Kanban
- [ ] Verificar métricas do dashboard
- [ ] Testar em diferentes navegadores

### 6.4 Testes de Performance
- [ ] Criar 1.000 leads para um tenant
- [ ] Medir tempo de `getLeads()` (deve ser < 100ms)
- [ ] Medir tempo de `getDashboardMetrics()` (deve ser < 200ms)
- [ ] Verificar que índices estão sendo usados (EXPLAIN QUERY PLAN)

---

## FASE 7: AUTENTICAÇÃO (FUTURO)

**Tempo Estimado:** 4-6 horas  
**Risco:** 🔴 Alto  
**Prioridade:** ⏳ Futuro

### 7.1 Escolher Biblioteca
- [ ] Decidir: NextAuth.js vs Clerk vs Custom
- [ ] Instalar dependências
- [ ] Configurar provider (Google, GitHub, etc.)

### 7.2 Integração
- [ ] Adicionar campo `tenantId` ao token de sessão
- [ ] Atualizar `getCurrentTenantId()` para usar sessão real
- [ ] Remover hardcoded tenantId

### 7.3 Fluxo de Signup
- [ ] Criar página de signup
- [ ] Criar tenant automaticamente no signup
- [ ] Criar primeiro usuário como admin
- [ ] Testar fluxo completo

### 7.4 Gestão de Usuários
- [ ] Criar página de convite de usuários
- [ ] Implementar roles (admin, user, viewer)
- [ ] Testar permissões

---

## FASE 8: DOCUMENTAÇÃO

**Tempo Estimado:** 1 hora  
**Risco:** 🟢 Baixo  
**Prioridade:** 🟡 Média

### 8.1 Atualizar README
- [ ] Documentar multi-tenancy no README.md
- [ ] Adicionar instruções de setup
- [ ] Adicionar exemplos de uso

### 8.2 Documentação Técnica
- [ ] Documentar arquitetura de multi-tenancy
- [ ] Documentar decisões arquiteturais
- [ ] Documentar fluxos de dados

### 8.3 Guia de Desenvolvimento
- [ ] Documentar como adicionar novos models
- [ ] Documentar padrões de segurança
- [ ] Documentar troubleshooting comum

---

## VALIDAÇÃO FINAL

### Checklist de Aceitação
- [ ] ✅ Cada tenant vê apenas seus próprios leads
- [ ] ✅ Impossível acessar dados de outro tenant
- [ ] ✅ Dashboard e Kanban filtrados automaticamente
- [ ] ✅ Nenhuma query sem filtro de `tenantId`
- [ ] ✅ Validação de propriedade em todas as operações
- [ ] ✅ Testes de segurança passando
- [ ] ✅ Performance adequada (< 200ms)
- [ ] ✅ Seed funciona corretamente
- [ ] ✅ Build de produção sem erros
- [ ] ✅ Documentação atualizada

### Aprovações Necessárias
- [ ] Tech Lead aprovou arquitetura
- [ ] Segurança aprovou mitigações
- [ ] Product Manager aprovou UX
- [ ] QA validou funcionalidades

---

## DEPLOY

### Pré-Deploy
- [ ] Fazer backup do banco de produção
- [ ] Testar migration em ambiente de staging
- [ ] Preparar rollback plan
- [ ] Comunicar equipe sobre deploy

### Deploy
- [ ] Aplicar migrations em produção
- [ ] Executar script de migração de dados
- [ ] Verificar que aplicação está funcionando
- [ ] Monitorar logs por 1 hora

### Pós-Deploy
- [ ] Verificar métricas de performance
- [ ] Verificar logs de erro
- [ ] Testar funcionalidades críticas
- [ ] Comunicar sucesso do deploy

---

**Próximo Documento:** [10-estimativas.md](10-estimativas.md)



