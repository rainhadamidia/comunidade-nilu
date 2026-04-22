-- Enum para categorias de conteúdo
CREATE TYPE public.content_category AS ENUM ('book', 'movie', 'meditation', 'music', 'community');

-- Tabela conteudos
CREATE TABLE public.conteudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  how_it_helped TEXT,
  category public.content_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Conteudos viewable by authenticated users"
  ON public.conteudos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own conteudos"
  ON public.conteudos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conteudos"
  ON public.conteudos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conteudos"
  ON public.conteudos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any conteudo"
  ON public.conteudos FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_conteudos_updated_at
  BEFORE UPDATE ON public.conteudos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index para filtros por categoria
CREATE INDEX idx_conteudos_category ON public.conteudos(category);
CREATE INDEX idx_conteudos_created_at ON public.conteudos(created_at DESC);