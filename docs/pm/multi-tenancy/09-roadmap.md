# Roadmap & Milestones - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Aprovado

---

## TIMELINE VISUAL

```
Semana 1-2: Preparação + Sprint 1 (MVP)
Semana 3-4: Sprint 2 (Auth) + Beta Privado
Semana 5-6: Beta Público
Semana 7+: Lançamento Geral
```

---

## FASE 1: PREPARAÇÃO (Semana 1)

### Objetivos
- Aprovar todos os documentos estratégicos
- Alocar recursos
- Preparar ambiente

### Milestones

#### M1.1 - Aprovações Estratégicas
**Data:** 27/12/2025  
**Responsável:** PM + CEO + CFO

**Entregas:**
- [ ] Business Case aprovado (CFO)
- [ ] Arquitetura aprovada (Tech Lead)
- [ ] Pricing aprovado (Sales + CFO)
- [ ] Orçamento de marketing aprovado (CFO)

**Critério de Sucesso:** Todas as aprovações obtidas

---

#### M1.2 - Setup de Projeto
**Data:** 28/12/2025  
**Responsável:** Tech Lead + DevOps

**Entregas:**
- [ ] Branch `feature/multi-tenancy` criada
- [ ] Ambiente de staging configurado
- [ ] Backup do banco de produção
- [ ] Ferramentas de monitoramento configuradas

**Critério de Sucesso:** Ambiente pronto para desenvolvimento

---

## FASE 2: SPRINT 1 - MVP TÉCNICO (Semana 2)

### Objetivos
- Implementar isolamento de dados
- Migrar dados existentes
- Validar segurança

### Milestones

#### M2.1 - Schema e Migrations
**Data:** 02/01/2026  
**Responsável:** Backend Developer

**Entregas:**
- [ ] Model `Tenant` criado
- [ ] Campo `tenantId` adicionado ao `Lead`
- [ ] Índices criados
- [ ] Migration executada
- [ ] Dados migrados para tenant default

**Critério de Sucesso:** Todos os leads têm tenantId, nenhum NULL

---

#### M2.2 - Server Actions com Isolamento
**Data:** 05/01/2026  
**Responsável:** Backend Developer

**Entregas:**
- [ ] `getCurrentTenantId()` implementada
- [ ] `getLeads()` filtra por tenant
- [ ] `createLead()` adiciona tenantId
- [ ] `updateLeadStatus()` valida propriedade
- [ ] `getDashboardMetrics()` filtra por tenant
- [ ] `deleteLead()` valida propriedade

**Critério de Sucesso:** Code review aprovado, sem queries sem filtro

---

#### M2.3 - Testes de Segurança
**Data:** 07/01/2026  
**Responsável:** QA Engineer

**Entregas:**
- [ ] Testes de isolamento implementados
- [ ] Testes de IDOR implementados
- [ ] Todos os testes passando em CI/CD
- [ ] Auditoria de segurança completa

**Critério de Sucesso:** Zero data leakage em testes

---

## FASE 3: SPRINT 2 - AUTENTICAÇÃO (Semana 3)

### Objetivos
- Implementar autenticação real
- Signup self-service
- Remover tenantId hardcoded

### Milestones

#### M3.1 - Integração NextAuth.js
**Data:** 10/01/2026  
**Responsável:** Backend Developer

**Entregas:**
- [ ] NextAuth.js instalado e configurado
- [ ] CredentialsProvider implementado
- [ ] tenantId adicionado ao token JWT
- [ ] `getCurrentTenantId()` usa sessão

**Critério de Sucesso:** Login/Logout funcional

---

#### M3.2 - Signup Self-Service
**Data:** 12/01/2026  
**Responsável:** Backend + Frontend Developer

**Entregas:**
- [ ] Página `/signup` criada
- [ ] Formulário de signup implementado
- [ ] Criação automática de Tenant + User
- [ ] Validação de email e slug únicos
- [ ] Redirecionamento para dashboard

**Critério de Sucesso:** Onboarding < 5 minutos

---

#### M3.3 - Gestão de Usuários
**Data:** 14/01/2026  
**Responsável:** Backend + Frontend Developer

