# Product Brief - CRM B2B FourSys MVP

**Versão:** 1.1 (Atualizado para Fullstack Local)  
**Data:** 25/12/2025  
**Product Manager:** John  
**Projeto:** CRM B2B FourSys - MVP Demo  
**Status:** 🟢 Aprovado para Arquitetura e Desenvolvimento

---

## 1. VISÃO DO PRODUTO

### 1.1 O Que Estamos a Construir
Um **CRM B2B focado em Gestão Visual de Leads** para PMEs, com interface extremamente fluida e simulação visual de "Inteligência de Vendas".

### 1.2 Objetivo da Demo
Criar uma experiência visual impressionante e tecnicamente sólida que demonstre:
- Gestão intuitiva de pipeline de vendas.
- Interface moderna e responsiva.
- Simulação de IA para priorização de leads.
- **Persistência de dados real** (sem perda de dados ao recarregar).

### 1.3 Público-Alvo
**Persona Principal:** Gestor de Vendas de PME
- Gere equipa de 2-5 vendedores.
- Precisa de visibilidade rápida do pipeline.
- Valoriza simplicidade sobre funcionalidades complexas.
- Quer tomar decisões baseadas em dados visuais.

---

## 2. ÉPICOS E FUNCIONALIDADES

### EPIC 1: Dashboard de Visão Geral
**Objetivo:** Fornecer visão instantânea das métricas críticas de vendas.

#### Funcionalidades Core:
1. **3 Cards de Métricas (Topo)**
   - **Pipeline Total**: Soma dos valores de leads abertos (R$).
   - **Leads Ativos**: Contagem de leads não-fechados.
   - **Taxa de Conversão**: Percentual mockado (ex: 23,5%).

2. **Gráfico de Vendas**
   - Título: "Vendas nos últimos 30 dias".
   - Tipo: Gráfico de linha (Recharts).
   - Dados: Estáticos/mockados (30 pontos).

#### Critérios de Aceitação Visual:
- ✅ Cards devem ter ícones distintos e cores diferenciadas.
- ✅ Valores devem atualizar em tempo real ao modificar leads.
- ✅ Gráfico deve ter animação suave ao carregar.
- ✅ Layout responsivo (desktop 1920x1080 e tablet 768x1024).
- ✅ Tipografia hierárquica: títulos grandes, valores em destaque.

---

### EPIC 2: Gestão Visual de Pipeline (Kanban)
**Objetivo:** Permitir movimentação visual e intuitiva de leads através do funil de vendas.

#### Funcionalidades Core:
1. **Kanban Board com 4 Colunas Fixas**
   - `Prospect` → `Qualificado` → `Proposta` → `Fechado`
   - Cada coluna mostra contador de leads.

2. **Card de Lead**
   - Nome do Cliente (destaque).
   - Nome da Empresa (secundário).
   - Valor Estimado (R$ formatado).
   - **Badge de AI Score** (0-100).

3. **Drag & Drop Fluido**
   - Arrastar card entre colunas.
   - Atualização automática de status no banco de dados.

#### Critérios de Aceitação Visual:
- ✅ **Badge de AI Score com código de cores:**
  - 🔴 Vermelho (0-40): Baixa prioridade
  - 🟡 Amarelo (41-70): Média prioridade
  - 🟢 Verde (71-100): Alta prioridade
- ✅ Card deve ter sombra e elevar-se ao hover.
- ✅ Durante drag, card fica semi-transparente (opacity: 0.6).
- ✅ Coluna de destino deve destacar-se (borda ou background).
- ✅ Animação de transição suave (200-300ms).

---

### EPIC 3: Cadastro Rápido de Leads (CRUD Simples)
**Objetivo:** Permitir criação rápida de leads com persistência no banco de dados.

#### Funcionalidades Core:
1. **Botão "Novo Lead"**
   - Localização: Topo da tela Kanban.
   - Ação: Abre modal de criação.

2. **Modal de Criação**
   - **Campos Obrigatórios:** Nome, Empresa, Valor (R$), Status.
   - **Campos Opcionais:** Email, Telefone.

