# User Flows - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎨 Fluxos Completos

---

## 📋 Introdução

Este documento detalha todos os **fluxos de usuário** (user flows) para a funcionalidade de Multi-tenancy, incluindo diagramas, pontos de decisão e estados de erro.

---

## 🚀 FLOW 1: Signup & Onboarding

**Objetivo:** Criar conta e tenant em < 3 minutos  
**Persona:** Gestor de Vendas (novo usuário)  
**Prioridade:** 🔴 Crítica

### Diagrama de Fluxo

```
┌─────────────┐
│   START     │
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Signup - Step 1 │
│ Dados da Empresa│
├─────────────────┤
│ • Nome Empresa  │
│ • Slug (auto)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Signup - Step 2 │
│   Seus Dados    │
├─────────────────┤
│ • Nome Completo │
│ • Email         │
│ • Senha         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Signup - Step 3 │
│  Confirmação    │
├─────────────────┤
│ • Review dados  │
│ • Aceitar termos│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Criando Conta...│
│   [Loading]     │
└──────┬──────────┘
       │
       ├─── ❌ Erro
       │    └──> Mensagem de erro
       │         └──> Voltar Step 2
       │
       ▼
┌─────────────────┐
│ ✅ Sucesso!     │
│ Conta Criada    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Email Enviado   │
│ Verificar Email │
└──────┬──────────┘
       │
       ├─── Skip (opcional)
       │    └──> Dashboard
       │
       ▼
┌─────────────────┐
│ Verificar Email │
│ Click no Link   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ ✅ Email OK     │
│ Redirect        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Dashboard     │
│ Welcome Tour    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Criar 1º Lead  │
│   [Optional]    │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│     END     │
│ Onboarding  │
│  Complete   │
└─────────────┘
```

### Pontos de Decisão

1. **Slug Único?**
   - ✅ Sim → Continuar
   - ❌ Não → Sugerir alternativa (foursys-1, foursys-2)

2. **Email Único?**
   - ✅ Sim → Continuar
   - ❌ Não → Erro "Email já cadastrado" + Link para login

3. **Senha Forte?**
   - ✅ Sim (8+ chars, 1 maiúscula, 1 número) → Continuar
   - ❌ Não → Mensagem de validação em tempo real

4. **Verificar Email?**
   - Sim → Fluxo de verificação
   - Skip → Dashboard (email não verificado)

### Estados de Erro

| Erro | Mensagem | Ação |
|------|----------|------|
| **Slug duplicado** | "Este nome já está em uso. Que tal 'foursys-tech'?" | Sugerir alternativa |
| **Email duplicado** | "Este email já está cadastrado. [Fazer login](#)" | Link para login |
| **Senha fraca** | "Senha deve ter 8+ caracteres, 1 maiúscula e 1 número" | Validação inline |
| **Erro de rede** | "Não foi possível criar sua conta. Tente novamente." | Botão "Tentar Novamente" |

### Métricas de Sucesso

- **Tempo médio:** < 3 minutos
- **Taxa de conclusão:** > 80%
- **Drop-off por step:** < 10%

---

## 🔐 FLOW 2: Login & Tenant Selection

**Objetivo:** Acesso rápido e seguro  
**Persona:** Usuário existente  
**Prioridade:** 🔴 Crítica

### Diagrama de Fluxo

```
┌─────────────┐
│   START     │
│ Login Page  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Login Form     │
├─────────────────┤
│ • Email         │
│ • Senha         │
│ [Esqueci senha] │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Validando...    │
│   [Loading]     │
└──────┬──────────┘
       │
       ├─── ❌ Credenciais inválidas
       │    └──> Mensagem de erro
       │         └──> Voltar Login Form
       │
       ▼
┌─────────────────┐
│ ✅ Autenticado  │
│ Buscar Tenants  │
└──────┬──────────┘
       │
       ├─── Usuário tem 1 tenant
       │    └──> Dashboard (tenant único)
       │
       ├─── Usuário tem 2+ tenants
       │    └──> Tenant Selector
       │
       ▼
┌─────────────────┐
│ Tenant Selector │
│ Escolher Tenant │
├─────────────────┤
│ □ FourSys Ltda  │
│ □ Tech Solutions│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Tenant Selected │
│ Set Session     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Dashboard     │
│ (Tenant Context)│
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│     END     │
│  Logged In  │
└─────────────┘
```

### Fluxo Alternativo: Forgot Password

```
┌─────────────────┐
│ Esqueci Senha   │
│ Click no Link   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Forgot Password │
│     Form        │
├─────────────────┤
│ • Email         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Email Enviado   │
│ Check Inbox     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Click Link      │
│ Reset Password  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Nova Senha Form │
├─────────────────┤
│ • Nova Senha    │
│ • Confirmar     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ ✅ Senha Salva  │
│ Redirect Login  │
└─────────────────┘
```

### Estados de Erro

| Erro | Mensagem | Ação |
|------|----------|------|
| **Credenciais inválidas** | "Email ou senha incorretos" | Tentar novamente |
| **Conta bloqueada** | "Sua conta foi bloqueada. Contate o suporte." | Link para suporte |
| **Email não verificado** | "Verifique seu email antes de fazer login" | Reenviar email |
| **Sessão expirada** | "Sua sessão expirou. Faça login novamente." | Redirect para login |

---

## 👥 FLOW 3: Convidar Usuário

