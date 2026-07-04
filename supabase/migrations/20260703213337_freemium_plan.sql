-- ============================================
-- FREEMIUM — plano do usuario
-- ============================================
-- Plano gratuito por padrao. Ate a integracao de pagamento real existir,
-- upgrade para 'premium' e feito manualmente (Table Editor) por um admin.
-- Regra de negocio (Regra do usuario.docx): grátis = 1 PSI ativo; premium = ilimitado.

CREATE TYPE public.user_plan AS ENUM ('free', 'premium');

ALTER TABLE public.profiles
  ADD COLUMN plan public.user_plan NOT NULL DEFAULT 'free';
