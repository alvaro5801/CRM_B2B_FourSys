# Resumo de Arquivos Impactados

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. ALTERAÇÕES OBRIGATÓRIAS

### 1.1 Arquivos Críticos (6 arquivos)

| # | Arquivo | Tipo | Complexidade | Prioridade |
|---|---------|------|--------------|------------|
| 1 | `prisma/schema.prisma` | Alteração | 🔴 Alta | Crítica |
| 2 | `src/app/actions/leads.ts` | Alteração | 🔴 Alta | Crítica |
| 3 | `prisma/seed.ts` | Alteração | 🟡 Média | Alta |
| 4 | `src/app/actions/tenants.ts` | Novo | 🟢 Baixa | Média |
| 5 | `prisma/migrations/assign-default-tenant.ts` | Novo | 🟡 Média | Alta |
| 6 | `src/lib/prisma.ts` | Alteração (opcional) | 🟡 Média | Baixa |

---

### 1.2 Detalhamento das Alterações

#### 📄 `prisma/schema.prisma`

**Tipo:** Alteração  
**Linhas Afetadas:** ~50 linhas adicionadas

**Mudanças:**
- ✅ Adicionar model `Tenant` (15 linhas)
- ✅ Adicionar campo `tenantId` ao model `Lead`
- ✅ Adicionar relação `tenant` ao model `Lead`
- ✅ Adicionar 4 índices novos
- ❌ (Opcional) Adicionar model `User`

**Referência:** [03-impacto-schema.md](03-impacto-schema.md)

---

#### 📄 `src/app/actions/leads.ts`

**Tipo:** Alteração  
**Linhas Afetadas:** ~30 linhas modificadas

**Mudanças:**
- ✅ Adicionar função `getCurrentTenantId()` (10 linhas)
- ✅ Modificar `getLeads()` (2 linhas)
- ✅ Modificar `createLead()` (2 linhas)
- ✅ Modificar `updateLeadStatus()` (10 linhas)
- ✅ Modificar `getDashboardMetrics()` (4 linhas)
- ✅ Modificar `deleteLead()` (2 linhas)

**Referência:** [04-impacto-server-actions.md](04-impacto-server-actions.md)

---

#### 📄 `prisma/seed.ts`

**Tipo:** Alteração  
**Linhas Afetadas:** ~40 linhas adicionadas

**Mudanças:**
- ✅ Criar 3 tenants de exemplo
- ✅ Adicionar `tenantId` a todos os leads
- ✅ Distribuir leads entre tenants

**Referência:** [06-impacto-seed.md](06-impacto-seed.md)

---

#### 📄 `src/app/actions/tenants.ts` (NOVO)

**Tipo:** Novo arquivo  
**Linhas:** ~80 linhas

**Conteúdo:**
- ✅ Função `getCurrentTenant()`
- ✅ Função `updateTenantSettings()`
- ✅ Função `getTenantStats()`
- ✅ Types e interfaces

