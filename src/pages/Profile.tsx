import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { challenges, userBonuses } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
  const completedChallenges = user?.completedChallenges || [];
  const completedCount = completedChallenges.length;
  const progressPercent = (completedCount / challenges.length) * 100;
  const unlockedBonuses = userBonuses.filter(b => b.unlocked).length;

  const stats = [
    { 
      icon: Target, 
      label: 'Desafios Completos', 
      value: completedCount, 
      color: 'text-primary',
      bg: 'bg-primary/20'
    },
    { 
      icon: Trophy, 
      label: 'Bônus Conquistados', 
      value: unlockedBonuses, 
      color: 'text-accent',
      bg: 'bg-accent/20'
    },
    { 
      icon: TrendingUp, 
      label: 'Progresso Geral', 
      value: `${Math.round(progressPercent)}%`, 
      color: 'text-secondary',
      bg: 'bg-secondary/20'
    },
    { 
      icon: Clock, 
      label: 'Desafios Restantes', 
      value: challenges.length - completedCount, 
      color: 'text-orange-400',
      bg: 'bg-orange-500/20'
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="glass-card p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-7xl p-4 rounded-2xl bg-muted/50 animate-float">
              {user?.avatar || '✨'}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold neon-text">{user?.nickname}</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-sm">
                  {completedCount === 0 
                    ? 'Iniciante na Jornada' 
                    : completedCount < 3 
                      ? 'Caminhante Desperto'
                      : completedCount < 6
                        ? 'Buscador Consciente'
                        : 'Iluminnado'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card p-5 text-center">
              <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Seu Progresso
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Jornada de Iluminação</span>
                <span className="font-medium">{completedCount}/{challenges.length}</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Próximo desafio</p>
                {completedCount < challenges.length ? (
                  <p className="font-medium">{challenges[completedCount]?.title}</p>
                ) : (
                  <p className="font-medium text-accent">Jornada Completa! 🎉</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Próximo bônus</p>
                {unlockedBonuses < userBonuses.length ? (
                  <p className="font-medium">
                    {userBonuses.find(b => !b.unlocked)?.name}
                  </p>
                ) : (
                  <p className="font-medium text-accent">Todos conquistados!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Challenges */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Desafios Concluídos
          </h2>

          {completedChallenges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {completedChallenges.map((id) => {
                const challenge = challenges.find(c => c.id === id);
                return challenge ? (
                  <div 
                    key={id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground">Desafio {challenge.id}</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não completou nenhum desafio.</p>
              <p className="text-sm mt-1">Comece sua jornada agora!</p>
            </div>
          )}
        </div>

        {/* Bonuses */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Seus Bônus
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userBonuses.map((bonus) => (
              <div 
                key={bonus.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  bonus.unlocked 
                    ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 neon-glow' 
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className={`text-4xl mb-2 ${bonus.unlocked ? '' : 'grayscale'}`}>
                  {bonus.icon}
                </div>
                <p className="font-medium text-sm">{bonus.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bonus.description}
                </p>
                <p className={`text-xs mt-2 ${bonus.unlocked ? 'text-accent' : 'text-muted-foreground'}`}>
                  {bonus.unlocked ? '✓ Conquistado' : '🔒 Bloqueado'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
