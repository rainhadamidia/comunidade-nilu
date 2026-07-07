# Technical Debt Assessment - FINAL

> **Documento:** Brownfield Discovery — FASE 8 (Assessment Final Consolidado)
> **Autor:** Aria (@architect — AIOX) · Consolida Fases 4–7
> **Data:** 2026-07-04
> **Produto:** ILUMINNARE — SaaS de saúde emocional corporativa (B2B · IA + gamificação + mentoria)
> **App:** `comunidade-nilu` (React + Vite + TypeScript + shadcn-ui + Tailwind + Supabase)
> **Deploy:** https://comunidade-nilu.vercel.app/
> **Status:** FINAL — incorpora validação de @data-engineer (Fase 5), @ux-design-expert (Fase 6) e os gaps/fricções do QA Gate (Fase 7). Substitui o DRAFT como fonte de verdade.
> **Gate de origem:** QA (Fase 7) = *NEEDS WORK* com nota explícita "uma rodada de consolidação resolve" — esta é essa rodada.

---

## Executive Summary

- **Total de débitos: 65** (53 do DRAFT + 3 de DB + 3 de UX + 6 de Governança/QA).
- **Distribuição por prioridade:** **P0 = 7** · **P1 = 22** · **P2 = 20** · **P3 = 16**.
- **Severidade "Crítica" formal:** 3 (DBT-S01, FE-02, GOV-L01) — todas no lote de release inicial.
- **Esforço total estimado: ~480 horas** (faixa **430–540h**) de dev pleno/sênior + **~12–16h de apoio de design**.
- **Caminho crítico (subconjunto P0 até produção): ~90–130h** — segurança RLS/RPC + SafeSpace persistido com modelo LGPD + suíte de testes de impersonação como gate.

**Tese de arquitetura da Fase 8 (o achado central):** os P0 de segurança **não podem ser corrigidos isoladamente**. A cadeia de dependência é:

```
mover escritas de pontos/gating para RPC (Lote 1)
   → SÓ ENTÃO endurecer a RLS (Lote 2)
   → SEM QUEBRAR a ativação premium manual (precisa de set_user_plan admin no MESMO lote)
   → E a persistência do SafeSpace precede o deploy do FE-02 (cria dado sensível → precede modelo LGPD)
```

Endurecer a RLS antes de mover as escritas para RPC **derruba produção**; persistir o SafeSpace antes do modelo LGPD **cria passivo jurídico no exato commit da correção**. O sequenciamento abaixo resolve as duas armadilhas.

**Correção técnica herdada da Fase 5 (crucial):** o fix do DBT-S01 **não é** "adicionar `WITH CHECK`" — em `FOR UPDATE`, `WITH CHECK` omitido já equivale ao `USING` (no-op). O fix real é **column-level** (`REVOKE`/`GRANT (colunas seguras)`) + **trigger** + **RPC `SECURITY DEFINER`**. Toda a Fase 8 desenha a migração a partir dessa correção.

---

## Inventário Completo de Débitos

> Rastreabilidade total preservada (Constituição AIOX, Art. IV — No Invention): nenhum ID foi fundido, removido ou inventado. Severidades/esforços refletem a **validação dos especialistas**. Horas de DB e UX são as validadas nas Fases 5–6; horas de Sistema e Governança são estimativa consolidada do @architect nesta fase.

### Sistema (validado por @architect — Fase 1, reconciliado)

| ID | Débito | Severidade | Esforço | Prio | Ref. cruzada |
|----|--------|-----------|---------|------|--------------|
| SYS-01 | `.env` versionado (só chaves públicas) | Média | ~0,5h | P2 | ≡ DBT-S04 |
| SYS-02 | URL pagamento InfinitePay hardcoded | Média | 2–4h | P2 | ≡ FE-18 |
| SYS-03 | Split-brain gamificação (POINTS localStorage vs NEURAL_COINS RPC) | Alta | XG (client) | P1 | DBT-D04/D06; ver Lote 1/5 |
| SYS-04 | Estado gamificação em localStorage (fraudável) | Alta | 16–40h | P1 | DBT-D04; Lote 1 (recorte) |
| SYS-05 | Código morto `getAllUsers()` | Baixo | ~1h | P3 | FE-14 |
| SYS-06 | Feature social "fake" (tips localStorage) | Alta | M | P1 | ≡ DBT-N01 |
| SYS-07 | God-context `AuthContext` (488 LOC, 18 métodos, 20 consumidores) | Alta | XG (40h+) | P1 | FE-11; **recorte cirúrgico no Lote 1** |
| SYS-08 | Mock data em produção (5 páginas) | Alta | G | P1 | ≡ FE-03 |
| SYS-09 | Ausência de testes reais (~0% cobertura) | Alta | XG | P1 | **absorvido em parte por QA-T01** |
| SYS-10 | TS/ESLint permissivos (`strict:false`) | Média | 4–8h | P2 | QA-T01 (gate CI) |
| SYS-11 | Sem code-splitting (18 páginas eager) | Média | ~8h | P2 | — |
| SYS-12 | React Query subutilizado (fetch manual em `useEffect`) | Média | 16–24h | P2 | DBT-P02/P03 |
| SYS-13 | `client.ts` sem validar env vars | Baixo | ~2h | P3 | — |
| SYS-14 | Dois lockfiles (`bun.lockb` + `package-lock.json`) | Baixo | ~1h | P3 | — |
| SYS-15 | README boilerplate Lovable | Baixo | ~1h | P3 | — |
| SYS-16 | Majors de build envelhecendo (Vite 5/Tailwind 3/Zod 3/rr6) | Baixo | 16–24h | P3 | — |

