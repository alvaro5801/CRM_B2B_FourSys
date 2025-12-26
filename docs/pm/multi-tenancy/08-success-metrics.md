# Success Metrics & KPIs - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Ativo

---

## 1. FRAMEWORK DE MÉTRICAS

### 1.1 Hierarquia
```
OBJETIVO ESTRATÉGICO
├── North Star Metric
├── KPIs Primários
│   ├── Leading Indicators
│   └── Lagging Indicators
└── Métricas de Suporte
```

---

## 2. NORTH STAR METRIC

### MRR (Monthly Recurring Revenue)
**Definição:** Receita recorrente mensal de clientes pagantes

**Por que esta métrica?**
- Reflete crescimento do negócio
- Combina aquisição + retenção + expansão
- Alinhada com objetivo de viabilizar SaaS

**Meta:**
- **Mês 3:** R$ 4.000
- **Mês 6:** R$ 20.000
- **Mês 12:** R$ 55.000

**Fórmula:**
```
MRR = Σ (Clientes Pro × R$ 80) + (Clientes Enterprise × R$ 300)
```

---

## 3. KPIs PRIMÁRIOS

### 3.1 Aquisição

#### KPI: Novos Signups/Mês
**Meta:** 50 (Mês 1) → 250 (Mês 6)  
**Como Medir:** Mixpanel, Google Analytics  
**Frequência:** Diária

**Breakdown:**
- Orgânico: 30%
- Google Ads: 40%
- LinkedIn Ads: 20%
- Referral: 10%

---

#### KPI: Taxa de Conversão (Visitante → Signup)
**Meta:** > 5%  
**Como Medir:** Funil no Google Analytics  
**Frequência:** Semanal

**Benchmark:** 3-5% é padrão para SaaS B2B

---

#### KPI: CAC (Customer Acquisition Cost)
**Meta:** < R$ 200  
**Como Medir:** Custo de Marketing / Novos Clientes  
**Frequência:** Mensal

**Fórmula:**
```
CAC = (Custo de Ads + Custo de Conteúdo + Salários Marketing) / Novos Clientes
```

---

### 3.2 Ativação

#### KPI: Tempo de Onboarding
**Meta:** < 5 minutos  
**Como Medir:** Analytics (signup → primeiro lead criado)  
**Frequência:** Diária

**Breakdown:**
- Signup: 2 min
- Criar primeiro lead: 3 min

---

#### KPI: Taxa de Ativação
**Meta:** > 70%  
**Como Medir:** % de signups que criam primeiro lead  
**Frequência:** Diária

**Definição de "Ativado":** Criou pelo menos 1 lead

---

### 3.3 Retenção

#### KPI: Churn Rate (Mensal)
**Meta:** < 5% (mensal) ou < 15% (anual)  
**Como Medir:** Cohort analysis  
**Frequência:** Mensal

**Fórmula:**
```
Churn = (Clientes que cancelaram no mês / Clientes no início do mês) × 100
```

**Breakdown por Plano:**
- Free: Não aplicável
- Pro: < 15%/ano
- Enterprise: < 5%/ano

---

#### KPI: NPS (Net Promoter Score)
**Meta:** > 50  
**Como Medir:** Pesquisa trimestral  
**Frequência:** Trimestral

**Pergunta:** "De 0 a 10, qual a probabilidade de recomendar o FourSys CRM?"

**Cálculo:**
```
NPS = % Promotores (9-10) - % Detratores (0-6)
```

---

#### KPI: DAU/MAU (Daily Active Users / Monthly Active Users)
**Meta:** > 60%  
**Como Medir:** Mixpanel  
**Frequência:** Semanal

**Definição de "Ativo":** Fez login e visualizou dashboard

---

### 3.4 Receita

#### KPI: MRR Growth Rate
**Meta:** +20%/mês  
**Como Medir:** (MRR mês atual - MRR mês anterior) / MRR mês anterior  
**Frequência:** Mensal

---

#### KPI: LTV (Lifetime Value)
**Meta:** > R$ 600 (Pro) | > R$ 3.600 (Enterprise)  
**Como Medir:** ARPU / Churn Rate  
**Frequência:** Trimestral

