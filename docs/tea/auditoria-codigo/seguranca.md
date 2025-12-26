# 🔒 Relatório de Segurança

**Data da Auditoria:** 25/12/2025  
**QA Engineer:** TEA Agent  
**Status Geral:** ⚠️ **PARCIALMENTE SEGURO**  
**Nível de Risco:** **Médio** (OK para MVP, Crítico para Produção)

---

## 📋 Resumo Executivo

O CRM B2B FourSys MVP possui algumas proteções básicas de segurança, mas apresenta vulnerabilidades que devem ser endereçadas antes do deploy em produção. A aplicação está protegida contra SQL Injection (graças ao Prisma), mas vulnerável a ataques CSRF e não possui rate limiting.

---

## 🎯 Pontuação de Segurança

| Categoria | Status | Pontuação | Prioridade |
|-----------|--------|-----------|------------|
| **SQL Injection** | ✅ Protegido | 10/10 | - |
| **XSS (Cross-Site Scripting)** | ⚠️ Parcial | 7/10 | P2 |
| **CSRF (Cross-Site Request Forgery)** | ❌ Vulnerável | 0/10 | P0 |
| **Rate Limiting** | ❌ Ausente | 0/10 | P1 |
| **Input Validation** | ✅ Implementado | 8/10 | P2 |
| **Authentication** | ❌ Não implementado | N/A | Pós-MVP |
| **Authorization** | ❌ Não implementado | N/A | Pós-MVP |
| **Data Encryption** | ⚠️ Parcial | 5/10 | P2 |
| **Secrets Management** | ⚠️ Parcial | 6/10 | P1 |

**Pontuação Geral:** 6/10

---

## ✅ Proteções Existentes

### 1. SQL Injection - PROTEGIDO ✅

**Status:** Totalmente protegido  
**Mecanismo:** Prisma ORM

#### Análise

O uso do Prisma ORM garante que todas as queries são parametrizadas automaticamente, prevenindo SQL Injection.

```typescript
// ✅ SEGURO - Prisma parametriza automaticamente
await prisma.lead.findMany({
  where: {
    status: userInput // Seguro, não pode injetar SQL
  }
});

// ❌ INSEGURO (não usado no projeto)
// await prisma.$queryRaw`SELECT * FROM Lead WHERE status = ${userInput}`
```

**Recomendação:** Manter uso do Prisma. Evitar `$queryRaw` e `$executeRaw`.

---

### 2. XSS (Cross-Site Scripting) - PARCIALMENTE PROTEGIDO ⚠️

**Status:** Parcialmente protegido  
**Mecanismo:** React escaping automático

#### Análise

React escapa automaticamente strings renderizadas, prevenindo a maioria dos ataques XSS. Porém, não há sanitização explícita de inputs.

**Proteções Automáticas:**

```typescript
// ✅ SEGURO - React escapa automaticamente
<h3>{lead.name}</h3>
// Se lead.name = "<script>alert('xss')</script>"
// Renderiza como texto, não executa
```

**Vulnerabilidades Potenciais:**

```typescript
// ⚠️ POTENCIALMENTE INSEGURO (não usado no projeto)
// <div dangerouslySetInnerHTML={{ __html: lead.description }} />

// ⚠️ POTENCIALMENTE INSEGURO (não usado no projeto)
// <a href={lead.website}>Link</a>
// Se website = "javascript:alert('xss')"
```

#### Recomendações

**Para Produção:**

1. **Adicionar DOMPurify para sanitização:**

```bash
npm install dompurify
npm install -D @types/dompurify
```

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

export function sanitizeUrl(url: string): string {
  // Permitir apenas http:// e https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return '#';
}
```

2. **Aplicar sanitização em campos de texto livre:**

```typescript
// Antes de salvar no banco
const sanitizedData = {
  ...data,
  name: sanitizeHtml(data.name),
  company: sanitizeHtml(data.company),
};
```

---

### 3. Input Validation - IMPLEMENTADO ✅

**Status:** Bem implementado  
**Mecanismo:** Zod + React Hook Form

#### Análise

A validação de inputs está bem implementada com Zod, prevenindo dados inválidos.

**Pontos Fortes:**

```typescript
// ✅ Validação robusta
export const createLeadSchema = z.object({
  name: z.string().min(3),
  company: z.string().min(2),
  value: z.number().min(0),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email().optional(),
});
```

**Melhorias Necessárias:**

1. **Adicionar validação de comprimento máximo:**

```typescript
export const createLeadSchema = z.object({
  name: z.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo'), // ✅ Previne DoS
  company: z.string()
    .min(2, 'Empresa muito curta')
    .max(100, 'Empresa muito longa'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .optional(),
  phone: z.string()
    .max(20, 'Telefone muito longo')
    .optional(),
});
```

2. **Adicionar validação de caracteres especiais:**

```typescript
// Prevenir caracteres de controle
name: z.string()
  .min(3)
  .max(100)
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),
```

---

## ❌ Vulnerabilidades Críticas

### 1. CSRF (Cross-Site Request Forgery) - VULNERÁVEL ❌

**Severidade:** 🔴 Crítica  
**Prioridade:** P0 (Urgente para Produção)  
**Impacto:** Alto - Atacante pode executar ações em nome do usuário

#### Descrição do Problema

Next.js Server Actions não possuem proteção CSRF nativa. Um site malicioso pode fazer requests para as Server Actions se o usuário estiver autenticado.

#### Cenário de Ataque

```html
<!-- Site malicioso: evil.com -->
<form action="https://crm-foursys.vercel.app/api/leads" method="POST">
  <input name="name" value="Lead Malicioso" />
  <input name="company" value="Evil Corp" />
  <input name="value" value="999999" />
  <input name="status" value="closed" />
