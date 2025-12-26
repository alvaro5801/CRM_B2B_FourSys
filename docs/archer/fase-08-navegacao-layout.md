# Fase 8: Navegação e Layout

**Duração Estimada:** 1 hora  
**Pré-requisito:** Fase 7 concluída  
**Objetivo:** Criar navegação entre Dashboard e Kanban  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, criaremos:
1. **Sidebar** - Navegação lateral
2. **Layout Principal** - Estrutura da aplicação
3. **Active States** - Indicação visual da página atual

---

## 8.1 Criar Componente Sidebar

### Arquivo: `src/components/layout/Sidebar.tsx`

**Criar pasta e arquivo:**

```bash
mkdir -p src/components/layout
touch src/components/layout/Sidebar.tsx
```

**Conteúdo:**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/kanban', icon: Kanban },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">CRM FourSys</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          CRM B2B FourSys v1.0
        </p>
      </div>
    </div>
  );
}
```

### Características da Sidebar

- **Logo** no topo
- **2 itens de navegação** (Dashboard e Pipeline)
- **Active state** (item atual destacado)
- **Ícones** do Lucide React
- **Footer** com versão

---

## 8.2 Atualizar Layout Principal

### Arquivo: `src/app/layout.tsx`

**Substituir conteúdo completo:**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM B2B FourSys",
  description: "Sistema de gestão de leads para PMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

### Estrutura do Layout

```
┌─────────────────────────────────────────┐
│ Sidebar │ Main Content                  │
│         │                               │
│ Logo    │ ┌─────────────────────────┐   │
│         │ │                         │   │
│ 📊 Dash │ │    Page Content         │   │
│ 📋 Pipe │ │    (Dashboard/Kanban)   │   │
│         │ │                         │   │
│         │ └─────────────────────────┘   │
│         │                               │
│ v1.0    │                               │
└─────────────────────────────────────────┘
```

---

## 8.3 Testar Navegação

### Abrir Aplicação

```
http://localhost:3000
```

### Testes Funcionais

#### Sidebar
- [ ] Logo "CRM FourSys" aparece
- [ ] 2 itens de navegação aparecem
- [ ] Ícones corretos (📊 Dashboard, 📋 Pipeline)
- [ ] Footer com versão aparece

#### Navegação
- [ ] Clicar em "Dashboard" → Vai para `/`
- [ ] Clicar em "Pipeline" → Vai para `/kanban`
- [ ] URL muda corretamente
- [ ] Página carrega sem reload completo (SPA)

#### Active State
- [ ] Em `/` → "Dashboard" destacado
- [ ] Em `/kanban` → "Pipeline" destacado
- [ ] Item ativo tem cor primária
- [ ] Itens inativos têm cor muted

#### Hover State
- [ ] Passar mouse sobre item inativo → Muda cor
- [ ] Transição suave

---

## 8.4 Responsividade (Opcional para MVP)

### Desktop (> 1024px)

- Sidebar sempre visível (256px largura)
- Main content ocupa resto

### Tablet/Mobile (< 1024px)

**Para MVP:** Sidebar sempre visível (pode ser melhorado depois)

**Pós-MVP:** 
- Sidebar escondida por padrão
- Botão hamburger para abrir
- Overlay ao abrir

---

## 8.5 Adicionar Transições Suaves

### Arquivo: `src/app/globals.css`

**Adicionar ao final:**

```css
/* Transições suaves para navegação */
.sidebar-link {
  transition: all 0.2s ease-in-out;
}

/* Animação de fade-in para páginas */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-content {
  animation: fadeIn 0.3s ease-out;
}
```

### Aplicar Animação nas Páginas

**Dashboard (`src/app/page.tsx`):**

```typescript
return (
  <div className="flex-1 space-y-4 p-8 pt-6 page-content">
    {/* ... conteúdo existente */}
  </div>
);
```

**Kanban (`src/app/kanban/page.tsx`):**

```typescript
return (
  <div className="flex-1 space-y-4 p-8 pt-6 page-content">
    {/* ... conteúdo existente */}
  </div>
);
```

---

## 8.6 Estrutura Final

### Verificar Arquivos

```bash
# Listar estrutura
ls -R src/

# Estrutura esperada:
# src/
# ├── app/
# │   ├── layout.tsx          ✅ Atualizado
# │   ├── page.tsx            ✅ Dashboard
# │   └── kanban/
# │       └── page.tsx        ✅ Kanban
# ├── components/
# │   ├── layout/
# │   │   └── Sidebar.tsx     ✅ Novo
# │   ├── dashboard/
# │   └── kanban/
# └── lib/
```

---

## Checklist de Conclusão

### Sidebar Component
- [ ] `Sidebar.tsx` criado
- [ ] Logo exibido
- [ ] 2 itens de navegação
- [ ] Ícones corretos
- [ ] Footer com versão

### Layout Principal
- [ ] `layout.tsx` atualizado
- [ ] Sidebar integrada
- [ ] Main content área configurada
- [ ] Overflow correto

### Navegação
- [ ] Links funcionam
- [ ] URLs corretas
- [ ] SPA navigation (sem reload)
- [ ] Active state funciona
- [ ] Hover state funciona

### Transições
- [ ] Transições suaves implementadas
- [ ] Fade-in nas páginas
- [ ] Sem "pulos" visuais

### Testes
- [ ] Navegação entre páginas funciona
- [ ] Active state correto
- [ ] Sem erros no console
- [ ] Sem erros TypeScript

---

## Troubleshooting

### Erro: "usePathname is not a function"

```typescript
// Verificar se 'use client' está no topo
'use client';

// Verificar import
import { usePathname } from 'next/navigation';
```

### Erro: Sidebar não aparece

```typescript
// Verificar se Sidebar está no layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";

<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <main>...</main>
</div>
```

### Erro: Active state não funciona

```typescript
// Verificar se pathname está sendo comparado corretamente
const isActive = pathname === item.href;

// Dashboard: pathname = '/'
// Kanban: pathname = '/kanban'
```

---

## Melhorias Futuras (Pós-MVP)

1. **Menu Hamburger** - Para mobile
2. **Submenu** - Itens aninhados
3. **Busca** - Buscar leads na sidebar
4. **Notificações** - Badge com contador
5. **Perfil do Usuário** - Avatar e dropdown
6. **Dark Mode Toggle** - Botão na sidebar

---

## Próxima Fase

➡️ **Fase 9: Refinamento Visual**
- Polir animações
- Melhorar responsividade
- Adicionar hover states
- Ajustar espaçamentos

**Arquivo:** `docs/design/fase-09-refinamento-visual.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

