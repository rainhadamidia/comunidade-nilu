-- ============================================
-- SISTEMA DE PROGRESSO POR ETAPAS (8 desafios sequenciais por etapa)
-- ============================================

-- Tabela de etapas (stages)
CREATE TABLE public.stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de desafios por etapa (8 por stage)
CREATE TABLE public.stage_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 8),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action TEXT,
  reflection TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (stage_id, position)
);

-- Progresso do usuário em cada desafio
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.stage_challenges(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  available_at TIMESTAMP WITH TIME ZONE, -- quando o desafio fica disponível (24h após o anterior)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- Progresso do usuário em cada etapa
CREATE TABLE public.user_stage_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, stage_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stage_progress ENABLE ROW LEVEL SECURITY;

-- Stages: visíveis a todos autenticados; só admin gerencia
CREATE POLICY "Stages viewable by authenticated"
  ON public.stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage stages"
  ON public.stages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Stage challenges: visíveis a todos autenticados; só admin gerencia
CREATE POLICY "Stage challenges viewable by authenticated"
  ON public.stage_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage stage challenges"
  ON public.stage_challenges FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User challenge progress: usuário vê/cria/atualiza só o próprio
CREATE POLICY "Users view own challenge progress"
  ON public.user_challenge_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own challenge progress"
  ON public.user_challenge_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own challenge progress"
  ON public.user_challenge_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all challenge progress"
  ON public.user_challenge_progress FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User stage progress: usuário vê/cria/atualiza só o próprio
CREATE POLICY "Users view own stage progress"
  ON public.user_stage_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stage progress"
  ON public.user_stage_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stage progress"
  ON public.user_stage_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all stage progress"
  ON public.user_stage_progress FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TRIGGERS de updated_at
-- ============================================
CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stage_challenges_updated_at
  BEFORE UPDATE ON public.stage_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON public.user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stage_progress_updated_at
  BEFORE UPDATE ON public.user_stage_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_user_challenge_progress_user ON public.user_challenge_progress(user_id);
CREATE INDEX idx_user_stage_progress_user ON public.user_stage_progress(user_id);
CREATE INDEX idx_stage_challenges_stage ON public.stage_challenges(stage_id, position);

-- ============================================
-- FUNÇÃO: inicializa o progresso do usuário (desbloqueia primeira etapa + 1º desafio)
-- ============================================
CREATE OR REPLACE FUNCTION public.initialize_user_progress(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  first_stage_id UUID;
  first_challenge_id UUID;
BEGIN
  -- Encontra a primeira etapa
  SELECT id INTO first_stage_id
  FROM public.stages
  ORDER BY position ASC
  LIMIT 1;

  IF first_stage_id IS NULL THEN
    RETURN;
  END IF;

  -- Desbloqueia a primeira etapa
  INSERT INTO public.user_stage_progress (user_id, stage_id, unlocked_at)
  VALUES (_user_id, first_stage_id, now())
  ON CONFLICT (user_id, stage_id) DO NOTHING;

  -- Encontra o primeiro desafio dessa etapa
  SELECT id INTO first_challenge_id
  FROM public.stage_challenges
  WHERE stage_id = first_stage_id
  ORDER BY position ASC
  LIMIT 1;

  IF first_challenge_id IS NOT NULL THEN
    INSERT INTO public.user_challenge_progress
      (user_id, challenge_id, stage_id, unlocked_at, available_at)
    VALUES
      (_user_id, first_challenge_id, first_stage_id, now(), now())
    ON CONFLICT (user_id, challenge_id) DO NOTHING;
  END IF;
END;
$$;

-- ============================================
-- FUNÇÃO: completar um desafio
-- - marca como completo
-- - desbloqueia o próximo (available_at = now() + 24h) OU
-- - se foi o 8º, marca a etapa como concluída e desbloqueia a próxima etapa
-- ============================================
CREATE OR REPLACE FUNCTION public.complete_user_challenge(_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _stage_id UUID;
  _position INTEGER;
  _next_challenge_id UUID;
  _next_stage_id UUID;
  _next_stage_first_challenge_id UUID;
  _stage_position INTEGER;
  _completed_count INTEGER;
  _result JSONB := '{}'::jsonb;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Busca dados do desafio
  SELECT sc.stage_id, sc.position, s.position
    INTO _stage_id, _position, _stage_position
  FROM public.stage_challenges sc
  JOIN public.stages s ON s.id = sc.stage_id
  WHERE sc.id = _challenge_id;

  IF _stage_id IS NULL THEN
    RAISE EXCEPTION 'Challenge not found';
  END IF;

  -- Verifica se o usuário tem esse desafio desbloqueado e disponível
  PERFORM 1 FROM public.user_challenge_progress
  WHERE user_id = _user_id
    AND challenge_id = _challenge_id
    AND unlocked_at IS NOT NULL
    AND (available_at IS NULL OR available_at <= now())
    AND completed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge is not available to complete';
  END IF;

  -- Marca como completo
  UPDATE public.user_challenge_progress
  SET completed_at = now()
  WHERE user_id = _user_id AND challenge_id = _challenge_id;

  _result := jsonb_build_object('completed_challenge_id', _challenge_id);

  -- Se não foi o 8º desafio, desbloqueia o próximo da mesma etapa com available_at = now() + 24h
  IF _position < 8 THEN
    SELECT id INTO _next_challenge_id
    FROM public.stage_challenges
    WHERE stage_id = _stage_id AND position = _position + 1;

    IF _next_challenge_id IS NOT NULL THEN
      INSERT INTO public.user_challenge_progress
        (user_id, challenge_id, stage_id, unlocked_at, available_at)
      VALUES
        (_user_id, _next_challenge_id, _stage_id, now(), now() + interval '24 hours')
      ON CONFLICT (user_id, challenge_id) DO UPDATE
        SET unlocked_at = COALESCE(public.user_challenge_progress.unlocked_at, now()),
            available_at = COALESCE(public.user_challenge_progress.available_at, now() + interval '24 hours');

      _result := _result || jsonb_build_object('next_challenge_id', _next_challenge_id, 'next_available_at', now() + interval '24 hours');
    END IF;
  ELSE
    -- Era o 8º: verificar se realmente todos foram completados
    SELECT COUNT(*) INTO _completed_count
    FROM public.user_challenge_progress
    WHERE user_id = _user_id
      AND stage_id = _stage_id
      AND completed_at IS NOT NULL;

    IF _completed_count >= 8 THEN
      -- Marca a etapa como concluída
      UPDATE public.user_stage_progress
      SET completed_at = now()
      WHERE user_id = _user_id AND stage_id = _stage_id;

      -- Encontra a próxima etapa
      SELECT id INTO _next_stage_id
      FROM public.stages
      WHERE position = _stage_position + 1;

      IF _next_stage_id IS NOT NULL THEN
        INSERT INTO public.user_stage_progress (user_id, stage_id, unlocked_at)
        VALUES (_user_id, _next_stage_id, now())
        ON CONFLICT (user_id, stage_id) DO UPDATE
          SET unlocked_at = COALESCE(public.user_stage_progress.unlocked_at, now());

        -- Desbloqueia o primeiro desafio da próxima etapa (disponível imediatamente)
        SELECT id INTO _next_stage_first_challenge_id
        FROM public.stage_challenges
        WHERE stage_id = _next_stage_id
        ORDER BY position ASC
        LIMIT 1;

        IF _next_stage_first_challenge_id IS NOT NULL THEN
          INSERT INTO public.user_challenge_progress
            (user_id, challenge_id, stage_id, unlocked_at, available_at)
          VALUES
            (_user_id, _next_stage_first_challenge_id, _next_stage_id, now(), now())
          ON CONFLICT (user_id, challenge_id) DO NOTHING;

          _result := _result || jsonb_build_object(
            'stage_completed', _stage_id,
            'next_stage_id', _next_stage_id,
            'next_challenge_id', _next_stage_first_challenge_id
          );
        END IF;
      ELSE
        _result := _result || jsonb_build_object('stage_completed', _stage_id, 'all_stages_completed', true);
      END IF;
    END IF;
  END IF;

  RETURN _result;
END;
$$;

-- ============================================
-- Atualiza handle_new_user para inicializar progresso
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Inicializa o progresso de etapas/desafios
  PERFORM public.initialize_user_progress(NEW.id);

  RETURN NEW;
END;
$function$;

-- ============================================
-- SEED: 3 etapas iniciais com 8 desafios cada (sequenciais)
-- ============================================
INSERT INTO public.stages (position, title, description) VALUES
  (1, 'Despertar', 'Reconheça quem você é e inicie sua jornada de autoconhecimento.'),
  (2, 'Conexão', 'Aprofunde seus relacionamentos e a relação consigo mesmo.'),
  (3, 'Propósito', 'Descubra o que move sua vida e construa sua direção.');

-- Etapa 1: Despertar
WITH s AS (SELECT id FROM public.stages WHERE position = 1)
INSERT INTO public.stage_challenges (stage_id, position, title, description, action, reflection, points)
SELECT s.id, v.position, v.title, v.description, v.action, v.reflection, 10
FROM s, (VALUES
  (1, 'O Primeiro Passo', 'Toda jornada começa com um único passo consciente.', 'Escreva 3 coisas que você está evitando enfrentar.', 'Por que você está evitando essas situações?'),
  (2, 'O Espelho Interior', 'Conhecer a si mesmo é o início de toda sabedoria.', 'Observe suas reações em 3 situações hoje.', 'Suas reações refletem quem você é ou quem foi condicionado a ser?'),
  (3, 'Silêncio Sagrado', 'No silêncio encontramos respostas.', 'Passe 15 minutos em silêncio absoluto.', 'O que surgiu em sua mente?'),
  (4, 'Gratidão Consciente', 'A gratidão transforma o que temos em suficiente.', 'Liste 5 coisas pelas quais é grato.', 'Quantas você costuma ignorar?'),
  (5, 'O Medo Revelado', 'Nomear o medo é o primeiro passo para superá-lo.', 'Identifique seu maior medo e escreva sobre ele.', 'Esse medo é real ou construção da mente?'),
  (6, 'Conexão Autêntica', 'Conexões verdadeiras exigem vulnerabilidade.', 'Tenha uma conversa honesta com alguém.', 'Como foi se permitir vulnerável?'),
  (7, 'Perdão Libertador', 'Perdoar é escolher a liberdade.', 'Escreva uma carta de perdão.', 'Que peso você carrega por não perdoar?'),
  (8, 'Propósito Emergente', 'Seu propósito é construído.', 'Liste 3 paixões e 3 habilidades.', 'Onde elas se encontram?')
) AS v(position, title, description, action, reflection);

-- Etapa 2: Conexão
WITH s AS (SELECT id FROM public.stages WHERE position = 2)
INSERT INTO public.stage_challenges (stage_id, position, title, description, action, reflection, points)
SELECT s.id, v.position, v.title, v.description, v.action, v.reflection, 15
FROM s, (VALUES
  (1, 'Escuta Profunda', 'Ouvir é um ato de presença.', 'Tenha uma conversa onde você só escuta.', 'O que você descobriu apenas escutando?'),
  (2, 'Limites Saudáveis', 'Dizer não é se respeitar.', 'Estabeleça um limite que vinha adiando.', 'O que te impedia de colocar esse limite?'),
  (3, 'Reconciliação', 'Reaproxime-se de alguém importante.', 'Entre em contato com alguém com quem se afastou.', 'Como foi reabrir esse canal?'),
  (4, 'Gestos Pequenos', 'O afeto vive nos detalhes.', 'Faça 3 gestos de carinho inesperados hoje.', 'Como as pessoas reagiram?'),
  (5, 'Honestidade Radical', 'A verdade liberta.', 'Diga uma verdade que estava guardando.', 'Como se sentiu depois?'),
  (6, 'Empatia Ativa', 'Entender o outro é um exercício diário.', 'Coloque-se no lugar de alguém que você julga.', 'O que mudou na sua percepção?'),
  (7, 'Comunidade Viva', 'Pertencer fortalece.', 'Participe ativamente de um grupo ou comunidade.', 'O que pertencer significa para você?'),
  (8, 'Amor Próprio', 'Trate-se como trata quem ama.', 'Faça algo só para você, sem culpa.', 'Por que é difícil priorizar a si mesmo?')
) AS v(position, title, description, action, reflection);

-- Etapa 3: Propósito
WITH s AS (SELECT id FROM public.stages WHERE position = 3)
INSERT INTO public.stage_challenges (stage_id, position, title, description, action, reflection, points)
SELECT s.id, v.position, v.title, v.description, v.action, v.reflection, 20
FROM s, (VALUES
  (1, 'Valores Centrais', 'Saiba o que importa.', 'Liste seus 5 valores mais importantes.', 'Você vive de acordo com eles?'),
  (2, 'Visão de Futuro', 'Imagine onde quer chegar.', 'Escreva sua vida ideal daqui a 5 anos.', 'Quais passos te aproximam disso?'),
  (3, 'Talentos Únicos', 'Reconheça seus dons.', 'Pergunte a 3 pessoas qual seu maior talento.', 'Você está usando esses talentos?'),
  (4, 'Missão Pessoal', 'Defina sua direção.', 'Escreva uma frase que resuma seu propósito.', 'Como vivê-la diariamente?'),
  (5, 'Ação Concreta', 'Sonho sem ação é fantasia.', 'Dê um passo concreto rumo a um objetivo.', 'O que aprendeu fazendo?'),
  (6, 'Hábito Transformador', 'Repetição cria realidade.', 'Inicie um novo hábito alinhado ao propósito.', 'Como ele te aproxima de quem quer ser?'),
  (7, 'Legado Vivo', 'Pense no impacto.', 'Escreva o que querem dizer sobre você daqui a 50 anos.', 'O que precisa mudar para criar esse legado?'),
  (8, 'Renascimento', 'Feche um ciclo, abra outro.', 'Faça um ritual de encerramento e novo começo.', 'Quem você está se tornando?')
) AS v(position, title, description, action, reflection);

-- Inicializa progresso para usuários já existentes
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT user_id FROM public.profiles LOOP
    PERFORM public.initialize_user_progress(u.user_id);
  END LOOP;
END $$;