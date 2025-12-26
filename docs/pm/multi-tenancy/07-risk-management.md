# Risk Management - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Ativo

---

## MATRIZ DE RISCOS

### Classificação
- **Probabilidade:** Baixa (< 20%) | Média (20-50%) | Alta (> 50%)
- **Impacto:** Baixo | Médio | Alto | Crítico
- **Prioridade:** Baixa 🟢 | Média 🟡 | Alta 🟠 | Crítica 🔴

---

## RISCOS TÉCNICOS

### RT001 - Data Leakage entre Tenants
**Probabilidade:** Média  
**Impacto:** 🔴 Crítico  
**Prioridade:** 🔴 Crítica

**Descrição:** Tenant A consegue ver/modificar dados do Tenant B devido a query sem filtro de tenantId.

**Consequências:**
- Violação de LGPD (multa até R$ 50M)
- Perda de confiança dos clientes
- Cancelamentos em massa
- Dano reputacional irreversível

**Mitigações:**
- ✅ Code review rigoroso focado em segurança
- ✅ Testes automatizados de isolamento em CI/CD
- ✅ Auditoria de segurança antes de produção
- ✅ Monitoramento de tentativas de acesso cruzado
- ✅ Prisma Middleware para filtro automático (opcional)

**Plano de Contingência:**
- Desativar aplicação imediatamente
- Identificar escopo do vazamento
- Notificar clientes afetados em 24h
- Aplicar correção urgente
- Auditoria completa

**Responsável:** Tech Lead + Security Engineer

---

### RT002 - Performance Degradada
**Probabilidade:** Baixa  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟡 Média

**Descrição:** Queries lentas após implementação de multi-tenancy devido a índices inadequados.

**Consequências:**
- Dashboard lento (> 2s)
- Frustração dos usuários
- Aumento de churn
- Custos de infra maiores

**Mitigações:**
- ✅ Índices adequados: `[tenantId]`, `[tenantId, status]`, etc
- ✅ Load testing com 1.000 tenants
- ✅ Monitoramento de slow queries
- ✅ APM (Application Performance Monitoring)
- ✅ Caching com Redis (se necessário)

**Plano de Contingência:**
- Adicionar índices faltantes
- Escalar banco verticalmente
- Implementar caching
- Otimizar queries problemáticas

**Responsável:** Backend Developer + DevOps

---

### RT003 - Perda de Dados na Migration
**Probabilidade:** Média  
**Impacto:** 🔴 Alto  
**Prioridade:** 🔴 Crítica

**Descrição:** Migration de dados existentes falha e corrompe/perde dados.

**Consequências:**
- Perda de leads de clientes
- Impossibilidade de rollback
- Downtime prolongado
- Perda de confiança

**Mitigações:**
- ✅ Backup completo antes de migration
- ✅ Testar migration em staging primeiro
- ✅ Validar contagem de registros antes/depois
- ✅ Script de rollback preparado
- ✅ Dry-run da migration

**Plano de Contingência:**
- Restaurar backup imediatamente
- Revisar script de migration
- Testar novamente em staging
- Aplicar correções
- Tentar novamente

**Responsável:** Backend Developer + DevOps

---

### RT004 - Complexidade de Autenticação
**Probabilidade:** Média  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟡 Média

**Descrição:** Integração com NextAuth.js mais complexa que esperado, causando atrasos.

**Consequências:**
- Atraso no Sprint 2
- Aumento de custos (+R$ 1.000)
- Postergação de lançamento

**Mitigações:**
- ✅ Usar biblioteca madura (NextAuth.js)
- ✅ Seguir documentação oficial
- ✅ Pair programming se necessário
- ✅ Buffer de 20% no cronograma

**Plano de Contingência:**
- Contratar consultor especializado
- Simplificar implementação (MVP)
- Postergar features não-críticas

**Responsável:** Backend Developer

---

## RISCOS DE NEGÓCIO

### RN001 - Baixa Conversão Free → Pro
**Probabilidade:** Média  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟡 Média

**Descrição:** Menos de 20% dos usuários free convertem para Pro (meta: 30%).