### Database (validado por @data-engineer — Fase 5)

| ID | Débito | Severidade | Horas | Prio | Notas Dara |
|----|--------|-----------|-------|------|------------|
| **DBT-S01** | UPDATE `profiles` sem restrição de **coluna** → auto-promoção `premium` + forja `points` | **Crítica** | 4–6h | **P0** | Fix = column GRANT + trigger, **não** WITH CHECK. Faseado (client→migração). |
| **DBT-S02** | `award_points` não valida `_amount` (client controla) | Alta | 4–6h | **P0** | Derivar pontos server-side; absorve DBT-D06. |
| **DBT-S03** | Gating de gamificação burlável via UPDATE direto em `user_*_progress` | Alta | 2–3h | **P0** | Regressão ~zero (client nunca faz `.update()` nessas tabelas). DROP policies. |
| **DBT-S06** *(novo, Fase 5)* | **Subsistema PSI sem gating server-side** — destranca semanas, forja conclusões, burla "1 PSI ativo". Pior que S03 (nem RPC tem). | Alta | 8–12h | **P0** | 2 RPCs novas: `complete_psi_task`, `create_psi_project` (absorve DBT-P04). |
| **DBT-D01** | `conteudos.user_id` sem FK → `auth.users` | Alta | *incl. D01–D03* | P1 | FK via `NOT VALID`→checar órfãos→`VALIDATE`. |
| **DBT-D02** | `user_challenge_progress.user_id` sem FK | Alta | 3–5h (as 3) | P1 | Idem. |
| **DBT-D03** | `user_stage_progress.user_id` sem FK | Alta | *incl.* | P1 | Idem. |
| **DBT-D04** | Split-brain de `profiles.points` (RPC + `.update()` + localStorage) | Média | 4–6h | P1 | Grosso é frontend (SYS-04); reconciliação só client-side. |
| **DBT-P01** | Índice faltante em `profiles.points` | Média | 0,5h | P2 | `CREATE INDEX idx_profiles_points`. Entrega imediata. |
| **DBT-P02** | Feed refetch total no realtime | Baixa (DB) | 1–1,5h | P2 | Rebaixado: é query pattern de **frontend**. DB só oferece keyset/RPC. |
| **DBT-P03** | Ranking refetch total a cada UPDATE de `profiles` | Baixa (DB) | 1–1,5h | P2 | Idem. Refetch incremental = Fase 6/frontend. |
| **DBT-S04** | `.env` versionado (só chaves públicas) | Média | 0,5h | P2 | `git rm --cached` + rotacionar publishable key. ≡ SYS-01. |
| **DBT-S05** | `initialize_user_progress` não checa `auth.uid()` | Baixa | 1h | P3 | Idempotente. Usar `auth.uid()` interno. |
| **DBT-P04** | N+1 de escrita no NovoProjeto (4 semanas em loop) | Baixa | 2–3h | P3 | **Absorvido** por `create_psi_project` (S06). |
| **DBT-D05** | Sem CHECK `points >= 0` | Baixa | 0,5–1h | P2 | Combina com S02. |
| **DBT-D06** | Regra de pontuação duplicada (DB seed vs client) | Média | *incl. S02* | P2 | Fecha ao derivar pontos server-side. |
| **DBT-M01** | Migrations com nomes UUID (export Lovable) | Baixa | 1h | P3 | Não renomear; documentar mapa `m#`→arquivo. |
| **DBT-M02** | Seed `stages` sem `ON CONFLICT` (não idempotente) | Baixa | 0,5–1h | P3 | Estender a `stage_challenges` e backfill. |
| **DBT-C01** | `posts.content` sem limite no DB | Baixa | 0,5–1h | P3 | `CHECK char_length<=500`. Estender a `conteudos`/`psi_*`. |
| **DBT-N01** | Tips/likes/comments só em localStorage | Baixa (DB) | 3–5h | P1 (feature) | Padrão já validado em `personality_notes`. Porta de SYS-06. **Puxado p/ Lote 1 (ver Decisão 2).** |
| **DBT-S07** *(novo, Fase 5)* | **"UPDATE só com USING" é sistêmico** — toda policy FOR UPDATE de user omite WITH CHECK. Risco concentra onde há coluna privilegiada (já em S01/S03/S06). | Média | 1–2h | P2 | Item de governança: varredura + lint de policies. |
| **DBT-M03** *(novo, Fase 5)* | `bootstrap_full_schema.sql` paralelo às migrations → risco de divergência | Baixa | 1–2h | P3 | Nota de propósito + check de paridade. |

