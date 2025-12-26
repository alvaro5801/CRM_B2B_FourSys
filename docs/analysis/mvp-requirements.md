# Documento de Análise de Requisitos - MVP CRM B2B FourSys

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)  
**Projeto:** CRM B2B FourSys - Demonstração MVP  
**Documento Base:** `Pesquisa_de_Mercado_CRM_B2B_FourSys.md`

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Objetivo
Desenvolver um CRM B2B focado em **Gestão Visual de Leads** para PMEs, com ênfase em interface fluida e simulação visual de "Inteligência de Vendas".

### 1.2 Escopo do MVP
Este documento define **exclusivamente** as funcionalidades incluídas no MVP. Funcionalidades como autenticação real, integrações externas e configurações avançadas estão **FORA DO ESCOPO**.

### 1.3 Público-Alvo
Pequenas e Médias Empresas (PMEs) que necessitam de gestão visual e simplificada de leads B2B.

---

## 2. MAPEAMENTO DE ENTIDADES

### 2.1 Entidade: Lead

Estrutura de dados principal do sistema.

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `id` | string (UUID) | ✅ Sim | Identificador único do lead | Gerado automaticamente |
| `name` | string | ✅ Sim | Nome completo do cliente | Min: 2 caracteres |
| `company` | string | ✅ Sim | Nome da empresa do cliente | Min: 2 caracteres |
| `status` | enum | ✅ Sim | Status atual no funil de vendas | Valores permitidos: `'prospect'`, `'qualified'`, `'proposal'`, `'closed'` |
| `value` | number | ✅ Sim | Valor estimado da oportunidade (R$) | Valor positivo, formato decimal |
| `aiScore` | number | ✅ Sim | Pontuação de IA (0-100) | Gerado automaticamente, range: 0-100 |
| `lastContact` | string (ISO Date) | ✅ Sim | Data do último contato | Formato ISO 8601 |
| `email` | string | ❌ Opcional | Email do cliente | Formato de email válido |
| `phone` | string | ❌ Opcional | Telefone do cliente | Formato livre |

**Regras de Geração Automática:**
- `id`: Gerado via UUID v4 na criação
- `aiScore`: Calculado automaticamente (simulado) na criação do lead
- `lastContact`: Definido como data/hora atual na criação

---

## 3. DEFINIÇÃO DE FLUXOS FUNCIONAIS

### 3.1 FLUXO 1: Criação e Qualificação Automática de Lead

**Objetivo:** Permitir a criação de um novo lead com qualificação automática simulada por IA.

**Atores:** Usuário (Vendedor/Gestor)

**Pré-condições:** Usuário está na tela de Gestão de Leads ou Kanban Board

**Fluxo Principal (Happy Path):**

1. Usuário clica no botão **"Novo Lead"**
2. Sistema exibe modal/dialog com formulário
3. Usuário preenche campos obrigatórios:
   - Nome do Cliente
   - Nome da Empresa
   - Valor Estimado (R$)
   - Status inicial (seleção)
4. Usuário preenche campos opcionais (se desejar):
   - Email
   - Telefone
5. Usuário clica em **"Salvar"** ou **"Criar Lead"**
6. Sistema valida os dados:
   - Campos obrigatórios preenchidos
   - Formato de email válido (se preenchido)
   - Valor numérico positivo
7. Sistema gera automaticamente:
   - `id` (UUID)
   - `aiScore` (valor entre 0-100, simulado)
   - `lastContact` (timestamp atual)
8. Sistema persiste o lead no storage (LocalStorage/Zustand)
9. Sistema fecha o modal
10. Sistema atualiza a interface (Kanban/Lista) exibindo o novo lead
11. Sistema exibe mensagem de sucesso: "Lead criado com sucesso!"

**Pós-condições:**
- Lead criado e visível no Kanban Board na coluna correspondente ao status
- Métricas do Dashboard atualizadas
- Badge de AI Score visível no card do lead

**Fluxos Alternativos:**

**3.1.A - Validação Falha:**
- 6a. Sistema detecta erro de validação
- 6b. Sistema exibe mensagem de erro específica
- 6c. Retorna ao passo 3 (usuário corrige dados)

**3.1.B - Cancelamento:**
- *a. Usuário clica em "Cancelar" a qualquer momento
- *b. Sistema fecha modal sem persistir dados
- *c. Retorna à tela anterior

---

### 3.2 FLUXO 2: Ciclo de Vida no Kanban (Movimentação e Atualização)

**Objetivo:** Permitir a movimentação visual de leads entre estágios do funil e atualização automática de métricas.

**Atores:** Usuário (Vendedor/Gestor)

