import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { annualChallenges, getUnlockedChallenges } from '@/lib/annualChallenges';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Lock, 
  CheckCircle2, 
  Play, 
  Calendar, 
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AnnualChallenges() {
  const { user, completeAnnualChallenge } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<typeof annualChallenges[0] | null>(null);
  const [reflection, setReflection] = useState('');

  const completedIds = user?.completedAnnualChallenges || [];
  const unlockedIds = getUnlockedChallenges(completedIds);
  const completedCount = completedIds.length;
  const progressPercent = (completedCount / annualChallenges.length) * 100;

  const getChallengeStatus = (challengeId: number): 'locked' | 'active' | 'completed' => {
    if (completedIds.includes(challengeId)) return 'completed';
    if (unlockedIds.includes(challengeId)) return 'active';
    return 'locked';
  };

  const handleComplete = () => {
    if (!selectedChallenge) return;

    if (reflection.trim().length < 10) {
      toast({
        title: 'Reflexão necessária',
        description: 'Escreva pelo menos algumas palavras sobre sua experiência.',
        variant: 'destructive',
      });
      return;
    }

    completeAnnualChallenge(selectedChallenge.id);
    toast({
      title: '🏆 Desafio Anual Concluído!',
      description: `+${selectedChallenge.points} pontos! Continue sua jornada!`,
    });
    setSelectedChallenge(null);
    setReflection('');
  };

  // Group challenges by month
  const challengesByMonth = annualChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.month]) acc[challenge.month] = [];
    acc[challenge.month].push(challenge);
    return acc;
  }, {} as Record<number, typeof annualChallenges>);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Desafios <span className="neon-text">Anuais</span>
          </h1>
          <p className="text-muted-foreground">
            24 desafios distribuídos ao longo do ano para transformação profunda.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Progresso Anual</h2>
                <p className="text-muted-foreground text-sm">
                  {completedCount} de 24 desafios concluídos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold neon-text">{Math.round(progressPercent)}%</p>
              <p className="text-sm text-muted-foreground">completo</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-accent">{completedCount}</p>
            <p className="text-sm text-muted-foreground">Concluídos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Play className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">
              {unlockedIds.filter(id => !completedIds.includes(id)).length}
            </p>
            <p className="text-sm text-muted-foreground">Disponíveis</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {24 - unlockedIds.length}
            </p>
            <p className="text-sm text-muted-foreground">Bloqueados</p>
          </div>
        </div>

        {/* Challenges by Month */}
        <div className="space-y-6">
          {Object.entries(challengesByMonth).map(([month, challenges]) => (
            <div key={month} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-semibold">{monthNames[Number(month) - 1]}</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {challenges.map((challenge) => {
                  const status = getChallengeStatus(challenge.id);
                  
                  return (
                    <div
                      key={challenge.id}
                      onClick={() => status === 'active' && setSelectedChallenge(challenge)}
                      className={`p-4 rounded-xl border transition-all ${
                        status === 'completed'
                          ? 'bg-accent/10 border-accent/50'
                          : status === 'active'
                            ? 'bg-muted/30 border-primary/30 cursor-pointer hover:border-primary/50'
                            : 'bg-muted/20 border-border opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          status === 'completed'
                            ? 'bg-accent text-accent-foreground'
                            : status === 'active'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : status === 'active' ? (
                            <Play className="w-5 h-5" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              Desafio {challenge.id}
                            </span>
                            {status === 'completed' && (
                              <span className="text-xs text-accent">+{challenge.points} pts</span>
                            )}
                          </div>
                          <h4 className="font-medium">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {challenge.description}
                          </p>
                          {status === 'active' && (
                            <p className="text-xs text-primary mt-2">Clique para começar →</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Challenge Modal */}
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="glass-card border-primary/30 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                {selectedChallenge?.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {selectedChallenge?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">
                  {selectedChallenge && monthNames[selectedChallenge.month - 1]} • Semana {selectedChallenge?.week}
                </span>
                <span className="ml-auto text-accent font-bold">
                  +{selectedChallenge?.points} pontos
                </span>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-semibold mb-2 text-primary">🎯 Ação Prática</h4>
                <p className="text-foreground">{selectedChallenge?.action}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  💭 Reflexão
                </h4>
                <p className="text-muted-foreground text-sm">{selectedChallenge?.reflection}</p>
                <Textarea
                  placeholder="Escreva sua reflexão aqui..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[120px] bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>

              <Button 
                onClick={handleComplete}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Completar Desafio (+{selectedChallenge?.points} pts)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
