# Database Specialist Review

> **Fase 5 — Brownfield Discovery** · Revisão de especialista de dados sobre o `technical-debt-DRAFT.md` (§2 + §5).
> **Revisor:** Dara (@data-engineer — AIOX) · **Data:** 2026-07-04
> **Fontes relidas:** todas as 10 migrations em `supabase/migrations/` + caminhos de escrita do client (`AuthContext.tsx`, `points.ts`, `MeuProjeto.tsx`, `NovoProjeto.tsx`, `Admin.tsx`, `Challenges.tsx`).
> **Escopo da re-auditoria:** a auditoria da Fase 2 (`DB-AUDIT.md`) cobriu `m1`–`m8`. Reli **também** as migrations `pci_results`, `psi_projects` e `personality_notes` (criadas em 2026-07-03/04), que **não estavam na tabela de débitos original** — e é justamente aí que mora a maior parte dos achados novos.

---

## ⚠️ Correção técnica que muda o remédio do achado crítico (leia antes da tabela)

O DBT-S01 e o DBT-S03 estão descritos como *"policy sem `WITH CHECK`"*. **A vulnerabilidade é 100% real e crítica**, mas o mecanismo está mal descrito, e isso afeta diretamente o fix:

**Semântica do PostgreSQL RLS:** numa policy `FOR UPDATE`, **quando `WITH CHECK` é omitido, a expressão `USING` é usada como `WITH CHECK` também** (aplicada à linha resultante). Ou seja, a policy de `profiles`:

```sql
FOR UPDATE USING (auth.uid() = user_id)   -- WITH CHECK implícito = auth.uid() = user_id
```

já valida que a linha **continua pertencendo ao usuário** após o UPDATE. **Adicionar `WITH CHECK (auth.uid() = user_id)` explícito é um no-op — não corrige nada.**

O buraco real não é ownership de linha; é que **RLS opera em granularidade de linha e não consegue restringir *quais colunas* são alteradas**. Com `auth.uid()=user_id` satisfeito, o usuário pode `SET plan='premium', points=999999` na própria linha à vontade. Portanto:

- ❌ "Adicionar WITH CHECK" **não resolve** o bypass do paywall.
- ✅ O fix precisa ser **column-level**: `REVOKE UPDATE` + `GRANT UPDATE (colunas seguras)`, e/ou **trigger `BEFORE UPDATE`** comparando `OLD`/`NEW`, e/ou mover `plan`/`points` para **RPC `SECURITY DEFINER`**.

Isso vale igual para DBT-S03 (o usuário satisfaz `auth.uid()=user_id` e mesmo assim seta `completed_at=now()` direto). Registro isto porque a Fase 8 vai desenhar a migração a partir dessas perguntas — e uma migração que só adiciona `WITH CHECK` daria falsa sensação de correção.

---

### Débitos Validados