**Consequências:**
- MRR abaixo da meta
- ROI de marketing negativo
- Muitos "free riders"

**Mitigações:**
- ✅ Limites adequados no plano Free (50 leads)
- ✅ Email drip para engajamento
- ✅ Onboarding que mostra valor
- ✅ Incentivos de conversão (desconto)

**Plano de Contingência:**
- Reduzir limite do Free (ex: 25 leads)
- Melhorar onboarding
- Adicionar features exclusivas ao Pro
- Oferecer trial estendido

**Responsável:** Product Manager + Marketing

---

### RN002 - Churn Alto (> 15%)
**Probabilidade:** Baixa  
**Impacto:** 🔴 Alto  
**Prioridade:** 🟠 Alta

**Descrição:** Churn mensal acima de 15% (meta: < 15%).

**Consequências:**
- LTV reduzido
- Crescimento estagnado
- Necessidade de aquisição constante

**Mitigações:**
- ✅ Onboarding excelente
- ✅ Suporte responsivo
- ✅ Monitoramento de uso
- ✅ Intervenção proativa quando uso cai
- ✅ Pesquisas de NPS

**Plano de Contingência:**
- Exit interviews para entender motivos
- Melhorias no produto
- Programa de retenção (descontos)
- Downgrade para Free em vez de cancelar

**Responsável:** Product Manager + Customer Success

---

### RN003 - CAC Muito Alto (> R$ 250)
**Probabilidade:** Média  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟡 Média

**Descrição:** Custo de Aquisição de Cliente acima de R$ 250 (meta: < R$ 200).

**Consequências:**
- LTV/CAC < 3x (não saudável)
- Payback > 6 meses
- Crescimento não sustentável

**Mitigações:**
- ✅ Otimização de campanhas pagas
- ✅ Investimento em SEO (CAC zero)
- ✅ Programa de referral
- ✅ Parcerias estratégicas

**Plano de Contingência:**
- Pausar campanhas não-rentáveis
- Focar em canais orgânicos
- Aumentar preço (se LTV justificar)
- Melhorar taxa de conversão

**Responsável:** Head of Marketing + CFO

---

### RN004 - Concorrentes Baixam Preço
**Probabilidade:** Baixa  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟢 Baixa

**Descrição:** Pipedrive ou RD Station reduzem preço para competir.

**Consequências:**
- Perda de diferencial de preço
- Necessidade de reduzir preço também
- Guerra de preços

**Mitigações:**
- ✅ Diferenciação por UX (não só preço)
- ✅ AI Score como diferencial
- ✅ Onboarding mais rápido
- ✅ Comunidade e conteúdo

**Plano de Contingência:**
- Manter preço e focar em valor
- Adicionar features exclusivas
- Melhorar suporte e onboarding
- Programa de fidelidade

**Responsável:** Product Manager + CEO

---

## RISCOS DE PROJETO

### RP001 - Atraso no Desenvolvimento
**Probabilidade:** Média  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟡 Média

**Descrição:** Desenvolvimento leva 50h em vez de 33h (50% de atraso).

**Consequências:**
- Custo adicional: +R$ 1.700
- Lançamento atrasado
- Perda de janela de oportunidade

**Mitigações:**
- ✅ Buffer de 20% no cronograma
- ✅ Daily standups para identificar bloqueios
- ✅ Pair programming em tarefas complexas
- ✅ Reduzir escopo se necessário

**Plano de Contingência:**
- Priorizar features críticas (MVP)
- Postergar features nice-to-have
- Contratar desenvolvedor adicional
- Lançar beta com funcionalidades reduzidas

**Responsável:** Tech Lead + PM

---

### RP002 - Falta de Recursos (Equipe)
**Probabilidade:** Baixa  
**Impacto:** 🔴 Alto  
**Prioridade:** 🟠 Alta

**Descrição:** Desenvolvedor principal sai ou fica doente durante implementação.

**Consequências:**
- Atraso significativo
- Perda de conhecimento
- Necessidade de contratar substituto

