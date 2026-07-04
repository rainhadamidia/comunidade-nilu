import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { challenges } from '@/lib/mockData';
import { annualChallenges } from '@/lib/annualChallenges';
import {
  Users,
  TrendingUp,
  Target,
  Activity,
  UserCheck,
  UserX,
  Award,
  Calendar,
  Crown
} from 'lucide-react';

interface ProfileRow {
  user_id: string;
  display_name: string;
  email: string;
  points: number;
  plan: 'free' | 'premium';
}

function PremiumManager() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, display_name, email, points, plan')
      .order('created_at', { ascending: false });
    setProfiles((data as ProfileRow[]) ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const alternarPlano = async (userId: string, planoAtual: 'free' | 'premium') => {
    setAtualizando(userId);
    const novoPlano = planoAtual === 'premium' ? 'free' : 'premium';
    const { error } = await supabase
      .from('profiles')
      .update({ plan: novoPlano })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Erro ao atualizar plano', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: novoPlano === 'premium' ? 'Usuário promovido a Premium! 👑' : 'Usuário voltou para o plano grátis' });
      await carregar();
    }
    setAtualizando(null);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Gestão de Assinaturas Premium</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Depois de confirmar o pagamento no painel da InfinitePay, promova o usuário aqui.
      </p>

      {carregando ? (
        <p className="text-muted-foreground">Carregando usuários...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Usuário</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Plano</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.user_id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-4">
                    <p className="font-medium">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={p.plan === 'premium' ? 'text-primary font-bold' : 'text-muted-foreground'}>
                      {p.plan === 'premium' ? '👑 Premium' : 'Grátis'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant={p.plan === 'premium' ? 'outline' : 'default'}
                      disabled={atualizando === p.user_id}
                      onClick={() => alternarPlano(p.user_id, p.plan)}
                    >
                      {p.plan === 'premium' ? 'Voltar para Grátis' : 'Tornar Premium'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhum usuário cadastrado ainda.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const allUsers = getAllUsers();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Acesso negado. Área administrativa.</p>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const activeUsers = allUsers.filter(u => 
    u.activeDays?.some(day => last7Days.includes(day))
  );
  const inactiveUsers = allUsers.filter(u => 
    !u.activeDays?.some(day => last7Days.includes(day))
  );

  const totalPoints = allUsers.reduce((sum, u) => sum + (u.points || 0), 0);
  const averagePoints = allUsers.length > 0 ? Math.round(totalPoints / allUsers.length) : 0;

  const totalChallengesCompleted = allUsers.reduce(
    (sum, u) => sum + (u.completedChallenges?.length || 0), 0
  );

  const totalAnnualChallengesCompleted = allUsers.reduce(
    (sum, u) => sum + (u.completedAnnualChallenges?.length || 0), 0
  );

  const getEngagementLevel = (user: typeof allUsers[0]) => {
    const score = (user.points || 0) + 
                  (user.completedChallenges?.length || 0) * 10 +
                  (user.activeDays?.length || 0) * 5;
    
    if (score >= 200) return { level: 'high', color: 'text-green-400', bg: 'bg-green-500/20', label: '🟢 Alto' };
    if (score >= 50) return { level: 'medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: '🟡 Médio' };
    return { level: 'low', color: 'text-red-400', bg: 'bg-red-500/20', label: '🔴 Baixo' };
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Painel <span className="neon-text">Administrativo</span>
          </h1>
          <p className="text-muted-foreground">
            Monitoramento de engajamento e atividade dos usuários.
          </p>
        </div>

        <PremiumManager />

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
            <p className="text-3xl font-bold text-primary">{allUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total de usuários</p>
          </div>
          <div className="glass-card p-5 text-center">
            <UserCheck className="w-8 h-8 mx-auto mb-3 text-green-400" />
            <p className="text-3xl font-bold text-green-400">{activeUsers.length}</p>
            <p className="text-sm text-muted-foreground">Ativos (7 dias)</p>
          </div>
          <div className="glass-card p-5 text-center">
            <UserX className="w-8 h-8 mx-auto mb-3 text-red-400" />
            <p className="text-3xl font-bold text-red-400">{inactiveUsers.length}</p>
            <p className="text-sm text-muted-foreground">Inativos (7 dias)</p>
          </div>
          <div className="glass-card p-5 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-accent" />
            <p className="text-3xl font-bold text-accent">{averagePoints}</p>
            <p className="text-sm text-muted-foreground">Pontos médios</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-semibold">Desafios Diários</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Total disponíveis</span>
                <span className="font-bold">{challenges.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent/10">
                <span className="text-muted-foreground">Total concluídos</span>
                <span className="font-bold text-accent">{totalChallengesCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Média por usuário</span>
                <span className="font-bold">
                  {allUsers.length > 0 ? (totalChallengesCompleted / allUsers.length).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Desafios Anuais</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Total disponíveis</span>
                <span className="font-bold">{annualChallenges.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                <span className="text-muted-foreground">Total concluídos</span>
                <span className="font-bold text-primary">{totalAnnualChallengesCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Média por usuário</span>
                <span className="font-bold">
                  {allUsers.length > 0 ? (totalAnnualChallengesCompleted / allUsers.length).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-semibold">Usuários e Engajamento</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Usuário</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Pontos</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Desafios</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Dias Ativos</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Engajamento</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => {
                  const engagement = getEngagementLevel(u);
                  const isActiveRecently = u.activeDays?.some(day => last7Days.includes(day));
                  
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{u.avatar}</span>
                          <div>
                            <p className="font-medium">{u.nickname}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          {isActiveRecently && (
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-accent">{u.points || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium">
                          {(u.completedChallenges?.length || 0) + (u.completedAnnualChallenges?.length || 0)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium">{u.activeDays?.length || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${engagement.bg} ${engagement.color}`}>
                          {engagement.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado ainda.
            </div>
          )}
        </div>

        {/* Engagement Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Distribuição de Engajamento</h2>
          <div className="grid grid-cols-3 gap-4">
            {['high', 'medium', 'low'].map(level => {
              const count = allUsers.filter(u => getEngagementLevel(u).level === level).length;
              const percentage = allUsers.length > 0 ? Math.round((count / allUsers.length) * 100) : 0;
              const config = {
                high: { label: 'Alto', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🟢' },
                medium: { label: 'Médio', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '🟡' },
                low: { label: 'Baixo', color: 'text-red-400', bg: 'bg-red-500/20', icon: '🔴' },
              }[level]!;
              
              return (
                <div key={level} className={`p-4 rounded-xl ${config.bg} text-center`}>
                  <p className="text-3xl mb-2">{config.icon}</p>
                  <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
