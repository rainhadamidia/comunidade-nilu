# Technical Debt Assessment - DRAFT
## Para Revisão dos Especialistas

> **Documento:** Brownfield Discovery — FASE 4 (Consolidação Inicial / DRAFT)
> **Autor:** Aria (@architect — AIOX)
> **Data:** 2026-07-04
> **Produto:** ILUMINNARE — SaaS de saúde emocional empresarial (IA + gamificação + mentoria)
> **App:** `comunidade-nilu` (React + Vite + TypeScript + shadcn-ui + Tailwind + Supabase)
> **Deploy:** https://comunidade-nilu.vercel.app/
> **Status:** DRAFT — aguarda revisão de @data-engineer (Fase 5) e @ux-design-expert (Fase 6), depois QA Gate (Fase 7).

---

### 0. Sumário da Consolidação

| Área | Fonte | IDs | Qtd |
|------|-------|-----|-----|
| Sistema | `docs/architecture/system-architecture.md` | SYS-01 → SYS-16 | 16 |
| Database | `supabase/docs/DB-AUDIT.md` (+ `SCHEMA.md`) | DBT-* (S/D/P/M/C/N) | 19 |
| Frontend/UX | `docs/frontend/frontend-spec.md` | FE-01 → FE-18 | 18 |
| **TOTAL CONSOLIDADO** | | | **53** |

> **Nota metodológica (Constituição AIOX — Art. IV, No Invention):** este DRAFT **não cria novos débitos**. Apenas consolida, referencia e propõe estimativa preliminar. A validação, o refinamento de esforço e eventuais novos achados são papel dos especialistas nas Fases 5–6.

#### ⚠️ Reconciliação inter-fases (rastreabilidade obrigatória)
Durante a consolidação identifiquei que **o mesmo débito foi visto por lentes diferentes** e, em um caso, **reclassificado**:

1. 🔴 **`.env` versionado — SYS-01 (Fase 1, "Crítica") foi CORRIGIDO por DBT-S04 (Fase 2, "Média").** A auditoria de banco confirmou que o histórico Git contém **apenas chaves públicas** (`role: anon` + publishable key); **nenhum `service_role` vazou**. Continua má prática, mas **não é catastrófico**. **O verdadeiro achado crítico do projeto é DBT-S01** (policy RLS de UPDATE em `profiles` sem `WITH CHECK`). Adotei a severidade da Fase 2 (Média) para o `.env` na matriz, mantendo ambos os IDs rastreáveis.
2. **Split-brain de pontos** aparece 3×: SYS-03 + SYS-04 (sistema) ≡ DBT-D04 + DBT-D06 (dados) — mesmo débito, correções complementares.
3. **Mock data em produção**: SYS-08 (sistema) ≡ FE-03 (UX) — mesma raiz, impacto duplo.
4. **Feature social "fake" (tips localStorage)**: SYS-06 (sistema) ≡ DBT-N01 (dados).
5. **Guardas de rota client-side**: SYS-05/SYS-07 (contexto) ≡ FE-11 (UX) — sem route guard central.
6. **Refetch total no realtime**: DBT-P02/P03 (dados) ≡ FE-09 percebido (UX/loading).

Esses cross-references estão anotados na Matriz (§4, coluna "Ref. cruzada") e nas perguntas aos especialistas (§5) — **decisão de consolidação, não de deduplicação**: nenhum ID foi fundido nem removido.

---

### 1. Débitos de Sistema
> Fonte: `docs/architecture/system-architecture.md` §8 (Aria, Fase 1). IDs preservados.

