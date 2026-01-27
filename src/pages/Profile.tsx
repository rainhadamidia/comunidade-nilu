import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { challenges, userBonuses } from '@/lib/mockData';
import { annualChallenges } from '@/lib/annualChallenges';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  Star
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
  const completedChallenges = user?.completedChallenges || [];
  const completedAnnualChallenges = user?.completedAnnualChallenges || [];
  const completedCount = completedChallenges.length;
  const progressPercent = (completedCount / challenges.length) * 100;
  const unlockedBonuses = userBonuses.filter(b => b.unlocked).length;

  // Calculate streak
  const calculateStreak = () => {
    if (!user?.activeDays || user.activeDays.length === 0) return 0;
    
    const sortedDays = [...user.activeDays].sort().reverse();
    let streak = 0;
    const now = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDays.includes(expectedStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Get level based on points
  const getLevel = () => {
    const points = user?.points || 0;
    if (points >= 1000) return { name: 'Iluminado Mestre', icon: '👑', color: 'text-yellow-400' };
    if (points >= 500) return { name: 'Iluminado', icon: '⭐', color: 'text-accent' };
    if (points >= 200) return { name: 'Buscador Consciente', icon: '🔮', color: 'text-primary' };
    if (points >= 50) return { name: 'Caminhante Desperto', icon: '🌱', color: 'text-green-400' };
    return { name: 'Iniciante na Jornada', icon: '✨', color: 'text-muted-foreground' };
  };

  const level = getLevel();

  const stats = [
    { 
      icon: Sparkles, 
      label: 'Pontos Totais', 
      value: user?.points || 0, 
      color: 'text-accent',
      bg: 'bg-accent/20'
    },
    { 
      icon: Flame, 
      label: 'Dias Seguidos', 
      value: streak, 
      color: 'text-orange-400',
      bg: 'bg-orange-500/20'
    },
    { 
      icon: Target, 
      label: 'Desafios Completos', 
      value: completedCount + completedAnnualChallenges.length, 
      color: 'text-primary',
      bg: 'bg-primary/20'
    },
    { 
      icon: Calendar, 
      label: 'Dias Ativos', 
      value: user?.activeDays?.length || 0, 
      color: 'text-secondary',
      bg: 'bg-secondary/20'
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
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold neon-text">{user?.nickname}</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="text-2xl">{level.icon}</span>
                <span className={`font-medium ${level.color}`}>{level.name}</span>
              </div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
              <Star className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-4xl font-bold text-accent">{user?.points || 0}</p>
              <p className="text-sm text-muted-foreground">pontos</p>
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
          
          <div className="space-y-6">
            {/* Daily Challenges Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Desafios Diários</span>
                <span className="font-medium">{completedCount}/{challenges.length}</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {/* Annual Challenges Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Desafios Anuais</span>
                <span className="font-medium">{completedAnnualChallenges.length}/{annualChallenges.length}</span>
              </div>
              <Progress 
                value={(completedAnnualChallenges.length / annualChallenges.length) * 100} 
                className="h-3" 
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Próximo desafio diário</p>
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

        {/* Activity History */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Atividade Recente
          </h2>

          {user?.selfCareLogs && user.selfCareLogs.length > 0 ? (
            <div className="space-y-3">
              {[...user.selfCareLogs].reverse().slice(0, 5).map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(log.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.activities.length} atividades de autocuidado
                      </p>
                    </div>
                  </div>
                  <span className="text-accent font-bold">+{log.points}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade registrada ainda.</p>
              <p className="text-sm mt-1">Comece seu autocuidado diário!</p>
            </div>
          )}
        </div>

        {/* Completed Challenges */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Desafios Concluídos
          </h2>

          {completedChallenges.length > 0 || completedAnnualChallenges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {completedChallenges.map((id) => {
                const challenge = challenges.find(c => c.id === id);
                return challenge ? (
                  <div 
                    key={`daily-${id}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground">Desafio Diário {challenge.id}</p>
                    </div>
                  </div>
                ) : null;
              })}
              {completedAnnualChallenges.map((id) => {
                const challenge = annualChallenges.find(c => c.id === id);
                return challenge ? (
                  <div 
                    key={`annual-${id}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground">Desafio Anual {challenge.id}</p>
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