### Frontend/UX (validado por @ux-design-expert — Fase 6)

| ID | Débito | Severidade | Horas | Prio UX | Prio final |
|----|--------|-----------|-------|---------|-----------|
| **FE-02** | SafeSpace finge persistir desabafo anônimo (só `useState`) | **Crítica** | 8–16h (+backend) | U0 | **P0** |
| FE-01 | Tom visual neon/gamer vs. saúde emocional | Alta | 16–28h `[+D 6–8h]` | U0 | P1 |
| FE-03 | Mock data em produção em 5 páginas (≡ SYS-08) | Alta | 20–32h | U0 | P1 |
| FE-04 | Acessibilidade quase ausente (7 attrs em 3/19 páginas) | Alta | 24–40h (Layout ~8–12h) | U1 | P1 |
| FE-07 | Componente duplicado Feed (real) vs SafeSpace (mock) | Média | 8–12h | U2 | P1 (pré-req FE-02) |
| FE-11 | Sem route guard central | Média-alta | 3–5h | U1/U2 | P1 |
| FE-18 | Premium sem loop fechado (≡ SYS-02) | Média | 8–16h (+webhook) | U0/U2 | P1 |
| **FE-19** *(novo, Fase 6)* | **Ausência de rede de crise nas telas sensíveis** (CVV 188, RH/psi, escalada). Dever de cuidado. | Alta | 6–12h `[+D/legal]` | U0 | P1 |
| **FE-21** *(novo, Fase 6)* | **Onboarding longo antes do "aha"** (Auth→20 perguntas→Projeto→Dashboard) | Média | 8–16h `[+D]` | U0 | P1 |
| FE-05 | Navegação não-semântica | Média | 4–6h (~70% no Layout) | U1 | P2 |
| FE-06 | Menu mobile sem a11y (usar `Sheet` shadcn) | Média | 4–6h | U1 | P2 |
| FE-08 | Três sistemas de toast simultâneos | Média | 3–5h | U2 | P2 |
| FE-09 | Skeletons/loading ausentes | Média | 6–10h | U2 | P2 |
| FE-10 | Erros de leitura falham silenciosamente | Média-alta | 4–8h | U1 | P2 |
| FE-12 | Design system em camada dupla (`.glass-card/.neon-*`) | Média | 16–24h | U2 (habilitador FE-01) | P2 |
| **FE-20** *(novo, Fase 6)* | **Sem `prefers-reduced-motion`** (WCAG 2.3.3/2.2.2; público sensível) | Média | 3–6h | U1 | P2 |
| FE-13 | Boilerplate de layout focado duplicado | Baixa | 2–4h | U3 | P3 |
| FE-14 | `NavLink.tsx` código morto | Baixa | 0,5–1h | U3 | P3 |
| FE-15 | `use-toast` duplicado | Baixa | 1–2h | U3 | P3 |
| FE-16 | Sem light mode (adiar até FE-01 definir paleta) | Baixa | 8–16h | U3 | P3 |
| FE-17 | Inconsistência de marca "Iluminnados"→ILUMINNARE | Baixa | 0,5–1h | U3 | P3 |

### Governança/QA (novos — validado por @qa, catalogados na Fase 8)

> Derivados da evidência já documentada nas Fases 1–6 + domínio do produto (saúde mental B2B). Formalizados aqui com ID, esforço e prioridade (a criação formal é papel da Fase 8 — Art. IV respeitado).

| ID | Débito | Severidade | Esforço | Prio | Racional de domínio |
|----|--------|-----------|---------|------|---------------------|
| **GOV-L01** | **LGPD / dado sensível de saúde.** Corrigir FE-02 persiste desabafo → dado sensível (LGPD Art. 5º, II). "Anônimo" client-side com `user_id` = pseudonimização (reidentificável), não anonimização. Falta: base legal/consentimento, minimização, retenção/expurgo, direito ao apagamento, cláusula operador↔controlador no contrato B2B. | **Crítica** | 16–30h | **P0** | **Precede o deploy do FE-02.** Modelo de dados deve **desacoplar autor de conteúdo**. |
| **QA-T01** | **Estratégia de testes + gate de CI ausentes.** Sem suíte de impersonação (`test-as-user`), E2E de paywall, nem pipeline `typecheck/lint/test`. Vulnerabilidade DBT-S01/S02/S03/S06 é **ativa**. | Alta | 16–30h | **P0** | **Gate de release** dos Lotes 1–2. Absorve a dimensão de processo de SYS-09/SYS-10. |
| **SEC-P01** | **Verificação dinâmica ausente.** Falta `get_advisors(security)`, confirmar RLS *enabled* em todas as tabelas, checar ausência de `service_role` no bundle, lint de policies (executar o DBT-S07). | Média-alta | 4–8h | P1 | Estático não pega policy off/RLS off/chave em runtime. Artefato antes de fechar Lote 2. |
| **OBS-A01** | **Sem observabilidade nem audit trail.** Sem Sentry/log estruturado; e — crítico pós-DBT-S01 — **sem auditoria de mudança de `plan`/`points`**. | Média | 8–16h | P1 | Sem audit log, bypass residual é indetectável; compliance B2B exige trilha. |
| **MOD-C01** | **Sem moderação server-side nem rate limiting.** Filtro de conteúdo, denúncia persistida, rate limit em `posts`/`award_points`/SafeSpace. Risco de auto-lesão/assédio/spam. | Média | 12–24h | P1 | Par de backend do FE-19 (dever de cuidado) + anti-abuso. Reforça GOV-L01. |
| **BKP-D01** | **Sem backup/PITR/retenção** do banco que passará a guardar dado sensível. | Baixa-média | 2–4h | P2 | Perder desabafos = dano reputacional + obrigação de retenção. |

