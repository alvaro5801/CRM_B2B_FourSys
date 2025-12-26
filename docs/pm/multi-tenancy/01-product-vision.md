# Product Vision & Strategy - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Aprovado para Desenvolvimento

---

## 1. VISÃO DO PRODUTO

### 1.1 Declaração de Visão

> **"Transformar o CRM FourSys de uma solução single-tenant cara e difícil de escalar em uma plataforma SaaS moderna que permite centenas de empresas prosperarem na mesma infraestrutura, com total segurança e isolamento de dados."**

### 1.2 Missão da Feature

Implementar **isolamento de dados por tenant** (multi-tenancy) para permitir que múltiplas empresas clientes usem a mesma instância do CRM FourSys sem comprometer segurança, performance ou experiência do usuário.

---

## 2. O PROBLEMA QUE ESTAMOS A RESOLVER

### 2.1 Situação Atual (AS-IS)

#### Arquitetura Atual
- **Modelo:** Single-tenant (uma instância por cliente)
- **Isolamento:** Físico (databases separados)
- **Custo:** R$ 100/mês por cliente
- **Manutenção:** Deploy manual em cada instância

#### Dores Identificadas

**Para o Negócio:**
- 💸 **Alto Custo Operacional:** R$ 1.000/mês para 10 clientes
- 🐌 **Escalabilidade Limitada:** Cada novo cliente = nova instância
- 🔧 **Manutenção Complexa:** Updates em múltiplas instâncias
- 📉 **Barreira de Entrada:** Custo inicial alto afasta PMEs

**Para a Equipe de Operações:**
- ⏰ **Tempo de Onboarding:** 2-4 horas por cliente
- 🔄 **Deploy Repetitivo:** Mesmo update em N instâncias
- 🐛 **Debugging Difícil:** Bugs específicos por instância
- 📊 **Monitoramento Fragmentado:** N dashboards para gerenciar

**Para os Clientes:**
- 🕐 **Tempo de Setup:** Dias até começar a usar
- 💰 **Custo Percebido:** "Por que pago tanto?"
- 🔒 **Vendor Lock-in:** Difícil migrar dados

---

### 2.2 Situação Desejada (TO-BE)

#### Arquitetura Futura
- **Modelo:** Multi-tenant (múltiplos clientes, uma instância)
- **Isolamento:** Lógico (Row-Level Security via tenantId)
- **Custo:** R$ 100/mês para TODOS os clientes
- **Manutenção:** Deploy único, todos atualizam

#### Benefícios Esperados

**Para o Negócio:**
- 💰 **Redução de Custos:** 90% de economia (R$ 10.800/ano)
- 🚀 **Escalabilidade:** Suporte para 1.000+ clientes
- 🎯 **Modelo SaaS Viável:** Precificação competitiva
- 📈 **Crescimento Acelerado:** Onboarding automático

**Para a Equipe de Operações:**
- ⚡ **Onboarding Instantâneo:** < 5 minutos (self-service)
- 🔄 **Deploy Único:** Um update, todos recebem
- 🐛 **Debugging Centralizado:** Logs unificados
- 📊 **Monitoramento Único:** Um dashboard para tudo

**Para os Clientes:**
- 🕐 **Acesso Imediato:** Signup e começar a usar
- 💰 **Custo Justo:** Paga pelo que usa
- 🔓 **Portabilidade:** Exportação de dados facilitada

---

## 3. OPORTUNIDADE DE MERCADO

### 3.1 Tamanho do Mercado

#### Mercado Endereçável Total (TAM)
- **PMEs no Brasil:** ~9 milhões
- **PMEs que precisam de CRM:** ~2 milhões (22%)
- **Valor médio por cliente:** R$ 200/mês
- **TAM:** R$ 4,8 bilhões/ano

#### Mercado Disponível Atendível (SAM)
- **PMEs B2B com 5-50 funcionários:** ~500 mil
- **Dispostas a pagar por CRM:** ~100 mil (20%)
- **SAM:** R$ 240 milhões/ano

#### Mercado Obtível Atendível (SOM)
- **Meta Ano 1:** 1.000 clientes
- **Receita Ano 1:** R$ 2,4 milhões
- **SOM:** 1% do SAM

---

### 3.2 Análise Competitiva

