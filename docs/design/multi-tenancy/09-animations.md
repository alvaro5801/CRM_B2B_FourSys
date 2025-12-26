# Animations & Transitions - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎬 Especificações Completas

---

## 📋 Introdução

Este documento especifica **todas as animações e transições** para criar uma experiência fluida e profissional em Multi-tenancy.

---

## ⏱️ Timing & Easing

### Durations
```css
--duration-instant: 0ms;      /* Instantâneo */
--duration-fast:    150ms;    /* Hover, clicks */
--duration-base:    200ms;    /* Transições padrão */
--duration-slow:    300ms;    /* Modals, dropdowns */
--duration-slower:  500ms;    /* Page transitions */
```

### Easing Functions
```css
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);        /* Padrão */
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 🎬 ANIMAÇÃO 1: Trocar de Tenant

### Sequência Completa
```
1. User clicks TenantSelector
   Duration: 0ms
   Effect: Dropdown opens

2. Dropdown appears
   Duration: 200ms
   Easing: ease-out
   Effect: slide-down + fade-in

3. User selects new tenant
   Duration: 0ms
   Effect: Trigger switch

4. Loading overlay
   Duration: 150ms (fade-in)
   Easing: ease-out
   Effect: Semi-transparent overlay + spinner

5. Dashboard fade-out
   Duration: 200ms
   Easing: ease-in
   Effect: Opacity 1 → 0

6. Fetch new data (background)
   Duration: ~500ms
   Effect: API call

7. Dashboard fade-in
   Duration: 200ms
   Easing: ease-out
   Effect: Opacity 0 → 1

8. TenantBadge bounce
   Duration: 500ms
   Easing: ease-bounce
   Effect: Scale 1 → 1.1 → 1

9. Toast notification
   Duration: 200ms (slide-in)
   Easing: ease-out
   Effect: Slide from top-right
```

### CSS Implementation
```css
/* Dropdown Slide Down */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tenant-selector-dropdown {
  animation: slideDown 200ms cubic-bezier(0, 0, 0.2, 1);
}

/* Dashboard Fade */
.dashboard-fade-out {
  animation: fadeOut 200ms cubic-bezier(0.4, 0, 1, 1);
}

.dashboard-fade-in {
  animation: fadeIn 200ms cubic-bezier(0, 0, 0.2, 1);
}