**Mitigações:**
- ✅ Documentação detalhada
- ✅ Pair programming (knowledge sharing)
- ✅ Code review (múltiplas pessoas conhecem código)
- ✅ Backup de desenvolvedor

**Plano de Contingência:**
- Contratar freelancer experiente
- Redistribuir tarefas para outros devs
- Postergar lançamento
- Simplificar escopo

**Responsável:** Tech Lead + HR

---

### RP003 - Scope Creep
**Probabilidade:** Alta  
**Impacto:** 🟡 Médio  
**Prioridade:** 🟠 Alta

**Descrição:** Stakeholders pedem features adicionais durante desenvolvimento.

**Consequências:**
- Atraso no lançamento
- Aumento de custos
- Equipe sobrecarregada

**Mitigações:**
- ✅ PRD claro e aprovado
- ✅ Change request process
- ✅ PM como gatekeeper
- ✅ Backlog para features futuras

**Plano de Contingência:**
- Dizer "não" educadamente
- Adicionar ao backlog para próximo sprint
- Avaliar trade-offs (o que sai se isso entrar?)
- Aprovar apenas mudanças críticas

**Responsável:** Product Manager

---

## RISCOS DE COMPLIANCE

### RC001 - Violação de LGPD
**Probabilidade:** Baixa  
**Impacto:** 🔴 Crítico  
**Prioridade:** 🔴 Crítica

**Descrição:** Sistema não está em conformidade com LGPD, resultando em multa.

**Consequências:**
- Multa até R$ 50M (2% do faturamento)
- Processo judicial
- Dano reputacional
- Perda de clientes

**Mitigações:**
- ✅ Isolamento de dados garantido
- ✅ Direito ao esquecimento (delete tenant)
- ✅ Exportação de dados
- ✅ Logs de auditoria
- ✅ Revisão legal

**Plano de Contingência:**
- Contratar advogado especializado
- Corrigir não-conformidades imediatamente
- Notificar ANPD se necessário
- Implementar melhorias de compliance

**Responsável:** Legal + Security Engineer

---

## MONITORAMENTO DE RISCOS

### Frequência de Revisão
- **Riscos Críticos:** Diário (durante implementação)
- **Riscos Altos:** Semanal
- **Riscos Médios:** Quinzenal
- **Riscos Baixos:** Mensal

### Responsáveis
- **Product Manager:** Coordena revisão de riscos
- **Tech Lead:** Riscos técnicos
- **CFO:** Riscos financeiros
- **Legal:** Riscos de compliance

### Ferramentas
- Planilha de riscos (atualizada semanalmente)
- Dashboard de métricas (tempo real)
- Alertas automáticos (Sentry, monitoramento)

---

## PLANO DE COMUNICAÇÃO DE RISCOS

### Quando Comunicar
- **Risco Crítico Materializado:** Imediatamente (< 1h)
- **Risco Alto Materializado:** Mesmo dia
- **Risco Médio Materializado:** Próxima reunião
- **Risco Baixo Materializado:** Relatório semanal

### Para Quem Comunicar
- **CEO:** Todos os riscos críticos e altos
- **CFO:** Riscos financeiros
- **Tech Lead:** Riscos técnicos
- **Equipe:** Riscos que impactam trabalho

---

## RESUMO DE PRIORIDADES

### Críticos 🔴 (Ação Imediata)
1. RT001 - Data Leakage
2. RT003 - Perda de Dados na Migration
3. RC001 - Violação de LGPD

### Altos 🟠 (Monitorar de Perto)
1. RN002 - Churn Alto
2. RP001 - Atraso no Desenvolvimento
3. RP002 - Falta de Recursos

### Médios 🟡 (Monitorar)
1. RT002 - Performance Degradada
2. RT004 - Complexidade de Autenticação
3. RN001 - Baixa Conversão
4. RN003 - CAC Alto
5. RP003 - Scope Creep

### Baixos 🟢 (Aceitar)
1. RN004 - Concorrentes Baixam Preço

---

**Próximo Documento:** [08-success-metrics.md](08-success-metrics.md)