**Pré-condições:** 
- Usuário está na tela Kanban Board
- Existe pelo menos 1 lead no sistema

**Fluxo Principal (Happy Path):**

1. Sistema exibe Kanban Board com 4 colunas fixas:
   - `Prospect`
   - `Qualificado`
   - `Proposta`
   - `Fechado`
2. Sistema renderiza cards de leads nas colunas correspondentes aos seus status
3. Cada card exibe:
   - Nome do Cliente
   - Nome da Empresa
   - Valor (formatado em R$)
   - Badge de AI Score (com código de cor)
4. Usuário clica e **arrasta** um card de lead
5. Sistema exibe feedback visual de drag (card semi-transparente, colunas destacadas)
6. Usuário **solta** o card sobre uma nova coluna
7. Sistema valida se a coluna de destino é diferente da origem
8. Sistema atualiza o campo `status` do lead:
   - Coluna `Prospect` → `status = 'prospect'`
   - Coluna `Qualificado` → `status = 'qualified'`
   - Coluna `Proposta` → `status = 'proposal'`
   - Coluna `Fechado` → `status = 'closed'`
9. Sistema atualiza `lastContact` para timestamp atual
10. Sistema persiste alterações no storage
11. Sistema reposiciona o card na nova coluna
12. Sistema recalcula e atualiza métricas do Dashboard:
    - Pipeline Total (soma de valores de leads não-fechados)
    - Leads Ativos (contagem de leads não-fechados)
    - Taxa de Conversão (cálculo estático/mockado)
13. Sistema exibe notificação sutil: "Lead movido para [Nome da Coluna]"

**Pós-condições:**
- Lead está na nova coluna
- Status do lead atualizado
- Dashboard reflete as novas métricas
- Histórico de `lastContact` atualizado

**Fluxos Alternativos:**

**3.2.A - Soltar na Mesma Coluna:**
- 7a. Sistema detecta que coluna de destino = coluna de origem
- 7b. Sistema retorna card à posição original
- 7c. Nenhuma atualização é realizada

**3.2.B - Cancelamento do Drag:**
- 5a. Usuário pressiona ESC ou solta fora das colunas
- 5b. Sistema cancela operação
- 5c. Card retorna à posição original

---

## 4. REGRAS DE NEGÓCIO

### RN001 - Geração de AI Score
**Descrição:** Todo lead criado deve receber automaticamente um `aiScore` entre 0 e 100.  
**Implementação MVP:** Valor gerado aleatoriamente (simulação de IA).  
**Critério de Aceitação:** Score sempre presente e dentro do range 0-100.

### RN002 - Badge de AI Score (Código de Cores)
**Descrição:** O card do lead deve exibir uma badge visual baseada no `aiScore`.  
**Regras de Classificação:**
- **Score 0-40:** Badge Vermelha (Baixa Prioridade)
- **Score 41-70:** Badge Amarela (Média Prioridade)
- **Score 71-100:** Badge Verde (Alta Prioridade)

**Critério de Aceitação:** Badge sempre visível e cor correspondente ao score.

### RN003 - Colunas Fixas do Kanban
**Descrição:** O Kanban Board possui 4 colunas fixas e imutáveis.  
**Ordem Obrigatória:** `Prospect` → `Qualificado` → `Proposta` → `Fechado`  
**Restrição:** Não é permitido adicionar, remover ou reordenar colunas no MVP.

### RN004 - Cálculo de Pipeline Total
**Descrição:** Métrica "Pipeline Total" no Dashboard.  
**Fórmula:** Soma dos valores (`value`) de todos os leads com `status != 'closed'`  
**Formato de Exibição:** R$ X.XXX,XX

### RN005 - Contagem de Leads Ativos
**Descrição:** Métrica "Leads Ativos" no Dashboard.  
**Fórmula:** Contagem de leads com `status != 'closed'`  
**Formato de Exibição:** Número inteiro

### RN006 - Taxa de Conversão (Mockada)
**Descrição:** Métrica "Taxa de Conversão" no Dashboard.  
**Implementação MVP:** Valor estático/mockado (ex: 23,5%)  
**Objetivo:** Impressionar visualmente na demo (não reflete cálculo real)

### RN007 - Persistência de Dados
**Descrição:** Todos os dados devem ser persistidos localmente.  
**Tecnologia:** LocalStorage ou Zustand Store (sem banco de dados real)  
**Restrição:** Dados não persistem entre dispositivos ou navegadores diferentes.

### RN008 - Atualização de Last Contact
**Descrição:** O campo `lastContact` deve ser atualizado automaticamente.  
**Gatilhos:**
- Criação de novo lead
- Movimentação de lead no Kanban
**Formato:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

---

