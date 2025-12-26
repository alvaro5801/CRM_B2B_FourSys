# Glossário Técnico

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex

---

## A

**ADR (Architectural Decision Record)**  
Documento que registra uma decisão arquitetural importante, incluindo contexto, alternativas consideradas e justificativa.

**Aggregate**  
Operação do Prisma que realiza cálculos agregados (sum, count, avg, etc.) em um conjunto de dados.

**AI Score**  
Pontuação de 0 a 100 que indica a probabilidade de conversão de um lead, gerada automaticamente pelo sistema.

---

## B

**Bcrypt**  
Algoritmo de hash de senha que adiciona salt automático e é resistente a ataques de força bruta.

**Business Case**  
Documento que justifica um investimento com base em análise de custos, benefícios e ROI.

---

## C

**Cascade Delete**  
Comportamento de banco de dados onde a deleção de um registro pai (tenant) automaticamente deleta todos os registros filhos (leads, users).

**Client-Side**  
Código que executa no navegador do usuário (frontend).

**Compliance**  
Conformidade com regulamentações legais (LGPD, GDPR, etc.).

**CRUD**  
Create, Read, Update, Delete - operações básicas de manipulação de dados.

---

## D

**Dashboard**  
Painel visual que exibe métricas e KPIs agregados.

**Data Leakage**  
Vazamento de dados onde um tenant consegue acessar dados de outro tenant (vulnerabilidade crítica).

**Defense in Depth**  
Estratégia de segurança que implementa múltiplas camadas de proteção.

**Deployment**  
Processo de publicar uma aplicação em ambiente de produção.

---

## E

**ERD (Entity-Relationship Diagram)**  
Diagrama que mostra relacionamentos entre entidades de banco de dados.

**Epic**  
Conjunto de user stories relacionadas que entregam uma funcionalidade completa.

---

## F

**Fail Secure**  
Princípio de segurança onde o sistema falha de forma segura (ex: negar acesso em caso de erro).

**Foreign Key (FK)**  
Chave estrangeira que referencia a chave primária de outra tabela, criando relacionamento.

**Fullstack**  
Desenvolvimento que abrange frontend e backend.

---

## G

**GDPR (General Data Protection Regulation)**  
Regulamentação europeia de proteção de dados pessoais.

**GTM (Go-to-Market)**  
Estratégia de lançamento de produto no mercado.

---

## H

**Hash**  
Função criptográfica unidirecional que transforma texto em string fixa (ex: senha → hash).

**HttpOnly Cookie**  
Cookie que não pode ser acessado via JavaScript, protegendo contra XSS.

---

## I

**IDOR (Insecure Direct Object Reference)**  
Vulnerabilidade onde atacante acessa recursos de outros usuários via ID direto.

**Índice (Index)**  
Estrutura de dados que acelera queries em banco de dados.

**Isolamento Lógico**  
Separação de dados por software (filtros) em vez de separação física (databases separados).

---

## J

**JWT (JSON Web Token)**  
Token de autenticação que contém informações do usuário em formato JSON assinado.

---

## K

**Kanban**  
Metodologia visual de gestão de tarefas com colunas representando estados.

**KPI (Key Performance Indicator)**  
Indicador-chave de performance usado para medir sucesso.

---

## L

**Lead**  
Potencial cliente em processo de vendas.

**LGPD (Lei Geral de Proteção de Dados)**  
Legislação brasileira de proteção de dados pessoais.

---

## M

**Migration**  
Script que altera estrutura de banco de dados de forma controlada e versionada.

**Middleware**  
Código que intercepta requisições antes de chegarem ao handler final.

**Multi-tenancy**  
Arquitetura onde múltiplos clientes (tenants) compartilham a mesma instância de aplicação.

**MVP (Minimum Viable Product)**  
Versão mínima de produto com funcionalidades essenciais para validação.

---

## N

**NextAuth.js**  
Biblioteca de autenticação para Next.js.

**Next.js**  
Framework React para aplicações fullstack com renderização server-side.

**NPS (Net Promoter Score)**  
Métrica de satisfação do cliente (escala -100 a +100).

---

## O

**Onboarding**  
Processo de cadastro e configuração inicial de novo usuário/tenant.

**Optimistic Update**  
Atualização otimista onde UI é atualizada imediatamente antes da confirmação do servidor.

**ORM (Object-Relational Mapping)**  
Ferramenta que mapeia objetos de código para tabelas de banco de dados (ex: Prisma).

---

## P

**Payload**  
Dados enviados em uma requisição HTTP.