**Referência:** [04-impacto-server-actions.md#43-novas-server-actions-necessárias](04-impacto-server-actions.md#43-novas-server-actions-necessárias)

---

#### 📄 `prisma/migrations/assign-default-tenant.ts` (NOVO)

**Tipo:** Novo arquivo (script de migração)  
**Linhas:** ~100 linhas

**Conteúdo:**
- ✅ Criar tenant default
- ✅ Associar leads órfãos ao tenant
- ✅ Validação pós-migração

**Referência:** [11-scripts-migracao.md](11-scripts-migracao.md)

---

#### 📄 `src/lib/prisma.ts` (OPCIONAL)

**Tipo:** Alteração (opcional, avançado)  
**Linhas Afetadas:** ~30 linhas adicionadas

**Mudanças:**
- ❌ (Opcional) Adicionar Prisma Middleware para filtro automático

**Referência:** [07-seguranca.md#4-prisma-middleware-avançado](07-seguranca.md#4-prisma-middleware-avançado)

---

## 2. ALTERAÇÕES OPCIONAIS

### 2.1 Componentes UI (3 arquivos)

| # | Arquivo | Tipo | Complexidade | Benefício |
|---|---------|------|--------------|-----------|
| 1 | `src/components/layout/Sidebar.tsx` | Alteração | 🟢 Baixa | UX: Exibir tenant atual |
| 2 | `src/components/kanban/CreateLeadModal.tsx` | Alteração | 🟢 Baixa | UX: Contexto visual |
| 3 | `src/components/layout/TenantSelector.tsx` | Novo | 🟡 Média | Multi-tenant por usuário |

**Referência:** [05-impacto-componentes.md](05-impacto-componentes.md)

---

### 2.2 Scripts Auxiliares (4 arquivos)

| # | Arquivo | Tipo | Utilidade |
|---|---------|------|-----------|
| 1 | `scripts/backup-database.sh` | Novo | Backup antes de migrar |
| 2 | `scripts/restore-database.sh` | Novo | Restaurar backup |
| 3 | `scripts/validate-multi-tenancy.ts` | Novo | Validar implementação |
| 4 | `scripts/rollback-multi-tenancy.sh` | Novo | Reverter mudanças |

**Referência:** [11-scripts-migracao.md](11-scripts-migracao.md)

---

## 3. ARQUIVOS SEM ALTERAÇÃO

### 3.1 Componentes UI (15+ arquivos)

✅ **Nenhuma alteração necessária:**

- `src/components/kanban/KanbanBoard.tsx`
- `src/components/kanban/KanbanColumn.tsx`
- `src/components/kanban/LeadCard.tsx`
- `src/components/dashboard/DashboardGrid.tsx`
- `src/components/dashboard/MetricCard.tsx`
- `src/components/dashboard/SalesChart.tsx`
- Todos os componentes em `src/components/ui/*`

**Motivo:** O filtro por tenant acontece nas Server Actions. Componentes recebem dados já filtrados.

---

### 3.2 Páginas (3 arquivos)

✅ **Nenhuma alteração necessária:**

- `src/app/page.tsx` (Dashboard)
- `src/app/kanban/page.tsx` (Kanban)
- `src/app/layout.tsx` (Layout Raiz - alteração opcional)

**Motivo:** Páginas chamam Server Actions que já retornam dados filtrados.

---

### 3.3 Validações (1 arquivo)

✅ **Nenhuma alteração necessária:**

- `src/lib/validations/lead.ts`

**Motivo:** `tenantId` é adicionado automaticamente nas Server Actions, não vem do formulário.

---

### 3.4 Utilitários (1 arquivo)

✅ **Nenhuma alteração necessária:**

- `src/lib/utils.ts`

**Motivo:** Funções utilitárias não dependem de tenant.

---

## 4. RESUMO QUANTITATIVO

### 4.1 Por Tipo de Alteração

| Tipo | Quantidade | Complexidade Média |
|------|------------|-------------------|
| **Alterações Obrigatórias** | 3 arquivos | 🔴 Alta |
| **Novos Arquivos Obrigatórios** | 2 arquivos | 🟡 Média |
| **Alterações Opcionais** | 3 arquivos | 🟢 Baixa |
| **Novos Arquivos Opcionais** | 5 arquivos | 🟡 Média |
| **Sem Alteração** | 20+ arquivos | - |
| **TOTAL DE ALTERAÇÕES** | **13 arquivos** | - |

---

### 4.2 Por Complexidade

| Complexidade | Arquivos | % do Total |
|--------------|----------|------------|
| 🔴 Alta | 2 | 15% |
| 🟡 Média | 5 | 38% |
| 🟢 Baixa | 6 | 47% |
| **TOTAL** | **13** | **100%** |

---

### 4.3 Por Prioridade

| Prioridade | Arquivos | Descrição |
|------------|----------|-----------|
| 🔴 Crítica | 3 | Bloqueia implementação |
| 🟡 Alta | 2 | Necessário para funcionar |
| 🟢 Média | 3 | Melhora UX |
| ⚪ Baixa | 5 | Auxiliares/Opcionais |
| **TOTAL** | **13** | - |

---

## 5. MAPA DE DEPENDÊNCIAS

### 5.1 Ordem de Implementação

```
1. prisma/schema.prisma
   ↓
2. Migration (npx prisma migrate dev)
   ↓
3. prisma/migrations/assign-default-tenant.ts
   ↓
4. src/app/actions/leads.ts
   ↓
5. src/app/actions/tenants.ts
   ↓
6. prisma/seed.ts
   ↓
7. (Opcional) src/components/layout/Sidebar.tsx
   ↓
8. (Opcional) src/components/kanban/CreateLeadModal.tsx
```

**Regra:** Não prosseguir para próximo arquivo sem validar o anterior.

---

### 5.2 Dependências Críticas

| Arquivo | Depende De | Bloqueio |
|---------|------------|----------|
| `leads.ts` | `schema.prisma` migrado | 🔴 Crítico |
| `tenants.ts` | `schema.prisma` migrado | 🔴 Crítico |
| `seed.ts` | `schema.prisma` migrado | 🔴 Crítico |
| `Sidebar.tsx` | `tenants.ts` implementado | 🟡 Médio |

---

## 6. CHECKLIST DE ARQUIVOS

### 6.1 Fase 1: Schema e Migrations
- [ ] `prisma/schema.prisma` - Alterado
- [ ] Migration gerada - Criada
- [ ] `prisma/migrations/assign-default-tenant.ts` - Criado
- [ ] Migration executada - Validada

### 6.2 Fase 2: Server Actions
- [ ] `src/app/actions/leads.ts` - Alterado
- [ ] `src/app/actions/tenants.ts` - Criado
- [ ] Testes unitários - Passando

### 6.3 Fase 3: Seed
- [ ] `prisma/seed.ts` - Alterado
- [ ] Seed executado - Validado

### 6.4 Fase 4: Componentes (Opcional)
- [ ] `src/components/layout/Sidebar.tsx` - Alterado
- [ ] `src/components/kanban/CreateLeadModal.tsx` - Alterado
- [ ] `src/components/layout/TenantSelector.tsx` - Criado (se necessário)

### 6.5 Fase 5: Scripts Auxiliares (Opcional)
- [ ] `scripts/backup-database.sh` - Criado
- [ ] `scripts/restore-database.sh` - Criado
- [ ] `scripts/validate-multi-tenancy.ts` - Criado
- [ ] `scripts/rollback-multi-tenancy.sh` - Criado

---

## 7. VALIDAÇÃO FINAL

### 7.1 Checklist de Validação

- [ ] Todos os arquivos obrigatórios alterados/criados
- [ ] Build de produção sem erros: `npm run build`
- [ ] Testes unitários passando: `npm test`
- [ ] Validação de multi-tenancy: `npm run validate:tenancy`
- [ ] Seed funciona: `npm run db:seed`
- [ ] Prisma Studio mostra dados corretos
- [ ] Aplicação funciona localmente

---

**Próximo Documento:** [13-glossario.md](13-glossario.md)



