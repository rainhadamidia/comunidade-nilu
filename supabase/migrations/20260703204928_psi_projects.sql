-- ============================================
-- PSI (PROJETOS, SONHOS E IDEIAS)
-- ============================================
-- Cadastro do projeto do usuario, quebrado em 4 semanas/etapas com
-- tarefas diarias (Estrutura do PSI.docx). Plano gratuito permite
-- 1 PSI ativo por vez (regra aplicada na Task #6 de gating freemium);
-- aqui so a estrutura de dados.

CREATE TYPE public.psi_prioridade AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE public.psi_status AS ENUM ('active', 'completed', 'abandoned');

CREATE TABLE public.psi_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pci_result_id UUID REFERENCES public.pci_results(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  objetivo TEXT NOT NULL,
  prazo_dias INTEGER NOT NULL DEFAULT 90,
  prioridade public.psi_prioridade NOT NULL DEFAULT 'media',
  categoria TEXT,
  status public.psi_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.psi_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own psi projects"
  ON public.psi_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own psi projects"
  ON public.psi_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own psi projects"
  ON public.psi_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_psi_projects_updated_at
  BEFORE UPDATE ON public.psi_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_psi_projects_user ON public.psi_projects(user_id, created_at DESC);

-- ============================================
-- SEMANAS (4 por projeto, gating sequencial)
-- ============================================

CREATE TYPE public.psi_week_status AS ENUM ('locked', 'active', 'completed');

CREATE TABLE public.psi_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.psi_projects(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL CHECK (numero BETWEEN 1 AND 4),
  titulo TEXT NOT NULL,
  status public.psi_week_status NOT NULL DEFAULT 'locked',
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (project_id, numero)
);

ALTER TABLE public.psi_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own psi weeks"
  ON public.psi_weeks FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.psi_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users insert own psi weeks"
  ON public.psi_weeks FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.psi_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users update own psi weeks"
  ON public.psi_weeks FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.psi_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE INDEX idx_psi_weeks_project ON public.psi_weeks(project_id, numero);

-- ============================================
-- TAREFAS DIARIAS (por semana)
-- ============================================

CREATE TYPE public.psi_task_status AS ENUM ('pending', 'in_progress', 'paused', 'completed');
CREATE TYPE public.psi_task_dificuldade AS ENUM ('facil', 'media', 'dificil');

CREATE TABLE public.psi_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES public.psi_weeks(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivo TEXT,
  tempo_estimado_min INTEGER NOT NULL DEFAULT 30,
  dificuldade public.psi_task_dificuldade NOT NULL DEFAULT 'media',
  status public.psi_task_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (week_id, ordem)
);

ALTER TABLE public.psi_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own psi tasks"
  ON public.psi_tasks FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.psi_weeks w
    JOIN public.psi_projects p ON p.id = w.project_id
    WHERE w.id = week_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own psi tasks"
  ON public.psi_tasks FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.psi_weeks w
    JOIN public.psi_projects p ON p.id = w.project_id
    WHERE w.id = week_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users update own psi tasks"
  ON public.psi_tasks FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.psi_weeks w
    JOIN public.psi_projects p ON p.id = w.project_id
    WHERE w.id = week_id AND p.user_id = auth.uid()
  ));

CREATE INDEX idx_psi_tasks_week ON public.psi_tasks(week_id, ordem);

-- ============================================
-- CHECK-INS DIARIOS (relatorio rapido de fim de dia)
-- ============================================

CREATE TABLE public.psi_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.psi_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  executou TEXT NOT NULL CHECK (executou IN ('sim', 'parcial', 'nao')),
  produtividade INTEGER CHECK (produtividade BETWEEN 1 AND 5),
  dificuldades TEXT,
  tempo_usado_min INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.psi_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own psi checkins"
  ON public.psi_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own psi checkins"
  ON public.psi_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_psi_checkins_user ON public.psi_checkins(user_id, created_at DESC);