**Performance**  
Velocidade e eficiência de execução de uma aplicação.

**Prisma**  
ORM moderno para Node.js/TypeScript com type-safety.

**PRD (Product Requirements Document)**  
Documento que especifica requisitos de produto.

---

## Q

**Query**  
Consulta a banco de dados para buscar ou manipular dados.

---

## R

**Revalidate**  
Invalidar cache do Next.js para forçar atualização de dados.

**ROI (Return on Investment)**  
Retorno sobre investimento (lucro / custo).

**Role**  
Papel de usuário que define permissões (admin, user, viewer).

**Rollback**  
Reverter mudanças para versão anterior (código ou banco de dados).

**Row-Level Security (RLS)**  
Isolamento de dados onde cada linha (row) contém identificador de tenant.

---

## S

**SaaS (Software as a Service)**  
Modelo de negócio onde software é oferecido como serviço na nuvem.

**Salt**  
Dados aleatórios adicionados a senha antes de hash para aumentar segurança.

**Schema**  
Estrutura de banco de dados (tabelas, colunas, relacionamentos).

**Seed**  
Script que popula banco de dados com dados iniciais/fictícios.

**Server Action**  
Função do Next.js que executa no servidor e pode ser chamada do cliente.

**Session**  
Dados de autenticação armazenados entre requisições.

**Sharding**  
Técnica de escalabilidade que distribui dados entre múltiplos bancos de dados.

**Slug**  
Identificador URL-friendly (ex: "foursys" em vez de "FourSys Ltda").

**Soft Delete**  
Marcar registro como inativo em vez de deletar fisicamente (via flag `isActive`).

**Spoofing**  
Falsificação de identidade ou dados (ex: enviar `tenantId` de outro tenant).

**SQL Injection**  
Ataque onde código SQL malicioso é injetado em query.

**SQLite**  
Banco de dados relacional leve, baseado em arquivo.

**Stakeholder**  
Parte interessada em um projeto (investidor, usuário, gerente, etc.).

---

## T

**Tenant**  
Inquilino - empresa cliente que usa o sistema multi-tenant.

**Token**  
Credencial de autenticação (geralmente JWT).

**Trade-off**  
Compromisso onde ganhar algo significa perder outra coisa.

**TypeScript**  
Superset de JavaScript com tipagem estática.

---

## U

**UUID (Universally Unique Identifier)**  
Identificador único universal (ex: `550e8400-e29b-41d4-a716-446655440000`).

**UX (User Experience)**  
Experiência do usuário ao interagir com produto.

---

## V

**Validação**  
Verificação de que dados atendem a critérios específicos.

**Vendor Lock-in**  
Dependência de fornecedor específico que dificulta migração.

**Vulnerability**  
Vulnerabilidade de segurança que pode ser explorada por atacantes.

---

## W

**Webhook**  
Callback HTTP que notifica sistema externo sobre eventos.

**Where Clause**  
Cláusula SQL que filtra resultados de query (ex: `WHERE tenantId = 'X'`).

---

## X

**XSS (Cross-Site Scripting)**  
Ataque onde código JavaScript malicioso é injetado em página web.

---

## Z

**Zero Trust**  
Modelo de segurança onde nenhuma requisição é confiável por padrão.

**Zod**  
Biblioteca TypeScript para validação de schemas e dados.

---

## Termos Específicos do Projeto

**Default Tenant**  
Tenant padrão criado para migrar leads existentes (`slug: "default"`).

**getCurrentTenantId()**  
Função crítica que extrai `tenantId` da sessão do usuário autenticado.

**Hardcoded tenantId**  
Estratégia temporária (Fase 1) onde `tenantId` é fixo para testes, antes de implementar auth real.

**Kanban Status**  
Estados do lead: `prospect`, `qualified`, `proposal`, `closed`.

**Shared Database, Shared Schema**  
Modelo de multi-tenancy escolhido onde todos os tenants compartilham database e schema.

**Tenant Selector**  
Componente UI que permite usuário trocar entre múltiplos tenants.

---

## Siglas Comuns

| Sigla | Significado |
|-------|-------------|
| **API** | Application Programming Interface |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **DB** | Database |
| **FK** | Foreign Key |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HTTP Secure |
| **ID** | Identifier |
| **JSON** | JavaScript Object Notation |
| **PK** | Primary Key |
| **QA** | Quality Assurance |
| **SQL** | Structured Query Language |
| **UI** | User Interface |
| **URL** | Uniform Resource Locator |

---

**Última Atualização:** 25/12/2025