## 5. REQUISITOS FUNCIONAIS DETALHADOS

### 5.1 RF001 - Dashboard (Home)

**Descrição:** Tela inicial com visão geral de métricas e gráfico.

**Componentes Obrigatórios:**

#### 5.1.1 Cards de Métricas (Topo)
- **Card 1:** Pipeline Total
  - Título: "Pipeline Total"
  - Valor: Calculado dinamicamente (RN004)
  - Ícone: Sugestão de cifrão ou gráfico de barras
  
- **Card 2:** Leads Ativos
  - Título: "Leads Ativos"
  - Valor: Calculado dinamicamente (RN005)
  - Ícone: Sugestão de usuários ou contatos
  
- **Card 3:** Taxa de Conversão
  - Título: "Taxa de Conversão"
  - Valor: Estático mockado (RN006)
  - Ícone: Sugestão de percentual ou alvo

#### 5.1.2 Gráfico de Linha
- **Título:** "Vendas nos últimos 30 dias"
- **Biblioteca:** Recharts
- **Dados:** Estáticos/mockados (array de 30 pontos)
- **Eixo X:** Dias (1-30)
- **Eixo Y:** Valor em R$
- **Estilo:** Linha suave, cores do tema da aplicação

**Critérios de Aceitação:**
- ✅ 3 cards visíveis e responsivos
- ✅ Valores atualizados em tempo real ao modificar leads
- ✅ Gráfico renderizado corretamente
- ✅ Layout responsivo (desktop e tablet)

---

### 5.2 RF002 - Kanban Board

**Descrição:** Interface principal de gestão visual de leads com drag & drop.

**Componentes Obrigatórios:**

#### 5.2.1 Estrutura de Colunas
- 4 colunas fixas (RN003)
- Cada coluna exibe:
  - Título do status
  - Contador de leads na coluna
  - Área de drop para receber cards

#### 5.2.2 Card de Lead
Cada card deve exibir:
- **Nome do Cliente** (destaque, fonte maior)
- **Nome da Empresa** (fonte menor, cor secundária)
- **Valor Estimado** (formatado: R$ X.XXX,XX)
- **Badge de AI Score** (RN002):
  - Exibir número do score
  - Cor de fundo conforme classificação
  - Posicionamento: canto superior direito do card

#### 5.2.3 Funcionalidade Drag & Drop
- Arrastar: Click + Hold no card
- Feedback visual durante drag:
  - Card arrastado semi-transparente
  - Coluna de destino destacada
- Soltar: Release do mouse sobre coluna válida
- Animação suave de transição

**Critérios de Aceitação:**
- ✅ Drag & drop funcional entre todas as colunas
- ✅ Badge de AI Score visível e com cor correta
- ✅ Atualização imediata do Dashboard após movimentação
- ✅ Feedback visual claro durante interação
- ✅ Responsivo (desktop e tablet)

---

### 5.3 RF003 - Gestão de Leads (CRUD Simplificado)

**Descrição:** Modal/Dialog para criação e edição de leads.

**Componentes Obrigatórios:**

#### 5.3.1 Botão de Ação
- **Label:** "Novo Lead" ou "+ Novo Lead"
- **Localização:** Topo da tela Kanban ou Gestão de Leads
- **Ação:** Abre modal de criação

#### 5.3.2 Modal de Criação/Edição
**Campos do Formulário:**

1. **Nome do Cliente** (obrigatório)
   - Tipo: Input text
   - Placeholder: "Ex: João Silva"
   - Validação: Mínimo 2 caracteres

2. **Nome da Empresa** (obrigatório)
   - Tipo: Input text
   - Placeholder: "Ex: Tech Solutions"
   - Validação: Mínimo 2 caracteres

3. **Valor Estimado** (obrigatório)
   - Tipo: Input number ou masked input
   - Placeholder: "R$ 0,00"
   - Validação: Valor positivo, formato decimal

4. **Status** (obrigatório)
   - Tipo: Select/Dropdown
   - Opções: Prospect, Qualificado, Proposta, Fechado
   - Default: "Prospect"

5. **Email** (opcional)
   - Tipo: Input email
   - Placeholder: "cliente@empresa.com"
   - Validação: Formato de email válido (se preenchido)

6. **Telefone** (opcional)
   - Tipo: Input tel
   - Placeholder: "(11) 98765-4321"
   - Validação: Nenhuma (formato livre)

**Botões de Ação:**
- **Salvar/Criar Lead:** Valida e persiste dados
- **Cancelar:** Fecha modal sem salvar