/* TenantBadge Bounce */
@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.tenant-badge-bounce {
  animation: bounce 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 📝 ANIMAÇÃO 2: Signup Flow

### Step Transition
```
1. User clicks "Próximo"
   Duration: 0ms
   Effect: Validation

2. Current step fade-out
   Duration: 150ms
   Easing: ease-in
   Effect: Opacity 1 → 0, translateX(0 → -20px)

3. Stepper update
   Duration: 200ms
   Easing: ease-out
   Effect: Circle fills, connector animates

4. Next step fade-in
   Duration: 150ms
   Easing: ease-out
   Effect: Opacity 0 → 1, translateX(20px → 0)
```

### CSS Implementation
```css
/* Step Fade Out */
@keyframes stepFadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

/* Step Fade In */
@keyframes stepFadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Stepper Circle Fill */
@keyframes circleFill {
  from {
    background: #E5E7EB;
  }
  to {
    background: #3B82F6;
  }
}

.stepper-circle-active {
  animation: circleFill 200ms cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 🎯 ANIMAÇÃO 3: Modal

### Open
```
1. Trigger click
   Duration: 0ms

2. Overlay fade-in
   Duration: 150ms
   Easing: ease-out
   Effect: Opacity 0 → 1

3. Modal scale-in + fade-in
   Duration: 200ms
   Easing: ease-out
   Effect: Scale 0.95 → 1, Opacity 0 → 1
```

### Close
```
1. Trigger (X, Escape, click outside)
   Duration: 0ms

2. Modal scale-out + fade-out
   Duration: 200ms
   Easing: ease-in
   Effect: Scale 1 → 0.95, Opacity 1 → 0

3. Overlay fade-out
   Duration: 150ms
   Easing: ease-in
   Effect: Opacity 1 → 0
```

### CSS Implementation
```css
/* Modal Open */
@keyframes modalOpen {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-enter {
  animation: modalOpen 200ms cubic-bezier(0, 0, 0.2, 1);
}

/* Modal Close */
@keyframes modalClose {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal-exit {
  animation: modalClose 200ms cubic-bezier(0.4, 0, 1, 1);
}

/* Overlay */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.overlay-enter {
  animation: overlayFadeIn 150ms cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 📋 ANIMAÇÃO 4: Drag & Drop (Kanban)

### Drag Start
```
1. User mousedown/touchstart
   Duration: 0ms
   Effect: Wait for 8px movement

2. Card opacity change
   Duration: 100ms
   Easing: ease-out
   Effect: Opacity 1 → 0.6

3. DragOverlay appears
   Duration: 100ms
   Easing: ease-out
   Effect: Scale 0.95 → 1.05, rotate 3deg
```

### Drag Over Column
```
1. Card enters column
   Duration: 150ms
   Easing: ease-out
   Effect: Column border highlight, background tint
```

### Drop Success
```
1. Card dropped
   Duration: 0ms
   Effect: Release

2. Card fade-out (old position)
   Duration: 150ms
   Easing: ease-in
   Effect: Opacity 1 → 0

3. Card fade-in (new position)
   Duration: 150ms
   Easing: ease-out
   Effect: Opacity 0 → 1, scale 0.95 → 1
```

### Drop Fail (Invalid Column)
```
1. Card dropped in invalid area
   Duration: 0ms
   Effect: Detect invalid

2. Card elastic return
   Duration: 300ms
   Easing: ease-elastic
   Effect: Return to original position with bounce

3. Shake animation
   Duration: 200ms
   Effect: Horizontal shake
```

### CSS Implementation
```css
/* Drag Start */
@keyframes dragStart {
  from {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  to {
    opacity: 0.6;
    transform: scale(1.05) rotate(3deg);
  }
}

/* Column Highlight */
@keyframes columnHighlight {
  from {
    border-color: #E5E7EB;
    background: transparent;
  }
  to {
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.05);
  }
}

/* Shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.card-shake {
  animation: shake 200ms ease-in-out;
}
```

---

## 🔔 ANIMAÇÃO 5: Toast Notifications

### Appear
```
1. Toast triggered
   Duration: 0ms

2. Toast slide-in
   Duration: 200ms
   Easing: ease-out
   Effect: Slide from top-right + fade-in
```

### Dismiss
```
1. Auto-dismiss or click
   Duration: 0ms

2. Toast slide-out
   Duration: 200ms
   Easing: ease-in
   Effect: Slide to right + fade-out
```

### CSS Implementation
```css
/* Toast Slide In */
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter {
  animation: toastSlideIn 200ms cubic-bezier(0, 0, 0.2, 1);
}

/* Toast Slide Out */
@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-exit {
  animation: toastSlideOut 200ms cubic-bezier(0.4, 0, 1, 1);
}
```

---

## 🎨 ANIMAÇÃO 6: Micro-Interactions

### Button Click
```css
.button:active {
  transform: scale(0.98);
  transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
}
```

### Card Hover
```css
.card {
  transition: all 200ms cubic-bezier(0, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Input Focus
```css
.input {
  transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
}

.input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Badge Pulse (New Notification)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.badge-new {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## ⚡ Performance Optimization

### Use GPU Acceleration
```css
/* Trigger GPU acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}
```

### Avoid Layout Thrashing
```css
/* ✅ Bom: Animar transform e opacity */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ Ruim: Animar width, height, top, left */
.element {
  width: 200px;  /* Causa reflow */
  left: 100px;   /* Causa reflow */
}
```

### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎬 Animation Library (Framer Motion)

### Variants
```tsx
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

<motion.div
  variants={modalVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {/* Modal content */}
</motion.div>
```

### Layout Animations
```tsx
<motion.div layout layoutId="tenant-badge">
  <TenantBadge />
</motion.div>
```

---

## 📊 Animation Checklist

### Essenciais
- [ ] Modal open/close
- [ ] Dropdown open/close
- [ ] Toast notifications
- [ ] Button hover/active
- [ ] Card hover
- [ ] Input focus
- [ ] Drag & drop feedback

### Nice to Have
- [ ] Page transitions
- [ ] Skeleton loading
- [ ] Success confetti
- [ ] Badge pulse
- [ ] Number count-up

### Accessibility
- [ ] Respeitar `prefers-reduced-motion`
- [ ] Não depender apenas de animação
- [ ] Fornecer feedback alternativo

---

**Próximo Documento:** [10-implementation-guide.md](10-implementation-guide.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Especificações de Animações Completas



