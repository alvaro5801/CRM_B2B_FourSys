# Fase 11: Otimização e Performance

**Duração Estimada:** 1 hora  
**Pré-requisito:** Fase 10 concluída  
**Objetivo:** Otimizar performance e SEO  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, vamos:
1. **Otimizar Metadata** - SEO
2. **Adicionar Loading States** - UX
3. **Otimizar Bundle** - Performance
4. **Configurar Caching** - Velocidade

---

## 11.1 Otimizar Metadata (SEO)

### Dashboard

**Arquivo:** `src/app/page.tsx`

**Adicionar/atualizar metadata:**

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | CRM FourSys',
  description: 'Visão geral das métricas de vendas e pipeline de leads',
  keywords: ['crm', 'dashboard', 'vendas', 'leads', 'métricas'],
  openGraph: {
    title: 'Dashboard - CRM FourSys',
    description: 'Gestão visual de leads para PMEs',
    type: 'website',
  },
};

export default async function DashboardPage() {
  // ... código existente
}
```

---

### Kanban

**Arquivo:** `src/app/kanban/page.tsx`

**Adicionar/atualizar metadata:**

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline | CRM FourSys',
  description: 'Gestão visual de leads com Kanban Board',
  keywords: ['kanban', 'pipeline', 'vendas', 'leads', 'gestão visual'],
  openGraph: {
    title: 'Pipeline - CRM FourSys',
    description: 'Kanban Board para gestão de leads',
    type: 'website',
  },
};

export default async function KanbanPage() {
  // ... código existente
}
```

---

### Layout Principal

**Arquivo:** `src/app/layout.tsx`

**Atualizar metadata:**

```typescript
export const metadata: Metadata = {
  title: {
    default: 'CRM B2B FourSys',
    template: '%s | CRM FourSys',
  },
  description: 'Sistema de gestão de leads com interface Kanban para PMEs',
  keywords: ['crm', 'b2b', 'gestão de leads', 'kanban', 'vendas'],
  authors: [{ name: 'FourSys' }],
  creator: 'FourSys',
  publisher: 'FourSys',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'http://localhost:3000',
    siteName: 'CRM FourSys',
    title: 'CRM B2B FourSys',
    description: 'Sistema de gestão de leads para PMEs',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## 11.2 Adicionar Loading States

### Loading Page Global

**Arquivo:** `src/app/loading.tsx`

**Criar arquivo:**

```typescript
import { Loading } from '@/components/ui/loading';

export default function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
```

---

### Loading para Kanban

**Arquivo:** `src/app/kanban/loading.tsx`

**Criar arquivo:**

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function KanbanLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-t-4">
            <CardHeader className="pb-3">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-32 bg-muted animate-pulse rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 11.3 Otimizar Imagens (Se Houver)

### Instalar Sharp

```bash
# Sharp otimiza imagens automaticamente no Next.js
npm install sharp
```

### Usar Next Image

```typescript
import Image from 'next/image';

// Em vez de <img>
<Image
  src="/logo.png"
  alt="Logo CRM FourSys"
  width={200}
  height={50}
  priority // Para imagens above the fold
/>
```

---

## 11.4 Otimizar Bundle Size

### Analisar Bundle

```bash
# Instalar analyzer
npm install -D @next/bundle-analyzer

# Criar next.config.js (se não existe)
```

**Arquivo:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Configurações existentes
};

module.exports = withBundleAnalyzer(nextConfig);
```

### Rodar Análise

```bash
# Analisar bundle
ANALYZE=true npm run build

# Abre visualização no navegador
```

### Otimizações

- [ ] Recharts é o maior pacote (esperado)
- [ ] @dnd-kit é razoável
- [ ] Sem duplicação de pacotes
- [ ] Bundle total < 500KB (gzipped)

---

## 11.5 Configurar Caching

### Revalidação de Páginas

**Dashboard (cache de 60 segundos):**

```typescript
// src/app/page.tsx
export const revalidate = 60; // Revalidar a cada 60 segundos

export default async function DashboardPage() {
  // ... código existente
}
```

**Kanban (cache de 30 segundos):**

```typescript
// src/app/kanban/page.tsx
export const revalidate = 30; // Revalidar a cada 30 segundos

export default async function KanbanPage() {
  // ... código existente
}
```

---

## 11.6 Otimizar Prisma Client

### Configurar Log Level

**Arquivo:** `src/lib/prisma.ts`

**Atualizar:**

```typescript
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] // Menos verbose
      : ['error'],
  });
```

---

## 11.7 Adicionar Error Boundaries

### Error Page Global

**Arquivo:** `src/app/error.tsx`

**Criar arquivo:**

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Algo deu errado!</h2>
        <p className="text-muted-foreground mb-4">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <Button onClick={reset}>Tentar Novamente</Button>
      </div>
    </div>
  );
}
```

---

### Not Found Page

**Arquivo:** `src/app/not-found.tsx`

**Criar arquivo:**

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-4">
          A página que você procura não existe.
        </p>
        <Link href="/">
          <Button>Voltar para Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## 11.8 Otimizar Fonts

### Usar Font Optimization do Next.js

**Arquivo:** `src/app/layout.tsx`

**Já está otimizado:**

```typescript
import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Adicionar se não existir
});
```

---

## Checklist de Conclusão

### Metadata
- [ ] Dashboard metadata configurado
- [ ] Kanban metadata configurado
- [ ] Layout metadata configurado
- [ ] OpenGraph tags adicionados
- [ ] Keywords relevantes

### Loading States
- [ ] Loading page global criado
- [ ] Kanban loading criado
- [ ] Loading component usado

### Imagens
- [ ] Sharp instalado
- [ ] Next Image usado (se houver imagens)
- [ ] Imagens otimizadas

### Bundle
- [ ] Bundle analyzer configurado
- [ ] Bundle size verificado (< 500KB)
- [ ] Sem pacotes duplicados

### Caching
- [ ] Revalidação configurada
- [ ] Cache funcionando

### Error Handling
- [ ] Error page criado
- [ ] Not found page criado
- [ ] Errors logados

### Performance
- [ ] Lighthouse score > 90
- [ ] Prisma logs otimizados
- [ ] Fonts otimizados

---

## Troubleshooting

### Bundle muito grande

```bash
# Analisar bundle
ANALYZE=true npm run build

# Identificar pacotes grandes
# Considerar lazy loading
```

### Metadata não aparece

```bash
# Verificar build
npm run build

# Metadata só aparece em produção
npm run start
```

### Loading state não aparece

```typescript
// Verificar se arquivo está em src/app/loading.tsx
// Não em src/app/components/loading.tsx
```

---

## Próxima Fase

➡️ **Fase 12: Documentação e Deployment**
- Criar README completo
- Documentar comandos
- Preparar para deploy
- Configurar .gitignore

**Arquivo:** `docs/design/fase-12-documentacao-deployment.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

