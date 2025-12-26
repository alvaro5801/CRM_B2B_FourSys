# Interaction Patterns - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎨 Padrões Completos

---

## 📋 Introdução

Este documento define **padrões de interação** e micro-animações para garantir consistência e fluidez na experiência de Multi-tenancy.

---

## 🎯 PADRÃO 1: Trocar de Tenant

### Trigger
- Click no TenantBadge (header)
- Keyboard: `Ctrl/Cmd + K` (opcional)

### Sequência de Interação
```
1. User clicks TenantBadge
   └─> Dropdown opens (slide-down, 200ms)

2. User selects new tenant
   └─> Confirmation (se mudanças não salvas)
   └─> Loading overlay (fade-in, 150ms)
   └─> Update session (background)
   └─> Dashboard fade-out (200ms)
   └─> Fetch new data
   └─> Dashboard fade-in (200ms)
   └─> TenantBadge bounce animation
   └─> Toast: "Agora você está em [Tenant Name]"
```

### Feedback Visual
- **Loading:** Spinner centralizado + overlay semi-transparente
- **Success:** Toast verde + bounce no TenantBadge
- **Error:** Toast vermelho + voltar ao tenant anterior

### Tempo Total
- **Ideal:** < 1s
- **Máximo aceitável:** 2s

---

## 📝 PADRÃO 2: Signup Flow

### Step 1 → Step 2
```
1. User preenche dados da empresa
2. User clicks "Próximo"
   └─> Validação inline (instantânea)
   └─> Se válido:
       └─> Step 1 fade-out (150ms)
       └─> Step indicator atualiza (slide, 200ms)
       └─> Step 2 fade-in (150ms)
   └─> Se inválido:
       └─> Shake animation no campo (300ms)
       └─> Mensagem de erro (fade-in, 150ms)
```

### Step 2 → Step 3
```
Similar ao anterior, com validação de email e senha
```

### Step 3 → Success
```
1. User clicks "Criar Minha Conta"
   └─> Button disabled + loading spinner
   └─> API call (background)
   └─> Se sucesso:
       └─> Confetti animation (opcional, 1s)
       └─> Success message (scale-in, 300ms)
       └─> Redirect para dashboard (2s delay)
   └─> Se erro:
       └─> Error toast (slide-in, 200ms)
       └─> Button re-enabled
```

---

## 🔐 PADRÃO 3: Login

### Sequência Normal
```
1. User preenche email + senha
2. User clicks "Entrar" ou pressiona Enter
   └─> Button disabled + loading
   └─> API call
   └─> Se sucesso:
       └─> Fade-out login form (200ms)
       └─> Loading screen (spinner)
       └─> Fetch user tenants
       └─> Se 1 tenant:
           └─> Redirect dashboard
       └─> Se 2+ tenants:
           └─> Show TenantSelector
   └─> Se erro:
       └─> Shake animation no form (300ms)
       └─> Error message (fade-in, 150ms)
       └─> Focus no campo email
```

### Forgot Password
```
1. User clicks "Esqueci minha senha"
   └─> Modal opens (scale-in, 200ms)
2. User digita email
3. User clicks "Enviar"
   └─> Button loading
   └─> Success toast
   └─> Modal closes (scale-out, 200ms)
```

---

## 👥 PADRÃO 4: Convidar Usuário

### Sequência
```
1. Admin clicks "Convidar Usuário"
   └─> Modal opens (scale-in, 200ms)
   └─> Focus no campo email

2. Admin digita email
   └─> Validação em tempo real
   └─> Check se email já existe (debounce 500ms)

3. Admin seleciona role
   └─> Dropdown opens (slide-down, 150ms)

4. Admin clicks "Enviar Convite"
   └─> Button loading
   └─> API call
   └─> Se sucesso:
       └─> Toast: "Convite enviado para [email]"
       └─> Modal closes (scale-out, 200ms)
       └─> User list atualiza (fade-in novo item)
   └─> Se erro:
       └─> Error message inline
       └─> Button re-enabled
```

---

## 📊 PADRÃO 5: Drag & Drop (Kanban)

### Sequência
```
1. User mousedown/touchstart no LeadCard
   └─> Aguardar 8px de movimento (evitar drags acidentais)
   └─> Card opacity: 0.6
   └─> Cursor: grabbing
   └─> DragOverlay aparece (scale-in, 100ms)

2. User move card sobre coluna
   └─> Coluna destino: border azul + background highlight
   └─> Outras colunas: sem mudança

3. User solta card (drop)
   └─> Se coluna válida:
       └─> Card fade-out da posição original (150ms)
       └─> Card fade-in na nova posição (150ms)
       └─> Optimistic update (UI instantânea)
       └─> API call (background)
       └─> Toast discreto: "Lead movido para [Coluna]"
   └─> Se coluna inválida:
       └─> Card volta à posição original (elastic, 300ms)
       └─> Shake animation (200ms)

4. Se API falha
   └─> Reverter mudança (fade animation)
   └─> Error toast
```