| ID | Débito | Severidade | Horas | Prioridade | Notas |
|----|--------|-----------|-------|------------|-------|
| **DBT-S01** | UPDATE `profiles` sem restrição de **coluna** → auto-promoção a `premium` + forja de `points` | **CRÍTICA** ✅ mantida | **4–6h** | **P0** | Fix real = column GRANT + trigger, **não** WITH CHECK. Acoplado a S02/D04. Migração **faseada** (ver Q1). |
| **DBT-S02** | `award_points` não valida `_amount` (client controla) | **Alta** ✅ mantida | **4–6h** | **P0** | Melhor fix: **derivar pontos server-side** dentro das RPCs de ação; `award_points` deixa de ser chamável com valor arbitrário. `stage_challenges.points` já é fonte de regra para desafios. |
| **DBT-S03** | Gating de gamificação burlável via UPDATE direto em `user_*_progress` | **Alta** ✅ mantida | **2–3h** | **P0** | **Regressão ~zero:** o client **nunca** faz `.update()` nessas tabelas (só `SELECT` + RPC `complete_user_challenge`/`initialize_user_progress`). Fix = **DROP das policies "Users update own"** / `REVOKE UPDATE`. Barato e seguro. |
| **DBT-D01** | `conteudos.user_id` sem FK → `auth.users` | **Alta** ✅ mantida | **1–2h** | **P1** | Adicionar via `NOT VALID` → checar órfãos → `VALIDATE` (Q4). |
| **DBT-D02** | `user_challenge_progress.user_id` sem FK | **Alta** ✅ mantida | *incl. D01* | **P1** | Idem. As 3 FKs numa única migration corretiva ≈ **3–5h** no total. |
| **DBT-D03** | `user_stage_progress.user_id` sem FK | **Alta** ✅ mantida | *incl. D01* | **P1** | Idem. |
| **DBT-D04** | Split-brain de `profiles.points` (RPC + `.update()` + localStorage) | **Média** ✅ mantida | **4–6h** | **P1** | Porção DB pequena; grosso é frontend (SYS-04). Reconciliação do localStorage **só é possível client-side** (Q6). |
| **DBT-P01** | Índice faltante em `profiles.points` | **Média** ✅ mantida | **0,5h** | **P2** | `CREATE INDEX idx_profiles_points ON profiles(points DESC);` Ganho real ofuscado pelo refetch total (P03) enquanto não corrigido. |
| **DBT-P02** | Feed refetch total no realtime | **Média** → **rebaixo p/ Baixa (DB)** | **1–1,5h** | **P2** | **Fronteira:** débito de **frontend** (query pattern), não de schema. Ownership Fase 6. DB só pode oferecer keyset/RPC. |
| **DBT-P03** | Ranking refetch total a cada UPDATE de `profiles` | **Média** → **rebaixo p/ Baixa (DB)** | **1–1,5h** | **P2** | Idem P02. Causa-raiz de DB: `points` mora na tabela quente `profiles`, atualizada a cada ponto de qualquer user (Q5). |
| **DBT-S04** | `.env` versionado (só chaves públicas) | **Média** ✅ mantida | **0,5h** | **P2** | `git rm --cached .env` + `.gitignore` + rotacionar publishable key. Sem urgência (nada de `service_role` vazou). |
| **DBT-S05** | `initialize_user_progress` não checa `auth.uid()` | **Baixa** ✅ mantida | **1h** | **P3** | Idempotente. Trocar assinatura para usar `auth.uid()` internamente (como `complete_user_challenge`) e remover o param. |
| **DBT-P04** | N+1 de escrita no NovoProjeto (4 semanas em loop) | **Baixa** ✅ mantida | **2–3h** | **P3** | Melhor num RPC transacional `create_psi_project(...)` — resolve atomicidade E o gap de gating do PSI (ver DBT-S06). |
| **DBT-D05** | Sem CHECK `points >= 0` | **Baixa** ✅ mantida | **0,5–1h** | **P2** | `ALTER TABLE profiles ADD CONSTRAINT points_non_negative CHECK (points >= 0);` Combina com S02. |
| **DBT-D06** | Regra de pontuação duplicada (DB seed vs constantes client) | **Média** ✅ mantida | *incl. S02* | **P2** | Resolve-se junto com S02 ao derivar pontos server-side; DB vira fonte única. |
| **DBT-M01** | Migrations com nomes UUID (export Lovable) | **Baixa** ✅ mantida | **1h** | **P3** | Não renomear migrations já aplicadas (quebra histórico). Só documentar mapa `m#`→arquivo. |
| **DBT-M02** | Seed `stages` sem `ON CONFLICT` (não idempotente) | **Baixa** ✅ mantida | **0,5–1h** | **P3** | Aplica também ao seed de `stage_challenges` e ao `DO $$` de backfill. Adicionar `ON CONFLICT (position) DO NOTHING`. |
| **DBT-C01** | `posts.content` sem limite no DB | **Baixa** ✅ mantida | **0,5–1h** | **P3** | `CHECK (char_length(content) <= 500)`. Estender o raciocínio a `conteudos`/`psi_*` (texto livre). |
| **DBT-N01** | Tips/likes/comments só em localStorage | **Baixa** (DB) ✅ mantida | **3–5h** | **P1 (feature)** | Porção DB = modelar tabelas. Feature completa é SYS-06. **Já há precedente resolvido:** `personality_notes` migrou o "Salvar no perfil" de `useState`→DB — mesmo padrão a seguir. |

**Ajustes de severidade que proponho:** rebaixar **DBT-P02/P03 para Baixa no eixo DB** (são débito de *query pattern* de frontend; o schema só contribui com índice e superfície de acesso). Todo o resto da Fase 2 fica **confirmado**.

---

### Débitos Adicionados

> Achados **novos**, majoritariamente nas migrations que a Fase 2 não cobriu (`psi_*`, `pci_*`). Nenhum invalida a auditoria anterior — completam-na.

