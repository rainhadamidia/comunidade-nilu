-- ============================================
-- NEURAL COINS — funcao de incremento atomico de pontos
-- ============================================
-- Reaproveita a coluna profiles.points ja existente. SECURITY DEFINER
-- para incrementar de forma atomica (evita race condition de
-- ler-modificar-escrever no cliente), mas checa auth.uid() manualmente
-- ja que bypassa RLS.

CREATE OR REPLACE FUNCTION public.award_points(_user_id UUID, _amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_points INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized to award points to this user';
  END IF;

  UPDATE public.profiles
  SET points = points + _amount
  WHERE user_id = _user_id
  RETURNING points INTO _new_points;

  RETURN _new_points;
END;
$$;