| ID | Débito | Evidência | Severidade (Fase 1) |
|----|--------|-----------|---------------------|
| 🔴 SYS-01 | `.env` versionado no Git (sem entrada no `.gitignore`; commits `034fae1`, `5eda154`). **REVISADO por DBT-S04 → Média** (só chaves públicas). | `.gitignore`; `git ls-files .env` | ~~Crítica~~ → **Média** |
| 🟠 SYS-02 | URL de pagamento InfinitePay **hardcoded** — mudança de plano exige rebuild+deploy. | `src/pages/Premium.tsx:5` | **Alta** |
| 🟠 SYS-03 | Split-brain de gamificação: dois sistemas de pontos paralelos (`POINTS` localStorage vs `NEURAL_COINS` RPC). | `AuthContext.tsx:75-84` vs `lib/points.ts:5-13` | **Alta** |
| 🟠 SYS-04 | Estado de gamificação em `localStorage` (não confiável, manipulável, sem sync multi-dispositivo). | `AuthContext.tsx:166-176, 143-156` | **Alta** |
| SYS-05 | Código morto + feature quebrada: `getAllUsers()` lê chave nunca escrita → sempre `[]`; não é consumido. | `AuthContext.tsx:347-359` | Média |
| 🟠 SYS-06 | Feature social "fake": `userTips`/likes/comentários só em `localStorage` — isolado por dispositivo. | `AuthContext.tsx:115-118, 361-363` | **Alta** |
| 🟠 SYS-07 | God-context: `AuthContext` (488 LOC, 18 métodos) concentra auth + pontos + progresso + tips; consumido por 20 arquivos. | `AuthContext.tsx` | **Alta** |
| 🟠 SYS-08 | Mock data em produção em 5 páginas coexistindo com dados reais. | `Dashboard/Community/Personalities/Profile/SafeSpace` | **Alta** |
| 🟠 SYS-09 | Ausência de testes reais (único teste é placeholder; ~0% cobertura sobre 11k LOC; sem `typecheck`/`coverage`). | `src/test/example.test.ts`; `package.json` | **Alta** |
| SYS-10 | TypeScript e ESLint permissivos (`strict:false`, `strictNullChecks:false`, `no-unused-vars:off`). | `tsconfig.app.json`, `eslint.config.js` | Média |
| SYS-11 | Sem code-splitting: 18 páginas eager-imported, zero `React.lazy` → TTI degradado em mobile. | `App.tsx:9-26` | Média |
| SYS-12 | React Query subutilizado: fetch manual em `useEffect` sem cache/dedupe/retry. | `App.tsx:28-31` vs telas | Média |
| SYS-13 | `client.ts` sem validação de env vars → `createClient(undefined)` falha obscuramente. | `client.ts:5-11` | Baixa |
| SYS-14 | Dois lockfiles (`bun.lockb` + `package-lock.json`) → risco de divergência dev/CI. | raiz | Baixa |
| SYS-15 | README boilerplate Lovable não customizado. | `README.md` | Baixa |
| SYS-16 | Majors de build/estilo envelhecendo (Vite 5, Tailwind 3, Zod 3, react-router 6). | `package.json` | Baixa |

---

### 2. Débitos de Database
> Fonte: `supabase/docs/DB-AUDIT.md` (Dara, Fase 2). IDs originais preservados.
> **⚠️ PENDENTE: Revisão do @data-engineer (Fase 5)** — validar esforços, confirmar padrões e complementar achados.