| ID | Débito | Evidência | Severidade | Horas | Prioridade |
|----|--------|-----------|-----------|-------|------------|
| **DBT-S06** *(novo)* | **Subsistema PSI sem gating server-side** — o avanço de semanas/tarefas e a conclusão de projeto são feitos por `.update()` **direto do client**, sem RPC de validação. As policies `FOR UPDATE` de `psi_weeks`/`psi_tasks`/`psi_projects` têm só `USING` (ownership) e **nenhuma restrição de coluna/transição**. Qualquer user autenticado pode `UPDATE psi_weeks SET status='completed', unlocked_at=now()` (destrancar as 4 semanas de uma vez), forjar `psi_tasks.completed_at`, ou flipar `psi_projects.status` para burlar o **limite freemium de "1 PSI ativo"**. É o **mesmo padrão do DBT-S03, porém pior**: o subsistema de desafios ao menos tem `complete_user_challenge`; o PSI **não tem RPC nenhuma**. | `psi_projects.sql:39-42, 80-83, 129-136`; `MeuProjeto.tsx:127-128,138-139,147-148,155` | **Alta** | **8–12h** | **P0/P1** |
| **DBT-S07** *(novo, sistêmico)* | **Padrão de "UPDATE só com USING" é do schema inteiro** — a varredura completa (Q2) mostra que **todas** as policies `FOR UPDATE` de usuário (`profiles`, `posts`, `conteudos`, `user_challenge_progress`, `user_stage_progress`, `psi_projects`, `psi_weeks`, `psi_tasks`) omitem `WITH CHECK` e **nenhuma restringe coluna**. Nas tabelas de conteúdo próprio (`posts`, `conteudos`) o risco é **baixo/aceitável** (editar o próprio conteúdo é legítimo — no máximo permite flipar o próprio `is_anonymous`). O risco concentra-se onde há **coluna privilegiada ou de gating** (já coberto por S01/S03/S06). Registro como item de **governança**: fechar o assessment com uma varredura RLS declarada e um *lint* de policies. | `m1:97-101,175-179`; `m3:30-33`; `m4:87-89,101-103`; `psi_projects.sql` | **Média** | **1–2h** | **P2** |
| **DBT-M03** *(novo)* | **`bootstrap_full_schema.sql` paralelo às migrations** — existe um dump consolidado do schema fora da cadeia de migrations versionada. Risco de **divergência** (schema aplicado ≠ soma das migrations) e de reaplicação destrutiva se rodado por engano. Precisa de nota de propósito (bootstrap de ambiente novo) e de um check de paridade. | `supabase/bootstrap_full_schema.sql` | **Baixa** | **1–2h** | **P3** |

> **Nota sobre "admin update any profile" (`m1:103-107`):** também sem `WITH CHECK`, mas admin é confiável e o efetivo `USING (has_role(...,'admin'))` já barra não-admins. Sem débito próprio — cai sob DBT-S07.

---

### Respostas ao Architect

**Q1 — Esforço real do DBT-S01 sem quebrar o freemium; qual das 3 opções; faseado ou big-bang?**

Primeiro a correção de premissa: **a opção implícita "só adicionar WITH CHECK" não existe como fix** (WITH CHECK omitido já equivale a USING — ver seção de correção no topo). Das três que propus:

- **(a) column GRANTs** — `REVOKE UPDATE ON profiles FROM authenticated;` + `GRANT UPDATE (display_name, avatar_url) ON profiles TO authenticated;`. Enforcement no **layer de privilégio do Postgres**, independente de RLS, e o PostgREST/Supabase respeita. É o **fix de menor complexidade e mais declarativo**. Custo: quebra **imediatamente** o caminho legado `AuthContext.saveUser().update({points})` (`AuthContext.tsx:173`) com 403.
- **(b) trigger `BEFORE UPDATE`** comparando `OLD.plan/OLD.points` com `NEW` e rejeitando mudança quando não-admin — pega **qualquer** caminho (inclusive futuros) e é o único que consegue liberar `plan` só para admin sem revogar a coluna. Custo: overhead por linha + lógica imperativa.
- **(c) `plan`/`points` mutáveis só via RPC `SECURITY DEFINER`** — é a política de escrita sancionada; casa com S02.

