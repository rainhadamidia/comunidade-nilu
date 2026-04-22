import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Lock,
  CheckCircle2,
  Play,
  ChevronRight,
  Sparkles,
  Clock,
  Trophy,
  Loader2,
} from 'lucide-react';

interface Stage {
  id: string;
  position: number;
  title: string;
  description: string | null;
}

interface StageChallenge {
  id: string;
  stage_id: string;
  position: number;
  title: string;
  description: string;
  action: string | null;
  reflection: string | null;
  points: number;
}

interface UserChallengeProgress {
  challenge_id: string;
  stage_id: string;
  unlocked_at: string | null;
  available_at: string | null;
  completed_at: string | null;
}

interface UserStageProgress {
  stage_id: string;
  unlocked_at: string | null;
  completed_at: string | null;
}

type ChallengeStatus = 'locked' | 'waiting' | 'available' | 'completed';

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Challenges() {
  const { user, addPoints } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [challenges, setChallenges] = useState<StageChallenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<UserChallengeProgress[]>([]);
  const [stageProgress, setStageProgress] = useState<UserStageProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<StageChallenge | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());

  // tick for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [stagesRes, challengesRes, cpRes, spRes] = await Promise.all([
        supabase.from('stages').select('*').order('position', { ascending: true }),
        supabase.from('stage_challenges').select('*').order('position', { ascending: true }),
        supabase.from('user_challenge_progress').select('*').eq('user_id', user.id),
        supabase.from('user_stage_progress').select('*').eq('user_id', user.id),
      ]);
      if (stagesRes.error) throw stagesRes.error;
      if (challengesRes.error) throw challengesRes.error;
      if (cpRes.error) throw cpRes.error;
      if (spRes.error) throw spRes.error;

      setStages(stagesRes.data || []);
      setChallenges(challengesRes.data || []);
      setChallengeProgress(cpRes.data || []);
      setStageProgress(spRes.data || []);

      // Safety net: if user has no progress yet, initialize via RPC
      if ((spRes.data?.length ?? 0) === 0) {
        await supabase.rpc('initialize_user_progress' as never, { _user_id: user.id } as never);
        const [cp2, sp2] = await Promise.all([
          supabase.from('user_challenge_progress').select('*').eq('user_id', user.id),
          supabase.from('user_stage_progress').select('*').eq('user_id', user.id),
        ]);
        setChallengeProgress(cp2.data || []);
        setStageProgress(sp2.data || []);
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Erro ao carregar desafios',
        description: e.message ?? String(e),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cpByChallengeId = useMemo(() => {
    const map = new Map<string, UserChallengeProgress>();
    challengeProgress.forEach((p) => map.set(p.challenge_id, p));
    return map;
  }, [challengeProgress]);

  const spByStageId = useMemo(() => {
    const map = new Map<string, UserStageProgress>();
    stageProgress.forEach((p) => map.set(p.stage_id, p));
    return map;
  }, [stageProgress]);

  const getChallengeStatus = (c: StageChallenge): ChallengeStatus => {
    const cp = cpByChallengeId.get(c.id);
    if (cp?.completed_at) return 'completed';
    if (!cp?.unlocked_at) return 'locked';
    const availableAt = cp.available_at ? new Date(cp.available_at).getTime() : 0;
    if (availableAt > now) return 'waiting';
    return 'available';
  };

  const handleComplete = async () => {
    if (!selectedChallenge) return;
    if (reflection.trim().length < 10) {
      toast({
        title: 'Reflexão necessária',
        description: 'Escreva pelo menos algumas palavras sobre sua experiência.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc(
        'complete_user_challenge' as never,
        { _challenge_id: selectedChallenge.id } as never,
      );
      if (error) throw error;

      addPoints(selectedChallenge.points, `Desafio: ${selectedChallenge.title}`);

      const result = (data as Record<string, unknown> | null) ?? {};
      if (result.stage_completed) {
        toast({
          title: '🏆 Etapa concluída!',
          description: result.next_stage_id
            ? 'Próxima etapa desbloqueada!'
            : 'Você concluiu todas as etapas disponíveis!',
        });
      } else {
        toast({
          title: '🎉 Desafio concluído!',
          description: result.next_available_at
            ? 'Próximo desafio disponível em 24h.'
            : `+${selectedChallenge.points} pontos!`,
        });
      }

      setSelectedChallenge(null);
      setReflection('');
      await fetchAll();
    } catch (e: any) {
      toast({
        title: 'Erro ao concluir',
        description: e.message ?? String(e),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">
          Faça login para acessar seus desafios.
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  const totalChallenges = challenges.length;
  const completedChallenges = challengeProgress.filter((p) => p.completed_at).length;
  const overallPercent = totalChallenges
    ? (completedChallenges / totalChallenges) * 100
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mapa de <span className="neon-text">Desafios</span>
          </h1>
          <p className="text-muted-foreground">
            Cada etapa tem 8 desafios sequenciais. O próximo é liberado 24h após você concluir o
            anterior.
          </p>
        </div>

        {/* Overall progress */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Progresso Geral</h2>
                <p className="text-sm text-muted-foreground">
                  {completedChallenges} de {totalChallenges} desafios concluídos
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold neon-text">{Math.round(overallPercent)}%</p>
          </div>
          <Progress value={overallPercent} className="h-2" />
        </div>

        {/* Stages */}
        <div className="space-y-8">
          {stages.map((stage) => {
            const stageChallengeList = challenges
              .filter((c) => c.stage_id === stage.id)
              .sort((a, b) => a.position - b.position);
            const sp = spByStageId.get(stage.id);
            const stageUnlocked = !!sp?.unlocked_at;
            const stageCompleted = !!sp?.completed_at;
            const completedInStage = stageChallengeList.filter(
              (c) => cpByChallengeId.get(c.id)?.completed_at,
            ).length;
            const stagePercent = (completedInStage / 8) * 100;

            return (
              <div
                key={stage.id}
                className={`glass-card p-6 ${!stageUnlocked ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        stageCompleted
                          ? 'bg-accent text-accent-foreground'
                          : stageUnlocked
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {stageCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : stageUnlocked ? (
                        stage.position
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        Etapa {stage.position}: {stage.title}
                      </h2>
                      {stage.description && (
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {stageCompleted && (
                      <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">
                        Etapa concluída
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {completedInStage}/8
                    </span>
                  </div>
                </div>

                <Progress value={stagePercent} className="h-2 mb-6" />

                {!stageUnlocked ? (
                  <p className="text-sm text-muted-foreground italic">
                    Conclua a etapa anterior para desbloquear.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-30" />
                    <div className="space-y-3">
                      {stageChallengeList.map((c) => {
                        const status = getChallengeStatus(c);
                        const cp = cpByChallengeId.get(c.id);
                        const availableAt = cp?.available_at
                          ? new Date(cp.available_at).getTime()
                          : 0;
                        const remainingMs = availableAt - now;

                        return (
                          <div
                            key={c.id}
                            className={`relative flex gap-4 ${
                              status === 'locked' ? 'opacity-60' : ''
                            }`}
                          >
                            <div
                              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                status === 'completed'
                                  ? 'bg-accent text-accent-foreground'
                                  : status === 'available'
                                    ? 'bg-primary text-primary-foreground animate-pulse-neon'
                                    : status === 'waiting'
                                      ? 'bg-secondary/30 text-secondary border border-secondary/50'
                                      : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : status === 'available' ? (
                                <Play className="w-4 h-4" />
                              ) : status === 'waiting' ? (
                                <Clock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </div>

                            <div
                              className={`flex-1 rounded-xl border p-4 transition-all ${
                                status === 'available'
                                  ? 'bg-muted/30 border-primary/30 cursor-pointer hover:border-primary/60'
                                  : status === 'completed'
                                    ? 'bg-accent/5 border-accent/30'
                                    : 'bg-muted/20 border-border'
                              }`}
                              onClick={() =>
                                status === 'available' && setSelectedChallenge(c)
                              }
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                      {c.position}/8
                                    </span>
                                    {status === 'completed' && (
                                      <span className="text-xs text-accent">
                                        Concluído{' '}
                                        {cp?.completed_at &&
                                          new Date(cp.completed_at).toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                    {status === 'available' && (
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full animate-pulse">
                                        Disponível
                                      </span>
                                    )}
                                    {status === 'waiting' && (
                                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Libera em {formatCountdown(remainingMs)}
                                      </span>
                                    )}
                                    {status === 'locked' && (
                                      <span className="text-xs text-muted-foreground">
                                        Bloqueado
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-semibold">{c.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {c.description}
                                  </p>
                                </div>
                                {status === 'available' && (
                                  <ChevronRight className="w-5 h-5 text-primary mt-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Challenge Modal */}
        <Dialog
          open={!!selectedChallenge}
          onOpenChange={() => {
            setSelectedChallenge(null);
            setReflection('');
          }}
        >
          <DialogContent className="glass-card border-primary/30 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {selectedChallenge?.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {selectedChallenge?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {selectedChallenge?.action && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold mb-2 text-primary">🎯 Ação Prática</h4>
                  <p className="text-foreground">{selectedChallenge.action}</p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold">💭 Reflexão</h4>
                {selectedChallenge?.reflection && (
                  <p className="text-muted-foreground text-sm">{selectedChallenge.reflection}</p>
                )}
                <Textarea
                  placeholder="Escreva sua reflexão aqui..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[120px] bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>

              <Button
                onClick={handleComplete}
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Completar Desafio (+{selectedChallenge?.points ?? 0} pts)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