**Menores (registrados, não bloqueiam):** sem `npm audit`/varredura de CVE (SYS-16 cobre só idade); sem axe/Lighthouse CI como teste automatizado de contraste (objetivaria FE-04) — endereçados como casos de teste em QA-T01/FE-20.

---

## Decisões de Resequenciamento Cross-Team

> Duas fricções cross-team que o QA (Fase 7) identificou e delegou explicitamente à Fase 8. Registradas como decisões arquiteturais (ADR-style) porque alteram a ordem de execução validada pelos especialistas.

### ADR-08.1 — Caminho admin/RPC de upgrade de plano no MESMO lote do endurecimento da RLS

**Contexto:** hoje o Premium é ativado **manualmente** (SYS-02/FE-18, sem webhook) — na prática, alguém seta `plan='premium'` via UPDATE direto. O fix do DBT-S01 (Lote 2: `REVOKE UPDATE` + trigger de `plan`) **remove esse caminho**. Sem um substituto sancionado, o Lote 2 quebra a única forma de ativar premium que existe.

**Decisão:** criar `set_user_plan(_user_id uuid, _plan text)` **`SECURITY DEFINER` restrita a admin** (`has_role(auth.uid(),'admin')`), incluída **no mesmo lote** do endurecimento (Lote 1 para a RPC existir, ativa no Lote 2 quando o UPDATE direto é revogado). Futuramente amarrada ao webhook do FE-18.

**Justificativa:** upgrade de plano é ato de admin/pagamento, não de self-service. Mover para RPC DEFINER é a política de escrita sancionada (casa com DBT-S02) e fecha o vetor de auto-promoção sem interromper a operação comercial. **Não pode ser "depois" — tem de sair no mesmo lote de correção**, senão há janela de premium inativável em produção.

**Impacto na matriz:** adiciona ~2–4h ao Lote 1; vira caso de teste positivo obrigatório em QA-T01 ("upgrade pelo caminho admin → OK").

### ADR-08.2 — Puxar a fundação de dados do SafeSpace (tabela + RPC + modelo LGPD) para o Lote 1 (P0)

**Contexto:** a UX (Fase 6) prioriza a persistência real do SafeSpace como **U0** (confiança/adesão — a alavanca comercial do contrato B2B). O plano original da DB (Fase 5) agendava a fundação social (DBT-N01) para o **Bloco 6 (último)**. Conflito de sequenciamento real: o item de maior risco de confiança depende de uma fundação agendada por último. Somando: corrigir FE-02 **cria dado sensível de saúde** (GOV-L01) no exato commit — o modelo LGPD tem de existir **antes** da persistência.

**Decisão:** puxar a fundação de dados do SafeSpace — **tabela + RPC de publicação anônima + modelo LGPD do GOV-L01** (autor **desacoplado** do conteúdo, base legal, retenção/expurgo, apagamento) — do Bloco 6 para o **Lote 1 (P0)**, junto da fundação server-side de pontos/gating. Segue o padrão `personality_notes` já validado (migrou "Salvar no perfil" de `useState`→DB).

**Justificativa:** (1) é pré-requisito do item de maior risco de confiança do produto; (2) evita construir um SafeSpace descartável (nasce sobre `<PostFeed>` compartilhado — FE-07); (3) impede o passivo LGPD de ser criado sem base legal. **Interim honesto obrigatório:** enquanto o Lote 1 não sobe, o botão do SafeSpace reflete o estado verdadeiro ("em breve"/desabilitado) — mentir persistência é pior que não ter (recomendação da Uma, ratificada). **Nada é persistido até o modelo LGPD estar pronto.**

**Impacto na matriz:** DBT-N01 (parte DB) e o backend de FE-02 sobem para P0/Lote 1; a camada UX de FE-02 (8–16h) permanece P0 mas **depende** do backend do Lote 1; GOV-L01 é gate de deploy do FE-02.

---

## Matriz de Priorização Final

**Legenda:** Prioridade **P0** (bloqueante/release gate) · **P1** (alto) · **P2** (médio) · **P3** (higiene). Área: SYS/DB/UX/GOV.

### P0 — 7 débitos (release gate, caminho crítico ~90–130h)

