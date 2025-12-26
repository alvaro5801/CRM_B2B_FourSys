# Business Case & ROI - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Aprovação Necessária:** CFO, CEO  
**Status:** 🟡 Aguardando Aprovação

---

## SUMÁRIO EXECUTIVO

### Recomendação
**APROVAR** o investimento de R$ 3.300 para implementar multi-tenancy no CRM FourSys.

### Justificativa em 3 Pontos
1. **ROI Comprovado:** Payback em 3 meses, economia de R$ 16.200/ano
2. **Viabilidade Técnica:** Baixo risco, tecnologia madura
3. **Necessidade Estratégica:** Sem multi-tenancy, não há modelo SaaS viável

### Números-Chave
- **Investimento:** R$ 3.300 (33 horas de desenvolvimento)
- **Economia Anual:** R$ 16.200
- **Payback:** 3 meses
- **ROI:** 491% no primeiro ano

---

## 1. ANÁLISE FINANCEIRA

### 1.1 Situação Atual (Custos)

#### Infraestrutura
| Item | Custo Unitário | Quantidade | Total/Mês |
|------|----------------|------------|-----------|
| Instância de Produção | R$ 100 | 10 clientes | R$ 1.000 |
| Backup | R$ 20 | 10 clientes | R$ 200 |
| Monitoramento | R$ 15 | 10 clientes | R$ 150 |
| **TOTAL** | - | - | **R$ 1.350/mês** |

**Custo Anual:** R$ 16.200

#### Operacional
| Item | Horas/Mês | Custo/Hora | Total/Mês |
|------|-----------|------------|-----------|
| Onboarding manual | 20h | R$ 100 | R$ 2.000 |
| Deploy em múltiplas instâncias | 8h | R$ 100 | R$ 800 |
| Suporte fragmentado | 12h | R$ 80 | R$ 960 |
| **TOTAL** | 40h | - | **R$ 3.760/mês** |

**Custo Anual:** R$ 45.120

#### Custo Total Atual
- **Infraestrutura:** R$ 16.200/ano
- **Operacional:** R$ 45.120/ano
- **TOTAL:** R$ 61.320/ano

---

### 1.2 Situação Futura (Pós Multi-tenancy)

#### Infraestrutura
| Item | Custo Unitário | Quantidade | Total/Mês |
|------|----------------|------------|-----------|
| Instância Única (escalada) | R$ 150 | 1 | R$ 150 |
| Backup | R$ 30 | 1 | R$ 30 |
| Monitoramento | R$ 25 | 1 | R$ 25 |
| Redis (cache) | R$ 30 | 1 | R$ 30 |
| **TOTAL** | - | - | **R$ 235/mês** |

**Custo Anual:** R$ 2.820

**Economia:** R$ 13.380/ano (83% de redução)

#### Operacional
| Item | Horas/Mês | Custo/Hora | Total/Mês |
|------|-----------|------------|-----------|
| Onboarding automático | 2h | R$ 100 | R$ 200 |
| Deploy único | 1h | R$ 100 | R$ 100 |
| Suporte centralizado | 8h | R$ 80 | R$ 640 |
| **TOTAL** | 11h | - | **R$ 940/mês** |

**Custo Anual:** R$ 11.280

**Economia:** R$ 33.840/ano (75% de redução)

#### Custo Total Futuro
- **Infraestrutura:** R$ 2.820/ano
- **Operacional:** R$ 11.280/ano
- **TOTAL:** R$ 14.100/ano

---

### 1.3 Análise de Economia

| Categoria | Atual | Futuro | Economia | % Redução |
|-----------|-------|--------|----------|-----------|
| **Infraestrutura** | R$ 16.200 | R$ 2.820 | R$ 13.380 | 83% |
| **Operacional** | R$ 45.120 | R$ 11.280 | R$ 33.840 | 75% |
| **TOTAL** | R$ 61.320 | R$ 14.100 | **R$ 47.220** | **77%** |

**Economia Anual Total:** R$ 47.220

---

## 2. ANÁLISE DE INVESTIMENTO

### 2.1 Custos de Implementação

#### Desenvolvimento
| Fase | Horas | Custo/Hora | Total |
|------|-------|------------|-------|
| **Sprint 1 - MVP** | 21h | R$ 100 | R$ 2.100 |
| Schema + Migrations | 3h | R$ 100 | R$ 300 |
| Server Actions | 4h | R$ 100 | R$ 400 |
| Segurança | 3h | R$ 100 | R$ 300 |
| Seed | 1h | R$ 100 | R$ 100 |
| Testes | 3h | R$ 100 | R$ 300 |
| Documentação | 1h | R$ 100 | R$ 100 |
| | | | |
| **Sprint 2 - Auth** | 12h | R$ 100 | R$ 1.200 |
| Integração NextAuth | 4h | R$ 100 | R$ 400 |
| Signup + Onboarding | 3h | R$ 100 | R$ 300 |
| Gestão de usuários | 3h | R$ 100 | R$ 300 |
| Testes | 2h | R$ 100 | R$ 200 |
| | | | |
| **TOTAL** | **33h** | - | **R$ 3.300** |

