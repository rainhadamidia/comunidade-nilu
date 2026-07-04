-- ============================================
-- RELATOS PESSOAIS NA TELA "PERSONALIDADES"
-- ============================================
-- Antes o botao "Salvar no meu perfil" so guardava em estado local
-- do React (perdia tudo ao atualizar a pagina). Tabela para persistir
-- de verdade, no mesmo padrao de RLS de psi_checkins.

CREATE TABLE public.personality_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_id TEXT NOT NULL,
  relato TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.personality_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own personality notes"
  ON public.personality_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own personality notes"
  ON public.personality_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all personality notes"
  ON public.personality_notes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_personality_notes_user ON public.personality_notes(user_id, personality_id);