**Recomendação:** **combinar (a) + (c)**, com **(b) como trava extra para `plan`** (upgrade é ato de admin/pagamento). `display_name`/`avatar_url` continuam por UPDATE direto (o caminho legítimo em `AuthContext.tsx:220` **não** quebra). Esforço da porção DB: **4–6h**.

**Faseado, obrigatoriamente** (big-bang causa regressão visível). Sequência:
1. **Fase A (client, deploy):** remover `saveUser().update({points})`; todo ganho de ponto passa a ir por RPC (`award_points` já existe; idealmente já derivando server-side — S02). App continua funcionando com a RLS **atual**.
2. **Fase B (migração DB):** aplicar `REVOKE`/`GRANT (display_name, avatar_url)` + trigger de `plan`. A partir daqui o caminho legado já não existe, então **nada quebra**.

Inverter a ordem (revogar antes de migrar o client) derruba a escrita de pontos em produção.

**Q2 — DBT-S01 é a única sem WITH CHECK, ou há padrão sistêmico? Precisa varredura completa?**

Fiz a varredura completa das 10 migrations. **É sistêmico — o export Lovable gerou *toda* policy `FOR UPDATE` de usuário só com `USING`.** Inventário:

| Tabela | Policy UPDATE user | Coluna privilegiada/gating? | Veredito |
|--------|--------------------|-----------------------------|----------|
| `profiles` | Users can update their own profile | **Sim** (`plan`, `points`) | 🔴 DBT-S01 |
| `user_challenge_progress` | Users update own challenge progress | **Sim** (`completed_at`) | 🔴 DBT-S03 |
| `user_stage_progress` | Users update own stage progress | **Sim** (`completed_at`) | 🔴 DBT-S03 |
| `psi_projects` | Users update own psi projects | **Sim** (`status` freemium) | 🔴 **DBT-S06 (novo)** |
| `psi_weeks` | Users update own psi weeks | **Sim** (`status`, `unlocked_at`) | 🔴 **DBT-S06 (novo)** |
| `psi_tasks` | Users update own psi tasks | **Sim** (`status`, `completed_at`) | 🔴 **DBT-S06 (novo)** |
| `posts` | Users can update their own posts | Não (conteúdo próprio) | 🟡 aceitável (DBT-S07) |
| `conteudos` | Users can update their own conteudos | Não (conteúdo próprio) | 🟡 aceitável (DBT-S07) |

Tabelas **sem** UPDATE de user (só SELECT+INSERT, INSERT já com WITH CHECK correto) — **OK:** `pci_results`, `personality_notes`, `psi_checkins`, `user_roles` (admin ALL c/ WITH CHECK), `stages`/`stage_challenges` (admin ALL c/ WITH CHECK). **Sim, a varredura era necessária** e revelou o subsistema PSI inteiro (S06) — que a Fase 2 não tinha visto porque essas migrations são posteriores. **Não feche o assessment sem S06.**

**Q3 — Mover pontos/conclusão para RPCs: esforço por RPC, quantas RPCs novas? A tabela de regras já existe?**

- **Regra de `_amount` já existe parcialmente:** `stage_challenges.points` (seed 10/15/20 por etapa) é a fonte de verdade para pontos de desafio. **Não precisa criar tabela nova para isso** — precisa *usá-la* server-side.
- **RPCs novas necessárias:**
  1. Modificar `complete_user_challenge` (já existe) para **conceder os pontos internamente** lendo `stage_challenges.points` (deixa de depender do client chamar `award_points`). ~**2–3h**.
  2. `award_points` deixa de ser API pública de valor livre: ou vira `SECURITY DEFINER` interna, ou ganha clamp defensivo (`_amount > 0` e teto) enquanto não some. ~**1h**.
  3. **PSI (S06)** precisa de **2 RPCs novas**: `complete_psi_task(_task_id)` (marca tarefa + avança semana quando todas concluídas, com gating sequencial) e `create_psi_project(...)` transacional (resolve também P04). ~**6–9h** juntas.
- Total das RPCs de pontos/gating: **~4–6h** (desafios) + **~8–12h** (PSI, = DBT-S06). Depois de existirem, faz-se `REVOKE UPDATE` das tabelas de progresso — S03/S06 fecham quase de graça.

**Q4 — Antes das 3 FKs `ON DELETE CASCADE`, há órfãos em produção? Precisa limpeza prévia?**

