# Arquitetura de Sistema — comunidade-nilu (ILUMINNARE)

> **Documento:** Brownfield Discovery — FASE 1 (Data Collection / System Architecture)
> **Autor:** Aria (@architect — AIOX)
> **Data:** 2026-07-04
> **Task de referência:** `document-project.md` (`*document-project`)
> **Escopo:** Análise de nível SISTEMA baseada em leitura direta do código-fonte. Não inclui auditoria de schema (FASE 2 — @data-engineer) nem de UX (FASE 3 — @ux-design-expert).

---

## 1. Visão Geral

`comunidade-nilu` é a aplicação de comunidade do produto **ILUMINNARE** (SaaS de saúde emocional empresarial — IA + gamificação + mentoria). É uma **SPA (Single Page Application)** client-side, gerada originalmente via **Lovable.dev**, com deploy ativo em `https://comunidade-nilu.vercel.app/`.

- **Tipo:** Frontend SPA + BaaS (Supabase) — não há backend próprio/servidor Node.
- **Arquitetura macro:** React SPA → Supabase (Postgres + Auth + Realtime) diretamente do browser via `@supabase/supabase-js`, protegido por RLS. Deploy estático na Vercel.
- **Estado de maturidade:** **Migração em andamento (híbrido).** O app está transicionando de um MVP originalmente baseado em `localStorage` + mock data para persistência real no Supabase. Várias telas já usam Supabase; outras ainda dependem de dados mockados e/ou `localStorage`. Essa dualidade é a principal fonte de débito técnico de sistema.

**Domínios funcionais (18 rotas):** Dashboard, Feed, Community, Challenges, AnnualChallenges, Ranking, Diagnóstico (PCI), SelfCare, SafeSpace, Premium (assinatura), Admin, Profile, Personalities, MeuProjeto/NovoProjeto (PSI), Auth, Index/NotFound.

---

## 2. Stack Tecnológico

### Core
| Camada | Tecnologia | Versão (package.json) |
|--------|-----------|----------------------|
| Build tool | Vite | ^5.4.19 |
| Framework UI | React | ^18.3.1 |
| Linguagem | TypeScript | ^5.8.3 |
| Plugin React | @vitejs/plugin-react-swc | ^3.11.0 (compilador SWC) |
| Roteamento | react-router-dom | ^6.30.1 |
| Server state | @tanstack/react-query | ^5.83.0 |
| BaaS | @supabase/supabase-js | ^2.93.3 |

### UI / Design System
- **shadcn-ui** (Radix UI primitives) — ~30 pacotes `@radix-ui/*`, todos em versões recentes (1.x–2.x).
- **Tailwind CSS** ^3.4.17 + `tailwindcss-animate`, `@tailwindcss/typography`, `tailwind-merge`, `class-variance-authority`, `clsx`.
- **lucide-react** ^0.462.0 (ícones), **recharts** ^2.15.4 (gráficos), **sonner** ^1.7.4 + toaster shadcn (notificações), **embla-carousel**, **vaul**, **cmdk**, **next-themes**.

### Formulários / Validação
- **react-hook-form** ^7.61.1 + **@hookform/resolvers** ^3.10.0 + **zod** ^3.25.76.

### Tooling (devDependencies)
- **ESLint** ^9.32.0 (flat config) + `typescript-eslint` ^8.38.0 + plugins react-hooks / react-refresh.
- **Vitest** ^3.2.4 + `@testing-library/react` ^16.0.0 + `jsdom` ^20.0.3 + `@testing-library/jest-dom`.
- **lovable-tagger** ^1.1.13 (dev-only — marcação de componentes para a plataforma Lovable).
- Gerenciadores: presença de `bun.lock`/`bun.lockb` **e** `package-lock.json` (npm) — dois lockfiles coexistindo.

### Scripts (`package.json`)
`dev`, `build`, `build:dev`, `lint` (eslint .), `preview`, `test` (vitest run), `test:watch`. **Não há script `typecheck` nem `test:coverage`.**

---

## 3. Estrutura de Pastas e Componentes

