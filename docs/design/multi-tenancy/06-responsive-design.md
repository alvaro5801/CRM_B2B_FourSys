# Responsive Design - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎨 Design Responsivo Completo

---

## 📋 Introdução

Este documento define **estratégias de design responsivo** para garantir experiência otimizada em todos os dispositivos.

---

## 📱 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm:  640px;   /* Mobile Large */
--breakpoint-md:  768px;   /* Tablet */
--breakpoint-lg:  1024px;  /* Desktop */
--breakpoint-xl:  1280px;  /* Desktop Large */
--breakpoint-2xl: 1536px;  /* Wide Desktop */
```

### Estratégia
- **Mobile First:** Estilos base para mobile, sobrescrever para desktop
- **Progressive Enhancement:** Adicionar features conforme tela cresce
- **Content First:** Priorizar conteúdo essencial em telas pequenas

---

## 📱 Mobile (320px - 767px)

### Layout Geral
- **Sidebar:** Hidden, acessível via hamburger menu
- **Header:** Compacto, logo + hamburger + user
- **Content:** Full width, single column

### Componentes Específicos

#### TenantBadge
```
Desktop: [🏢 FourSys Ltda | foursys ▼]
Mobile:  [🏢 FourSys ▼]
```

#### Dashboard
```
┌─────────────┐
│ Card 1      │ Full width
├─────────────┤
│ Card 2      │ Full width
├─────────────┤
│ Card 3      │ Full width
├─────────────┤
│ Graph       │ Scrollable
└─────────────┘
```

#### Kanban
```
Horizontal scroll com snap points
[Prospect] [Qualificado] [Proposta] [Fechado]
    ↔ Swipe para navegar
```

#### Signup
```
Full screen wizard
Stepper compacto: "Passo 1 de 3"
```

---

## 📱 Tablet (768px - 1023px)

### Layout Geral
- **Sidebar:** Collapsible (ícones apenas)
- **Header:** Médio, logo + nav + tenant + user
- **Content:** 2 columns onde aplicável

### Componentes Específicos

#### Dashboard
```
┌──────────┬──────────┐
│ Card 1   │ Card 2   │ 2 columns
├──────────┴──────────┤
│ Card 3              │ Full width
├─────────────────────┤
│ Graph               │ Full width
└─────────────────────┘
```

#### Kanban
```
2 columns visíveis + scroll
[Prospect] [Qualificado]
[Proposta] [Fechado]
```

---

## 💻 Desktop (1024px+)

### Layout Geral
- **Sidebar:** Full, sempre visível
- **Header:** Completo, todos os elementos
- **Content:** Multi-column layouts

### Componentes Específicos

#### Dashboard
```
┌────────┬────────┬────────┐
│ Card 1 │ Card 2 │ Card 3 │ 3 columns
├────────┴────────┴────────┤
│ Graph                    │ Full width
├──────────────┬───────────┤
│ Activity     │ Quick     │ 2 columns
│ Feed         │ Actions   │
└──────────────┴───────────┘
```

#### Kanban
```
4 columns lado a lado
[Prospect] [Qualificado] [Proposta] [Fechado]
```

---

## 🎯 Componentes Adaptativos

### TenantSelector

#### Mobile
```
Bottom Sheet (slide-up from bottom)
Full width, max-height: 80vh
```

#### Desktop
```
Dropdown (below TenantBadge)
Fixed width: 320px
Max-height: 400px
```

### Modals

#### Mobile
```
Full screen
Slide-in from bottom
Header com botão "Voltar"
```

#### Desktop
```
Centered overlay
Max-width: 600px
Close button (X)
```

### Navigation

#### Mobile
```
Hamburger Menu
Slide-in sidebar
Overlay background
```

#### Desktop
```
Persistent sidebar
Always visible
Collapsible (opcional)
```

---

## 📏 Spacing Adjustments

```css
/* Mobile */
.container {
  padding: var(--space-4);  /* 16px */
  gap: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);  /* 24px */
    gap: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);  /* 32px */
    gap: var(--space-8);
  }
}
```

---

## 🔤 Typography Scale

```css
/* Mobile */
h1 { font-size: var(--text-2xl); }  /* 24px */
h2 { font-size: var(--text-xl); }   /* 20px */
body { font-size: var(--text-base); } /* 16px */

/* Desktop */
@media (min-width: 1024px) {
  h1 { font-size: var(--text-4xl); }  /* 36px */
  h2 { font-size: var(--text-2xl); }  /* 24px */
  body { font-size: var(--text-lg); }  /* 18px */
}
```

---

## 🖼️ Images & Media

### Responsive Images
```tsx
<img 
  srcSet="
    image-320.jpg 320w,
    image-640.jpg 640w,
    image-1024.jpg 1024w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  src="image-640.jpg"
  alt="Description"
/>
```

### Aspect Ratios
```css
.card-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

---

## 📊 Tables & Data

### Mobile
```
Card-based layout
Stack rows vertically
Hide non-essential columns
```

### Desktop
```
Traditional table
All columns visible
Sortable headers
```

---

## 🎯 Touch Targets

### Minimum Sizes
- **Mobile:** 44px × 44px (Apple HIG)
- **Desktop:** 32px × 32px (mouse precision)

### Spacing
- **Mobile:** 8px between targets
- **Desktop:** 4px between targets

---

## 🔄 Orientation Changes

### Portrait (Mobile)
- Single column layouts
- Vertical navigation
- Stacked cards

### Landscape (Mobile)
- 2 column layouts (where applicable)
- Horizontal navigation
- Side-by-side cards

---

## 🎨 Adaptive Components

### Button Sizes
```tsx
// Mobile
<Button size="lg">Large Touch Target</Button>

// Desktop
<Button size="md">Standard Size</Button>
```

### Input Heights
```css
/* Mobile */
.input {
  height: 48px;  /* Easier to tap */
}

/* Desktop */
@media (min-width: 1024px) {
  .input {
    height: 40px;  /* Standard */
  }
}
```

---

## 📱 Mobile-Specific Features

### Pull to Refresh
```tsx
<PullToRefresh onRefresh={fetchData}>
  <Content />
</PullToRefresh>
```

### Bottom Navigation (Optional)
```
┌─────────────────────┐
│                     │
│     Content         │
│                     │
├─────────────────────┤
│ [🏠] [📋] [⚙️] [👤] │
└─────────────────────┘
```

### Safe Areas (iOS)
```css
.container {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 🎯 Performance Optimization

### Lazy Loading
```tsx
// Load images only when visible
<img loading="lazy" src="..." alt="..." />

// Load components on demand
const HeavyComponent = lazy(() => import('./Heavy'));
```

### Responsive Fonts
```css
/* Fluid typography */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

---

## ✅ Testing Checklist

### Devices to Test
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)

### Orientations
- [ ] Portrait
- [ ] Landscape

### Browsers
- [ ] Chrome (mobile + desktop)
- [ ] Safari (iOS + macOS)
- [ ] Firefox
- [ ] Edge

---

**Próximo Documento:** [07-accessibility.md](07-accessibility.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Design Responsivo Completo