3. **Geração Automática**
   - AI Score (0-100, aleatório).
   - ID único (UUID).
   - Data de criação (timestamp).

#### Critérios de Aceitação Visual:
- ✅ Modal deve abrir com animação fade-in.
- ✅ Campos obrigatórios marcados com asterisco (*).
- ✅ Validação em tempo real.
- ✅ Após salvar, modal fecha e lead aparece imediatamente no Kanban (Optimistic UI).
- ✅ Notificação de sucesso: "Lead criado com sucesso!".

---

## 3. REGRAS DE NEGÓCIO CRÍTICAS

### RN001 - AI Score Visual
- Todo lead recebe score 0-100 (gerado aleatoriamente).
- Cor da badge muda conforme score (Vermelho/Amarelo/Verde).

### RN002 - Colunas Fixas
- 4 colunas imutáveis: Prospect, Qualificado, Proposta, Fechado.

### RN003 - Cálculo de Métricas
- **Pipeline Total**: Soma de `value` onde `status != 'closed'`.
- **Leads Ativos**: Contagem onde `status != 'closed'`.

### RN004 - Persistência de Dados (Atualizado)
- **Obrigatório:** Dados devem ser salvos no **SQLite** via Prisma.
- O sistema deve manter o estado dos leads (coluna Kanban) entre recargas de página.
- Server Actions devem validar os dados antes de salvar no banco.

---

## 4. ANTI-ESCOPO (O QUE NÃO FAZER)

### 🚫 Funcionalidades PROIBIDAS no MVP:

#### Infraestrutura & Backend (Simplificação)
- ❌ Microserviços (Manter Monolito Next.js).
- ❌ Docker/Kubernetes (Não é necessário para SQLite Local).
- ❌ API REST Separada (Usar Server Actions apenas).
- ❌ PostgreSQL/MySQL em nuvem (Usar SQLite local para velocidade).

#### Autenticação e Segurança
- ❌ Auth complexa (OAuth, Google, Facebook).
- ❌ Recuperação de password via email real.
- ❌ Roles e Permissões complexas.

#### Integrações
- ❌ Integração com email (Gmail, Outlook).
- ❌ Integração com outros CRMs.
- ❌ Webhooks externos.

### ⚠️ Mensagem para a Equipa:
**"Se exige configuração de servidor ou conta em nuvem, NÃO implementar. Deve rodar com `npm run dev`."**

---

## 5. STACK TECNOLÓGICA (ATUALIZADO)

### Fullstack Framework
- **Core:** Next.js 14+ (App Router).
- **Language:** TypeScript.
- **Backend Communication:** Server Actions (Zero-API approach).

### Banco de Dados & Persistência
- **ORM:** Prisma.
- **Database:** **SQLite** (arquivo local `dev.db`).
- **Seed:** Script obrigatório para popular o banco com 20 leads iniciais.

### Frontend & UI
- **UI Library:** Shadcn/ui + Tailwind CSS.
- **Drag & Drop:** `@dnd-kit/core`.
- **Gráficos:** Recharts.

---

## 6. CRITÉRIOS DE SUCESSO DA DEMO

### Experiência Visual
- ✅ Interface carrega em < 1 segundo.
- ✅ Drag & drop é fluido (< 100ms latência).
- ✅ Animações são suaves e profissionais.

### Funcionalidade Core
- ✅ **Persistência:** Criar um lead, recarregar a página e o lead CONTINUAR lá.
- ✅ **Kanban:** Mover um lead, recarregar a página e ele CONTINUAR na nova coluna.
- ✅ Dashboard reflete mudanças em tempo real.

---

## 7. ESTRUTURA DE DADOS (PRISMA SCHEMA SUGERIDO)

```prisma
model Lead {
  id          String   @id @default(uuid())
  name        String
  company     String
  status      String   // 'prospect', 'qualified', 'proposal', 'closed'
  value       Float
  aiScore     Int
  email       String?
  phone       String?
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
}