**Entregas:**
- [ ] Página `/settings/users` criada
- [ ] Listagem de usuários do tenant
- [ ] Desativar/reativar usuário
- [ ] Validação de permissões (admin)

**Critério de Sucesso:** Admin consegue gerenciar usuários

---

## FASE 4: BETA PRIVADO (Semana 3-4)

### Objetivos
- Validar funcionalidade com 5 clientes
- Coletar feedback
- Iterar rapidamente

### Milestones

#### M4.1 - Seleção de Clientes Beta
**Data:** 14/01/2026  
**Responsável:** PM + Sales

**Entregas:**
- [ ] 5 clientes selecionados
- [ ] Emails de convite enviados
- [ ] Calls de onboarding agendadas

**Critério de Sucesso:** 5 clientes confirmados

---

#### M4.2 - Onboarding Assistido
**Data:** 15-17/01/2026  
**Responsável:** PM + Customer Success

**Entregas:**
- [ ] 5 calls de onboarding realizadas
- [ ] Clientes criaram primeiros leads
- [ ] Feedback inicial coletado

**Critério de Sucesso:** 5/5 clientes ativados

---

#### M4.3 - Iteração com Base em Feedback
**Data:** 18-21/01/2026  
**Responsável:** PM + Dev Team

**Entregas:**
- [ ] Bugs críticos corrigidos
- [ ] Melhorias de UX implementadas
- [ ] Documentação atualizada

**Critério de Sucesso:** NPS > 40, zero bugs críticos

---

## FASE 5: BETA PÚBLICO (Semana 5-6)

### Objetivos
- Escalar para 50 usuários
- Validar onboarding self-service
- Preparar para lançamento geral

### Milestones

#### M5.1 - Abertura de Vagas
**Data:** 22/01/2026  
**Responsável:** PM + Marketing

**Entregas:**
- [ ] Landing page de beta criada
- [ ] 50 vagas abertas
- [ ] Email marketing enviado
- [ ] Posts em LinkedIn publicados

**Critério de Sucesso:** 50 signups em 2 semanas

---

#### M5.2 - Monitoramento e Otimização
**Data:** 22/01-04/02/2026  
**Responsável:** PM + Dev Team

**Entregas:**
- [ ] Dashboards de métricas configurados
- [ ] Monitoramento de onboarding
- [ ] Ajustes de UX baseados em dados
- [ ] Suporte responsivo

**Critério de Sucesso:** Taxa de ativação > 70%

---

#### M5.3 - Preparação para Lançamento
**Data:** 02-04/02/2026  
**Responsável:** PM + Marketing

**Entregas:**
- [ ] Vídeo de demo gravado
- [ ] Landing page principal criada
- [ ] Materiais de marketing preparados
- [ ] Campanhas de ads configuradas

**Critério de Sucesso:** Tudo pronto para lançamento

---

## FASE 6: LANÇAMENTO GERAL (Semana 7+)

### Objetivos
- Abertura para todos
- Campanha de marketing
- Crescimento acelerado

### Milestones

#### M6.1 - Lançamento Oficial
**Data:** 05/02/2026  
**Responsável:** PM + Marketing + CEO

**Entregas:**
- [ ] Press release publicado
- [ ] Webinar de lançamento realizado
- [ ] Campanhas de ads ativadas
- [ ] Parcerias anunciadas

**Critério de Sucesso:** 100 signups na primeira semana

---

#### M6.2 - Crescimento Mês 1
**Data:** 05/02-05/03/2026  
**Responsável:** PM + Marketing

**Entregas:**
- [ ] 100 novos clientes
- [ ] MRR de R$ 8.000
- [ ] CAC < R$ 200
- [ ] Churn < 15%

**Critério de Sucesso:** Metas de crescimento atingidas

---

#### M6.3 - Otimização Contínua
**Data:** Ongoing  
**Responsável:** PM + Dev Team

**Entregas:**
- [ ] A/B tests de onboarding
- [ ] Melhorias de performance
- [ ] Novas features baseadas em feedback
- [ ] Otimização de funil