**Fórmula:**
```
LTV = ARPU × (1 / Churn Rate)
```

**Exemplo (Pro):**
```
LTV = R$ 80 × (1 / 0,15) = R$ 533
```

---

#### KPI: LTV/CAC Ratio
**Meta:** > 3x  
**Como Medir:** LTV / CAC  
**Frequência:** Trimestral

**Benchmark:**
- < 1x: Insustentável
- 1-3x: Preocupante
- 3-5x: Saudável
- > 5x: Excelente

---

### 3.5 Segurança

#### KPI: Incidentes de Data Leakage
**Meta:** 0  
**Como Medir:** Logs de auditoria + testes automatizados  
**Frequência:** Diária

**Alerta:** Qualquer incidente é crítico

---

#### KPI: Queries sem Filtro de Tenant
**Meta:** 0%  
**Como Medir:** Code review + análise estática  
**Frequência:** A cada commit

---

### 3.6 Performance

#### KPI: Tempo de Resposta (P95)
**Meta:** < 200ms  
**Como Medir:** APM (New Relic, Datadog)  
**Frequência:** Tempo real

**Breakdown:**
- Dashboard: < 1s
- Kanban Board: < 1s
- Criar Lead: < 500ms

---

#### KPI: Uptime
**Meta:** 99,9% (8,76h downtime/ano)  
**Como Medir:** Monitoramento (UptimeRobot)  
**Frequência:** Tempo real

---

## 4. MÉTRICAS DE SUPORTE

### 4.1 Conversão Free → Pro

**Meta:** > 30%  
**Como Medir:** Funil  
**Frequência:** Mensal

**Gatilhos de Conversão:**
- Atingiu 45 leads (90% do limite)
- Tentou adicionar segundo usuário
- 30 dias de uso ativo

---

### 4.2 Trial → Paid Conversion

**Meta:** > 40%  
**Como Medir:** Funil  
**Frequência:** Mensal

**Ações para Melhorar:**
- Email drip durante trial
- Onboarding personalizado
- Desconto no último dia

---

### 4.3 Payback Period

**Meta:** < 6 meses  
**Como Medir:** CAC / ARPU  
**Frequência:** Trimestral

**Fórmula:**
```
Payback = CAC / ARPU
```

**Exemplo:**
```
Payback = R$ 200 / R$ 80 = 2,5 meses ✅
```

---

### 4.4 Viral Coefficient (K-factor)

**Meta:** > 0,5  
**Como Medir:** Novos signups via referral / Total de usuários  
**Frequência:** Mensal

**Benchmark:**
- K < 1: Crescimento não-viral
- K = 1: Crescimento viral sustentável
- K > 1: Crescimento viral exponencial

---

## 5. DASHBOARD DE MÉTRICAS

### 5.1 Dashboard Executivo (CEO/CFO)

**Atualização:** Mensal

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| MRR | R$ X | R$ Y | 🟢/🟡/🔴 |
| Novos Clientes | X | Y | 🟢/🟡/🔴 |
| Churn Rate | X% | < 15% | 🟢/🟡/🔴 |
| LTV/CAC | Xx | > 3x | 🟢/🟡/🔴 |
| Uptime | X% | 99,9% | 🟢/🟡/🔴 |

---

### 5.2 Dashboard de Produto (PM)

**Atualização:** Semanal

| Métrica | Atual | Meta | Tendência |
|---------|-------|------|-----------|
| Signups/Semana | X | Y | ↗️/→/↘️ |
| Taxa de Ativação | X% | > 70% | ↗️/→/↘️ |
| Tempo de Onboarding | Xmin | < 5min | ↗️/→/↘️ |
| DAU/MAU | X% | > 60% | ↗️/→/↘️ |
| NPS | X | > 50 | ↗️/→/↘️ |

---

### 5.3 Dashboard Técnico (Tech Lead)

**Atualização:** Tempo real

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| Uptime | X% | 99,9% | 🟢/🔴 |
| P95 Response Time | Xms | < 200ms | 🟢/🟡/🔴 |
| Error Rate | X% | < 0,1% | 🟢/🟡/🔴 |
| Data Leakage | X | 0 | 🟢/🔴 |
| Queries sem Tenant | X | 0 | 🟢/🔴 |