| ID | Débito | Área | Esforço | Depende de / Gate |
|----|--------|------|---------|-------------------|
| DBT-S02 | `award_points` sem validar `_amount` | DB | 4–6h | Base de tudo (deriva pontos server-side) |
| DBT-S06 | PSI sem gating server-side | DB | 8–12h | RPCs `complete_psi_task`/`create_psi_project` |
| DBT-S03 | Gating burlável via UPDATE direto | DB | 2–3h | Após RPCs existirem |
| DBT-S01 | UPDATE `profiles` sem restrição de coluna | DB | 4–6h | **Lote 2, só após Lote 1 em prod** + `set_user_plan` (ADR-08.1) |
| GOV-L01 | LGPD / dado sensível de saúde | GOV | 16–30h | **Precede** FE-02 |
| FE-02 | SafeSpace fake → persistência real | UX | 8–16h +backend | Backend SafeSpace (Lote 1, ADR-08.2) + GOV-L01 |
| QA-T01 | Suíte de impersonação + gate de CI | GOV | 16–30h | **Verde antes de Lotes 1–2 tocarem prod** |

### P1 — 22 débitos (alto)

| ID | Débito | Área | Esforço |
|----|--------|------|---------|
| DBT-D01/D02/D03 | 3 FKs `ON DELETE CASCADE` | DB | 3–5h |
| DBT-D04 | Split-brain `profiles.points` (reconciliação) | DB | 4–6h |
| DBT-N01 | Persistência social (tabelas tips/likes/comments) | DB | 3–5h |
| SYS-03 | Split-brain gamificação (resolução completa) | SYS | XG |
| SYS-04 | Estado gamificação em localStorage | SYS | 16–40h |
| SYS-06 | Feature social "fake" | SYS | M |
| SYS-07 | God-context AuthContext (refactor completo) | SYS | 40h+ |
| SYS-08 | Mock data em produção | SYS | G |
| SYS-09 | Cobertura de testes (build-out) | SYS | XG |
| FE-01 | Tom visual "modo acolhimento" | UX | 16–28h `[+D]` |
| FE-03 | Mock → dados reais | UX | 20–32h |
| FE-04 | Acessibilidade AA (Layout-first) | UX | 24–40h |
| FE-07 | `<PostFeed>`/`<PostComposer>` compartilhado | UX | 8–12h |
| FE-11 | Route guard central | UX | 3–5h |
| FE-18 | Premium loop fechado (+webhook) | UX | 8–16h |
| FE-19 | Rede de crise nas telas sensíveis | UX | 6–12h `[+D]` |
| FE-21 | Onboarding encurtado | UX | 8–16h `[+D]` |
| SEC-P01 | Pentest dinâmico / advisors Supabase | GOV | 4–8h |
| OBS-A01 | Audit log de `plan`/`points` + Sentry | GOV | 8–16h |
| MOD-C01 | Moderação server-side + rate limiting | GOV | 12–24h |

### P2 — 20 débitos (médio)

| ID | Débito | Área | Esforço |
|----|--------|------|---------|
| DBT-P01 | Índice `idx_profiles_points` | DB | 0,5h |
| DBT-P02/P03 | Superfície de acesso (índice + RPC leaderboard) | DB | 1–1,5h |
| DBT-S04 | `.env` versionado (rm cached + rotate) | DB | 0,5h |
| DBT-D05 | CHECK `points >= 0` | DB | 0,5–1h |
| DBT-D06 | Regra de pontuação duplicada | DB | incl. S02 |
| DBT-S07 | Lint/varredura de policies RLS | DB | 1–2h |
| SYS-01 | `.env` (dimensão sistema) | SYS | 0,5h |
| SYS-02 | URL pagamento hardcoded | SYS | 2–4h |
| SYS-10 | TS/ESLint permissivos | SYS | 4–8h |
| SYS-11 | Code-splitting (`React.lazy`) | SYS | ~8h |
| SYS-12 | React Query (cache/dedupe/retry) | SYS | 16–24h |
| FE-05 | Navegação semântica | UX | 4–6h |
| FE-06 | Menu mobile acessível (`Sheet`) | UX | 4–6h |
| FE-08 | Consolidar toast único | UX | 3–5h |
| FE-09 | Skeletons/loading reais | UX | 6–10h |
| FE-10 | Erros visíveis com recuperação | UX | 4–8h |
| FE-12 | Componentes governados (design system) | UX | 16–24h |
| FE-20 | `prefers-reduced-motion` | UX | 3–6h |
| BKP-D01 | Backup/PITR/retenção | GOV | 2–4h |

### P3 — 16 débitos (higiene / baixo risco)

| ID | Débito | Área | Esforço |
|----|--------|------|---------|
| DBT-S05 | `initialize_user_progress` caller check | DB | 1h |
| DBT-P04 | N+1 NovoProjeto (absorvido por S06) | DB | — |
| DBT-M01 | Documentar mapa de migrations | DB | 1h |
| DBT-M02 | `ON CONFLICT` nos seeds | DB | 0,5–1h |
| DBT-M03 | Paridade `bootstrap_full_schema.sql` | DB | 1–2h |
| DBT-C01 | CHECK tamanho `posts.content` | DB | 0,5–1h |
| SYS-05 | Código morto `getAllUsers()` | SYS | 1h |
| SYS-13 | `client.ts` valida env vars | SYS | 2h |
| SYS-14 | Unificar lockfile | SYS | 1h |
| SYS-15 | README customizado | SYS | 1h |
| SYS-16 | Majors de build (upgrade) | SYS | 16–24h |
| FE-13 | `FocusLayout`/`AuthLayout` | UX | 2–4h |
| FE-14 | Remover `NavLink` morto | UX | 0,5–1h |
| FE-15 | `use-toast` duplicado | UX | 1–2h |
| FE-16 | Light mode (adiado) | UX | 8–16h |
| FE-17 | Corrigir marca "Iluminnados" | UX | 0,5–1h |