**Critério de Sucesso:** MRR Growth > 20%/mês

---

## ROADMAP DE FEATURES (PÓS-LANÇAMENTO)

### Q1 2026 (Jan-Mar)

**Foco:** Lançamento e estabilização

- ✅ Multi-tenancy MVP
- ✅ Autenticação
- ✅ Signup self-service
- ⏳ Gestão de usuários
- ⏳ Plano Free
- ⏳ Plano Pro

---

### Q2 2026 (Abr-Jun)

**Foco:** Crescimento e retenção

- 📋 Plano Enterprise
- 📋 Tenant Selector (multi-tenant por usuário)
- 📋 Convites de equipe
- 📋 Integrações básicas (email, calendar)
- 📋 Exportação de dados
- 📋 Relatórios básicos

---

### Q3 2026 (Jul-Set)

**Foco:** Escalabilidade e otimização

- 📋 Subdomain routing
- 📋 Database dedicado (add-on)
- 📋 API pública
- 📋 Webhooks
- 📋 Integrações avançadas (Zapier)
- 📋 Relatórios customizados

---

### Q4 2026 (Out-Dez)

**Foco:** Expansão e Enterprise

- 📋 White-label
- 📋 SSO (Single Sign-On)
- 📋 SAML
- 📋 Customizações por tenant
- 📋 SLA garantido
- 📋 Suporte 24/7

---

## DEPENDÊNCIAS CRÍTICAS

### Dependências Externas

| Dependência | Responsável | Prazo | Status |
|-------------|-------------|-------|--------|
| Aprovação de orçamento | CFO | 27/12 | ⏳ Pendente |
| Aprovação de arquitetura | Tech Lead | 27/12 | ⏳ Pendente |
| Aprovação de pricing | Sales + CFO | 27/12 | ⏳ Pendente |
| Contratação de designer | HR | 30/12 | ⏳ Pendente |

### Dependências Internas

| Dependência | Responsável | Prazo | Status |
|-------------|-------------|-------|--------|
| Schema implementado | Backend Dev | 02/01 | ⏳ Aguardando |
| Server Actions implementadas | Backend Dev | 05/01 | ⏳ Aguardando |
| NextAuth.js integrado | Backend Dev | 10/01 | ⏳ Aguardando |
| Landing page criada | Frontend Dev | 02/02 | ⏳ Aguardando |

---

## RISCOS AO ROADMAP

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Atraso no desenvolvimento | Posterga lançamento | Buffer de 20% no cronograma |
| Bugs críticos em beta | Posterga lançamento | Testes rigorosos + beta privado |
| Baixa adesão ao beta | Atrasa validação | Marketing agressivo + incentivos |
| Aprovações atrasadas | Bloqueia início | Pressionar stakeholders |

---

## COMUNICAÇÃO DO ROADMAP

### Stakeholders Internos

**Frequência:** Semanal  
**Formato:** Email + reunião de status  
**Conteúdo:**
- Progresso vs roadmap
- Bloqueios e riscos
- Próximos milestones

### Stakeholders Externos (Clientes)

**Frequência:** Mensal  
**Formato:** Newsletter + blog post  
**Conteúdo:**
- Features lançadas
- Próximas features
- Como dar feedback

---

## CRITÉRIOS DE SUCESSO DO ROADMAP

### Sucesso Total ✅
- Todos os milestones entregues no prazo
- Zero bugs críticos em produção
- Metas de crescimento atingidas
- NPS > 50

### Sucesso Parcial 🟡
- Atraso < 2 semanas
- Bugs críticos corrigidos em < 24h
- 80% das metas atingidas
- NPS > 40

### Falha ❌
- Atraso > 1 mês
- Bugs críticos não corrigidos
- < 50% das metas atingidas
- NPS < 30

---

## PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Aprovar roadmap (CEO + Tech Lead)
2. ✅ Obter aprovações pendentes
3. ✅ Alocar recursos
4. ✅ Iniciar Sprint 1

---

**Próximo Documento:** [10-stakeholder-plan.md](10-stakeholder-plan.md)



