# Modelo de Dados LGPD do SafeSpace — Design (Story 1.2)

**Autor:** Dara (@data-engineer) · **Quality gate:** @architect · **Data:** 2026-07-05
**Status:** Proposta de design — aguardando revisão do `@architect` e validação jurídica humana (base legal)

> Escopo desta story: **desenhar** o modelo de dados. Não há migration SQL executável aqui — isso é entregue na Story 3 (Lote 1b), depois que este design for aprovado. [Ver AC 4]

---

## 1. Contexto e por que o padrão `personality_notes` não serve aqui

O app já tem um precedente recente de migrar uma tela de `useState` para uma tabela real com RLS: `personality_notes` (`supabase/migrations/20260704143449_personality_notes.sql`).

```sql
CREATE TABLE public.personality_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_id TEXT NOT NULL,
  relato TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE POLICY "Users view own personality notes"
  ON public.personality_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

Isso expõe `user_id` como coluna comum na própria tabela de conteúdo, com uma policy que permite ao próprio usuário (e a admins) consultar o vínculo autor↔conteúdo diretamente via `SELECT`.

**Isso é correto para um relato de personalidade** — não é dado sensível de saúde, e o usuário espera ver seu próprio histórico associado ao seu nome.

**Isso é incorreto para o SafeSpace.** Um "desabafo anônimo" sobre saúde emocional com `user_id` visível/consultável por qualquer client autenticado com a própria sessão é **pseudonimização reidentificável, não anonimização real** — exatamente o alerta do `GOV-L01` no assessment de débito técnico (`docs/prd/technical-debt-assessment.md`, linha 121): *"'Anônimo' client-side com `user_id` = pseudonimização (reidentificável), não anonimização"*.

A mecânica de migração (sair de `useState` para tabela real, RLS habilitada, índice) **é** reaproveitada de `personality_notes` — só o tratamento da coluna de autoria muda.

### Não há dados legados a migrar (AC 6)

Hoje o SafeSpace é 100% mock local: `src/pages/SafeSpace.tsx` usa `useState<SafeSpacePost[]>(initialPosts)`, e `SafeSpacePost` (`src/lib/mockData.ts`, linhas 26-32) tem apenas `id`, `content`, `timestamp`, `comments`, `likes` — **sem nenhum campo de autor**. Não existe, portanto, nenhum desabafo real já persistido em risco. Esta é uma migração de zero para uma tabela nova, não uma correção de dados existentes.

---

## 2. Modelo de dados proposto: 2 tabelas, autoria trancada

A ideia central: **separar o conteúdo público (o que qualquer usuário autenticado pode ler) da autoria (quem escreveu) em duas tabelas com níveis de acesso completamente diferentes.**

### 2.1 `safespace_posts` — conteúdo público, sem coluna de autor

```
Tabela: public.safespace_posts
├── id            UUID        PK, default gen_random_uuid()
├── content       TEXT        NOT NULL
├── created_at    TIMESTAMPTZ NOT NULL, default now()
└── likes_count   INTEGER     NOT NULL, default 0
```

Nenhuma coluna referencia `auth.users`. Não existe `user_id`, `author_id`, nem qualquer FK para identidade. RLS: `SELECT` liberado para `authenticated` (a feed é lida por todo mundo, como hoje); `INSERT`/`UPDATE`/`DELETE` **não** liberados direto — só via RPC (seção 2.3).

### 2.2 `safespace_post_authorship` — autoria trancada, sem policy de leitura para `authenticated`

```
Tabela: public.safespace_post_authorship
├── post_id       UUID        PK, FK → safespace_posts(id) ON DELETE CASCADE
├── user_id       UUID        NOT NULL, FK → auth.users(id) ON DELETE CASCADE
└── created_at    TIMESTAMPTZ NOT NULL, default now()
```

RLS habilitada, **sem nenhuma policy de `SELECT` para o papel `authenticated`**. O único jeito de ler essa tabela é através de uma função `SECURITY DEFINER` restrita a `admin`/compliance (seção 2.4) — nunca por uma query direta do client, nem do próprio autor.

> Por que uma tabela separada em vez de uma coluna `user_id` com RLS restritiva na mesma tabela de `safespace_posts`? Porque RLS previne o `SELECT` via API/PostgREST, mas qualquer coluna sensível que *existe* na mesma linha aumenta a superfície de risco (dump de backup, replicação, acesso direto ao Postgres por alguém com `service_role`, futuro bug de policy). Fisicamente separar o dado sensível reduz o raio de exposição — é defesa em profundidade, não só controle de acesso.

### 2.3 Comentários (`safespace_comments`) — mesmo padrão

Os comentários hoje (`SafeSpacePost.comments`) têm a mesma característica de "resposta anônima de apoio" e sofrem do mesmo risco. Proposta simétrica:

```
Tabela: public.safespace_comments
├── id            UUID        PK, default gen_random_uuid()
├── post_id       UUID        NOT NULL, FK → safespace_posts(id) ON DELETE CASCADE
├── content       TEXT        NOT NULL
└── created_at    TIMESTAMPTZ NOT NULL, default now()

