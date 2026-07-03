import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Lock, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  objetivo: string | null;
  tempo_estimado_min: number;
  dificuldade: string;
  status: string;
}

interface Week {
  id: string;
  numero: number;
  titulo: string;
  status: string;
}

interface Project {
  id: string;
  nome: string;
  objetivo: string;
}

export default function MeuProjeto() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [tasksByWeek, setTasksByWeek] = useState<Record<string, Task[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [checkinAberto, setCheckinAberto] = useState<string | null>(null);
  const [executou, setExecutou] = useState<'sim' | 'parcial' | 'nao'>('sim');
  const [dificuldades, setDificuldades] = useState('');

  useEffect(() => {
    if (!user) return;
    carregarProjeto();
  }, [user]);

  const carregarProjeto = async () => {
    if (!user) return;
    setCarregando(true);

    const { data: projectData } = await supabase
      .from('psi_projects')
      .select('id, nome, objetivo')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!projectData) {
      navigate('/novo-projeto');
      return;
    }

    setProject(projectData);

    const { data: weeksData } = await supabase
      .from('psi_weeks')
      .select('id, numero, titulo, status')
      .eq('project_id', projectData.id)
      .order('numero');

    setWeeks(weeksData ?? []);

    if (weeksData && weeksData.length > 0) {
      const { data: tasksData } = await supabase
        .from('psi_tasks')
        .select('id, week_id, ordem, titulo, descricao, objetivo, tempo_estimado_min, dificuldade, status')
        .in('week_id', weeksData.map(w => w.id))
        .order('ordem');

      const grouped: Record<string, Task[]> = {};
      (tasksData ?? []).forEach((t: any) => {
        if (!grouped[t.week_id]) grouped[t.week_id] = [];
        grouped[t.week_id].push(t);
      });
      setTasksByWeek(grouped);
    }

    setCarregando(false);
  };

  const abrirCheckin = (taskId: string) => {
    setExecutou('sim');
    setDificuldades('');
    setCheckinAberto(taskId);
  };

  const confirmarCheckin = async (task: Task, week: Week) => {
    if (!user) return;

    const { error: checkinError } = await supabase.from('psi_checkins').insert({
      task_id: task.id,
      user_id: user.id,
      executou,
      dificuldades: dificuldades.trim() || null,
    });
    if (checkinError) {
      toast({ title: 'Erro ao registrar check-in', variant: 'destructive' });
      return;
    }

    await supabase
      .from('psi_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', task.id);

    const tarefasDaSemana = tasksByWeek[week.id] ?? [];
    const todasConcluidas = tarefasDaSemana.every(t => t.id === task.id || t.status === 'completed');

    if (todasConcluidas) {
      await supabase
        .from('psi_weeks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', week.id);

      const proximaSemana = weeks.find(w => w.numero === week.numero + 1);
      if (proximaSemana) {
        await supabase
          .from('psi_weeks')
          .update({ status: 'active', unlocked_at: new Date().toISOString() })
          .eq('id', proximaSemana.id);
        toast({ title: `Semana ${week.numero} concluída! 🎉`, description: `Semana ${proximaSemana.numero} liberada.` });
      } else {
        toast({ title: 'Projeto concluído! 🏆', description: 'Você chegou ao fim das 4 semanas.' });
        if (project) {
          await supabase.from('psi_projects').update({ status: 'completed' }).eq('id', project.id);
        }
      }
    } else {
      toast({ title: 'Tarefa concluída!' });
    }

    setCheckinAberto(null);
    carregarProjeto();
  };

  if (carregando) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Carregando sua jornada...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            <span className="neon-text">{project?.nome}</span>
          </h1>
          <p className="text-muted-foreground">{project?.objetivo}</p>
        </div>

        {weeks.map((week) => {
          const tarefas = tasksByWeek[week.id] ?? [];
          const isLocked = week.status === 'locked';
          const isCompleted = week.status === 'completed';

          return (
            <div key={week.id} className={cn('glass-card p-6', isLocked && 'opacity-50')}>
              <div className="flex items-center gap-3 mb-4">
                {isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : isCompleted ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Circle className="w-5 h-5 text-primary" />}
                <h2 className="text-xl font-semibold">Semana {week.numero} — {week.titulo}</h2>
              </div>

              {!isLocked && (
                <div className="space-y-3">
                  {tarefas.map((task) => (
                    <div key={task.id} className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <p className={cn('font-medium', task.status === 'completed' && 'line-through text-muted-foreground')}>
                              {task.titulo}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 ml-6">{task.descricao}</p>
                          <div className="flex items-center gap-1 mt-2 ml-6 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {task.tempo_estimado_min} min
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => abrirCheckin(task.id)}>
                            Concluir
                          </Button>
                        )}
                      </div>

                      {checkinAberto === task.id && (
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                          <p className="text-sm font-medium">Como foi executar essa tarefa?</p>
                          <div className="flex gap-2">
                            {(['sim', 'parcial', 'nao'] as const).map((opcao) => (
                              <button
                                key={opcao}
                                type="button"
                                onClick={() => setExecutou(opcao)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                                  executou === opcao ? 'bg-primary/20 neon-border' : 'bg-muted/30'
                                )}
                              >
                                {opcao === 'sim' ? 'Sim' : opcao === 'parcial' ? 'Parcialmente' : 'Não'}
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Encontrou alguma dificuldade? (opcional)"
                            value={dificuldades}
                            onChange={(e) => setDificuldades(e.target.value)}
                            className="bg-muted/50 border-border/50 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => confirmarCheckin(task, week)}>Salvar</Button>
                            <Button size="sm" variant="ghost" onClick={() => setCheckinAberto(null)}>Cancelar</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isLocked && (
                <p className="text-sm text-muted-foreground">Conclua a semana anterior para desbloquear.</p>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