**Critérios de Aceitação:**
- ✅ Modal abre e fecha corretamente
- ✅ Validações funcionam em tempo real
- ✅ Mensagens de erro claras e específicas
- ✅ Lead criado aparece imediatamente no Kanban
- ✅ Campos opcionais podem ficar vazios
- ✅ AI Score gerado automaticamente (não editável pelo usuário)

---

## 6. REQUISITOS NÃO-FUNCIONAIS

### 6.1 RNF001 - Performance
- Renderização do Kanban com até 50 leads: < 1 segundo
- Drag & drop responsivo: < 100ms de latência
- Atualização de métricas: < 200ms

### 6.2 RNF002 - Usabilidade
- Interface intuitiva (usuário consegue criar lead sem tutorial)
- Feedback visual em todas as ações
- Mensagens de erro claras e em português

### 6.3 RNF003 - Compatibilidade
- Navegadores: Chrome, Firefox, Edge (últimas 2 versões)
- Dispositivos: Desktop (1920x1080) e Tablet (768x1024)
- Mobile: Fora do escopo MVP

### 6.4 RNF004 - Tecnologia
- **Frontend:** React + TypeScript
- **State Management:** Zustand ou Context API
- **Persistência:** LocalStorage
- **UI Library:** Shadcn/ui (recomendado)
- **Drag & Drop:** dnd-kit ou react-beautiful-dnd
- **Gráficos:** Recharts

### 6.5 RNF005 - Segurança
- Validação de inputs no frontend
- Sanitização de dados antes de persistir
- Sem autenticação real (fora do escopo MVP)

---

## 7. FORA DO ESCOPO (EXCLUSÕES EXPLÍCITAS)

As seguintes funcionalidades **NÃO** fazem parte do MVP:

❌ Sistema de autenticação e login real  
❌ Gestão de usuários e permissões  
❌ Integrações com APIs externas (email, CRM, etc.)  
❌ Relatórios avançados e exportação de dados  
❌ Configurações personalizáveis  
❌ Histórico de atividades detalhado  
❌ Notificações push ou email  
❌ Suporte mobile responsivo  
❌ Banco de dados real (backend)  
❌ Edição inline de leads no Kanban  
❌ Filtros e busca avançada  
❌ Anexos e documentos  
❌ Calendário e agendamento  
❌ Inteligência Artificial real (apenas simulação visual)

---

## 8. CRITÉRIOS DE ACEITAÇÃO GLOBAIS

Para considerar o MVP completo, todos os seguintes critérios devem ser atendidos:

### 8.1 Funcionalidades Core
- ✅ Dashboard exibe 3 métricas + gráfico
- ✅ Kanban Board com 4 colunas funcionais
- ✅ Drag & Drop operacional
- ✅ Modal de criação de leads funcional
- ✅ AI Score gerado e exibido corretamente
- ✅ Persistência local funcionando

### 8.2 Qualidade Visual
- ✅ Interface moderna e fluida
- ✅ Animações suaves (transições de 200-300ms)
- ✅ Código de cores consistente
- ✅ Tipografia legível e hierárquica
- ✅ Espaçamento adequado (não poluído)

### 8.3 Experiência do Usuário
- ✅ Fluxo intuitivo (criar lead → arrastar → ver métricas)
- ✅ Feedback visual em todas as ações
- ✅ Sem bugs críticos ou travamentos
- ✅ Tempo de resposta < 1s para ações principais

---

## 9. GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Lead** | Oportunidade de venda potencial com dados de cliente e empresa |
| **Pipeline** | Conjunto de leads em diferentes estágios do funil de vendas |
| **AI Score** | Pontuação simulada (0-100) que indica prioridade do lead |
| **Kanban Board** | Interface visual com colunas representando estágios do funil |
| **Drag & Drop** | Ação de arrastar e soltar cards entre colunas |
| **Badge** | Elemento visual (etiqueta) que exibe o AI Score com cor |
| **MVP** | Minimum Viable Product - versão mínima funcional do produto |
| **LocalStorage** | Armazenamento local do navegador (chave-valor) |

---

## 10. PRÓXIMOS PASSOS RECOMENDADOS

Após aprovação deste documento:

1. **Product Manager:** Revisar e aprovar requisitos
2. **Arquiteto/Dev:** Criar especificação técnica e arquitetura
3. **UX Designer:** Criar wireframes de alta fidelidade (opcional)
4. **Dev:** Iniciar implementação seguindo este documento como "contrato"

---

## 11. CONTROLE DE VERSÃO

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 25/12/2025 | Mary (Business Analyst) | Versão inicial baseada em `Pesquisa_de_Mercado_CRM_B2B_FourSys.md` |

---

**Documento gerado por:** BMAD Business Method Module  
**Agente:** Mary - Business Analyst 📊  
**Status:** ✅ Pronto para Revisão/Aprovação

