import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, EyeOff, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  content: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export default function Feed() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('id, content, is_anonymous, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for non-anonymous posts
    const userIds = [...new Set((postsData || []).filter(p => !p.is_anonymous).map(p => p.user_id))];
    let profilesMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);
      profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        return acc;
      }, {} as Record<string, { display_name: string; avatar_url: string | null }>);
    }

    const enriched = (postsData || []).map(p => ({
      ...p,
      author: p.is_anonymous ? null : (profilesMap[p.user_id] ?? null),
    }));

    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchPosts();

    // Realtime subscription
    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== (payload.old as Post).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSending(true);
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      is_anonymous: isAnonymous,
    });

    if (error) {
      toast({
        title: 'Erro ao publicar',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setContent('');
      setIsAnonymous(false);
      toast({
        title: 'Mensagem publicada!',
        description: isAnonymous ? 'Postada anonimamente.' : 'Compartilhada com a comunidade.',
      });
    }
    setIsSending(false);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Feed da Comunidade
          </h1>
          <p className="text-muted-foreground">Compartilhe pensamentos em tempo real</p>
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <Textarea
            placeholder="O que você quer compartilhar?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            className="bg-muted/30 border-border/50 focus:border-primary resize-none"
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="anonymous-mode"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous-mode" className="flex items-center gap-2 cursor-pointer">
                <EyeOff className="w-4 h-4" />
                Postar anonimamente
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{content.length}/500</span>
              <Button
                type="submit"
                disabled={isSending || !content.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </form>

        {/* Posts list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando posts...</div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Seja o primeiro a compartilhar algo.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="glass-card p-5 animate-fade-in">
                <header className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">
                    {post.is_anonymous ? '🎭' : (post.author?.avatar_url ?? '✨')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {post.is_anonymous ? 'Anônimo' : (post.author?.display_name ?? 'Iluminnado')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  {post.is_anonymous && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Anônimo
                    </span>
                  )}
                </header>
                <p className="text-foreground whitespace-pre-wrap break-words">{post.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}