| ID | Débito | Evidência | Severidade (Fase 2) |
|----|--------|-----------|---------------------|
| 🔴 **DBT-S01** | **ACHADO CRÍTICO REAL** — RLS UPDATE de `profiles` sem `WITH CHECK` nem restrição de coluna → qualquer usuário autenticado faz `UPDATE profiles SET plan='premium', points=999999` → **bypass do paywall freemium + forja de pontos/ranking**. | `m1:97-101` (política); `m8:10-11` (`plan`) | **CRÍTICA** |
| 🔴 DBT-S02 | `award_points` (SECURITY DEFINER) valida `auth.uid()` mas **não valida `_amount`** (vem do client) → auto-inflar pontos (inclusive negativo). | `m7:18-25`; `lib/points.ts:15` | **Alta** |
| 🔴 DBT-S03 | Gating de gamificação burlável: RLS permite `UPDATE ... SET completed_at=now()` direto, pulando a validação 24h/sequência da RPC. | `m4:84-89, 98-103` vs `217-227` | **Alta** |
| 🔴 DBT-D01 | `conteudos.user_id` **sem FK** para `auth.users` → dados órfãos, sem CASCADE. | `m3:7` | **Alta** |
| 🔴 DBT-D02 | `user_challenge_progress.user_id` **sem FK** → órfãos. | `m4:33` | **Alta** |
| 🔴 DBT-D03 | `user_stage_progress.user_id` **sem FK** → órfãos. | `m4:47` | **Alta** |
| DBT-S04 | `.env` versionado — **só chaves públicas, sem `service_role`**. Reclassifica SYS-01 para Média. | `git ls-files`; commits `5eda154`,`034fae1` | Média |
| DBT-D04 | Split-brain de pontos: 3 fontes divergentes p/ `profiles.points` (RPC, `.update()` direto, localStorage). | `AuthContext.tsx:75,171-175`; `points.ts:15`; `m7` | Média |
| DBT-P01 | Índice faltante em `profiles.points`: Ranking `ORDER BY points DESC LIMIT 50` → seq scan + sort. | `Ranking.tsx:32-37` | Média |
| DBT-P02 | Feed re-busca 100 posts + profiles a cada INSERT (refetch total, não incremental). | `Feed.tsx:83-90` | Média |
| DBT-P03 | Ranking re-busca tudo a cada UPDATE de `profiles` (muda a cada ponto de qualquer usuário). | `Ranking.tsx:47-54` | Média |
| DBT-S05 | `initialize_user_progress` (DEFINER) não checa `auth.uid()` (dano baixo, idempotente, mas viola princípio). | `m4:137-142`; `Challenges.tsx:112` | Baixa |
| DBT-P04 | N+1 de escrita no NovoProjeto: 4 semanas em loop sequencial `await`, sem batch/transação. | `NovoProjeto.tsx:99-124` | Baixa |
| DBT-D05 | Sem CHECK `points >= 0` em `profiles` (combinado com DBT-S02 → pontos negativos). | `m1:78`; `m7:22-24` | Baixa |
| DBT-D06 | Regra de pontuação duplicada/divergente: `stage_challenges.points` (DB) vs constantes no client. | `m4` seed vs `points.ts`/`AuthContext.tsx` | Baixa |
| DBT-M01 | Migrations bootstrap com nomes UUID (export Lovable), sem descrição semântica. | migrations `...180824` etc. | Baixa |
| DBT-M02 | Seed de `stages` sem `ON CONFLICT` → reaplicar duplica etapas (migration não idempotente). | `m4:338-341` | Baixa |
| DBT-C01 | `posts.content` sem limite no DB (só `maxLength=500` no client) → payloads grandes via API direta. | `m1:152`; `Feed.tsx:155` | Baixa |
| DBT-N01 | Dados sociais (tips/likes/comments) só em localStorage, nunca no DB → perda de dados. | `AuthContext.tsx:361-363` | Baixa |

---

### 3. Débitos de Frontend/UX
> Fonte: `docs/frontend/frontend-spec.md` (Uma, Fase 3). IDs preservados.
> **⚠️ PENDENTE: Revisão do @ux-design-expert (Fase 6)** — validar esforços de design, escopo de retrabalho de design system e priorização UX.

| ID | Débito | Evidência | Severidade (Fase 3) |
|----|--------|-----------|---------------------|
| 🔴 FE-01 | Tom visual neon/gamer conflita com domínio de saúde emocional (SafeSpace/Diagnostico/SelfCare precisam acolher). | `index.css` (paleta neon); `SafeSpace.tsx` | **Alta** |
| 🔴 FE-02 | **SafeSpace fake** — confirma "publicado anonimamente" mas grava só em `useState` (some no refresh). | `SafeSpace.tsx:33-38` | **Alta** |
| 🔴 FE-03 | Mock data em produção em 5 páginas (parecem reais). ≡ SYS-08. | `mockData.ts` em `Dashboard/Community/Profile/Personalities/SafeSpace` | **Alta** |
| 🔴 FE-04 | Acessibilidade quase ausente (7 atributos a11y em 3 de 19 páginas) — risco de conformidade corporativa. | varredura `aria-*/role/alt` | **Alta** |
| FE-05 | Navegação não-semântica (`<button>`+navigate, sem `aria-current`/landmark). | `Layout.tsx:77-147` | Média |
| FE-06 | Menu mobile sem `aria-expanded`, focus-trap, `Esc` ou trava de scroll. | `Layout.tsx:64-102` | Média |
| FE-07 | Componente duplicado: feed anônimo em `Feed` (real) e `SafeSpace` (mock). | `Feed.tsx` vs `SafeSpace.tsx` | Média |
| FE-08 | Três sistemas de toast simultâneos (Toaster + Sonner + PointsToast). | `App.tsx:35-37` | Média |
| FE-09 | Skeletons/loading states ausentes (`skeleton` nunca usado). | `ui/skeleton.tsx`; `Feed.tsx:188` | Média |
| FE-10 | Erros de leitura falham silenciosamente (só `console.error`, lista vazia). | `Feed.tsx:49-53` | Média |
| FE-11 | Sem route guard central; proteção ad hoc por página. ≡ SYS-07 (contexto). | `App.tsx:39-59` vs `Feed.tsx:36-40` | Média |
| FE-12 | Design system em camada dupla (tokens Tailwind + classes `.glass-card/.neon-*` sem componente). | `index.css:82-147` | Média |
| FE-18 | Premium sem loop fechado (link externo + ativação manual, sem status no app). ≡ SYS-02. | `Premium.tsx:5,53` | Média |
| FE-13 | Boilerplate de layout focado duplicado (fundo+glow em 4 telas). | `Auth/Diagnostico/NovoProjeto/Premium` | Baixa |
| FE-14 | `NavLink.tsx` é componente morto (nunca importado). | `src/components/NavLink.tsx` | Baixa |
| FE-15 | `use-toast` duplicado em dois caminhos. | `hooks/use-toast.ts` e `ui/use-toast.ts` | Baixa |
| FE-16 | Sem light mode apesar de `darkMode:["class"]` declarado. | `tailwind.config.ts:4`; `index.css` | Baixa |
| FE-17 | Inconsistência de marca: UI diz "Iluminnados", produto é ILUMINNARE. | `Layout.tsx:62,108`; `Auth.tsx:93` | Baixa |