Tabela: public.safespace_comment_authorship
├── comment_id    UUID        PK, FK → safespace_comments(id) ON DELETE CASCADE
├── user_id       UUID        NOT NULL, FK → auth.users(id) ON DELETE CASCADE
└── created_at    TIMESTAMPTZ NOT NULL, default now()
```

Fora de escopo desta story detalhar RPCs de comentário linha a linha — o mecanismo é idêntico ao de posts (seção 2.4), só trocando a tabela-alvo.

### 2.4 RPC de publicação — única porta de entrada, `SECURITY DEFINER`

```sql
-- Assinatura proposta (SEM corpo executável — design apenas, ver AC 4)
CREATE FUNCTION public.create_safespace_post(_content TEXT)
RETURNS UUID  -- id do post criado
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _post_id UUID;
BEGIN
  INSERT INTO public.safespace_posts (content)
  VALUES (_content)
  RETURNING id INTO _post_id;

  INSERT INTO public.safespace_post_authorship (post_id, user_id)
  VALUES (_post_id, auth.uid());

  RETURN _post_id;
END;
$$;
```

As duas inserções acontecem na mesma transação (corpo de função Postgres é atômico por padrão — se a segunda `INSERT` falhar, a primeira é revertida). O client nunca faz `INSERT` direto em nenhuma das duas tabelas; só chama essa RPC via `supabase.rpc('create_safespace_post', { _content })`.

### 2.5 Prova de que o client comum não consegue reidentificar o autor (AC 3 — "teste de reidentificação")

Cenário: um usuário autenticado comum (não admin) tenta descobrir quem escreveu um post específico.

```sql
-- Tentativa 1: consultar a tabela de conteúdo (funciona, mas não expõe autoria)
SELECT id, content, created_at FROM public.safespace_posts WHERE id = '<post_id>';
-- ✅ Retorna o post — mas a tabela não tem nenhuma coluna de autor. Não há o que reidentificar aqui.

-- Tentativa 2: consultar a tabela de autoria diretamente via PostgREST/client SDK
SELECT user_id FROM public.safespace_post_authorship WHERE post_id = '<post_id>';
-- ❌ RLS ativa, sem policy de SELECT para `authenticated` → PostgREST retorna 0 linhas
--    (comportamento padrão do Supabase quando RLS bloqueia: não é erro, é "não encontrado")

-- Tentativa 3: tentar via join implícito (ex.: PostgREST embed safespace_posts?select=*,safespace_post_authorship(*))
-- ❌ Mesmo resultado — o embed do PostgREST ainda respeita RLS da tabela embutida,
--    então a sub-relação some do payload, não retorna user_id.
```

O único caminho que retorna `user_id` é uma chamada a uma função `SECURITY DEFINER` de leitura (seção 2.6), que a própria função deve gatear com `public.has_role(auth.uid(), 'admin'::app_role)` antes de retornar qualquer coisa — reaproveitando a função `has_role` que já existe (`supabase/migrations/20260421180824_*.sql`) e o enum `app_role` (`admin`, `moderator`, `user`), sem precisar criar papel novo.

Isso é o "teste de reidentificação" citado no assessment (seção "E2E de negócio"): um `SELECT` direto nas tabelas expostas ao client autenticado não reidentifica o autor — só uma função administrativa explícita, auditável e restrita a papel `admin`, consegue.

### 2.6 RPC administrativa de leitura de autoria — assinatura explícita

> Adicionado na revisão do `@architect`: a seção 2.5 citava essa função apenas de passagem; como ela é a única porta de leitura de autoria (uso: investigação de abuso/denúncia, pedido de titular via suporte), merece assinatura própria, não só menção.

```sql
-- Assinatura proposta (SEM corpo executável — design apenas, ver AC 4)
CREATE FUNCTION public.get_safespace_post_author(_post_id UUID)
RETURNS UUID  -- user_id do autor, ou NULL se já expurgado (seção 3.3)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN (
    SELECT user_id FROM public.safespace_post_authorship WHERE post_id = _post_id
  );