</form>
<script>
  // Submete automaticamente quando usuário visita página
  document.forms[0].submit();
</script>
```

Se o usuário estiver autenticado no CRM, o lead seria criado sem seu consentimento.

#### Solução Recomendada

**Implementar tokens CSRF:**

```bash
npm install csrf
```

**1. Criar middleware de CSRF:**

```typescript
// src/lib/csrf.ts
import { createHash, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'change-me-in-production';

export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(`${token}-${sessionId}-${CSRF_SECRET}`)
    .digest('hex');
  
  return `${token}.${hash}`;
}

export function validateCsrfToken(token: string, sessionId: string): boolean {
  const [tokenPart, hashPart] = token.split('.');
  
  if (!tokenPart || !hashPart) {
    return false;
  }
  
  const expectedHash = createHash('sha256')
    .update(`${tokenPart}-${sessionId}-${CSRF_SECRET}`)
    .digest('hex');
  
  return hashPart === expectedHash;
}
```

**2. Adicionar token em formulários:**

```typescript
// src/components/kanban/CreateLeadModal.tsx
import { generateCsrfToken } from '@/lib/csrf';

export function CreateLeadModal() {
  const [csrfToken] = useState(() => generateCsrfToken('session-id'));
  
  const onSubmit = async (data: CreateLeadFormData) => {
    await createLead({
      ...data,
      _csrf: csrfToken, // Adicionar token
    });
  };
  
  // ...
}
```

**3. Validar token em Server Actions:**

```typescript
// src/app/actions/leads.ts
import { validateCsrfToken } from '@/lib/csrf';

export async function createLead(data: CreateLeadInput & { _csrf: string }): Promise<Lead> {
  // Validar CSRF token
  if (!validateCsrfToken(data._csrf, 'session-id')) {
    throw new Error('Token CSRF inválido');
  }
  
  // Remover token antes de salvar
  const { _csrf, ...leadData } = data;
  
  // Continuar com criação...
}
```

**Tempo de Implementação:** 2-3 horas  
**Complexidade:** ⭐⭐⭐ Alta

---

### 2. Rate Limiting - AUSENTE ❌

**Severidade:** 🔴 Crítica  
**Prioridade:** P1 (Alta para Produção)  
**Impacto:** Alto - Vulnerável a ataques de força bruta e DoS

#### Descrição do Problema

Não há limite de requisições por IP ou usuário. Um atacante pode:
- Criar milhares de leads (DoS)
- Fazer scraping de dados
- Executar ataques de força bruta (quando auth for implementado)

#### Cenário de Ataque

```javascript
// Script malicioso
for (let i = 0; i < 10000; i++) {
  fetch('https://crm-foursys.vercel.app/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: `Lead ${i}`,
      company: `Company ${i}`,
      value: 1000,
      status: 'prospect'
    })
  });
}
// Cria 10.000 leads, sobrecarregando banco
```

#### Solução Recomendada

**Implementar rate limiting com Upstash:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

**1. Configurar Upstash Redis:**

```env
# .env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**2. Criar middleware de rate limit:**

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Limite: 10 requisições por 10 segundos
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// Limite mais restritivo para criação
export const createLeadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 por minuto
  analytics: true,
});
```

**3. Aplicar em Server Actions:**

```typescript
// src/app/actions/leads.ts
import { createLeadRatelimit } from '@/lib/ratelimit';
import { headers } from 'next/headers';

