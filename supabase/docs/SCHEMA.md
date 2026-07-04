# SCHEMA — comunidade-nilu (ILUMINNARE)

> Reconstruído a partir das migrations reais em `supabase/migrations/`.
> Backend: Supabase (PostgreSQL). Gerado pela Fase 2 do Brownfield Discovery (@data-engineer / Dara).
> Data: 2026-07-04.

## Fonte das migrations (ordem de aplicação)

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 1 | `20260421180824_e1639809-...sql` | Bootstrap: roles, profiles, posts, funções base, triggers |
| 2 | `20260421181042_6079ed7d-...sql` | Realtime para `posts` (REPLICA IDENTITY FULL + publication) |
| 3 | `20260422192738_42db8798-...sql` | Tabela `conteudos` + enum `content_category` |
| 4 | `20260422194401_877b0af2-...sql` | Sistema de etapas/desafios + RPCs de progresso + seed 3 etapas |
| 5 | `20260703163119_pci_results.sql` | Diagnóstico comportamental `pci_results` |
| 6 | `20260703204928_psi_projects.sql` | PSI: projetos, semanas, tarefas, check-ins |
| 7 | `20260703213336_award_points.sql` | RPC `award_points` (Neural Coins) |
| 8 | `20260703213337_freemium_plan.sql` | Coluna `profiles.plan` + enum `user_plan` |
| 9 | `20260704143449_personality_notes.sql` | Tabela `personality_notes` |

> Nota: os arquivos 1–4 usam nomes UUID auto-gerados (export Lovable), sem descrição semântica no nome. Não existe um `bootstrap_full_schema.sql` — o "bootstrap" real é a migration #1.

## ENUMs

| Enum | Valores |
|------|---------|
| `app_role` | `admin`, `moderator`, `user` |
| `content_category` | `book`, `movie`, `meditation`, `music`, `community` |
| `user_plan` | `free`, `premium` |
| `psi_prioridade` | `baixa`, `media`, `alta` |
| `psi_status` | `active`, `completed`, `abandoned` |
| `psi_week_status` | `locked`, `active`, `completed` |
| `psi_task_status` | `pending`, `in_progress`, `paused`, `completed` |
| `psi_task_dificuldade` | `facil`, `media`, `dificil` |

## Tabelas

### `user_roles`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | FK → auth.users ON DELETE CASCADE, NOT NULL |
| role | app_role | NOT NULL |
| created_at | timestamptz | default now() |
- Constraint: `UNIQUE (user_id, role)` (também serve de índice para `has_role`).
- RLS: **ON**. SELECT próprio; SELECT/ALL admin (`has_role`).

