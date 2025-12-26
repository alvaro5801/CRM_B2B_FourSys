# Estimativas e Cronograma

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. BREAKDOWN POR FASE

| Fase | Descrição | Tempo | Risco | Prioridade |
|------|-----------|-------|-------|------------|
| **1** | Schema e Migrations | 2-3h | 🟡 Médio | 🔴 Crítica |
| **2** | Server Actions | 3-4h | 🔴 Alto | 🔴 Crítica |
| **3** | Componentes (opcional) | 1-2h | 🟢 Baixo | 🟡 Média |
| **4** | Segurança | 2-3h | 🔴 Alto | 🔴 Crítica |
| **5** | Seed | 1h | 🟢 Baixo | 🟡 Média |
| **6** | Testes | 2-3h | 🟡 Médio | 🔴 Crítica |
| **7** | Autenticação (futuro) | 4-6h | 🔴 Alto | ⏳ Futuro |
| **8** | Documentação | 1h | 🟢 Baixo | 🟡 Média |
| **TOTAL (MVP)** | Fases 1-6 + 8 | **14-21h** | - | - |
| **TOTAL (Completo)** | Todas as fases | **18-27h** | - | - |

---

## 2. CRONOGRAMA SUGERIDO

### 2.1 Sprint 1 (1 Semana) - MVP Básico

**Objetivo:** Implementar multi-tenancy sem autenticação real.

| Dia | Fase | Atividades | Horas |
|-----|------|------------|-------|
| **Dia 1** | Preparação + Fase 1 | Backup, schema, migrations, migração de dados | 4h |
| **Dia 2** | Fase 2 (Parte 1) | Server Actions: getLeads, createLead, updateLeadStatus | 4h |
| **Dia 3** | Fase 2 (Parte 2) | Server Actions: getDashboardMetrics, deleteLead, tenants.ts | 3h |
| **Dia 3** | Fase 5 | Atualizar seed | 1h |
| **Dia 4** | Fase 4 | Segurança: code review, validações, testes | 4h |
| **Dia 5** | Fase 6 | Testes unitários, integração, performance | 4h |
| **Dia 5** | Fase 8 | Documentação | 1h |
| **TOTAL** | - | - | **21h** |

**Entrega:** Multi-tenancy funcional com tenantId hardcoded.

---

### 2.2 Sprint 2 (1 Semana) - Autenticação

**Objetivo:** Integrar autenticação real e remover hardcoded tenantId.

| Dia | Fase | Atividades | Horas |
|-----|------|------------|-------|
| **Dia 1** | Fase 7 (Parte 1) | Escolher biblioteca, instalar, configurar | 2h |
| **Dia 2** | Fase 7 (Parte 2) | Adicionar tenantId ao token, atualizar getCurrentTenantId | 2h |
| **Dia 3** | Fase 7 (Parte 3) | Fluxo de signup, criação automática de tenant | 3h |
| **Dia 4** | Fase 7 (Parte 4) | Gestão de usuários, roles, permissões | 3h |
| **Dia 5** | Testes | Testar autenticação end-to-end | 2h |
| **TOTAL** | - | - | **12h** |

**Entrega:** Sistema completo com autenticação real.

---

### 2.3 Sprint 3 (Opcional) - Componentes Avançados

**Objetivo:** TenantSelector e melhorias de UX.

| Dia | Fase | Atividades | Horas |
|-----|------|------------|-------|
| **Dia 1** | Fase 3 | Sidebar com indicador de tenant | 1h |
| **Dia 2** | Fase 3 | TenantSelector + API de troca | 3h |
| **Dia 3** | Fase 3 | Multi-tenant por usuário | 2h |
| **Dia 4** | Testes | Testar componentes | 2h |
| **TOTAL** | - | - | **8h** |

---

## 3. RISCOS E MITIGAÇÕES

### 3.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Perda de dados na migration** | Média | 🔴 Alto | Backup obrigatório antes de migrar |
| **Queries sem filtro de tenant** | Alta | 🔴 Crítico | Code review rigoroso + middleware |
| **Performance degradada** | Baixa | 🟡 Médio | Índices adequados + monitoramento |
| **Complexidade de autenticação** | Média | 🔴 Alto | Usar biblioteca testada (NextAuth.js) |
| **Bugs de isolamento** | Média | 🔴 Crítico | Testes automatizados de segurança |

---

### 3.2 Riscos de Projeto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Scope creep** | Alta | 🟡 Médio | Seguir checklist rigorosamente |
| **Subestimação de tempo** | Média | 🟡 Médio | Buffer de 20% nas estimativas |
| **Falta de conhecimento da equipe** | Baixa | 🟡 Médio | Pair programming + code review |
| **Bloqueio por decisões** | Média | 🟡 Médio | Decisões arquiteturais antecipadas |

---

## 4. RECURSOS NECESSÁRIOS

### 4.1 Equipe

| Papel | Dedicação | Fase |
|-------|-----------|------|
| **Backend Developer** | 100% | Fases 1, 2, 4, 5, 6 |
| **Frontend Developer** | 30% | Fase 3 |
| **QA Engineer** | 50% | Fase 6 |
| **Tech Lead** | 20% | Code review, decisões |
| **DevOps** | 10% | Deploy, monitoramento |

---

### 4.2 Infraestrutura

| Recurso | Necessário | Quando |
|---------|------------|--------|
| **Ambiente de Staging** | ✅ Sim | Fase 1 (testar migrations) |
| **Backup de Produção** | ✅ Sim | Antes de deploy |
| **Monitoramento** | ✅ Sim | Pós-deploy |
| **Redis (cache)** | ❌ Opcional | Otimização futura |

