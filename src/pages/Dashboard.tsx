import { useAuth } from '@/contexts/AuthContext';
import { challenges, communityMembers, activities, userBonuses } from '@/lib/mockData';
import { Layout } from '@/components/Layout';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Map, Users, Gift, ChevronRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const completedCount = user?.completedChallenges?.length || 0;
  const progressPercent = (completedCount / challenges.length) * 100;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Olá, <span className="neon-text">{user?.nickname}</span>! {user?.avatar}
            </h1>
            <p className="text-muted-foreground">Continue sua jornada de evolução interior.</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-muted-foreground">Seu progresso geral</p>
            <p className="text-2xl font-bold neon-text">{Math.round(progressPercent)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Jornada de Iluminação</span>
            <span className="text-sm font-medium">{completedCount}/{challenges.length} desafios</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-muted" />
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Início</span>
            <span>Iluminação</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Journey Map Preview */}
          <div 
            className="glass-card p-6 cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => navigate('/challenges')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Mapa de Desafios</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            {/* Mini Journey Path */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {challenges.slice(0, 6).map((challenge, index) => {
                const isCompleted = user?.completedChallenges?.includes(challenge.id);
                const isActive = challenge.status === 'active' || 
                  (index > 0 && user?.completedChallenges?.includes(challenges[index - 1].id));
                
                return (
                  <div key={challenge.id} className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isCompleted 
                          ? 'bg-accent text-accent-foreground neon-glow' 
                          : isActive
                            ? 'bg-primary/20 border-2 border-primary text-primary animate-pulse-neon'
                            : 'bg-muted text-muted-foreground opacity-50'
                      }`}
                    >
                      {isCompleted ? '✓' : challenge.id}
                    </div>
                    {index < 5 && (
                      <div className={`w-6 h-0.5 ${
                        isCompleted ? 'bg-accent' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
              <span className="text-muted-foreground ml-2">...</span>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {completedCount === 0 
                ? 'Comece sua jornada agora!'
                : `Continue de onde parou: Desafio ${completedCount + 1}`}
            </p>
          </div>

          {/* Community Preview */}
          <div 
            className="glass-card p-6 cursor-pointer hover:border-secondary/50 transition-all group"
            onClick={() => navigate('/community')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-xl font-semibold">Praça dos Iluminnados</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>

            {/* Member Avatars */}
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2">
                {communityMembers.slice(0, 5).map((member) => (
                  <div 
                    key={member.id}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl border-2 border-background"
                    title={member.nickname}
                  >
                    {member.avatar}
                  </div>
                ))}
              </div>
              <span className="ml-3 text-sm text-muted-foreground">
                +{communityMembers.length - 5} membros ativos
              </span>
            </div>

            {/* Recent Activity */}
            <div className="space-y-2">
              {activities.slice(0, 2).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30"
                >
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">{activity.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bonuses Section */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Seus Bônus</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userBonuses.map((bonus) => (
              <div 
                key={bonus.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  bonus.unlocked 
                    ? 'bg-accent/10 border border-accent/50' 
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{bonus.icon}</div>
                <p className="font-medium text-sm">{bonus.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bonus.unlocked ? '✓ Conquistado' : '🔒 Bloqueado'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold neon-text">{completedCount}</p>
            <p className="text-sm text-muted-foreground">Desafios completos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold neon-text-secondary">{userBonuses.filter(b => b.unlocked).length}</p>
            <p className="text-sm text-muted-foreground">Bônus conquistados</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold neon-text-accent">{challenges.length - completedCount}</p>
            <p className="text-sm text-muted-foreground">Desafios restantes</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