Em teoria os `user_id` dessas tabelas **deveriam** ser sempre válidos, porque as policies INSERT exigem `WITH CHECK (auth.uid()=user_id)` — não dá para inserir com id alheio. **Órfãos só surgem se um usuário foi deletado de `auth.users`** (aí, sem FK/CASCADE, as linhas ficam penduradas). Para um app jovem, provavelmente poucos ou nenhum — mas **tem que checar**, porque um único órfão faz o `ADD CONSTRAINT` falhar.

Não executo SQL contra produção aqui (governança), então entrego o diagnóstico + a estratégia segura:

```sql
-- 1) Detectar órfãos (rodar para as 3 tabelas)
SELECT 'conteudos' AS tbl, count(*) FROM public.conteudos c
  LEFT JOIN auth.users u ON u.id = c.user_id WHERE u.id IS NULL
UNION ALL
SELECT 'user_challenge_progress', count(*) FROM public.user_challenge_progress p
  LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL
UNION ALL
SELECT 'user_stage_progress', count(*) FROM public.user_stage_progress p
  LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL;
```

**Estratégia recomendada (zero downtime, à prova de órfão):**
```sql
-- 2) Adiciona FK como NOT VALID: não escaneia linhas existentes, já enforça em novas
ALTER TABLE public.conteudos
  ADD CONSTRAINT conteudos_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
-- 3) Limpar órfãos (se a query 1 acusou), depois:
ALTER TABLE public.conteudos VALIDATE CONSTRAINT conteudos_user_id_fkey;
```
Se a contagem de órfãos for 0, dá para pular o `NOT VALID` e adicionar direto. **Precisa de script de limpeza prévio apenas se a query (1) retornar > 0** — e mesmo assim o caminho `NOT VALID` permite aplicar a migração já, limpar com calma e validar depois. Esforço: **3–5h** para as três (incl. verificação).

**Q5 — Índice resolve o Ranking, mas o refetch total (P02/P03) é DB ou frontend? Onde traço a fronteira com a Fase 6?**

Fronteira clara:

- **DB é dono de:** o índice `idx_profiles_points` (P01), a superfície de acesso eficiente (ex.: uma RPC `get_leaderboard(_limit)` com keyset), e — se virar problema real de escala — mover o placar para uma estrutura menos quente (leaderboard materializado). **P01 é meu, entrego já.**
- **Frontend é dono de:** o *padrão de reação ao realtime*. Hoje `Feed.tsx:83-90` e `Ranking.tsx:47-54` fazem **refetch total a cada evento** — isso é lógica de client (append incremental vs. recarregar tudo, debounce, React Query). Pertence à **Fase 6 / SYS-12**.

Causa-raiz de DB do P03 que vale registrar: `points` vive em `profiles`, tabela quente atualizada a cada ponto de **qualquer** usuário; como o Ranking assina UPDATEs de `profiles`, todo mundo recebe evento o tempo todo. Mitigação de DB **possível mas over-engineering agora**: separar o contador de placar numa tabela/coluna dedicada com realtime próprio, ou debounce server-side. **Recomendo NÃO fazer isso agora** — resolver no frontend (debounce + merge incremental) é 10x mais barato e suficiente na escala atual. Minha entrega de DB para P02/P03 fica em **1–1,5h** (índice +, se quiserem, a RPC de leaderboard); o resto é Fase 6.

**Q6 — Ao eleger `profiles.points` como fonte única, há risco de perder pontos presos em localStorage? Precisa backfill?**

Risco: **baixo-moderado e auto-cicatrizante**, mas com uma limitação dura que precisa ficar explícita:

- **`localStorage` é per-device/per-browser — não há como ler server-side.** Portanto **não existe backfill via SQL.** Qualquer "migração" de pontos presos tem de acontecer **no client, no próximo login** de cada usuário.
- Na prática o risco é menor do que parece: o caminho legado `saveUser().update({points})` **já grava no DB** (`AuthContext.tsx:173`), então para a maioria dos usuários o `profiles.points` já reflete o valor. O `localStorage` é um espelho, não um cofre isolado.
- **Estratégia recomendada (reconciliação one-shot client-side):** na inicialização do `AuthContext`, antes de aposentar o caminho localStorage, comparar `localStorage.POINTS` com `profiles.points`; se `localStorage > DB`, chamar `award_points` (já atômico) para creditar a diferença **uma única vez**, gravar um flag `points_reconciled` e então limpar o contador local. Assim ninguém perde pontos e o split-brain fecha à medida que os usuários logam. É trabalho de frontend (parte de SYS-04/DBT-D04); a porção DB é só garantir que `award_points` esteja endurecido (S02) **antes** de expô-lo à reconciliação — senão a própria reconciliação vira vetor de inflar pontos.