```
src/
├── App.tsx                  # Composition root: providers + rotas (imports eager)
├── main.tsx                 # Bootstrap React
├── pages/          (18)     # Uma página por rota
├── components/
│   ├── ui/         (~50)    # shadcn-ui primitives (gerados)
│   ├── Layout.tsx           # Shell/navegação
│   ├── NavLink.tsx
│   └── PointsToast.tsx      # Feedback visual de pontos
├── contexts/
│   └── AuthContext.tsx      # (488 LOC) auth + gamificação + tips (God-context)
├── hooks/
│   ├── usePresence.tsx      # Realtime presence (Supabase channel)
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/supabase/
│   ├── client.ts            # createClient (lê env vars)
│   └── types.ts     (678)   # Tipos gerados do schema (Database)
├── lib/
│   ├── mockData.ts  (252)   # Dados mockados (ainda consumidos em prod)
│   ├── points.ts            # NEURAL_COINS + award_points RPC
│   ├── annualChallenges.ts  (279)
│   ├── pci/ (content.ts, engine.ts)   # Motor do diagnóstico PCI
│   ├── psi/ (taskTemplates.ts)        # Templates de tarefas PSI
│   └── utils.ts             # cn() helper
└── test/ (example.test.ts, setup.ts)

supabase/
├── config.toml
├── bootstrap_full_schema.sql
└── migrations/ (9 arquivos, 2026-04 → 2026-07)
```

**Métrica:** ~91 arquivos em `src/`, **~11.469 LOC** de TS/TSX. Maiores arquivos: `supabase/types.ts` (678, gerado), `ui/sidebar.tsx` (637, gerado), `Challenges.tsx` (493), `AuthContext.tsx` (488), `Admin.tsx` (382).

---

## 4. Dependências e Versões

**Saúde geral:** dependências em versões recentes (majoritariamente meados de 2025). **Nenhuma CVE crítica conhecida** nos ranges atuais até o cutoff da análise. O risco predominante é **envelhecimento de majors**, não vulnerabilidade ativa.

| Dependência | Versão atual | Observação |
|-------------|-------------|-----------|
| vite | ^5.4.19 | Major aging — Vite 6 disponível. Upgrade recomendado a médio prazo. |
| tailwindcss | ^3.4.17 | Tailwind 4 disponível (mudança de engine). Migração é breaking. |
| zod | ^3.25.76 | Zod 4 disponível. Upgrade opcional. |
| react-router-dom | ^6.30.1 | v7 disponível; v6 ainda suportada. |
| react / react-dom | ^18.3.1 | Estável; React 19 disponível mas 18.3 é LTS de fato. |
| @supabase/supabase-js | ^2.93.3 | Atual. |
| lovable-tagger | ^1.1.13 | Dev-only; acopla o repo à plataforma Lovable (vendor tag). |

**Risco de tooling:** coexistência de `bun.lockb` + `package-lock.json` pode causar divergência de resolução de dependências entre ambientes (dev usa bun, CI/Vercel pode usar npm). Recomenda-se eleger **um** gerenciador.

---

## 5. Padrões de Código Existentes

- **Imports absolutos** via alias `@/*` → `./src/*` (configurado em `vite.config.ts`, `vitest.config.ts`, `tsconfig`). Consistente.
- **Nomenclatura:** páginas em PascalCase; componentes ui em kebab-case (padrão shadcn); hooks `useXxx`; libs em camelCase. Mistura de PT-BR (nomes de domínio: `Diagnostico`, `MeuProjeto`, `pontosPorDificuldade`) e EN (infra/técnico). Aceitável mas inconsistente.
- **Estado global:** via **React Context** (`AuthContext`, `PresenceProvider`) — não há Redux/Zustand. Server state via React Query (`QueryClient` instanciado, porém subutilizado: muitas telas usam `supabase.from(...)` direto em `useEffect` em vez de `useQuery`).
- **Roteamento:** declarativo em `App.tsx`, todas as rotas **eager-imported** (sem `React.lazy`).
- **TypeScript "frouxo":** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals/Parameters: false` (em `tsconfig.app.json` e `tsconfig.json`). ESLint com `@typescript-eslint/no-unused-vars: "off"`. Reduz segurança de tipos — variáveis não usadas e `null`/`undefined` não são checados.
- **Guardas de rota:** feitas **dentro** de cada página (ex.: `Admin.tsx` faz `if (!user?.isAdmin) navigate('/')`), não há wrapper `<ProtectedRoute>`. Proteção real depende de RLS no Supabase.

---

## 6. Pontos de Integração

| Integração | Detalhe / Evidência |
|-----------|---------------------|
| **Supabase Auth** | `AuthContext.tsx` — `signInWithPassword`, `signUp`, `onAuthStateChange`, `getSession`. Sessão persistida em `localStorage` (`client.ts`). |
| **Supabase DB (Postgres)** | Acesso direto do browser via `supabase.from(...)`. Tabelas em uso: `profiles`, `user_roles`, `pci_results`, `psi_projects`, `psi_weeks`, `psi_tasks`, `psi_checkins`, `posts`, `conteudos`, `personality_notes`, `stages`, `stage_challenges`, `user_challenge_progress`, `user_stage_progress`. |
| **Supabase Realtime (Presence)** | `usePresence.tsx` — canal `iluminnados-presence`, heartbeat a cada 30s. Ranking também usa canal realtime em `profiles`. |
| **Supabase RPC** | `award_points` (`lib/points.ts`) — incremento atômico de pontos server-side. |
| **RLS** | Políticas presentes em 5 migrations (a auditoria detalhada é FASE 2 — @data-engineer). |
| **InfinitePay** | `Premium.tsx` — link de assinatura **hardcoded** (`https://invoice.infinitepay.io/plans/...`). Sem webhook/confirmação server-side visível; gestão de Premium é manual no Admin (ver commits). |
| **Vercel** | Deploy estático. `vercel.json` faz rewrite SPA (`/(.*) → /index.html`) — corrige 404 em rotas do SPA. |
| **Google Fonts** | `@import` em `index.css` (Inter + Space Grotesk). |