---

## 5. DEPENDÊNCIAS

### 5.1 Dependências Técnicas

| Dependência | Status | Bloqueio |
|-------------|--------|----------|
| Prisma instalado | ✅ OK | Nenhum |
| Next.js 14+ | ✅ OK | Nenhum |
| TypeScript | ✅ OK | Nenhum |
| Biblioteca de Auth | ⏳ Pendente | Fase 7 |

---

### 5.2 Dependências de Decisão

| Decisão | Responsável | Prazo | Bloqueio |
|---------|-------------|-------|----------|
| Escolher biblioteca de auth | Tech Lead | Antes da Fase 7 | Fase 7 |
| Aprovar arquitetura | Tech Lead | Antes da Fase 1 | Fase 1 |
| Definir estratégia de onboarding | Product Manager | Antes da Fase 7 | Fase 7 |

---

## 6. CUSTOS ESTIMADOS

### 6.1 Custo de Desenvolvimento

**Assumindo:** Developer @ R$ 100/hora

| Fase | Horas | Custo |
|------|-------|-------|
| MVP (Fases 1-6 + 8) | 21h | R$ 2.100 |
| Autenticação (Fase 7) | 12h | R$ 1.200 |
| Componentes Avançados (Fase 3) | 8h | R$ 800 |
| **TOTAL** | **41h** | **R$ 4.100** |

---

### 6.2 Custo de Infraestrutura

| Recurso | Custo Mensal | Necessário |
|---------|--------------|------------|
| Banco de Dados (PostgreSQL) | R$ 50 | ✅ Sim |
| Redis (cache) | R$ 30 | ❌ Opcional |
| Monitoramento (Sentry) | R$ 25 | ✅ Sim |
| **TOTAL** | **R$ 105/mês** | - |

---

## 7. ROI (RETURN ON INVESTMENT)

### 7.1 Benefícios Quantificáveis

| Benefício | Economia Anual |
|-----------|----------------|
| **Redução de Instâncias** | R$ 12.000 |
| Antes: 10 clientes × R$ 100/mês = R$ 1.000/mês |
| Depois: 1 instância × R$ 100/mês = R$ 100/mês |
| Economia: R$ 900/mês = **R$ 10.800/ano** |
| | |
| **Redução de Manutenção** | R$ 6.000 |
| Antes: 10 deploys × 1h × R$ 100 = R$ 1.000/deploy |
| Depois: 1 deploy × 1h × R$ 100 = R$ 100/deploy |
| Assumindo 6 deploys/ano: **R$ 5.400/ano** |
| | |
| **TOTAL** | **R$ 16.200/ano** |

**Payback:** R$ 4.100 (investimento) / R$ 16.200 (economia anual) = **3 meses**

---

### 7.2 Benefícios Não-Quantificáveis

- ✅ Escalabilidade (suporta 1.000+ clientes)
- ✅ Modelo SaaS viável
- ✅ Onboarding automático
- ✅ Melhor experiência do cliente
- ✅ Vantagem competitiva

---

## 8. PLANO DE CONTINGÊNCIA

### 8.1 Se Migration Falhar

**Problema:** Migration corrompe dados ou falha.

**Plano:**
1. Restaurar backup imediatamente
2. Revisar migration SQL
3. Testar em staging novamente
4. Aplicar correções
5. Tentar novamente

**Tempo de Recuperação:** 1-2 horas

---

### 8.2 Se Performance Degradar

**Problema:** Queries lentas após implementação.

**Plano:**
1. Verificar que índices foram criados
2. Analisar slow query log
3. Adicionar índices faltantes
4. Considerar caching (Redis)
5. Escalar banco de dados (vertical)

**Tempo de Recuperação:** 2-4 horas

---

### 8.3 Se Houver Data Leakage

**Problema:** Tenant A vê dados do Tenant B.

**Plano:**
1. **IMEDIATO:** Desativar aplicação
2. Identificar query vulnerável
3. Aplicar correção
4. Testar isolamento
5. Reativar aplicação
6. Notificar clientes afetados (se necessário)

**Tempo de Recuperação:** 1-2 horas

---

## 9. MÉTRICAS DE SUCESSO

### 9.1 Métricas Técnicas

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Queries com filtro de tenant** | 100% | Code review |
| **Testes de isolamento passando** | 100% | CI/CD |
| **Performance de queries** | < 200ms | Monitoramento |
| **Zero data leakage** | 0 incidentes | Testes de segurança |

---

### 9.2 Métricas de Negócio

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Redução de custos** | R$ 900/mês | Fatura de infra |
| **Tempo de onboarding** | < 5 min | Analytics |
| **Satisfação do cliente** | > 4.5/5 | NPS |
| **Novos clientes/mês** | +20% | CRM |

---

## 10. PRÓXIMOS PASSOS

### 10.1 Imediatos (Esta Semana)
1. ✅ Aprovar arquitetura (Tech Lead)
2. ✅ Fazer backup do banco
3. ✅ Criar branch `feature/multi-tenancy`
4. ✅ Iniciar Fase 1 (Schema)

### 10.2 Curto Prazo (Próximas 2 Semanas)
1. ⏳ Completar MVP (Fases 1-6 + 8)
2. ⏳ Testar em staging
3. ⏳ Deploy em produção

### 10.3 Médio Prazo (Próximo Mês)
1. 📋 Implementar autenticação (Fase 7)
2. 📋 Componentes avançados (Fase 3)
3. 📋 Monitoramento e otimizações

---

**Próximo Documento:** [11-scripts-migracao.md](11-scripts-migracao.md)



