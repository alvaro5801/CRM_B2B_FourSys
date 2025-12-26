# Fase 1: Setup do Projeto

**Duração Estimada:** 1 hora  
**Pré-requisito:** Fase 0 concluída  
**Objetivo:** Criar projeto Next.js com TypeScript e configurar Tailwind CSS + Shadcn/ui  
**Status:** 🟡 Pendente

---

## 1.1 Criar Projeto Next.js

### Comando de Criação

```bash
# Navegar para a pasta do projeto
cd CRM_B2B_FourSys

# Criar projeto Next.js com todas as configurações
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-git
```

### Respostas para o Wizard

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

### Verificar Criação

```bash
# Listar estrutura criada
ls -la

# Deve mostrar:
# - src/
# - public/
# - package.json
# - tsconfig.json
# - tailwind.config.ts
# - next.config.js
```

---

## 1.2 Instalar Dependências Core

### UI e Componentes

```bash
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### Drag & Drop

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Gráficos

```bash
npm install recharts
```

### Forms e Validação

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Database

```bash
npm install prisma @prisma/client
npm install -D tsx
```

### Verificar Instalação

```bash
# Ver todas as dependências instaladas
npm list --depth=0
```

---

## 1.3 Configurar Tailwind CSS

### Arquivo: `tailwind.config.ts`

**Substituir conteúdo completo:**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## 1.4 Configurar CSS Global

### Arquivo: `src/app/globals.css`

**Substituir conteúdo completo:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 1.5 Instalar Shadcn/ui CLI

### Instalar Dependência de Animação

```bash
npm install tailwindcss-animate
```

### Inicializar Shadcn/ui

```bash
npx shadcn-ui@latest init
```

### Respostas para o Wizard

```
✔ Would you like to use TypeScript? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? › src/app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? › tailwind.config.ts
✔ Configure the import alias for components? › @/components
✔ Configure the import alias for utils? › @/lib/utils
✔ Are you using React Server Components? › yes
```

---

## 1.6 Adicionar Componentes Shadcn Necessários

### Instalar Componentes UI Essenciais

```bash
# Componentes básicos
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
```

### Verificar Componentes Instalados

```bash
# Listar componentes na pasta
ls src/components/ui/

# Deve mostrar:
# - button.tsx
# - card.tsx
# - dialog.tsx
# - input.tsx
# - label.tsx
# - badge.tsx
# - select.tsx
# - form.tsx
```

---

## 1.7 Verificar Estrutura Final

### Comando de Verificação

```bash
# Listar estrutura do src/
ls -R src/

# Estrutura esperada:
# src/
# ├── app/
# │   ├── favicon.ico
# │   ├── globals.css
# │   ├── layout.tsx
# │   └── page.tsx
# ├── components/
# │   └── ui/
# │       ├── button.tsx
# │       ├── card.tsx
# │       ├── dialog.tsx
# │       └── ...
# └── lib/
#     └── utils.ts
```

### Testar Projeto

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir navegador em http://localhost:3000
# Deve aparecer a página inicial do Next.js
```

### Verificar Console

- [ ] Sem erros no terminal
- [ ] Sem erros no console do navegador
- [ ] Página carrega corretamente
- [ ] Hot reload funcionando (editar `page.tsx` e ver mudanças)

---

## 1.8 Limpar Arquivos Padrão (Opcional)

### Simplificar page.tsx

**Arquivo:** `src/app/page.tsx`

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">CRM B2B FourSys</h1>
      <p className="mt-4 text-muted-foreground">
        Projeto em desenvolvimento...
      </p>
    </main>
  );
}
```

### Testar Mudança

```bash
# Recarregar http://localhost:3000
# Deve mostrar apenas o título e subtítulo
```

---

## Checklist de Conclusão

### Projeto Next.js
- [ ] Projeto criado com TypeScript
- [ ] App Router configurado
- [ ] Pasta `src/` criada
- [ ] ESLint configurado

### Dependências
- [ ] Todas as dependências instaladas sem erros
- [ ] `package.json` atualizado
- [ ] `node_modules/` criado

### Tailwind CSS
- [ ] `tailwind.config.ts` configurado
- [ ] `globals.css` com variáveis CSS
- [ ] Classes Tailwind funcionando

### Shadcn/ui
- [ ] CLI inicializado
- [ ] Componentes UI instalados
- [ ] Pasta `components/ui/` criada
- [ ] `lib/utils.ts` criado

### Verificação Final
- [ ] Projeto roda sem erros (`npm run dev`)
- [ ] Página carrega em localhost:3000
- [ ] Hot reload funcionando
- [ ] Sem erros no console

---

## Troubleshooting

### Erro: "Cannot find module 'tailwindcss-animate'"

```bash
npm install tailwindcss-animate
```

### Erro: Shadcn/ui não encontra componentes

```bash
# Reinstalar componentes
npx shadcn-ui@latest add button --overwrite
```

### Erro: TypeScript reclamando de tipos

```bash
# Reinstalar tipos
npm install -D @types/node @types/react @types/react-dom
```

---

## Próxima Fase

➡️ **Fase 2: Configuração do Banco de Dados**
- Inicializar Prisma
- Criar schema
- Popular banco com dados de teste

**Arquivo:** `docs/design/fase-02-configuracao-banco.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

