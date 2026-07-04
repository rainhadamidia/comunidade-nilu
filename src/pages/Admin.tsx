import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  TrendingUp,
  Target,
  Activity,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';

interface ProfileRow {
  user_id: string;
  display_name: string;
  email: string;
  points: number;
  plan: 'free' | 'premium';
  created_at: string;
}

interface EngajamentoUsuario extends ProfileRow {
  desafiosConcluidos: number;
  diasAtivos: number;
  ativoRecente: boolean;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [usuarios, setUsuarios] = useState<EngajamentoUsuario[]>([]);
  const [totalDesafiosDisponiveis, setTotalDesafiosDisponiveis] = useState(0);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user?.isAdmin) return;

    const carregarDados = async () => {
      setCarregando(true);

      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const [{ data: profiles }, { data: pciResults }, { data: challengeProgress }, { count: totalChallenges }] =
        await Promise.all([
          supabase.from('profiles').select('user_id, display_name, email, points, plan, created_at'),
          supabase.from('pci_results').select('user_id, created_at'),
          supabase.from('user_challenge_progress').select('user_id, completed_at').not('completed_at', 'is', null),
          supabase.from('stage_challenges').select('id', { count: 'exact', head: true }),
        ]);

      setTotalDesafiosDisponiveis(totalChallenges ?? 0);

      const desafiosPorUsuario = new Map<string, { total: number; dias: Set<string> }>();
      (challengeProgress ?? []).forEach((c) => {
        const entry = desafiosPorUsuario.get(c.user_id) ?? { total: 0, dias: new Set<string>() };
        entry.total += 1;
        if (c.completed_at) entry.dias.add(c.completed_at.split('T')[0]);
        desafiosPorUsuario.set(c.user_id, entry);
      });

      const ultimaAtividadePorUsuario = new Map<string, string>();
      (pciResults ?? []).forEach((r) => {
        const atual = ultimaAtividadePorUsuario.get(r.user_id);
        if (!atual || r.created_at > atual) ultimaAtividadePorUsuario.set(r.user_id, r.created_at);
      });
      (challengeProgress ?? []).forEach((c) => {
        if (!c.completed_at) return;
        const atual = ultimaAtividadePorUsuario.get(c.user_id);
        if (!atual || c.completed_at > atual) ultimaAtividadePorUsuario.set(c.user_id, c.completed_at);
      });

      const linhas: EngajamentoUsuario[] = ((profiles as ProfileRow[]) ?? []).map((p) => {
        const desafios = desafiosPorUsuario.get(p.user_id);
        const ultimaAtividade = ultimaAtividadePorUsuario.get(p.user_id);
        return {
          ...p,
          desafiosConcluidos: desafios?.total ?? 0,
          diasAtivos: desafios?.dias.size ?? 0,
          ativoRecente: ultimaAtividade ? new Date(ultimaAtividade) >= seteDiasAtras : false,
        };
      });

      setUsuarios(linhas);
      setCarregando(false);
    };

    carregarDados();
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Acesso negado. Área administrativa.</p>
        </div>
      </Layout>
    );
  }

  const activeUsers = usuarios.filter(u => u.ativoRecente);
  const inactiveUsers = usuarios.filter(u => !u.ativoRecente);
  const totalPoints = usuarios.reduce((sum, u) => sum + (u.points || 0), 0);
  const averagePoints = usuarios.length > 0 ? Math.round(totalPoints / usuarios.length) : 0;
  const totalChallengesCompleted = usuarios.reduce((sum, u) => sum + u.desafiosConcluidos, 0);

  const getEngagementLevel = (u: EngajamentoUsuario) => {
    const score = (u.points || 0) + u.desafiosConcluidos * 10 + u.diasAtivos * 5;

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
            Monitoramento de engajamento e atividade dos usuários (dados reais do Supabase).
          </p>
        </div>

        <PremiumManager />

        {carregando ? (
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold text-primary">{usuarios.length}</p>
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
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-semibold">Desafios (Mapa de Desafios)</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Total disponíveis</span>
                  <span className="font-bold">{totalDesafiosDisponiveis}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-accent/10">
                  <span className="text-muted-foreground">Total concluídos</span>
                  <span className="font-bold text-accent">{totalChallengesCompleted}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Média por usuário</span>
                  <span className="font-bold">
                    {usuarios.length > 0 ? (totalChallengesCompleted / usuarios.length).toFixed(1) : 0}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Nota: "Desafios Anuais" ainda não tem progresso salvo no banco de dados (só existe como catálogo estático) —
                por isso não aparece aqui. Precisa ser integrado ao Supabase para gerar estatística real.
              </p>
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
                    {usuarios.map((u) => {
                      const engagement = getEngagementLevel(u);

                      return (
                        <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{u.display_name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                              {u.ativoRecente && (
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-bold text-accent">{u.points || 0}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-medium">{u.desafiosConcluidos}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-medium">{u.diasAtivos}</span>
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

              {usuarios.length === 0 && (
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
                  const count = usuarios.filter(u => getEngagementLevel(u).level === level).length;
                  const percentage = usuarios.length > 0 ? Math.round((count / usuarios.length) * 100) : 0;
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
          </>
        )}
      </div>
    </Layout>
  );
}
