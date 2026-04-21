
-- Garantir que posts envie dados completos no realtime
ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- Adicionar tabela posts à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
