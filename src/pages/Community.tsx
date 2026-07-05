import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Users, Heart, Hand, Circle, Sparkles, Wifi, Loader2 } from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MemberProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  updated_at: string;
}

type MemberStatus = 'online' | 'em jornada' | 'offline';

// "Em jornada" = ativo nas últimas 24h mas não está online agora
const JOURNEY_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function Community() {
  const { user } = useAuth();
  const { onlineUsers, onlineCount } = usePresence();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [waved, setWaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, points, updated_at')
        .order('points', { ascending: false });

      if (cancelled) return;
      if (error) {
        toast({
          title: 'Erro ao carregar membros',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setMembers((data ?? []) as MemberProfile[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onlineIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.user_id)),
    [onlineUsers],
  );

  const getMemberStatus = (m: MemberProfile): MemberStatus => {
    if (onlineIds.has(m.user_id)) return 'online';
    const updated = new Date(m.updated_at).getTime();
    if (Date.now() - updated < JOURNEY_WINDOW_MS) return 'em jornada';
    return 'offline';
  };

  const sortedMembers = useMemo(() => {
    const order: Record<MemberStatus, number> = { online: 0, 'em jornada': 1, offline: 2 };
    return [...members].sort(
      (a, b) => order[getMemberStatus(a)] - order[getMemberStatus(b)],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, onlineIds]);

  const journeyCount = useMemo(
    () => members.filter((m) => getMemberStatus(m) === 'em jornada').length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, onlineIds],
  );

  const handleWave = (memberId: string, nickname: string) => {
    if (waved.includes(memberId)) return;
    setWaved([...waved, memberId]);
    toast({
      title: '👋 Aceno enviado!',
      description: `Você acenou para ${nickname}`,
    });
  };

  const handleLike = (memberId: string, nickname: string) => {
    if (liked.includes(memberId)) return;
    setLiked([...liked, memberId]);
    toast({
      title: '💜 Presença curtida!',
      description: `Você curtiu a presença de ${nickname}`,
    });
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case 'online': return 'text-accent';
      case 'em jornada': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Praça dos <span className="neon-text-secondary">Iluminnados</span>
          </h1>
          <p className="text-muted-foreground">
            Conecte-se com outros viajantes. Você não está sozinho nessa jornada.
          </p>
        </div>

        {/* Online Now - Real-time presence */}
        <section className="glass-card p-5 border-accent/30">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Wifi className="w-5 h-5 text-accent" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              </div>
              <h2 className="font-semibold">Online agora</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                {onlineCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Atualizado em tempo real</span>
          </div>

          {onlineCount === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Ninguém online agora. Você é o primeiro a chegar! ✨
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {onlineUsers.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/30 border border-border/50 hover:border-accent/50 transition-all"
                  title={u.display_name}
                >
                  <div className="relative">
                    <span className="text-xl leading-none">{u.avatar_url || '✨'}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full ring-2 ring-background" />
                  </div>
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {u.user_id === user?.id ? `${u.display_name} (você)` : u.display_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{members.length} membros na praça</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Carregando membros...
              </div>
            ) : members.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                Ainda não há membros na praça.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedMembers.map((member) => {
                  const status = getMemberStatus(member);
                  const isSelf = member.user_id === user?.id;
                  const displayName = isSelf
                    ? `${member.display_name} (você)`
                    : member.display_name;
                  return (
                    <div
                      key={member.user_id}
                      className="glass-card p-5 hover:border-secondary/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl relative">
                          {member.avatar_url || '✨'}
                          {status === 'online' && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full ring-2 ring-background animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{displayName}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Circle className={`w-2 h-2 fill-current ${getStatusColor(status)}`} />
                            <span className={`text-sm capitalize ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {member.points} pts
                          </p>
                        </div>
                      </div>

                      {!isSelf && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWave(member.user_id, member.display_name)}
                            disabled={waved.includes(member.user_id)}
                            className={`flex-1 ${waved.includes(member.user_id) ? 'border-primary/50 text-primary' : ''}`}
                          >
                            <Hand className="w-4 h-4 mr-1.5" />
                            {waved.includes(member.user_id) ? 'Acenou' : 'Acenar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLike(member.user_id, member.display_name)}
                            disabled={liked.includes(member.user_id)}
                            className={`flex-1 ${liked.includes(member.user_id) ? 'border-secondary/50 text-secondary' : ''}`}
                          >
                            <Heart className={`w-4 h-4 mr-1.5 ${liked.includes(member.user_id) ? 'fill-secondary' : ''}`} />
                            {liked.includes(member.user_id) ? 'Curtiu' : 'Curtir'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Atividade recente</span>
            </div>

            <div className="glass-card p-4">
              <p className="text-sm text-muted-foreground">
                Em breve, aqui você vai acompanhar a atividade real da comunidade — quem entrou, avançou de desafio ou compartilhou algo nas outras áreas do app.
              </p>
            </div>

            {/* Community Stats */}
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4">Estatísticas da Praça</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Online agora</span>
                  <span className="font-medium text-accent">
                    {onlineCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Em jornada</span>
                  <span className="font-medium text-primary">
                    {journeyCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de membros</span>
                  <span className="font-medium">{members.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