---

### 4. Matriz Preliminar
> **Estimativa preliminar do @architect** (a validar). Legenda:
> **Impacto** = Crítico / Alto / Médio / Baixo · **Esforço** = P (≤0,5d) / M (0,5–2d) / G (2–5d) / XG (>5d) · **Prioridade** = P0 (bloqueante) / P1 / P2 / P3.
> 🔴 = crítico/alto já sinalizado nas fases. Coluna "Ref." indica débito equivalente em outra fase.

| ID | Débito (resumo) | Área | Impacto | Esforço | Prioridade | Ref. cruzada |
|----|-----------------|------|---------|---------|------------|--------------|
| 🔴 **DBT-S01** | RLS UPDATE `profiles` sem WITH CHECK (bypass paywall/forja pontos) | DB | **Crítico** | M | **P0** | — |
| 🔴 FE-02 | SafeSpace finge persistir desabafo anônimo | UX | **Crítico** | M | **P0** | SYS-08/FE-03 |
| 🔴 DBT-S02 | `award_points` sem validar `_amount` | DB | Alto | M | **P0** | DBT-S01 |
| 🔴 DBT-S03 | Gating de gamificação burlável via UPDATE direto | DB | Alto | G | **P0** | DBT-S01 |
| 🔴 DBT-D01 | `conteudos.user_id` sem FK | DB | Alto | P | P1 | — |
| 🔴 DBT-D02 | `user_challenge_progress.user_id` sem FK | DB | Alto | P | P1 | — |
| 🔴 DBT-D03 | `user_stage_progress.user_id` sem FK | DB | Alto | P | P1 | — |
| 🔴 SYS-03 | Split-brain gamificação (2 sistemas) | Sistema | Alto | XG | P1 | DBT-D04/D06 |
| 🔴 SYS-04 | Estado gamificação em localStorage (fraudável) | Sistema | Alto | G | P1 | DBT-D04 |
| 🔴 SYS-08 | Mock data em produção (5 páginas) | Sistema | Alto | G | P1 | FE-03 |
| 🔴 FE-03 | Mock data — percepção de produto fake | UX | Alto | G | P1 | SYS-08 |
| 🔴 FE-01 | Tom visual neon vs saúde emocional | UX | Alto | G | P1 | — |
| 🔴 FE-04 | Acessibilidade quase ausente | UX | Alto | G | P1 | — |
| 🔴 SYS-06 | Feature social "fake" (tips localStorage) | Sistema | Alto | M | P1 | DBT-N01 |
| 🔴 DBT-N01 | Tips/likes/comments só em localStorage | DB | Médio | M | P1 | SYS-06 |
| 🔴 SYS-07 | God-context AuthContext (488 LOC) | Sistema | Alto | XG | P1 | FE-11 |
| 🔴 SYS-09 | Ausência de testes reais (~0% cobertura) | Sistema | Alto | XG | P1 | — |
| 🟠 SYS-02 | URL pagamento hardcoded | Sistema | Médio | P | P2 | FE-18 |
| 🟠 FE-18 | Premium sem loop fechado | UX | Médio | G | P2 | SYS-02 |
| SYS-01 | `.env` versionado (só chaves públicas) | Sistema | Médio | P | P2 | DBT-S04 |
| DBT-S04 | `.env` — sem service_role vazado | DB | Médio | P | P2 | SYS-01 |
| DBT-D04 | Split-brain de `profiles.points` (3 fontes) | DB | Médio | G | P1 | SYS-03/04 |
| DBT-P01 | Índice faltante `profiles.points` | DB | Médio | P | P2 | — |
| DBT-P02 | Feed refetch total no realtime | DB | Médio | M | P2 | FE-09 |
| DBT-P03 | Ranking refetch total no realtime | DB | Médio | M | P2 | DBT-P01 |
| SYS-05 | Código morto `getAllUsers()` | Sistema | Baixo | P | P3 | — |
| SYS-10 | TS/ESLint permissivos | Sistema | Médio | M | P2 | — |
| SYS-11 | Sem code-splitting | Sistema | Médio | M | P2 | — |
| SYS-12 | React Query subutilizado | Sistema | Médio | G | P2 | DBT-P02/P03 |
| SYS-13 | `client.ts` sem validar env vars | Sistema | Baixo | P | P3 | — |
| SYS-14 | Dois lockfiles | Sistema | Baixo | P | P3 | — |
| SYS-15 | README boilerplate | Sistema | Baixo | P | P3 | — |
| SYS-16 | Majors envelhecendo | Sistema | Baixo | G | P3 | — |
| DBT-S05 | `initialize_user_progress` sem checar caller | DB | Baixo | P | P3 | DBT-S02 |
| DBT-P04 | N+1 de escrita no NovoProjeto | DB | Baixo | M | P3 | — |
| DBT-D05 | Sem CHECK `points >= 0` | DB | Baixo | P | P2 | DBT-S02 |
| DBT-D06 | Regra de pontuação duplicada (DB vs client) | DB | Médio | M | P2 | SYS-03/DBT-D04 |
| DBT-M01 | Migrations com nomes UUID | DB | Baixo | P | P3 | — |
| DBT-M02 | Seed `stages` sem `ON CONFLICT` | DB | Baixo | P | P3 | — |
| DBT-C01 | `posts.content` sem limite no DB | DB | Baixo | P | P3 | — |
| FE-05 | Navegação não-semântica | UX | Médio | M | P2 | FE-04 |
| FE-06 | Menu mobile sem a11y | UX | Médio | M | P2 | FE-04 |
| FE-07 | Componente duplicado Feed/SafeSpace | UX | Médio | M | P1 | FE-02 |
| FE-08 | Três sistemas de toast | UX | Médio | M | P2 | FE-15 |
| FE-09 | Skeletons/loading ausentes | UX | Médio | M | P2 | DBT-P02 |
| FE-10 | Erros falham silenciosamente | UX | Médio | M | P2 | — |
| FE-11 | Sem route guard central | UX | Médio | M | P1 | SYS-07/DBT-S01 |
| FE-12 | Design system em camada dupla | UX | Médio | G | P2 | FE-01 |
| FE-13 | Boilerplate layout focado duplicado | UX | Baixo | M | P3 | — |
| FE-14 | `NavLink.tsx` código morto | UX | Baixo | P | P3 | SYS-05 |
| FE-15 | `use-toast` duplicado | UX | Baixo | P | P3 | FE-08 |
| FE-16 | Sem light mode | UX | Baixo | M | P3 | FE-01 |
| FE-17 | Inconsistência de marca "Iluminnados" | UX | Baixo | P | P3 | SYS-15 |