**Distribuição final por prioridade:** **P0 = 7 · P1 = 22 · P2 = 20 · P3 = 16 · (total 65).**

---

## Plano de Resolução

> Ordem por **lotes de dependência** (não só por prioridade). Reflete as duas decisões de resequenciamento (ADR-08.1 e ADR-08.2). Regra de ouro herdada da Fase 5: **RPCs antes de endurecer RLS**; da Fase 7: **modelo LGPD antes de persistir SafeSpace**; **suíte de segurança verde antes de qualquer migração dos Lotes 1–2 tocar produção**.

### Lote 0 — Pré-requisitos e fundação de governança (paralelo, ~10–18h)
- **DBT-S04 / SYS-01:** `git rm --cached .env` + `.gitignore` + rotacionar publishable key. (~1h, independente)
- **QA-T01 (setup):** pipeline de CI (`typecheck` + `lint` + `test` bloqueando merge) + esqueleto da suíte de impersonação (`test-as-user`). Habilitador de todo o resto.
- **GOV-L01 (design):** desenhar o modelo de dados LGPD do SafeSpace — **autor desacoplado de conteúdo**, base legal/consentimento, política de retenção/expurgo, fluxo de apagamento. **Bloqueia o Lote 1 de persistir qualquer coisa.**
- **Interim honesto (UX):** botão SafeSpace em "em breve"/desabilitado até o Lote 1 subir.

### Lote 1 — Fundação server-side + SafeSpace persistido + LGPD (P0, ~40–65h) — destrava o endurecimento sem regressão
1. **DBT-S02 + DBT-D06:** `complete_user_challenge` concede pontos derivados de `stage_challenges.points`; `award_points` endurecido. (4–6h)
2. **DBT-S06:** criar `complete_psi_task` + `create_psi_project` transacional (absorve DBT-P04). (8–12h)
3. **SafeSpace backend (DBT-N01 core + FE-02 backend, ADR-08.2):** tabela + RPC de publicação anônima **já sobre o modelo LGPD do GOV-L01** (sem `user_id` reidentificável exposto). (~6–10h)
4. **`set_user_plan(admin)` DEFINER (ADR-08.1):** caminho sancionado de upgrade de plano. (2–4h)
5. **Client — Fase A (recorte cirúrgico):** extrair as escritas diretas de pontos do `AuthContext` (`saveUser().update({points})`) e de `MeuProjeto.tsx` para as RPCs; reconciliação one-shot de localStorage **só após S02 endurecido**. **Não** exige o refactor completo de SYS-07 (isso é Lote 5). (recorte ~8–16h)
6. **Deploy do Lote 1.** App continua funcionando com a RLS **atual**.
- **GATE:** suíte de impersonação (QA-T01) verde **antes** do Lote 2.

### Lote 2 — Endurecimento da RLS (P0, ~10–14h) — SÓ após Lote 1 em produção
1. **DBT-S01:** `REVOKE UPDATE ON profiles` + `GRANT UPDATE (display_name, avatar_url)` + trigger de `plan` (só admin/`set_user_plan`). (4–6h)
2. **DBT-S03 + DBT-S06 (parte RLS):** DROP das policies "Users update own" de `user_*_progress` e `psi_weeks`/`psi_tasks`/`psi_projects` (tudo já passa por RPC). (2–3h)
3. **DBT-S07 + SEC-P01:** lint/varredura de policies + `get_advisors(security)` + confirmar RLS *enabled* em todas as tabelas + ausência de `service_role` no bundle → **entregar como artefato**. (5–10h)
- **GATE:** testes negativos (auto-promoção/forja) rejeitados **e** positivos (display_name, upgrade admin, conclusão legítima) OK.

### Lote 3 — Integridade de dados + auditoria (P1, ~15–27h)
1. **DBT-D01/D02/D03:** 3 FKs via `NOT VALID` → detectar/limpar órfãos → `VALIDATE`. (3–5h)
2. **DBT-D05:** CHECK `points >= 0`. (0,5–1h)
3. **DBT-D04:** finalizar reconciliação e eleger `profiles.points` fonte única. (4–6h)
4. **OBS-A01:** audit log de `plan`/`points` (pós-RPC) + instrumentação de erros (Sentry/log estruturado). (8–16h)

