# DB-AUDIT — comunidade-nilu (ILUMINNARE)

> Auditoria de banco (schema + RLS + segurança + performance) — Fase 2 Brownfield Discovery.
> Executor: @data-engineer (Dara). Data: 2026-07-04.
> Evidência sempre referencia arquivo real (`m#` = migration na ordem do SCHEMA.md) e linha.
> Severidade preliminar — validação final e priorização de correção cabe ao @architect/@qa.

## Resumo executivo

- **Nenhuma tabela sem RLS.** Todas as 14 tabelas têm `ENABLE ROW LEVEL SECURITY`. ✅
- **Achado crítico real:** não é o `.env` — é a **política UPDATE de `profiles` permissiva demais** (DBT-S01), que permite a qualquer usuário autenticado se auto-promover a `premium` e forjar `points`. Isso derrota o freemium E a função atômica `award_points`.
- **Correção do alerta de segurança do @architect:** o `.env` está versionado, porém o histórico Git contém **apenas chaves públicas** (`role: anon` + publishable key `sb_publishable_...`). **NENHUM `service_role` (chave secreta) vazou.** Continua sendo má prática (DBT-S04), mas de severidade média, não catastrófica.
- 3 FKs ausentes para `auth.users` geram risco de dados órfãos (DBT-D01/02/03).

## Tabela de débitos

| ID | Débito | Evidência (arquivo / linha) | Severidade |
|----|--------|-----------------------------|------------|
| **DBT-S01** | **RLS UPDATE de `profiles` permissiva demais**: política "Users can update their own profile" é `FOR UPDATE USING (auth.uid()=user_id)` **sem `WITH CHECK` e sem restrição de coluna**. Qualquer usuário autenticado pode `UPDATE profiles SET plan='premium', points=999999 WHERE user_id=auth.uid()` → **bypass do paywall freemium + forja de pontos/ranking**. | `m1` (`...180824`) linhas 97-101 (política); coluna `points` linha 78; `plan` em `m8` (`freemium_plan.sql`) linhas 10-11 | **CRÍTICA** |
| **DBT-S02** | **`award_points` permite auto-inflar pontos**: SECURITY DEFINER valida `auth.uid()=_user_id` mas **não valida `_amount`** (controlado pelo client). Usuário pode conceder a si mesmo qualquer valor (inclusive negativo). | `m7` (`award_points.sql`) linhas 18-25; client passa `amount` em `src/lib/points.ts:15` | **ALTA** |
| **DBT-S03** | **Gating de gamificação burlável**: `user_challenge_progress`/`user_stage_progress` permitem INSERT/UPDATE do próprio registro sem gating no lado do banco. A regra 24h e a sequência de desafios só são impostas dentro da RPC `complete_user_challenge`; um `UPDATE ... SET completed_at=now()` direto (permitido pela RLS) pula a validação. | `m4` (`...194401`) linhas 84-89 e 98-103 (políticas INSERT/UPDATE own) vs gating só na função linhas 217-227 | **ALTA** |
| **DBT-D01** | **`conteudos.user_id` sem FOREIGN KEY** para `auth.users` → dados órfãos ao deletar usuário e sem CASCADE. | `m3` (`...192738`) linha 7 (`user_id UUID NOT NULL,` sem `REFERENCES`) | **ALTA** |
| **DBT-D02** | **`user_challenge_progress.user_id` sem FK** para `auth.users` → órfãos. | `m4` (`...194401`) linha 33 | **ALTA** |
| **DBT-D03** | **`user_stage_progress.user_id` sem FK** para `auth.users` → órfãos. | `m4` (`...194401`) linha 47 | **ALTA** |
| **DBT-S04** | **`.env` versionado no Git** (não está no `.gitignore`). Histórico contém somente chaves públicas (JWT `role:anon` + publishable key) — **sem vazamento de `service_role`**. Expõe `project_id`/URL (públicos por natureza). Risco real = má prática que pode vazar uma chave secreta no futuro. | `git ls-files` lista `.env`; `.gitignore` não contém `.env`; commits `5eda154`, `034fae1` | **MÉDIA** |
| **DBT-D04** | **Split-brain de pontos** (3 fontes divergentes p/ `profiles.points`): RPC `award_points`, `.update({points})` direto no client, e localStorage `POINTS`. Sem reconciliação → valores inconsistentes entre Ranking (DB) e UI legada (localStorage). | `src/contexts/AuthContext.tsx:75,171-175`; `src/lib/points.ts:15`; `m7` | **MÉDIA** |
| **DBT-P01** | **Índice faltante em `profiles.points`**: Ranking faz `ORDER BY points DESC LIMIT 50` → seq scan + sort. Falta `idx_profiles_points`. | `src/pages/Ranking.tsx:32-37`; nenhuma migration cria índice em `points` | **MÉDIA** |
| **DBT-P02** | **Feed re-busca tudo no realtime**: a cada INSERT de qualquer post, `fetchPosts()` recarrega os 100 posts + profiles (refetch total em vez de append incremental). Custo cresce sob carga. | `src/pages/Feed.tsx:83-90` | **MÉDIA** |
| **DBT-P03** | **Ranking re-busca tudo a cada UPDATE de `profiles`** (e profiles muda a cada ponto ganho por qualquer usuário) → refetch excessivo do ranking inteiro. | `src/pages/Ranking.tsx:47-54` | **MÉDIA** |
| **DBT-S05** | **`initialize_user_progress(_user_id)` sem validar chamador**: SECURITY DEFINER aceita `_user_id` arbitrário, não checa `auth.uid()`. Dano baixo (idempotente), mas viola o princípio de validar o chamador em funções DEFINER. | `m4` (`...194401`) linhas 137-142; chamada em `src/pages/Challenges.tsx:112` | **BAIXA** |
| **DBT-P04** | **N+1 de escrita no NovoProjeto**: cria 4 semanas em loop sequencial com `await` por semana (+ insert de tarefas por semana), sem batch/transação única. | `src/pages/NovoProjeto.tsx:99-124` | **BAIXA** |
| **DBT-D05** | **Sem CHECK `points >= 0`** em `profiles`: combinado com `award_points` sem validar `_amount`, pontos podem ficar negativos. | `m1` linha 78; `m7` linhas 22-24 | **BAIXA** |
| **DBT-D06** | **Regra de pontuação duplicada e divergente**: `stage_challenges.points` (seed 10/15/20) vs constantes `NEURAL_COINS`/`POINTS` no client. Duas fontes da regra de negócio. | `m4` seed (`...194401` linhas 345-386) vs `src/lib/points.ts:5-13` e `AuthContext.tsx:75-84` | **BAIXA** |
| **DBT-M01** | **Migrations bootstrap com nomes UUID** auto-gerados (export Lovable), sem descrição semântica → baixa legibilidade/rastreabilidade do histórico. | migrations `20260421180824_e1639809...`, `...42db8798...`, `...877b0af2...` | **BAIXA** |
| **DBT-M02** | **Seed de `stages` sem `ON CONFLICT`**: reaplicar a migration #4 duplicaria as 3 etapas (o backfill de progresso usa `ON CONFLICT DO NOTHING`, mas o INSERT de stages não). Migration não é idempotente. | `m4` (`...194401`) linhas 338-341 | **BAIXA** |
| **DBT-C01** | **`posts.content` sem limite no DB** (só `maxLength=500` no client) → payloads grandes possíveis via API direta. | `m1` linha 152; `src/pages/Feed.tsx:155` | **BAIXA** |
| **DBT-N01** | **Dados sociais só em localStorage**: tips/likes/comments (`UserTip`) nunca persistidos no DB — risco de perda de dados e não sincroniza entre dispositivos. | `src/contexts/AuthContext.tsx:361-363` | **BAIXA** |