**Distribuição preliminar por prioridade:** P0 = 4 · P1 = 15 · P2 = 20 · P3 = 14 (total 53).

> **Observação de arquitetura (trade-off):** os P0 de segurança (DBT-S01/S02/S03) e o FE-02 (SafeSpace) têm esforço **M/G individual**, mas **não podem ser corrigidos isoladamente sem regressão**. A correção correta de DBT-S01 exige mover mutação de `plan`/`points` para RPCs SECURITY DEFINER (DBT-S02/S03) e reconciliar o split-brain de pontos (SYS-03/04/DBT-D04) — caso contrário, "endurecer" a RLS quebra o caminho legado que escreve pontos via `.update()` no client (`AuthContext.saveUser`). **Esse acoplamento é a decisão arquitetural central da Fase 8** e precisa de sequenciamento, não de fixes pontuais.

---

### 5. Perguntas para Especialistas

#### Para @data-engineer (Dara) — Fase 5
1. 🔴 **DBT-S01 (crítico):** qual o esforço real para restringir o UPDATE de `profiles` **sem quebrar o freemium**? Das 3 opções que você propôs (a: `GRANT UPDATE (display_name, avatar_url)`; b: trigger `BEFORE UPDATE`; c: `plan`/`points` só via RPC DEFINER), qual minimiza regressão no caminho legado do client (`AuthContext.saveUser().update({points})`)? Recomenda migração faseada ou big-bang?
2. **Padrão sistêmico:** DBT-S01 é a única policy sem `WITH CHECK`, ou **há outras tabelas com o mesmo padrão** (INSERT/UPDATE own sem CHECK)? Ex.: `posts`, `personality_notes`, `psi_*` — precisamos de uma varredura completa antes de fechar o assessment?
3. **DBT-S02/S03:** mover concessão de pontos e conclusão de progresso para RPCs validadas (modelo `complete_user_challenge`) — esforço por RPC e quantas RPCs novas? A tabela de regras de `_amount` (derivar server-side) já existe parcialmente em `stage_challenges.points`?
4. **DBT-D01/02/03:** antes de adicionar as 3 FKs `ON DELETE CASCADE`, **há órfãos existentes em produção** que a migração corretiva quebraria? Precisa de script de limpeza prévio?
5. **DBT-P01/P02/P03:** o índice `idx_profiles_points` resolve o Ranking, mas o refetch total no realtime (P02/P03) é débito de DB ou de frontend (query pattern)? Onde você traça a fronteira de ownership com a Fase 6?
6. **DBT-D04:** ao eleger `profiles.points` como fonte única, há risco de perda dos pontos hoje presos em localStorage de usuários ativos? Precisa de estratégia de reconciliação/backfill?