---

### Recomendações

**Ordem de resolução do ponto de vista de dados — segurança › integridade › performance › higiene.** O acoplamento que o architect apontou é real: **não dá para endurecer a RLS antes de mover as escritas para RPCs e ajustar o client.** Por isso a ordem abaixo é de *dependência*, não só de prioridade.

**Bloco 0 — Pré-requisito rápido (paralelo, ~1h):** DBT-S04 (`git rm --cached .env` + rotacionar publishable key). Independente de tudo.

**Bloco 1 — Fundação server-side de pontos/gating (P0, ~14–20h):** é o que destrava o endurecimento da RLS sem regressão.
1. DBT-S02 + DBT-D06: `complete_user_challenge` passa a conceder pontos derivados de `stage_challenges.points`; `award_points` endurecido. *(4–6h)*
2. DBT-S06: criar `complete_psi_task` + `create_psi_project` transacional (absorve DBT-P04). *(8–12h)*
3. **Client:** trocar as escritas diretas (`AuthContext.tsx:173`, `MeuProjeto.tsx:127-155`) pelas RPCs; deploy. *(porção frontend — coordenar com SYS-04)*

**Bloco 2 — Endurecimento da RLS (P0, ~8–11h) — só depois do Bloco 1 em produção:**
4. DBT-S01: `REVOKE UPDATE` + `GRANT UPDATE (display_name, avatar_url)` + trigger de `plan`. *(4–6h)*
5. DBT-S03 + DBT-S06 (parte RLS): DROP das policies "Users update own" de `user_*_progress` e `psi_weeks`/`psi_tasks`/`psi_projects` (agora que tudo passa por RPC). *(2–3h)*
6. DBT-S07: varredura/lint final de policies + `WITH CHECK` explícito onde ajudar legibilidade. *(1–2h)*

**Bloco 3 — Integridade (P1, ~4–6h):**
7. DBT-D01/D02/D03: 3 FKs `ON DELETE CASCADE` via `NOT VALID` → limpar órfãos → `VALIDATE`. *(3–5h)*
8. DBT-D05: CHECK `points >= 0`. *(0,5–1h)*

**Bloco 4 — Performance (P2, ~2–3h):**
9. DBT-P01: `idx_profiles_points`. *(0,5h)* — entrego já, não depende de nada.
10. DBT-P02/P03: entregar índice + (opcional) RPC de leaderboard; **refetch incremental é da Fase 6.** *(1–1,5h)*

**Bloco 5 — Higiene / baixo risco (P3, ~4–6h):** DBT-S05 (caller check), DBT-M02 (`ON CONFLICT` nos seeds), DBT-C01 (CHECK de tamanho), DBT-M01 (documentar mapa de migrations), DBT-M03 (nota de propósito + paridade do `bootstrap_full_schema.sql`).

**Bloco 6 — Persistência social (P1 feature, ~3–5h DB):** DBT-N01 — modelar tabelas de tips/likes/comments seguindo o padrão já validado em `personality_notes`. É porta de entrada de SYS-06; a porção DB é pequena, o resto é produto/frontend.

**Aviso de governança (Constituição AIOX — Art. V, Quality First):** nenhuma dessas migrações deve ir a produção sem *dry-run* + verificação de órfãos (Bloco 3) e sem o Bloco 1 já deployado (Bloco 2 depende disso). Toda migração de RLS deve ser seguida de **teste de impersonação** (`test-as-user`) confirmando que um usuário comum **não** consegue mais `SET plan='premium'` nem forjar `completed_at`.

---
*Revisão produzida por Dara (@data-engineer) — Fase 5 Brownfield Discovery. Débitos da Fase 2 validados; 3 débitos novos adicionados (DBT-S06, DBT-S07, DBT-M03) a partir da re-auditoria das migrations `psi_*`/`pci_*` não cobertas originalmente. Estimativas para dev pleno/sênior. Correção técnica registrada: o fix do achado crítico é column-level/RPC, não `WITH CHECK`.*
