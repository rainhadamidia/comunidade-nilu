-- ============================================
-- PCI (PERFIL COMPORTAMENTAL INDIVIDUAL) — DIAGNÓSTICO
-- ============================================
-- Guarda cada realização do diagnóstico comportamental (questionário de
-- 20 perguntas / 5 traços). Um usuário pode ter mais de um registro ao
-- longo do tempo: 1x obrigatório no plano gratuito, e novamente ao
-- avançar para o Premium (o perfil evolui com a transformação do usuário
-- durante o nível gratuito). O resultado "atual" é sempre o mais recente
-- (ORDER BY created_at DESC LIMIT 1).

CREATE TABLE public.pci_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL, -- { [perguntaId]: valor(1-5) }
  scores JSONB NOT NULL, -- { inovador: 23.4, comunicador: 18.1, ... } somando 100
  dominante TEXT NOT NULL,
  secundario TEXT NOT NULL,
  terciario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pci_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own PCI results"
  ON public.pci_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own PCI results"
  ON public.pci_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all PCI results"
  ON public.pci_results FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_pci_results_user_created ON public.pci_results(user_id, created_at DESC);