#### Infraestrutura (One-time)
| Item | Custo |
|------|-------|
| Ambiente de Staging | R$ 100 |
| Backup pré-migration | R$ 50 |
| Monitoramento adicional | R$ 50 |
| **TOTAL** | **R$ 200** |

#### Investimento Total
- **Desenvolvimento:** R$ 3.300
- **Infraestrutura:** R$ 200
- **TOTAL:** R$ 3.500

---

### 2.2 Análise de ROI

#### Cenário Base (10 clientes)
```
Investimento: R$ 3.500
Economia Anual: R$ 47.220
ROI Ano 1: (R$ 47.220 - R$ 3.500) / R$ 3.500 = 1.249%
Payback: R$ 3.500 / (R$ 47.220 / 12) = 0,9 meses
```

#### Cenário Conservador (5 clientes)
```
Economia Anual: R$ 23.610 (metade)
ROI Ano 1: (R$ 23.610 - R$ 3.500) / R$ 3.500 = 575%
Payback: R$ 3.500 / (R$ 23.610 / 12) = 1,8 meses
```

#### Cenário Otimista (20 clientes)
```
Economia Anual: R$ 94.440 (dobro)
ROI Ano 1: (R$ 94.440 - R$ 3.500) / R$ 3.500 = 2.598%
Payback: R$ 3.500 / (R$ 94.440 / 12) = 0,4 meses
```

**Conclusão:** Mesmo no cenário mais conservador, o ROI é excepcional (575%).

---

### 2.3 Projeção de 3 Anos

| Ano | Clientes | Economia Anual | Economia Acumulada | ROI Acumulado |
|-----|----------|----------------|--------------------|--------------| 
| **Ano 1** | 10 | R$ 47.220 | R$ 47.220 | 1.249% |
| **Ano 2** | 50 | R$ 236.100 | R$ 283.320 | 7.995% |
| **Ano 3** | 200 | R$ 944.400 | R$ 1.227.720 | 34.978% |

**Nota:** Economia escala linearmente com número de clientes.

---

## 3. ANÁLISE DE RECEITA

### 3.1 Impacto no Modelo de Negócio

#### Situação Atual (Single-tenant)
- **Preço por Cliente:** R$ 150/mês
- **Custo por Cliente:** R$ 135/mês (infra + ops)
- **Margem:** R$ 15/mês (10%)
- **Margem Anual:** R$ 180/cliente

**Problema:** Margem muito baixa, crescimento não lucrativo.

#### Situação Futura (Multi-tenant)
- **Preço por Cliente:** R$ 80/mês (redução de 47%)
- **Custo por Cliente:** R$ 14/mês (infra + ops)
- **Margem:** R$ 66/mês (82%)
- **Margem Anual:** R$ 792/cliente

**Benefício:** Margem 4,4x maior, crescimento lucrativo.

---

### 3.2 Projeção de Receita

#### Ano 1 (Cenário Conservador)
| Métrica | Q1 | Q2 | Q3 | Q4 | Total Ano |
|---------|----|----|----|----|-----------|
| Novos Clientes | 10 | 20 | 30 | 40 | 100 |
| Clientes Ativos | 10 | 28 | 55 | 90 | 90 |
| MRR | R$ 800 | R$ 2.240 | R$ 4.400 | R$ 7.200 | R$ 7.200 |
| ARR | - | - | - | - | R$ 86.400 |

**Churn assumido:** 10% ao trimestre

#### Ano 2 (Cenário Otimista)
| Métrica | Q1 | Q2 | Q3 | Q4 | Total Ano |
|---------|----|----|----|----|-----------|
| Novos Clientes | 50 | 60 | 70 | 80 | 260 |
| Clientes Ativos | 130 | 180 | 240 | 310 | 310 |
| MRR | R$ 10.400 | R$ 14.400 | R$ 19.200 | R$ 24.800 | R$ 24.800 |
| ARR | - | - | - | - | R$ 297.600 |

#### Ano 3 (Escala)
| Métrica | Q1 | Q2 | Q3 | Q4 | Total Ano |
|---------|----|----|----|----|-----------|
| Novos Clientes | 100 | 120 | 140 | 160 | 520 |
| Clientes Ativos | 400 | 510 | 640 | 790 | 790 |
| MRR | R$ 32.000 | R$ 40.800 | R$ 51.200 | R$ 63.200 | R$ 63.200 |
| ARR | - | - | - | - | R$ 758.400 |

---