### Lote 4 — UX confiança/adesão + acessibilidade + moderação (P1, ~110–150h) — pode iniciar em paralelo ao Lote 3
> Ordem UX anti-retrabalho (Fase 6): governar componentes → tema → dados; a11y Layout-first em paralelo desde o início.
1. **FE-12** (governar `.glass-card/.neon-*` em componentes shadcn) → **FE-01** (tema "acolhimento" como variante) → **FE-02 + FE-03** (dados reais, remove mock, conecta o SafeSpace backend do Lote 1). (~60–90h)
2. **FE-07** (`<PostFeed>` compartilhado — pré-req de FE-02). (8–12h)
3. **FE-19** (rede de crise) + **FE-21** (onboarding encurtado). (14–28h)
4. **MOD-C01** (moderação server-side + rate limiting) — par de backend do SafeSpace/FE-19. (12–24h)
5. **a11y Layout-first em PARALELO:** FE-04 (refactor `Layout.tsx`) resolve FE-05/FE-06 de uma vez; **FE-20** (`prefers-reduced-motion`) no mesmo lote. (~30–52h)
6. **FE-18 + webhook Premium** (fecha o loop; casa com `set_user_plan`). (8–16h)

### Lote 5 — Sistema/qualidade estrutural (P1/P2, ~90–120h)
- **SYS-03/SYS-04** (resolução completa do split-brain de gamificação) e **SYS-07** (refactor completo do god-context — agora **sem pressão de P0**).
- **SYS-09 / QA-T01 (build-out):** ampliar cobertura de testes sobre o núcleo estabilizado.
- **SYS-10/SYS-11/SYS-12**, **FE-08/FE-09/FE-10/FE-11**.

### Lote 6 — Performance, DR e higiene (P2/P3, ~40–60h)
- **Performance:** DBT-P01 (índice, entrega imediata), DBT-P02/P03 (frontend: refetch incremental + debounce), SYS-16 (upgrade de majors).
- **DR (obrigatório com dado sensível persistido):** **BKP-D01** — backup/PITR/retenção.
- **Higiene:** DBT-S05/M01/M02/M03/C01, SYS-05/13/14/15, FE-13/14/15/16/17.

**Timeline indicativa (1 dev pleno full-time):** Lotes 0–2 (segurança + LGPD, caminho crítico) ≈ 3–4 semanas · Lote 3 ≈ 1 semana · Lote 4 (UX) ≈ 4–5 semanas · Lote 5 ≈ 3 semanas · Lote 6 ≈ 1,5 semana. **Total ≈ 13–15 semanas.** Com 1 dev DB + 1 dev UX em paralelo a partir do Lote 3, comprime para ≈ 8–9 semanas.

---

## Riscos e Mitigações

| Risco | Áreas | Mitigação (decisão Fase 8) |
|-------|-------|----------------------------|
| **Fix do FE-02 gera passivo LGPD** — persistir "desabafo anônimo" com `user_id` = dado sensível reidentificável no commit da correção. | FE-02, FE-07, GOV-L01, DBT-N01 | **ADR-08.2**: modelo de dados **desacopla autor↔conteúdo** e sobe **antes** da persistência (Lote 1). Interim honesto (Uma) até lá. Nada persiste sem base legal. |
| **Endurecer `plan` quebra a ativação premium manual atual.** | DBT-S01, SYS-02, FE-18, DBT-S02 | **ADR-08.1**: `set_user_plan(admin)` DEFINER no mesmo lote; ativa quando o UPDATE direto é revogado. |
| **P0 de segurança arrasta refactor XG** (mover escrita de pontos toca god-context SYS-07). | DBT-S01, SYS-03/04/07, DBT-D04 | **Recorte cirúrgico** no Lote 1 (extrair só a escrita de pontos); refactor completo do SYS-07 fica no Lote 5. Não inflar o P0. |
| **Falsa sensação de segurança via route guard** — FE-11 é UX, não controle de segurança (client é bypassável). | FE-11, DBT-S01 | Documentado: **controle real é server-side (RLS/RPC)**. FE-11 **não** conta como mitigação de DBT-S01. |
| **Reconciliação one-shot como vetor de inflação** — creditar `localStorage > DB` antes de S02 fechado permite inflar. | DBT-D04, DBT-S02, SYS-04 | Ordem obrigatória: `award_points` endurecido (S02) **antes** de expor a reconciliação. Caso de teste explícito (replay 2× → credita 1×). |
| **DBT-S07 declarado mas não executado** — lint de policies ficou como recomendação. | DBT-S07, SEC-P01 | Rodar `get_advisors(security)` + inventário RLS enabled como **artefato** antes de fechar o Lote 2. |
| **Migração de FK falha com órfão único** — `ADD CONSTRAINT` quebra se houver `user_id` órfão. | DBT-D01/02/03 | Caminho `NOT VALID` → query de detecção da Dara → limpar → `VALIDATE`. Aplica migração já, valida depois. |
| **Sem CI, suítes de teste não se sustentam.** | QA-T01, SYS-09/10 | Gate de CI é **Lote 0** (habilitador); nenhuma suíte de segurança é garantida no tempo sem ele. |

---

## Critérios de Sucesso