| Concorrente | Modelo | Preço | Multi-tenancy | Diferencial FourSys |
|-------------|--------|-------|---------------|---------------------|
| **Pipedrive** | SaaS | R$ 150/mês | ✅ Sim | ❌ Caro para PMEs |
| **RD Station CRM** | SaaS | R$ 120/mês | ✅ Sim | ❌ Complexo demais |
| **Agendor** | SaaS | R$ 90/mês | ✅ Sim | ✅ Mais simples |
| **FourSys (Atual)** | Self-hosted | R$ 100/mês | ❌ Não | ❌ Não escalável |
| **FourSys (Futuro)** | SaaS | R$ 80/mês | ✅ Sim | ✅ **Melhor custo-benefício** |

**Posicionamento:** CRM B2B mais acessível e simples do mercado, com foco em gestão visual de pipeline.

---

### 3.3 Janela de Oportunidade

**Por que AGORA?**

1. **Tendência de Mercado:** 
   - 78% das PMEs migraram para SaaS em 2024
   - Expectativa de crescimento de 25% ao ano

2. **Maturidade Tecnológica:**
   - Next.js 14 + Prisma facilitam multi-tenancy
   - Bibliotecas de autenticação maduras (NextAuth.js)

3. **Pressão Competitiva:**
   - Concorrentes já são multi-tenant
   - Clientes esperam onboarding instantâneo

4. **Viabilidade Financeira:**
   - ROI em 3 meses
   - Baixo risco técnico

**Risco de NÃO fazer:** Perder relevância e clientes para concorrentes SaaS.

---

## 4. ESTRATÉGIA DE PRODUTO

### 4.1 Objetivos Estratégicos

#### Objetivo 1: Viabilizar Modelo SaaS
**Meta:** Reduzir custo operacional em 90%  
**KPI:** Custo por cliente < R$ 10/mês  
**Timeline:** Sprint 1 (2 semanas)

#### Objetivo 2: Escalar para 1.000 Clientes
**Meta:** Suportar 1.000+ tenants sem degradação  
**KPI:** Performance < 200ms, 99.9% uptime  
**Timeline:** Sprint 2 (4 semanas)

#### Objetivo 3: Onboarding Automático
**Meta:** Self-service signup sem intervenção manual  
**KPI:** Tempo de onboarding < 5 minutos  
**Timeline:** Sprint 2 (4 semanas)

---

### 4.2 Princípios de Design

#### Princípio 1: Segurança por Design
- **Nunca** aceitar tenantId do cliente
- **Sempre** filtrar queries por tenant
- **Zero** tolerância para data leakage

#### Princípio 2: Transparência para o Usuário
- Cliente não precisa saber que é multi-tenant
- Experiência idêntica ao single-tenant
- Performance não pode degradar

#### Princípio 3: Simplicidade Operacional
- Deploy único para todos os clientes
- Monitoramento centralizado
- Rollback sem impacto

#### Princípio 4: Escalabilidade Progressiva
- Começar com Shared DB, Shared Schema
- Evoluir para Sharding se necessário
- Clientes premium podem ter DB dedicado

---

### 4.3 Estratégia de Faseamento

#### Fase 1: MVP Técnico (Sprint 1 - 1 semana)
**Objetivo:** Provar viabilidade técnica

**Entregas:**
- ✅ Schema com tenantId
- ✅ Server Actions com isolamento
- ✅ Testes de segurança
- ✅ tenantId hardcoded (sem auth)

**Critério de Sucesso:** Zero data leakage em testes

---

#### Fase 2: Autenticação (Sprint 2 - 1 semana)
**Objetivo:** Sistema completo e seguro

**Entregas:**
- ✅ Integração NextAuth.js
- ✅ Signup self-service
- ✅ tenantId na sessão
- ✅ Gestão de usuários

**Critério de Sucesso:** Onboarding < 5 minutos

---

#### Fase 3: Componentes Avançados (Sprint 3 - Opcional)
**Objetivo:** UX aprimorada para power users

**Entregas:**
- ✅ Tenant Selector (usuário multi-tenant)
- ✅ Dashboard de admin
- ✅ Indicador visual de tenant

**Critério de Sucesso:** NPS > 4.5/5

---

#### Fase 4: Otimizações (Futuro)
**Objetivo:** Escalar além de 1.000 tenants