export async function createLead(data: CreateLeadInput): Promise<Lead> {
  // Obter IP do usuário
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Verificar rate limit
  const { success, limit, remaining, reset } = await createLeadRatelimit.limit(ip);
  
  if (!success) {
    throw new Error(
      `Limite de requisições excedido. Tente novamente em ${Math.ceil((reset - Date.now()) / 1000)} segundos.`
    );
  }
  
  // Continuar com criação...
}
```

**4. Adicionar headers de rate limit na resposta:**

```typescript
// src/app/api/leads/route.ts (se usar API routes)
export async function POST(request: Request) {
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  });
}
```

**Limites Recomendados:**

| Ação | Limite | Janela | Justificativa |
|------|--------|--------|---------------|
| Criar Lead | 5 | 1 minuto | Prevenir spam |
| Atualizar Lead | 20 | 1 minuto | Permitir drag & drop |
| Buscar Leads | 30 | 1 minuto | Leitura mais permissiva |
| Dashboard | 10 | 1 minuto | Leitura moderada |

**Tempo de Implementação:** 2-3 horas  
**Complexidade:** ⭐⭐⭐ Alta

---

## ⚠️ Vulnerabilidades Médias

### 3. Secrets Management - PARCIAL ⚠️

**Severidade:** 🟡 Média  
**Prioridade:** P1 (Alta)

#### Problemas Identificados

1. **DATABASE_URL hardcoded** (já identificado em bugs)
2. **Sem rotação de secrets**
3. **Sem validação de .env**

#### Recomendações

**1. Validar variáveis de ambiente no startup:**

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  NEXT_PUBLIC_APP_URL: z.string().url('URL inválida'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET deve ter no mínimo 32 caracteres'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

**2. Usar secrets manager em produção:**

```typescript
// Para Vercel
// Configurar secrets via dashboard ou CLI:
// vercel env add DATABASE_URL production
// vercel env add CSRF_SECRET production

// Para AWS
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

async function getSecret(secretName: string) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString!);
}
```

---

### 4. Data Encryption - PARCIAL ⚠️

**Severidade:** 🟡 Média  
**Prioridade:** P2 (Média)

#### Análise

**Dados em Trânsito:**
- ✅ HTTPS em produção (Vercel)
- ❌ Sem HTTPS em desenvolvimento local

**Dados em Repouso:**
- ❌ SQLite não criptografa por padrão
- ❌ Emails e telefones em texto plano

#### Recomendações

**1. Forçar HTTPS em desenvolvimento:**

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};
```

**2. Criptografar dados sensíveis:**

```typescript
// src/lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encrypted = Buffer.from(parts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}
```

**3. Aplicar criptografia em campos sensíveis:**

```typescript
// Antes de salvar
const lead = await prisma.lead.create({
  data: {
    ...data,
    email: data.email ? encrypt(data.email) : null,
    phone: data.phone ? encrypt(data.phone) : null,
  }
});

// Ao buscar
const leads = await prisma.lead.findMany();
return leads.map(lead => ({
  ...lead,
  email: lead.email ? decrypt(lead.email) : null,
  phone: lead.phone ? decrypt(lead.phone) : null,
}));
```

---

## 📋 Checklist de Segurança para Produção

### Crítico (Antes do Deploy)

- [ ] Implementar proteção CSRF
- [ ] Implementar rate limiting
- [ ] Migrar para PostgreSQL (SQLite não é seguro para produção)
- [ ] Configurar HTTPS
- [ ] Validar todas as variáveis de ambiente
- [ ] Remover logs sensíveis do código
- [ ] Configurar Content Security Policy (CSP)

### Importante (Primeira Semana)

- [ ] Adicionar sanitização de inputs com DOMPurify
- [ ] Implementar criptografia de dados sensíveis
- [ ] Configurar secrets manager
- [ ] Adicionar logging de segurança
- [ ] Implementar monitoramento de ataques

### Recomendado (Primeiro Mês)

- [ ] Implementar autenticação (NextAuth.js)
- [ ] Implementar autorização (RBAC)
- [ ] Adicionar 2FA
- [ ] Configurar WAF (Web Application Firewall)
- [ ] Realizar penetration testing
- [ ] Configurar SIEM (Security Information and Event Management)

---

## 🔗 Recursos e Referências

### Ferramentas Recomendadas

- **CSRF:** [csrf](https://www.npmjs.com/package/csrf)
- **Rate Limiting:** [@upstash/ratelimit](https://github.com/upstash/ratelimit)
- **Sanitização:** [DOMPurify](https://github.com/cure53/DOMPurify)
- **Secrets:** [Vercel Env](https://vercel.com/docs/environment-variables)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)

### Guias e Documentação

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

---

## 📞 Contato

**Security Reviewer:** TEA Agent  
**Para vulnerabilidades:** security@foursys.com  
**Última Atualização:** 25/12/2025

---

**Próximo Documento:** [Performance](./performance.md)