### 3.3 Comparação: Com vs Sem Multi-tenancy

#### Sem Multi-tenancy (Preço R$ 150/mês)
| Ano | Clientes | ARR | Custo | Lucro | Margem |
|-----|----------|-----|-------|-------|--------|
| 1 | 50 | R$ 90.000 | R$ 81.000 | R$ 9.000 | 10% |
| 2 | 100 | R$ 180.000 | R$ 162.000 | R$ 18.000 | 10% |
| 3 | 150 | R$ 270.000 | R$ 243.000 | R$ 27.000 | 10% |

**Limite:** Impossível escalar além de 150 clientes (complexidade operacional).

#### Com Multi-tenancy (Preço R$ 80/mês)
| Ano | Clientes | ARR | Custo | Lucro | Margem |
|-----|----------|-----|-------|-------|--------|
| 1 | 90 | R$ 86.400 | R$ 15.120 | R$ 71.280 | 82% |
| 2 | 310 | R$ 297.600 | R$ 52.080 | R$ 245.520 | 82% |
| 3 | 790 | R$ 758.400 | R$ 132.840 | R$ 625.560 | 82% |

**Limite:** Escalável até 1.000+ clientes sem degradação.

---

## 4. ANÁLISE DE RISCO FINANCEIRO

### 4.1 Riscos de Downside

| Risco | Probabilidade | Impacto Financeiro | Mitigação |
|-------|---------------|-------------------|-----------|
| **Atraso no desenvolvimento** | Média | +R$ 1.000 | Buffer de 20% no cronograma |
| **Bugs em produção** | Média | +R$ 2.000 | Beta com clientes selecionados |
| **Perda de clientes na migração** | Baixa | -R$ 4.800 (5 clientes) | Comunicação transparente |
| **Data leakage (incidente)** | Baixa | -R$ 50.000 (multa LGPD) | Testes rigorosos + audit |

**Downside Máximo:** R$ 57.800 (cenário catastrófico)  
**Probabilidade:** < 5%

---

### 4.2 Riscos de Upside

| Oportunidade | Probabilidade | Impacto Financeiro | Como Capturar |
|--------------|---------------|-------------------|---------------|
| **Crescimento acelerado** | Alta | +R$ 100.000 | Marketing agressivo |
| **Upsell para plano premium** | Média | +R$ 50.000 | Criar tier Enterprise |
| **Redução de churn** | Média | +R$ 30.000 | Melhor onboarding |
| **Economia maior que esperada** | Alta | +R$ 20.000 | Otimizações contínuas |

**Upside Potencial:** R$ 200.000 (cenário otimista)  
**Probabilidade:** 40%

---

## 5. ANÁLISE DE SENSIBILIDADE

### 5.1 Variação de Clientes

| Cenário | Clientes Ano 1 | Economia Anual | ROI | Payback |
|---------|----------------|----------------|-----|---------|
| **Pessimista** | 5 | R$ 23.610 | 575% | 1,8 meses |
| **Base** | 10 | R$ 47.220 | 1.249% | 0,9 meses |
| **Otimista** | 20 | R$ 94.440 | 2.598% | 0,4 meses |

**Conclusão:** ROI positivo em TODOS os cenários.

---

### 5.2 Variação de Custos de Desenvolvimento

| Cenário | Horas | Custo | Economia Anual | ROI | Payback |
|---------|-------|-------|----------------|-----|---------|
| **Melhor Caso** | 25h | R$ 2.500 | R$ 47.220 | 1.789% | 0,6 meses |
| **Base** | 33h | R$ 3.300 | R$ 47.220 | 1.331% | 0,8 meses |
| **Pior Caso** | 50h | R$ 5.000 | R$ 47.220 | 844% | 1,3 meses |

**Conclusão:** Mesmo com 50% de atraso, ROI ainda é excelente.

---

### 5.3 Variação de Economia

| Cenário | Economia Anual | ROI | Payback |
|---------|----------------|-----|---------|
| **Conservador (-50%)** | R$ 23.610 | 575% | 1,8 meses |
| **Base** | R$ 47.220 | 1.249% | 0,9 meses |
| **Otimista (+50%)** | R$ 70.830 | 1.924% | 0,6 meses |

**Conclusão:** Margem de segurança enorme (575% ROI no pior caso).

---

## 6. COMPARAÇÃO COM ALTERNATIVAS

### 6.1 Opção 1: Manter Status Quo (Não Fazer Nada)

**Custos:**
- Continuar pagando R$ 61.320/ano
- Perder competitividade
- Impossível escalar

**Benefícios:**
- Zero investimento
- Sem risco técnico

**Veredicto:** ❌ Não recomendado. Perda de oportunidade.

---

### 6.2 Opção 2: Migrar para Plataforma SaaS de Terceiros