**Objetivo:** Admin convida membro da equipe  
**Persona:** Admin do Tenant  
**Prioridade:** 🟡 Média

### Diagrama de Fluxo

```
┌─────────────┐
│   START     │
│ Settings >  │
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ User List       │
│ (Tenant-scoped) │
├─────────────────┤
│ • João (Admin)  │
│ • Maria (User)  │
│ [+ Convidar]    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Invite Modal    │
├─────────────────┤
│ • Email         │
│ • Role (select) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Validando...    │
└──────┬──────────┘
       │
       ├─── ❌ Email já existe
       │    └──> "Usuário já faz parte do tenant"
       │
       ▼
┌─────────────────┐
│ Enviando Email..│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ ✅ Convite Sent │
│ Toast Success   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User List       │
│ + Pending User  │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│     END     │
└─────────────┘
```

### Fluxo do Convidado

```
┌─────────────────┐
│ Email Recebido  │
│ Click no Link   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Accept Invite   │
│     Page        │
├─────────────────┤
│ • Nome Completo │
│ • Senha         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Criando Conta...│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ ✅ Conta Criada │
│ Redirect Login  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Dashboard     │
│ (Tenant Context)│
└─────────────────┘
```

---

## 🔄 FLOW 4: Trocar de Tenant

**Objetivo:** Usuário multi-tenant troca de contexto  
**Persona:** Usuário com acesso a múltiplos tenants  
**Prioridade:** 🟡 Média

### Diagrama de Fluxo

```
┌─────────────┐
│   START     │
│ Dashboard   │
│ (Tenant A)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Click Tenant    │
│   Selector      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Dropdown Opens  │
├─────────────────┤
│ ✓ Tenant A      │
│ □ Tenant B      │
│ □ Tenant C      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Select Tenant B │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Switching...    │
│ [Loading]       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Update Session  │
│ tenantId = B    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Revalidate Data │
│ Fetch Tenant B  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Dashboard     │
│ (Tenant B)      │
├─────────────────┤
│ • Badge: B      │
│ • Data: B       │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│     END     │
│ Switched OK │
└─────────────┘
```

### Animação de Transição

```
1. Fade Out Dashboard (200ms)
2. Show Loading Spinner (center)
3. Update Session (background)
4. Fade In New Dashboard (200ms)
5. Highlight Tenant Badge (bounce)
```

---

## 📊 FLOW 5: Admin - Gerenciar Tenants

**Objetivo:** Admin global visualiza e gerencia tenants  
**Persona:** Admin Global (FourSys)  
**Prioridade:** 🟡 Média

### Diagrama de Fluxo

```
┌─────────────┐
│   START     │
│ Admin Login │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Admin Dashboard │
│ Global View     │
├─────────────────┤
│ • Total Tenants │
│ • Active Users  │
│ • Total Leads   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Tenants List    │
├─────────────────┤
│ □ FourSys (10)  │
│ □ Tech (5)      │
│ □ Sales (3)     │
│ [Search] [Sort] │
└──────┬──────────┘
       │
       ├─── Click Tenant
       │    └──> Tenant Details
       │
       ├─── Search
       │    └──> Filter List
       │
       ▼
┌─────────────────┐
│ Tenant Details  │
├─────────────────┤
│ • Name, Slug    │
│ • Created At    │
│ • Stats         │
│ • Users List    │
│ • Leads Count   │
│ [Desativar]     │
└──────┬──────────┘
       │
       ├─── Desativar
       │    └──> Confirmation Modal
       │         └──> Soft Delete
       │
       ▼
┌─────────────────┐
│ Tenant Stats    │
│   (Graphs)      │
├─────────────────┤
│ • Leads/Month   │
│ • Active Users  │
│ • Engagement    │
└─────────────────┘
```

---

## 🎯 Métricas de Sucesso por Flow

| Flow | Métrica | Meta |
|------|---------|------|
| **Signup** | Tempo médio | < 3 min |
| **Signup** | Taxa de conclusão | > 80% |
| **Login** | Tempo médio | < 30s |
| **Login** | Taxa de erro | < 5% |
| **Convidar** | Tempo médio | < 1 min |
| **Trocar Tenant** | Tempo de transição | < 2s |
| **Admin** | Tempo para encontrar tenant | < 10s |

---

## 🚨 Tratamento de Erros Global

### Princípios

1. **Mensagens Claras:** Explicar o que aconteceu e o que fazer
2. **Ações Sugeridas:** Sempre oferecer próximo passo
3. **Não Culpar:** Evitar "Você errou", usar "Não foi possível"
4. **Contexto:** Manter usuário informado do estado

### Exemplos

```
❌ Ruim: "Erro 500"
✅ Bom: "Não foi possível salvar. Tente novamente em alguns instantes."

❌ Ruim: "Email inválido"
✅ Bom: "Por favor, insira um email válido (ex: voce@empresa.com)"

❌ Ruim: "Falha"
✅ Bom: "Não conseguimos conectar ao servidor. Verifique sua internet."
```

---

## 📱 Fluxos Responsivos

### Mobile

- **Signup:** Wizard em tela cheia
- **Login:** Form simplificado
- **Tenant Selector:** Bottom sheet (mobile)

### Desktop

- **Signup:** Modal centralizado
- **Login:** Card centralizado
- **Tenant Selector:** Dropdown (header)

---

**Próximo Documento:** [03-wireframes.md](03-wireframes.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Fluxos Completos