**Entregas:**
- 📋 Sharding por tenant
- 📋 Read replicas
- 📋 Caching avançado (Redis)
- 📋 Tenant premium em DB dedicado

**Critério de Sucesso:** Suporte para 10.000+ tenants

---

## 5. POSICIONAMENTO DE MERCADO

### 5.1 Proposta de Valor

**Para PMEs B2B:**
> "O CRM mais simples e acessível do Brasil para gerenciar seu pipeline de vendas visualmente, com onboarding instantâneo e preço justo."

**Diferenciadores:**
1. 💰 **Preço:** R$ 80/mês (vs R$ 120-150 dos concorrentes)
2. ⚡ **Velocidade:** Comece a usar em 5 minutos
3. 🎨 **Simplicidade:** Interface visual intuitiva
4. 🤖 **IA Simulada:** Score de priorização automático

---

### 5.2 Segmentação de Clientes

#### Segmento Primário: PMEs B2B (5-20 funcionários)
**Características:**
- Faturamento: R$ 500k - R$ 5M/ano
- Equipe de vendas: 2-5 pessoas
- Orçamento de software: R$ 500-2.000/mês
- Maturidade digital: Média

**Dores:**
- CRMs complexos demais
- Preços altos
- Setup demorado

**Nossa Solução:**
- Interface simples
- Preço acessível
- Onboarding instantâneo

---

#### Segmento Secundário: Freelancers & Consultores B2B
**Características:**
- Trabalham sozinhos ou equipe de 2-3
- Orçamento limitado (< R$ 200/mês)
- Precisam de visibilidade de pipeline

**Nossa Solução:**
- Plano gratuito (até 50 leads)
- Upgrade simples conforme crescem

---

#### Segmento Futuro: Empresas Médias (20-100 funcionários)
**Características:**
- Precisam de customizações
- Compliance rigoroso
- Orçamento maior

**Nossa Solução:**
- Plano Enterprise
- Database dedicado (opcional)
- SLA garantido

---

### 5.3 Mensagens-Chave

**Para o Cliente:**
- "Comece a vender mais em 5 minutos"
- "CRM visual que sua equipe vai adorar usar"
- "Preço justo, sem surpresas"

**Para o Mercado:**
- "O CRM B2B mais acessível do Brasil"
- "Tecnologia SaaS moderna, preço de startup"

**Para Investidores:**
- "Modelo SaaS escalável com ROI comprovado"
- "Redução de custos de 90%, crescimento de 300%"

---

## 6. ROADMAP ESTRATÉGICO

### 6.1 Curto Prazo (Q1 2026)
- ✅ Lançar MVP multi-tenant
- ✅ Migrar 10 clientes beta
- ✅ Validar segurança e performance
- ✅ Coletar feedback

### 6.2 Médio Prazo (Q2-Q3 2026)
- 📋 Onboarding de 100 novos clientes
- 📋 Lançar plano gratuito
- 📋 Implementar tenant selector
- 📋 Adicionar integrações (email, calendar)

### 6.3 Longo Prazo (Q4 2026+)
- 📋 Atingir 1.000 clientes
- 📋 Lançar plano Enterprise
- 📋 Expandir para LATAM
- 📋 Implementar sharding

---

## 7. CRITÉRIOS DE SUCESSO

### 7.1 Métricas de Produto

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Tempo de Onboarding** | < 5 min | Analytics |
| **Adoção (DAU/MAU)** | > 60% | Mixpanel |
| **Retenção (Mês 1)** | > 80% | Cohort analysis |
| **NPS** | > 50 | Pesquisa trimestral |

### 7.2 Métricas de Negócio

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Novos Clientes/Mês** | 50 | CRM |
| **Churn Rate** | < 5% | Fatura |
| **MRR** | R$ 40k (500 clientes) | Financeiro |
| **CAC Payback** | < 6 meses | Financeiro |

### 7.3 Métricas Técnicas

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Uptime** | 99.9% | Monitoramento |
| **Performance** | < 200ms | APM |
| **Data Leakage** | 0 incidentes | Testes + Audit |
| **Bugs Críticos** | < 1/mês | Sentry |

---

## 8. RISCOS ESTRATÉGICOS