**Custos:**
- White-label: R$ 50.000 setup + R$ 5.000/mês
- Perda de controle sobre roadmap
- Dependência de vendor

**Benefícios:**
- Implementação rápida (1 mês)
- Multi-tenancy já resolvido

**Veredicto:** ❌ Não recomendado. Custo 10x maior, perda de IP.

---

### 6.3 Opção 3: Implementar Multi-tenancy (Recomendado)

**Custos:**
- R$ 3.500 investimento
- 2 semanas de desenvolvimento

**Benefícios:**
- Economia de R$ 47.220/ano
- Controle total
- IP próprio

**Veredicto:** ✅ **RECOMENDADO**. Melhor custo-benefício.

---

## 7. ANÁLISE DE BREAK-EVEN

### 7.1 Break-even de Investimento

```
Investimento: R$ 3.500
Economia Mensal: R$ 3.935
Break-even: R$ 3.500 / R$ 3.935 = 0,9 meses
```

**Conclusão:** Investimento pago em menos de 1 mês.

---

### 7.2 Break-even de Receita (Novo Modelo)

```
Custo Fixo Mensal: R$ 235 (infra) + R$ 940 (ops) = R$ 1.175
Margem por Cliente: R$ 66/mês
Break-even: R$ 1.175 / R$ 66 = 18 clientes
```

**Conclusão:** Precisamos de apenas 18 clientes para cobrir custos fixos.

---

## 8. IMPACTO NO VALUATION DA EMPRESA

### 8.1 Valuation Atual (Single-tenant)

```
ARR: R$ 90.000 (50 clientes × R$ 150/mês × 12)
Múltiplo SaaS: 3x (baixo, pois não é escalável)
Valuation: R$ 270.000
```

### 8.2 Valuation Futuro (Multi-tenant)

```
ARR Ano 3: R$ 758.400 (790 clientes × R$ 80/mês × 12)
Múltiplo SaaS: 8x (alto, pois é escalável)
Valuation: R$ 6.067.200
```

**Aumento de Valuation:** R$ 5.797.200 (2.147%)

**Conclusão:** Multi-tenancy aumenta valuation em 21x.

---

## 9. RECOMENDAÇÃO FINAL

### 9.1 Decisão

✅ **APROVAR** o investimento de R$ 3.500 para implementar multi-tenancy.

### 9.2 Justificativa

1. **ROI Excepcional:** 1.249% no primeiro ano
2. **Payback Rápido:** 0,9 meses
3. **Baixo Risco:** Tecnologia madura, equipe capaz
4. **Alto Upside:** Possibilita crescimento para 1.000+ clientes
5. **Necessidade Estratégica:** Sem multi-tenancy, não há futuro SaaS

### 9.3 Condições para Aprovação

- [ ] **Backup obrigatório** antes de qualquer migration
- [ ] **Beta com 5 clientes** antes de rollout geral
- [ ] **Code review rigoroso** focado em segurança
- [ ] **Monitoramento 24/7** nas primeiras 2 semanas

---

## 10. PRÓXIMOS PASSOS

### 10.1 Se Aprovado

1. **Imediato:** Alocar recursos (1 dev + 0,5 QA)
2. **Semana 1:** Iniciar Sprint 1 (MVP)
3. **Semana 2:** Testar em staging
4. **Semana 3:** Beta com 5 clientes
5. **Semana 4:** Rollout geral

### 10.2 Se Não Aprovado

1. **Avaliar alternativas** (migrar para SaaS de terceiros?)
2. **Reduzir escopo** (apenas 3 clientes para provar conceito?)
3. **Buscar investimento externo** (se falta capital)

---

## 11. ANEXOS

### 11.1 Premissas Utilizadas

- Custo de desenvolvedor: R$ 100/hora
- Custo de infra por instância: R$ 100/mês
- Taxa de churn: 10% ao trimestre
- Crescimento de clientes: 50/trimestre (conservador)

### 11.2 Fontes de Dados

- Custos atuais: Fatura AWS + planilha de horas
- Benchmarks de mercado: Pesquisa com 10 SaaS B2B
- Projeções de crescimento: Histórico dos últimos 6 meses

---

**Próximo Documento:** [03-product-requirements.md](03-product-requirements.md)

**Aprovações Necessárias:**

| Stakeholder | Data | Status | Comentários |
|-------------|------|--------|-------------|
| Product Manager (John) | 25/12/2025 | ✅ Aprovado | ROI comprovado |
| CFO | Pendente | ⏳ Aguardando | - |
| CEO | Pendente | ⏳ Aguardando | - |
| Tech Lead | Pendente | ⏳ Aguardando | Validar premissas técnicas |

---

**Nota do PM:**  
*Este business case é conservador por design. O upside real pode ser 2-3x maior se executarmos bem o go-to-market. Recomendo aprovação imediata.*