---

## 7. Configurações

- **Env vars** (`.env`, prefixo `VITE_` → expostas ao client por design): `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`. Lidas em `integrations/supabase/client.ts`. **Nenhum segredo server-side** (correto para SPA — a publishable/anon key é pública por natureza, a segurança recai sobre RLS).
- **`client.ts`** não valida presença das env vars: se `VITE_SUPABASE_URL`/`KEY` estiverem ausentes, `createClient(undefined, undefined)` falha em runtime sem mensagem clara.
- **Build/Deploy:** Vite build → dist estático → Vercel. `vercel.json` mínimo (apenas rewrites SPA).
- **`.gitignore`** ignora `node_modules`, `dist`, `.vercel`, logs — **mas NÃO ignora `.env`**.
- **Vitest:** `environment: jsdom`, `globals: true`, setup em `src/test/setup.ts`, include `src/**/*.{test,spec}.{ts,tsx}`.

---

## 8. Débitos Técnicos Identificados (Sistema)

> Cada débito cita evidência concreta (arquivo/linha). Severidade preliminar (Crítica / Alta / Média / Baixa) — validação e priorização final na FASE 4+ do Brownfield.

| ID | Débito | Evidência (arquivo) | Severidade Preliminar |
|----|--------|---------------------|----------------------|
| SYS-01 | **`.env` versionado no Git** (presente no histórico — commits `034fae1`, `5eda154`) e não listado no `.gitignore`. Expõe PROJECT_ID/URL/publishable key no repositório. Embora a anon key seja pública por design, versionar `.env` é má prática e cria risco caso chaves service-role sejam adicionadas futuramente. | `.gitignore` (sem entrada `.env`); `git ls-files .env` retorna match; `.env` | **Crítica** |
| SYS-02 | **URL de pagamento hardcoded.** Link de assinatura InfinitePay fixo no código; qualquer mudança de plano/conta exige rebuild+deploy. Deveria ser env var/config. | `src/pages/Premium.tsx:5` (`const LINK_ASSINATURA = 'https://invoice.infinitepay.io/...'`) | **Alta** |
| SYS-03 | **Split-brain de gamificação (dois sistemas de pontos paralelos).** `AuthContext` mantém `POINTS` (CHECK_IN:5, CHALLENGE_COMPLETE:10…) via `localStorage`; `lib/points.ts` mantém `NEURAL_COINS` (25/50/150…) via RPC `award_points` no Supabase. Duas fontes de verdade e duas escalas de pontos divergentes para o mesmo conceito. | `src/contexts/AuthContext.tsx:75-84` vs `src/lib/points.ts:5-13` | **Alta** |
| SYS-04 | **Estado de gamificação em `localStorage` (não confiável).** `progress`, `completedChallenges`, `activeDays`, `selfCareLogs`, `lastCheckIn` persistidos só no browser (`iluminnados_user_${id}`). Não sincroniza entre dispositivos e é trivialmente manipulável pelo usuário (fraude de pontos/ranking). Apenas `points` é espelhado no Supabase. | `src/contexts/AuthContext.tsx:166-176` (`saveUser`) e :143-156 | **Alta** |
| SYS-05 | **Código morto + feature quebrada: `getAllUsers()`.** Lê a chave `localStorage('iluminnados_users')` (plural) que **nunca é escrita** em lugar nenhum do código → sempre retorna `[]`. Além disso, o método é exposto no context mas **não é consumido por nenhuma página**. | `src/contexts/AuthContext.tsx:347-359`; `grep` confirma: nenhuma escrita de `iluminnados_users`, nenhum consumo de `getAllUsers` fora do próprio context | **Média** |
| SYS-06 | **Feature social "fake" (tips device-local).** `userTips` (dicas da comunidade, likes, comentários) persistidos em `localStorage('iluminnados_tips')` — cada usuário vê apenas as próprias dicas; não há compartilhamento real entre usuários. Feature aparenta ser social mas é isolada por dispositivo. | `src/contexts/AuthContext.tsx:115-118, 361-363` | **Alta** |
| SYS-07 | **God-context / acoplamento excessivo.** `AuthContext` (488 LOC) concentra autenticação + pontos + check-in + progresso de desafios + autocuidado + dicas + likes/comentários (18 métodos em um único provider). Consumido por 20 arquivos. Qualquer mudança em gamificação re-renderiza toda a árvore e arrisca regressões em auth. | `src/contexts/AuthContext.tsx` (488 LOC, `AuthContextType` com 18 membros) | **Alta** |
| SYS-08 | **Mock data em produção.** 5 páginas de produto ainda importam de `lib/mockData.ts` (challenges, communityMembers, activities, userBonuses) em vez de dados reais do Supabase — coexistindo com dados reais na mesma tela. | `Dashboard.tsx:2`, `Community.tsx:3`, `Personalities.tsx`, `Profile.tsx`, `SafeSpace.tsx` (imports de `@/lib/mockData`) | **Alta** |
| SYS-09 | **Ausência de testes reais.** Único teste é o placeholder gerado (`expect(true).toBe(true)`). Cobertura efetiva ~0% sobre 11k LOC, incluindo lógica crítica de pontos/PCI/PSI. Sem script `test:coverage` nem `typecheck`. | `src/test/example.test.ts` (7 linhas triviais); `package.json` scripts | **Alta** |
| SYS-10 | **TypeScript e lint em modo permissivo.** `strict:false`, `strictNullChecks:false`, `noImplicitAny:false`, `noUnusedLocals/Parameters:false`; ESLint com `no-unused-vars:"off"`. Anula grande parte da segurança de tipos numa base client-side que acessa DB diretamente. | `tsconfig.app.json:21-24`, `tsconfig.json:17-22`, `eslint.config.js:23` | **Média** |
| SYS-11 | **Sem code-splitting (bundle único).** As 18 páginas são `import` estáticos em `App.tsx`; zero uso de `React.lazy`. Todo o app (incl. recharts, embla, ~50 componentes ui) carrega no first load → performance/TTI degradados, especialmente em mobile. | `src/App.tsx:9-26`; `grep React.lazy` → 0 ocorrências | **Média** |
| SYS-12 | **React Query subutilizado.** `QueryClient` é provido mas a maioria das telas faz `supabase.from(...)` dentro de `useEffect` manual (sem cache, dedupe, retry ou estados de loading/error padronizados). Duplicação de padrão de fetch entre páginas. | `App.tsx:28-31` (QueryClient) vs fetch manual em `Ranking.tsx:32`, `Community.tsx:35`, etc. | **Média** |
| SYS-13 | **`client.ts` sem validação de env vars.** Se as variáveis `VITE_SUPABASE_*` faltarem, `createClient(undefined, undefined)` falha silenciosamente/obscuramente em runtime. | `src/integrations/supabase/client.ts:5-11` | **Baixa** |
| SYS-14 | **Dois lockfiles / gerenciadores.** `bun.lockb` + `bun.lock` e `package-lock.json` coexistem — risco de divergência de resolução entre dev (bun) e build (npm/Vercel). | raiz do projeto (`bun.lockb`, `package-lock.json`) | **Baixa** |
| SYS-15 | **README boilerplate não customizado.** README ainda é o template Lovable com `REPLACE_WITH_PROJECT_ID`; nenhuma doc de setup/arquitetura específica do projeto. | `README.md:5,13,65` | **Baixa** |
| SYS-16 | **Majors de build/estilo envelhecendo.** Vite 5, Tailwind 3, Zod 3, react-router 6 têm majors mais novos. Sem CVE crítica, mas dívida de atualização crescente (migrações breaking se adiadas). | `package.json` dependencies | **Baixa** |

---

## 9. Notas para as Próximas Fases (Brownfield)

- **FASE 2 (@data-engineer):** auditar as 9 migrations e políticas RLS das 14 tabelas em uso — validar se a proteção real de `/admin` e a integridade de pontos (`award_points`) estão cobertas server-side, dado que as guardas de rota são client-side (SYS-04, SYS-07).
- **FASE 3 (@ux-design-expert):** avaliar impacto UX das telas com mock data misturado a dados reais (SYS-08).
- **Tema arquitetural central a resolver no draft (FASE 4):** unificar a fonte de verdade da gamificação (localStorage → Supabase) e consolidar os dois sistemas de pontos (SYS-03/04/06). É o débito de maior alavancagem: destrava confiabilidade, multi-dispositivo e features sociais reais.

---
*Gerado por Aria (@architect) — AIOX Brownfield Discovery FASE 1. Todos os achados verificados por leitura direta do código.*