### Métricas de saída (assessment → resolução)
- **Segurança:** 0 findings críticos em `get_advisors(security)`; RLS *enabled* em 100% das tabelas; nenhum `service_role` no bundle client; auto-promoção a premium e forja de pontos/gating **impossíveis** por usuário comum autenticado.
- **LGPD:** modelo de dados do SafeSpace com autor desacoplado; base legal documentada; fluxos de retenção/expurgo e apagamento funcionais; cláusula operador↔controlador no contrato B2B.
- **Qualidade/processo:** CI verde bloqueando merge (`typecheck` + `lint` + `test`); cobertura de testes saindo de ~0% para baseline nos módulos de segurança/pontos.
- **Confiança/adesão (UX):** SafeSpace persiste de verdade e anonimiza; mock removido das 5 páginas; rede de crise presente nas telas sensíveis; tom "acolhimento" aplicado; onboarding com "aha" antecipado.
- **DR:** backup/PITR configurado antes de dado sensível persistido em escala.

### Suíte de testes (gate de release — inegociável para Lotes 1–2)
**1. Segurança / Impersonação (`test-as-user`) — P0:**
- Negativos (devem **falhar/no-op** p/ user comum): `UPDATE profiles SET plan='premium'`; `SET points=999999`; `UPDATE user_*_progress SET completed_at=now()` (S03); `UPDATE psi_weeks SET status='completed'` (S06); `UPDATE psi_projects SET status=...` (burlar "1 PSI ativo"); `award_points(_amount=999999)` e negativo (S02); reconciliação chamada 2×/replay → credita **1×** (flag `points_reconciled`).
- Positivos (regressão — devem **continuar OK**): `UPDATE profiles SET display_name/avatar_url` próprio; ganho via `complete_user_challenge` (valor derivado); **upgrade de plano via `set_user_plan` admin** (valida ADR-08.1); conclusão sequencial PSI via `complete_psi_task` (pular etapa → bloqueado).

**2. Migrações / Integridade — P1:** query de órfãos (3 tabelas) + caminho `NOT VALID→VALIDATE`; idempotência de seeds (M02); paridade `bootstrap_full_schema.sql` (M03); CHECK `points>=0` rejeita negativo (D05).

**3. E2E de negócio — P1:** paywall (free **não** acessa premium ponta a ponta); SafeSpace (post sobrevive ao refresh, aparece anonimizado, e `select user_id` via API **não reidentifica** autor — teste conjunto GOV-L01); Premium (ativação → status refletido, FE-18).

**4. Segurança dinâmica / LGPD — P1:** `get_advisors(security)` sem críticos; RLS enabled; ausência de `service_role` no bundle + rotação da publishable key (S04); teste de reidentificação (nenhum endpoint expõe autoria anônima); teste de expurgo (apagamento remove/anonimiza desabafos).

**5. Acessibilidade — P1/P2:** axe-core/Lighthouse CI nas 15 páginas sem atributos (objetiva FE-04); `prefers-reduced-motion` desliga animações (FE-20); contraste AA de `--muted-foreground`/neon.

**6. Gate de CI — P1 (habilitador):** pipeline `typecheck` + `lint` + `test` bloqueando merge (Lote 0). Sem CI, nenhuma suíte acima se sustenta.

---

## Anexo — Rastreabilidade e proveniência

| Fase | Agente | Artefato | Contribuição incorporada |
|------|--------|----------|--------------------------|
| 1 | @architect (Aria) | `system-architecture.md` | SYS-01→SYS-16 |
| 2 | @data-engineer (Dara) | `DB-AUDIT.md` | DBT-* (S/D/P/M/C/N) |
| 3 | @ux-design-expert (Uma) | `frontend-spec.md` | FE-01→FE-18 |
| 4 | @architect (Aria) | `technical-debt-DRAFT.md` | Consolidação (53) + reconciliação inter-fases |
| 5 | @data-engineer (Dara) | `db-specialist-review.md` | Validação + correção do fix S01 (column-level) + DBT-S06/S07/M03 |
| 6 | @ux-design-expert (Uma) | `ux-specialist-review.md` | Validação + FE-19/FE-20/FE-21 + sequência anti-retrabalho |
| 7 | @qa (Quinn) | `qa-review.md` | 6 gaps de governança + 2 fricções cross-team + suíte de testes |
| **8** | **@architect (Aria)** | **este documento** | **Consolidação final (65) + ADR-08.1/08.2 + matriz + plano de lotes** |

---
*Assessment FINAL produzido por Aria (@architect) — AIOX Brownfield Discovery FASE 8. Rastreabilidade total preservada: nenhum débito inventado, nenhum ID fundido ou removido. Incorpora integralmente as validações de @data-engineer e @ux-design-expert e cataloga formalmente os 6 gaps de governança do @qa. As duas fricções cross-team foram resolvidas como decisões arquiteturais explícitas (ADR-08.1 e ADR-08.2). O núcleo técnico foi aprovado pelo QA na Fase 7; esta consolidação blinda o domínio (saúde/LGPD) e a prova (testes) — pronto para a Fase 9 (relatório executivo do @analyst) e Fase 10 (epic + stories do @pm).*