### 8.1 Riscos de Mercado

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Concorrentes baixam preço** | Média | 🟡 Médio | Diferenciação por UX |
| **Mercado não valoriza preço** | Baixa | 🟡 Médio | Validar com beta |
| **Regulação LGPD mais rígida** | Baixa | 🔴 Alto | Compliance desde o início |

### 8.2 Riscos de Produto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Data leakage** | Média | 🔴 Crítico | Testes rigorosos |
| **Performance degradada** | Baixa | 🟡 Médio | Índices + monitoramento |
| **Complexidade de auth** | Média | 🟡 Médio | Usar NextAuth.js |

### 8.3 Riscos de Execução

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Atraso no desenvolvimento** | Média | 🟡 Médio | Buffer de 20% no cronograma |
| **Bugs em produção** | Média | 🔴 Alto | Beta com clientes selecionados |
| **Resistência de clientes atuais** | Baixa | 🟡 Médio | Comunicação transparente |

---

## 9. DEPENDÊNCIAS ESTRATÉGICAS

### 9.1 Decisões Críticas

| Decisão | Responsável | Prazo | Status |
|---------|-------------|-------|--------|
| **Aprovar investimento** | CFO | Imediato | ⏳ Pendente |
| **Escolher biblioteca de auth** | Tech Lead | Esta semana | ⏳ Pendente |
| **Definir pricing** | PM + Sales | Esta semana | ⏳ Pendente |
| **Aprovar arquitetura** | Tech Lead | Esta semana | ⏳ Pendente |

### 9.2 Recursos Necessários

| Recurso | Quantidade | Quando |
|---------|------------|--------|
| **Backend Developer** | 1 FTE | Sprint 1-2 |
| **Frontend Developer** | 0.3 FTE | Sprint 3 |
| **QA Engineer** | 0.5 FTE | Sprint 1-2 |
| **DevOps** | 0.2 FTE | Deploy |

---

## 10. PRÓXIMOS PASSOS

### 10.1 Imediatos (Esta Semana)
1. ✅ Apresentar visão para stakeholders
2. ✅ Obter aprovação do CFO (business case)
3. ✅ Obter aprovação do Tech Lead (arquitetura)
4. ✅ Definir pricing strategy

### 10.2 Curto Prazo (Próximas 2 Semanas)
1. ⏳ Iniciar Sprint 1 (MVP)
2. ⏳ Selecionar clientes beta
3. ⏳ Preparar comunicação de lançamento

### 10.3 Médio Prazo (Próximo Mês)
1. 📋 Lançar beta privado
2. 📋 Coletar feedback
3. 📋 Iterar com base em dados

---

## 11. ALINHAMENTO COM VISÃO DA EMPRESA

### 11.1 Missão da FourSys
> "Empoderar PMEs brasileiras com tecnologia de classe mundial a preços acessíveis."

**Como Multi-tenancy Contribui:**
- ✅ Reduz preço final para o cliente
- ✅ Democratiza acesso a CRM moderno
- ✅ Permite escalar sem comprometer qualidade

### 11.2 Valores da FourSys
- **Simplicidade:** Multi-tenancy é transparente para o usuário
- **Acessibilidade:** Redução de custos viabiliza preço justo
- **Excelência:** Segurança e performance não negociáveis

---

## 12. CONCLUSÃO

Multi-tenancy não é apenas uma melhoria técnica — é uma **transformação estratégica** que:

1. **Viabiliza o modelo SaaS** (redução de 90% nos custos)
2. **Desbloqueia crescimento** (1.000+ clientes possíveis)
3. **Melhora a experiência** (onboarding instantâneo)
4. **Garante competitividade** (preço e velocidade)

**Investimento:** R$ 3.300 (33 horas)  
**Retorno:** R$ 16.200/ano  
**Payback:** 3 meses  

**Decisão:** APROVAR e iniciar Sprint 1 imediatamente.

---

**Próximo Documento:** [02-business-case.md](02-business-case.md)

**Aprovações:**

| Stakeholder | Data | Status |
|-------------|------|--------|
| Product Manager (John) | 25/12/2025 | ✅ Aprovado |
| Tech Lead | Pendente | ⏳ Aguardando |
| CFO | Pendente | ⏳ Aguardando |
| CEO | Pendente | ⏳ Aguardando |