#### Para @ux-design-expert (Uma) — Fase 6
1. 🔴 **FE-01 (tom visual):** reformular o tom das telas de saúde emocional (SafeSpace/Diagnostico/SelfCare) é **retrabalho de design system** (novo conjunto de tokens/"modo acolhimento") ou **ajuste pontual de paleta**? Sua recomendação sugeria duas rotas (modo acolhimento localizado vs. re-paleta global) — qual tem menor esforço/risco preservando a gamificação nas áreas de desafio/ranking?
2. 🔴 **FE-02 (SafeSpace fake):** o esforço de "persistir de verdade" o SafeSpace é majoritariamente **backend** (ligar ao mesmo destino do Feed) ou há trabalho de UX relevante (anonimização real, moderação, empty/error states)? Isso deve ser um `<PostFeed>` compartilhado (FE-07) desde já?
3. **FE-04 (a11y):** o baseline de acessibilidade é **retrofit incremental por página** ou exige refatorar `Layout.tsx` (nav semântica) primeiro como dependência? Qual o esforço para atingir AA nas 15 páginas sem atributos?
4. **FE-12 (design system duplo):** transformar `.glass-card/.neon-*` em componentes governados e adotar `Card/Sidebar/Avatar` do shadcn — isso conflita ou converge com a repaginação de tom (FE-01)? Devem ser feitos juntos para evitar retrabalho?
5. **FE-07:** extrair `<PostFeed>`/`<PostComposer>` compartilhado entre Feed e SafeSpace — você estima esforço médio? Há divergências de comportamento (anônimo vs. identificado) que impeçam a unificação total?
6. **Sequenciamento:** dos débitos UX P1, qual ordem minimiza retrabalho — tom visual (FE-01) antes ou depois de consolidar componentes (FE-07/FE-12)?

---

### 6. Próximos Passos (Brownfield)
- **Fase 5** — @data-engineer revisa §2 e responde §5, produz `db-specialist-review.md`.
- **Fase 6** — @ux-design-expert revisa §3 e responde §5, produz `ux-specialist-review.md`.
- **Fase 7** — @qa aplica QA Gate (APPROVED | NEEDS WORK) sobre este DRAFT + revisões.
- **Fase 8** — @architect consolida `technical-debt-assessment.md` final (com esforços validados e sequenciamento do acoplamento segurança↔gamificação).

---
*DRAFT gerado por Aria (@architect) — AIOX Brownfield Discovery FASE 4. Rastreabilidade total preservada: nenhum débito inventado, nenhum ID fundido ou removido. Estimativas de impacto/esforço/prioridade são preliminares e sujeitas à validação dos especialistas.*
