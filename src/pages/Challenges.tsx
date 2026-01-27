import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { challenges as initialChallenges, Challenge } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Lock, CheckCircle2, Play, ChevronRight, Sparkles } from 'lucide-react';

export default function Challenges() {
  const { user, updateProgress } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [reflection, setReflection] = useState('');

  const getChallengeStatus = (challenge: Challenge, index: number): 'locked' | 'active' | 'completed' => {
    if (user?.completedChallenges?.includes(challenge.id)) {
      return 'completed';
    }
    if (index === 0 || user?.completedChallenges?.includes(initialChallenges[index - 1].id)) {
      return 'active';
    }
    return 'locked';
  };

  const handleCompleteChallenge = () => {
    if (!selectedChallenge) return;

    if (reflection.trim().length < 10) {
      toast({
        title: 'Reflexão necessária',
        description: 'Escreva pelo menos algumas palavras sobre sua experiência.',
        variant: 'destructive',
      });
      return;
    }

    updateProgress(selectedChallenge.id);
    toast({
      title: '🎉 Parabéns!',
      description: `Você completou "${selectedChallenge.title}"!`,
    });
    setSelectedChallenge(null);
    setReflection('');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mapa de <span className="neon-text">Desafios</span>
          </h1>
          <p className="text-muted-foreground">
            Cada desafio é um passo em direção à sua evolução. Complete em ordem para desbloquear os próximos.
          </p>
        </div>

        {/* Challenge Journey Path */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-30" />

          <div className="space-y-6">
            {initialChallenges.map((challenge, index) => {
              const status = getChallengeStatus(challenge, index);
              
              return (
                <div 
                  key={challenge.id}
                  className={`relative flex gap-6 ${
                    status === 'locked' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Status Indicator */}
                  <div 
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      status === 'completed'
                        ? 'bg-accent text-accent-foreground challenge-completed'
                        : status === 'active'
                          ? 'bg-primary text-primary-foreground challenge-active animate-pulse-neon'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : status === 'active' ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  {/* Challenge Card */}
                  <div 
                    className={`flex-1 glass-card p-6 transition-all ${
                      status === 'active' ? 'cursor-pointer hover:border-primary/50' : ''
                    } ${status === 'completed' ? 'border-accent/30' : ''}`}
                    onClick={() => status === 'active' && setSelectedChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Desafio {challenge.id}</span>
                          {status === 'completed' && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                              Completo
                            </span>
                          )}
                          {status === 'active' && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full animate-pulse">
                              Ativo
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                        <p className="text-muted-foreground">{challenge.description}</p>
                      </div>
                      {status === 'active' && (
                        <ChevronRight className="w-5 h-5 text-primary mt-1" />
                      )}
                    </div>

                    {status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-sm text-primary">Clique para iniciar este desafio →</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Challenge Detail Modal */}
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
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
                onClick={handleCompleteChallenge}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Completar Desafio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