---

## 6. METAS POR FASE

### Fase 1: Beta Privado (Semana 3-4)

| Métrica | Meta |
|---------|------|
| Clientes Beta | 5 |
| Onboarding | < 10 min (assistido) |
| Data Leakage | 0 |
| NPS | > 40 |
| Bugs Críticos | 0 |

---

### Fase 2: Beta Público (Semana 5-6)

| Métrica | Meta |
|---------|------|
| Signups | 50 |
| Taxa de Ativação | > 60% |
| Onboarding | < 5 min (self-service) |
| Churn (2 semanas) | < 20% |
| NPS | > 50 |

---

### Fase 3: Lançamento Geral (Mês 1-3)

| Métrica | Meta Mês 1 | Meta Mês 3 |
|---------|------------|------------|
| Signups | 50 | 250 |
| Clientes Pro | 20 | 100 |
| MRR | R$ 1.600 | R$ 8.000 |
| CAC | < R$ 250 | < R$ 200 |
| Churn | < 20% | < 15% |
| NPS | > 50 | > 60 |

---

## 7. ALERTAS E AÇÕES

### 🔴 Alerta Crítico (Ação Imediata)

| Condição | Ação |
|----------|------|
| Uptime < 99% | Investigar e resolver imediatamente |
| Data Leakage > 0 | Desativar app, investigar, corrigir |
| Churn > 25% | Reunião emergencial com equipe |
| P95 > 1s | Otimizar queries urgentemente |

---

### 🟡 Alerta Médio (Ação em 24h)

| Condição | Ação |
|----------|------|
| Taxa de Ativação < 50% | Melhorar onboarding |
| CAC > R$ 250 | Otimizar campanhas |
| NPS < 30 | Pesquisa qualitativa com clientes |
| MRR Growth < 10%/mês | Revisar estratégia de aquisição |

---

### 🟢 Alerta Baixo (Monitorar)

| Condição | Ação |
|----------|------|
| DAU/MAU < 50% | Melhorar engajamento |
| Trial → Paid < 30% | Melhorar email drip |
| K-factor < 0,3 | Melhorar programa de referral |

---

## 8. RELATÓRIOS

### 8.1 Relatório Semanal (PM → CEO)

**Conteúdo:**
- MRR atual e crescimento
- Novos signups e ativações
- Churn e motivos
- Principais conquistas
- Bloqueios e riscos

---

### 8.2 Relatório Mensal (PM → Board)

**Conteúdo:**
- Resumo executivo
- Métricas vs metas
- Análise de cohorts
- NPS e feedback qualitativo
- Roadmap próximo mês

---

### 8.3 Relatório Trimestral (PM → Investidores)

**Conteúdo:**
- Crescimento de MRR e ARR
- Unit economics (LTV/CAC)
- Retenção por cohort
- Expansão de mercado
- Planos futuros

---

## 9. FERRAMENTAS

| Ferramenta | Uso | Custo |
|------------|-----|-------|
| **Mixpanel** | Product analytics | R$ 200/mês |
| **Google Analytics** | Web analytics | Grátis |
| **Stripe** | Billing + MRR | 2,9% + R$ 0,39 |
| **New Relic** | APM | R$ 300/mês |
| **UptimeRobot** | Monitoramento uptime | Grátis |
| **Sentry** | Error tracking | R$ 100/mês |
| **Metabase** | Dashboards | Grátis (self-hosted) |

**Total:** ~R$ 600/mês

---

## 10. PRÓXIMOS PASSOS

### Imediatos
1. ✅ Configurar Mixpanel
2. ✅ Configurar Google Analytics
3. ✅ Criar dashboards no Metabase
4. ✅ Definir alertas críticos

### Curto Prazo
1. ⏳ Coletar baseline de métricas (beta)
2. ⏳ Calibrar metas com base em dados reais
3. ⏳ Automatizar relatórios semanais

### Médio Prazo
1. 📋 Implementar cohort analysis
2. 📋 A/B testing de onboarding
3. 📋 Pesquisa de NPS automatizada

---

**Próximo Documento:** [09-roadmap.md](09-roadmap.md)