## Recomendações prioritárias (para o @architect na Fase 4)

1. **DBT-S01 (bloqueante):** restringir UPDATE de `profiles` — remover a permissão de alterar `plan`/`points` pelo usuário. Opções: (a) `GRANT UPDATE (display_name, avatar_url)` + revogar demais colunas; (b) trigger `BEFORE UPDATE` que rejeita mudança de `plan`/`points` quando não-admin; (c) tornar `points`/`plan` mutáveis apenas via RPC SECURITY DEFINER. Adicionar `WITH CHECK (auth.uid()=user_id)`.
2. **DBT-S02/S03:** mover toda concessão de pontos e conclusão de progresso para RPCs validadas no servidor (modelo do `complete_user_challenge`); `award_points` deve derivar `_amount` de uma tabela de regras, não do client.
3. **DBT-D01/02/03:** adicionar FK `user_id → auth.users(id) ON DELETE CASCADE` nas 3 tabelas (migration corretiva; verificar órfãos existentes antes).
4. **DBT-S04:** `git rm --cached .env`, adicionar ao `.gitignore`, rotacionar a publishable key por precaução. (Sem urgência de service_role — não vazou.)
5. **DBT-D04:** eleger `profiles.points` como fonte única; aposentar o caminho localStorage/`saveUser().update({points})`.
6. **DBT-P01:** `CREATE INDEX idx_profiles_points ON profiles(points DESC);`