### `profiles`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → auth.users ON DELETE CASCADE, NOT NULL, **UNIQUE** |
| display_name | text | NOT NULL |
| email | text | NOT NULL |
| avatar_url | text | |
| points | integer | NOT NULL default 0 — usado no Ranking |
| plan | user_plan | NOT NULL default `free` (migration #8) |
| created_at / updated_at | timestamptz | trigger `update_updated_at_column` |
- RLS: **ON**. SELECT: todos autenticados (`true`). INSERT: próprio. UPDATE: próprio **(sem WITH CHECK / sem restrição de coluna — ver DBT-S01)** + admin.

### `posts`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → auth.users ON DELETE CASCADE, NOT NULL |
| content | text | NOT NULL (sem limite no DB) |
| is_anonymous | boolean | default false |
| created_at / updated_at | timestamptz | |
- Índices: `idx_posts_user_id`, `idx_posts_created_at (DESC)`.
- Realtime: `REPLICA IDENTITY FULL` + `supabase_realtime`.
- RLS: **ON**. SELECT todos; INSERT/UPDATE/DELETE próprio; DELETE admin.

### `conteudos`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | **NOT NULL, SEM FK** (ver DBT-D01) |
| title / description | text | NOT NULL |
| how_it_helped | text | |
| category | content_category | NOT NULL |
| created_at / updated_at | timestamptz | |
- Índices: `idx_conteudos_category`, `idx_conteudos_created_at (DESC)`.
- RLS: **ON**. SELECT todos; INSERT/UPDATE/DELETE próprio; DELETE admin.

### `stages`
- `id` PK, `position` int **UNIQUE** NOT NULL, `title` NOT NULL, `description`, timestamps.
- RLS: **ON**. SELECT todos; ALL admin. Seed: 3 etapas (Despertar / Conexão / Propósito).

### `stage_challenges`
- `id` PK, `stage_id` FK → stages ON DELETE CASCADE, `position` int CHECK 1–8, `title`, `description`, `action`, `reflection`, `points` int default 10, timestamps.
- Constraint: `UNIQUE (stage_id, position)`. Índice `idx_stage_challenges_stage (stage_id, position)`.
- RLS: **ON**. SELECT todos; ALL admin. Seed: 8 desafios × 3 etapas.

### `user_challenge_progress`
- `id` PK, `user_id` uuid **SEM FK** (ver DBT-D02), `challenge_id` FK → stage_challenges CASCADE, `stage_id` FK → stages CASCADE, `unlocked_at`, `available_at`, `completed_at`, timestamps.
- Constraint: `UNIQUE (user_id, challenge_id)`. Índice `idx_user_challenge_progress_user (user_id)`.
- RLS: **ON**. SELECT/INSERT/UPDATE próprio; SELECT admin. **Sem DELETE.**

### `user_stage_progress`
- `id` PK, `user_id` uuid **SEM FK** (ver DBT-D03), `stage_id` FK → stages CASCADE, `unlocked_at`, `completed_at`, timestamps.
- Constraint: `UNIQUE (user_id, stage_id)`. Índice `idx_user_stage_progress_user (user_id)`.
- RLS: **ON**. SELECT/INSERT/UPDATE próprio; SELECT admin.

### `pci_results` (diagnóstico comportamental)
- `id` PK, `user_id` FK → auth.users CASCADE, `respostas` jsonb, `scores` jsonb, `dominante`/`secundario`/`terciario` text, `created_at`.
- Índice `idx_pci_results_user_created (user_id, created_at DESC)`.
- RLS: **ON**. SELECT/INSERT próprio; SELECT admin. Append-only (sem UPDATE/DELETE) — por design (mantém histórico).

### `psi_projects`
- `id` PK, `user_id` FK → auth.users CASCADE, `pci_result_id` FK → pci_results **ON DELETE SET NULL**, `nome`, `descricao`, `objetivo`, `prazo_dias` int default 90, `prioridade` enum, `categoria`, `status` enum default `active`, timestamps.
- Índice `idx_psi_projects_user (user_id, created_at DESC)`.
- RLS: **ON**. SELECT/INSERT/UPDATE próprio. **Sem DELETE** (usa `status='abandoned'`).

### `psi_weeks`
- `id` PK, `project_id` FK → psi_projects CASCADE, `numero` int CHECK 1–4, `titulo`, `status` enum default `locked`, `unlocked_at`, `completed_at`, `created_at`.
- Constraint: `UNIQUE (project_id, numero)`. Índice `idx_psi_weeks_project (project_id, numero)`.
- RLS: **ON**. SELECT/INSERT/UPDATE via `EXISTS` na posse do projeto pai.

### `psi_tasks`
- `id` PK, `week_id` FK → psi_weeks CASCADE, `ordem` int, `titulo`, `descricao`, `objetivo`, `tempo_estimado_min` int default 30, `dificuldade` enum, `status` enum default `pending`, `completed_at`, `created_at`.
- Constraint: `UNIQUE (week_id, ordem)`. Índice `idx_psi_tasks_week (week_id, ordem)`.
- RLS: **ON**. SELECT/INSERT/UPDATE via `EXISTS` (week → project → user).

### `psi_checkins`
- `id` PK, `task_id` FK → psi_tasks CASCADE, `user_id` FK → auth.users CASCADE, `executou` text CHECK in (`sim`,`parcial`,`nao`), `produtividade` int CHECK 1–5, `dificuldades`, `tempo_usado_min`, `created_at`.
- Índice `idx_psi_checkins_user (user_id, created_at DESC)`.
- RLS: **ON**. SELECT/INSERT próprio. Append-only.

### `personality_notes`
- `id` PK, `user_id` FK → auth.users CASCADE, `personality_id` text (sem FK — dados estáticos no frontend), `relato` text, `created_at`.
- Índice `idx_personality_notes_user (user_id, personality_id)`.
- RLS: **ON**. SELECT/INSERT próprio; SELECT admin.

## Funções / RPCs

| Função | Segurança | Avaliação |
|--------|-----------|-----------|
| `has_role(_user_id, _role)` | SECURITY DEFINER, STABLE, `search_path=public` | OK — evita recursão de RLS. Bem projetada. |
| `update_updated_at_column()` | trigger fn, `search_path=public` | OK. |
| `handle_new_user()` | SECURITY DEFINER | OK — cria profile + role `user` + inicializa progresso. Trigger `on_auth_user_created` AFTER INSERT em auth.users. |
| `initialize_user_progress(_user_id)` | SECURITY DEFINER | ⚠️ Aceita `_user_id` arbitrário, **não valida** `auth.uid()`. Dano baixo (idempotente `ON CONFLICT DO NOTHING`), mas viola princípio de validar chamador (DBT-S05). Chamada do client em `Challenges.tsx:112`. |
| `complete_user_challenge(_challenge_id)` | SECURITY DEFINER | ✅ **Modelo correto** — usa `auth.uid()` internamente, valida desbloqueio + `available_at` + `completed_at IS NULL` antes de completar. Não aceita user_id externo. |
| `award_points(_user_id, _amount)` | SECURITY DEFINER | ⚠️ Checa `auth.uid() = _user_id` (bom p/ atomicidade), mas `_amount` é controlado pelo client e **não é validado** → usuário pode conceder a si mesmo qualquer valor (DBT-S02). |

## Views
Nenhuma view definida.

## Triggers
- `on_auth_user_created` — AFTER INSERT em auth.users → `handle_new_user()`.
- `update_*_updated_at` — BEFORE UPDATE em: profiles, posts, conteudos, stages, stage_challenges, user_challenge_progress, user_stage_progress, psi_projects.

## Observações de arquitetura (split-brain de pontos)
Três fontes de verdade divergentes para pontuação coexistem (ver DBT-D04):
1. **`profiles.points`** via RPC atômica `award_points` (lado `lib/points.ts` — Neural Coins).
2. **`profiles.points`** via `.update({ points })` direto no client (`AuthContext.saveUser`).
3. **localStorage** (`iluminnados_user_*`, constante `POINTS` em `AuthContext`) — gamificação legada não persistida no DB.

O Ranking lê `profiles.points`; a UI de gamificação legada lê localStorage. Não há reconciliação.
