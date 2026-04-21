import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankedUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
}

export default function Ranking() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, points')
        .order('points', { ascending: false })
        .limit(50);

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchRanking();

    // Refresh ranking when profiles update
    const channel = supabase
      .channel('ranking-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => fetchRanking()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading || !user) return null;

  const getRankIcon = (position: number) => {
    if (position === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (position === 1) return <Medal className="w-6 h-6 text-slate-300" />;
    if (position === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{position + 1}</span>;
  };

  const getRankStyle = (position: number) => {
    if (position === 0) return 'border-yellow-400/50 bg-yellow-400/5';
    if (position === 1) return 'border-slate-300/50 bg-slate-300/5';
    if (position === 2) return 'border-amber-600/50 bg-amber-600/5';
    return '';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Ranking dos Iluminnados
          </h1>
          <p className="text-muted-foreground">Quem mais evoluiu na jornada</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando ranking...</div>
        ) : users.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum usuário ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const isCurrentUser = u.user_id === user.id;
              return (
                <div
                  key={u.user_id}
                  className={cn(
                    'glass-card p-4 flex items-center gap-4 transition-all border',
                    getRankStyle(i),
                    isCurrentUser && 'neon-border bg-primary/5'
                  )}
                >
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(i)}
                  </div>
                  <div className="text-3xl">{u.avatar_url ?? '✨'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {u.display_name}
                      {isCurrentUser && (
                        <span className="text-xs ml-2 text-primary">(você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? 'Líder da jornada' : `Posição #${i + 1}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">{u.points}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}