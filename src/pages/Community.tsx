import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { communityMembers, activities } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Users, Heart, Hand, Circle, Sparkles } from 'lucide-react';

export default function Community() {
  const [waved, setWaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

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

  const getStatusColor = (status: string) => {
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{communityMembers.length} membros na praça</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {communityMembers.map((member) => (
                <div 
                  key={member.id}
                  className="glass-card p-5 hover:border-secondary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{member.nickname}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Circle className={`w-2 h-2 fill-current ${getStatusColor(member.status)}`} />
                        <span className={`text-sm ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWave(member.id, member.nickname)}
                      disabled={waved.includes(member.id)}
                      className={`flex-1 ${waved.includes(member.id) ? 'border-primary/50 text-primary' : ''}`}
                    >
                      <Hand className="w-4 h-4 mr-1.5" />
                      {waved.includes(member.id) ? 'Acenou' : 'Acenar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(member.id, member.nickname)}
                      disabled={liked.includes(member.id)}
                      className={`flex-1 ${liked.includes(member.id) ? 'border-secondary/50 text-secondary' : ''}`}
                    >
                      <Heart className={`w-4 h-4 mr-1.5 ${liked.includes(member.id) ? 'fill-secondary' : ''}`} />
                      {liked.includes(member.id) ? 'Curtiu' : 'Curtir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Atividade recente</span>
            </div>

            <div className="glass-card p-4 space-y-3">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 animate-fade-in"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'advance' ? 'bg-primary/20 text-primary' :
                    activity.type === 'complete' ? 'bg-accent/20 text-accent' :
                    activity.type === 'share' ? 'bg-secondary/20 text-secondary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {activity.type === 'advance' && '⬆️'}
                    {activity.type === 'complete' && '✅'}
                    {activity.type === 'share' && '💬'}
                    {activity.type === 'join' && '👋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Community Stats */}
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4">Estatísticas da Praça</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Online agora</span>
                  <span className="font-medium text-accent">
                    {communityMembers.filter(m => m.status === 'online').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Em jornada</span>
                  <span className="font-medium text-primary">
                    {communityMembers.filter(m => m.status === 'em jornada').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de membros</span>
                  <span className="font-medium">{communityMembers.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  return `${Math.floor(seconds / 86400)}d atrás`;
}