END;
$$;
```

Toda chamada a essa função é, por natureza, um acesso administrativo a dado sensível — recomenda-se (Story 3) logar cada chamada (quem chamou, quando, para qual `post_id`) em uma tabela de auditoria simples, para que o uso dessa porta fique rastreável e não vire um vazamento silencioso por uso indevido de uma conta admin.

---

## 3. Base legal, minimização, retenção e apagamento (`GOV-L01`)

### 3.1 Base legal (recomendação técnica — **decisão final é jurídica, ação humana fora do escopo de dev**)

> ⚠️ **Esta seção é uma recomendação técnica, não uma decisão jurídica.** O ILUMINNARE opera em contexto B2B (empresa contrata para seus colaboradores). Antes da Story 3 subir em produção, a base legal proposta abaixo precisa ser validada por um advogado especializado em LGPD/dado sensível de saúde. Nenhuma persistência real de conteúdo de saúde emocional deve ir ao ar sem essa validação.

Recomendação técnica preliminar: **consentimento explícito e específico** (LGPD, art. 11, II, "a" — hipótese para dado sensível), coletado no onboarding do colaborador, com linguagem clara de que:
- O conteúdo do desabafo é armazenado de forma desacoplada de identidade para uso da plataforma (finalidade de apoio emocional/histórico pessoal, se aplicável);
- A autoria fica registrada separadamente, sob acesso restrito, apenas para permitir que o próprio autor peça a remoção do seu conteúdo (ver 3.4) e para obrigações legais/moderação, se necessário;
- O consentimento é específico para o SafeSpace — não pode ser genérico ("aceito os termos de uso" cobrindo tudo).

Alternativas descartadas nesta recomendação preliminar (mas a decisão cabe ao jurídico): "legítimo interesse" é uma base mais frágil para dado sensível de saúde (LGPD art. 11 restringe legítimo interesse como hipótese válida para dados sensíveis); "execução de contrato" não se aplica bem a um recurso opcional de bem-estar.

### 3.2 Minimização

- `safespace_posts.content` é texto livre — não há campo estruturado adicional coletando metadados desnecessários (localização, dispositivo, IP) hoje nem proposto aqui.
- `safespace_post_authorship` guarda **apenas** `post_id` + `user_id` + `created_at` — o mínimo necessário para permitir apagamento a pedido e auditoria administrativa. Nenhum outro dado (ex.: IP, user-agent) é proposto para essa tabela.

### 3.3 Retenção e expurgo

Proposta: a tabela `safespace_post_authorship` (e a equivalente de comentários) tem uma **janela de retenção configurável**, sugerida em **90 dias** como ponto de partida razoável (prazo curto o suficiente para limitar exposição, longo o suficiente para permitir moderação/denúncia de abuso nesse intervalo) — **o valor exato é decisão de negócio/jurídica, não hardcoded no código**. Passado esse prazo, um job agendado (ex.: `pg_cron` ou Edge Function agendada) apaga a linha de autoria (`DELETE FROM safespace_post_authorship WHERE created_at < now() - retention_window`), **sem apagar o post em `safespace_posts`** — o conteúdo público permanece (o desabafo continua existindo para a comunidade), só o vínculo de identidade é expurgado. Depois do expurgo, aquele post se torna **irreversivelmente anônimo** (nem um admin consegue mais linká-lo a um autor).

### 3.4 Direito ao apagamento

Proposta de RPC (assinatura, sem corpo executável — Story 3 implementa):

```sql
CREATE FUNCTION public.delete_own_safespace_post(_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Valida autoria via a tabela trancada antes de apagar
  IF NOT EXISTS (
    SELECT 1 FROM public.safespace_post_authorship
    WHERE post_id = _post_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE; -- não é o autor (ou já foi expurgado) — nada acontece
  END IF;

  DELETE FROM public.safespace_posts WHERE id = _post_id; -- CASCADE remove authorship e comments
  RETURN TRUE;
END;
$$;
```

Como a função é `SECURITY DEFINER` mas valida `auth.uid()` internamente contra a tabela trancada, só o próprio autor (identificado pela sessão, não por um parâmetro que o client poderia forjar) consegue apagar seu post — o mesmo padrão de "checagem manual de `auth.uid()`" já usado em `award_points` (sistema de pontos existente do projeto).

---

## 4. Resumo do que fica para a Story 3 (fora de escopo aqui)

- Migration SQL executável das tabelas, RPCs e job de expurgo acima (hoje são apenas propostas de design).
- Implementação real das RPCs `create_safespace_post`, `delete_own_safespace_post`, `get_safespace_post_author` (admin) e equivalentes de comentário, incluindo a tabela de auditoria de chamadas administrativas recomendada na seção 2.6.
- Configuração do job agendado de expurgo (90 dias, valor final a confirmar).
- Atualização de `src/pages/SafeSpace.tsx` para trocar `SAFESPACE_PERSISTENCE_ENABLED` (Story 1.3) de `false` para `true` e ligar de fato nas RPCs acima.
- **Pré-requisito não-técnico:** validação jurídica humana da base legal (seção 3.1) e confirmação do prazo de retenção (seção 3.3) — sem isso, a Story 3 não deve subir em produção mesmo que o código esteja pronto.

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-07-05 | 1.0 | Documento de design criado a partir da Story 1.2 — `@data-engineer` (Dara) | Dara (@data-engineer) |
| 2026-07-05 | 1.1 | Quality gate `@architect` (Aria): adicionada seção 2.6 (assinatura explícita da RPC administrativa de leitura de autoria + recomendação de auditoria de acesso). Aprovado (GO). | Aria (@architect) |