### Feedback Tátil (Mobile)
- Vibração leve ao iniciar drag
- Vibração ao soltar em coluna válida

---

## 🎨 PADRÃO 6: Modals

### Abertura
```
1. Trigger (button click)
   └─> Overlay fade-in (150ms)
   └─> Modal scale-in + fade-in (200ms)
   └─> Focus no primeiro input
```

### Fechamento
```
1. Trigger (X, Escape, click fora)
   └─> Se mudanças não salvas:
       └─> Confirmation dialog (scale-in, 150ms)
       └─> "Descartar mudanças?"
   └─> Modal scale-out + fade-out (200ms)
   └─> Overlay fade-out (150ms)
```

---

## 🔔 PADRÃO 7: Toasts (Notificações)

### Tipos
1. **Success:** Verde, ícone checkmark
2. **Error:** Vermelho, ícone X
3. **Warning:** Amarelo, ícone !
4. **Info:** Azul, ícone i

### Comportamento
```
1. Toast aparece (slide-in from top-right, 200ms)
2. Auto-dismiss após duração:
   - Success: 3s
   - Error: 5s
   - Warning: 4s
   - Info: 3s
3. Toast desaparece (slide-out, 200ms)
4. Próximo toast sobe (se houver fila)
```

### Interação
- Hover: Pausar auto-dismiss
- Click: Dismiss imediato
- Swipe right (mobile): Dismiss

---

## 🎯 PADRÃO 8: Loading States

### Skeleton Loading
```tsx
// Para listas e grids
<Skeleton className="h-20 w-full mb-4" />
<Skeleton className="h-20 w-full mb-4" />
<Skeleton className="h-20 w-full" />
```

### Spinner Loading
```tsx
// Para ações pontuais
<Button disabled>
  <Spinner className="mr-2" />
  Salvando...
</Button>
```

### Progress Bar
```tsx
// Para uploads/processos longos
<ProgressBar value={progress} max={100} />
```

---

## ⌨️ PADRÃO 9: Keyboard Shortcuts

### Globais
- `Ctrl/Cmd + K`: Abrir TenantSelector (se multi-tenant)
- `Ctrl/Cmd + N`: Criar novo lead
- `Ctrl/Cmd + S`: Salvar (se form aberto)
- `Escape`: Fechar modal/dropdown

### Navegação
- `Tab`: Próximo campo
- `Shift + Tab`: Campo anterior
- `Enter`: Submit form
- `↑↓`: Navegar em listas/dropdowns
- `Space`: Selecionar item

### Kanban
- `Arrow keys`: Mover entre cards
- `Enter`: Abrir card
- `Delete`: Deletar card (com confirmação)

---

## 📱 PADRÃO 10: Mobile Gestures

### Swipe
- **Swipe Right:** Voltar (navegação)
- **Swipe Left:** Próximo (wizard)
- **Swipe Down:** Refresh (pull-to-refresh)

### Long Press
- **Long Press Card:** Abrir menu de contexto
- **Long Press Tenant:** Opções rápidas

### Pinch
- **Pinch Zoom:** Zoom em gráficos (opcional)

---

## 🎬 Micro-Animações

### Button Click
```css
.button:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

### Card Hover
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  transition: all 200ms ease-out;
}
```

### Badge Pulse (Novo Tenant)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.badge-new {
  animation: pulse 2s ease-in-out infinite;
}
```

### Success Bounce
```css
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.success-icon {
  animation: bounce 500ms ease-out;
}
```

---

## 🚨 Error Handling

### Inline Errors
```tsx
<Input 
  error="Email já cadastrado"
  className="border-red-500"
/>
<ErrorMessage>Email já cadastrado</ErrorMessage>
```

### Toast Errors
```tsx
toast.error('Não foi possível salvar', {
  description: 'Tente novamente em alguns instantes.',
  action: {
    label: 'Tentar Novamente',
    onClick: () => retry()
  }
});
```

### Page-Level Errors
```tsx
<ErrorBoundary>
  <ErrorState
    title="Algo deu errado"
    description="Não foi possível carregar os dados."
    action={<Button onClick={reload}>Recarregar</Button>}
  />
</ErrorBoundary>
```

---

## 🎯 Princípios de Interação

1. **Feedback Imediato:** Toda ação tem resposta visual < 100ms
2. **Optimistic Updates:** UI atualiza antes da API responder
3. **Graceful Degradation:** Funciona mesmo se animações desabilitadas
4. **Prefers-Reduced-Motion:** Respeitar preferência do usuário
5. **Progressive Enhancement:** Core funciona sem JS

---

**Próximo Documento:** [06-responsive-design.md](06-responsive-design.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Padrões Completos



