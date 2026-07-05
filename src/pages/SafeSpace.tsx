import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { safeSpacePosts as initialPosts, SafeSpacePost } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Send, Shield, Eye, EyeOff } from 'lucide-react';

// Story 1.3: publicação real ainda não persiste (depende da Story 3, sobre o
// modelo LGPD da Story 1.2). Trocar para true quando a persistência subir.
const SAFESPACE_PERSISTENCE_ENABLED = false;

export default function SafeSpace() {
  const [posts, setPosts] = useState<SafeSpacePost[]>(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handlePost = () => {
    if (!SAFESPACE_PERSISTENCE_ENABLED) return;

    if (newPost.trim().length < 10) {
      toast({
        title: 'Texto muito curto',
        description: 'Escreva pelo menos algumas palavras para compartilhar.',
        variant: 'destructive',
      });
      return;
    }

    const post: SafeSpacePost = {
      id: Date.now().toString(),
      content: newPost,
      timestamp: new Date(),
      comments: [],
      likes: 0,
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast({
      title: 'Desabafo compartilhado',
      description: 'Sua mensagem foi publicada anonimamente.',
    });
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId: string) => {
    const comment = newComment[postId]?.trim();
    if (!comment || comment.length < 5) {
      toast({
        title: 'Comentário muito curto',
        description: 'Escreva pelo menos algumas palavras.',
        variant: 'destructive',
      });
      return;
    }

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: [...post.comments, { id: Date.now().toString(), content: comment, timestamp: new Date() }] 
          } 
        : post
    ));
    setNewComment({ ...newComment, [postId]: '' });
    toast({
      title: 'Comentário enviado',
      description: 'Sua resposta foi publicada anonimamente.',
    });
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Espaço <span className="neon-text">Seguro</span>
            </h1>
            {!SAFESPACE_PERSISTENCE_ENABLED && (
              <Badge variant="secondary">Em breve</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Um lugar para desabafar sem julgamentos. Tudo aqui é anônimo e respeitoso.
          </p>
        </div>

        {/* New Post */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <EyeOff className="w-4 h-4" />
            <span>
              {SAFESPACE_PERSISTENCE_ENABLED
                ? 'Sua identidade está protegida'
                : 'Estamos cuidando com carinho de um jeito seguro de guardar o que você compartilha aqui. Em breve este espaço vai poder acolher seu desabafo de verdade — por enquanto, sinta-se à vontade para escrever como um rascunho, só para organizar o que sente.'}
            </span>
          </div>
          <Textarea
            placeholder="O que você gostaria de compartilhar? Este é um espaço seguro..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] bg-muted/50 border-border/50 focus:border-primary mb-4"
          />
          <Button
            onClick={handlePost}
            disabled={!SAFESPACE_PERSISTENCE_ENABLED}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Compartilhar anonimamente
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Anônimo</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.timestamp)}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed">{post.content}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="hover:text-secondary"
                >
                  <Heart className="w-4 h-4 mr-1.5" />
                  {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                  className="hover:text-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  {post.comments.length}
                  {showComments.includes(post.id) ? (
                    <Eye className="w-4 h-4 ml-1.5" />
                  ) : (
                    <EyeOff className="w-4 h-4 ml-1.5" />
                  )}
                </Button>
              </div>

              {/* Comments */}
              {showComments.includes(post.id) && (
                <div className="mt-4 space-y-4">
                  {post.comments.length > 0 && (
                    <div className="space-y-3 pl-4 border-l-2 border-border/50">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Anônimo</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Comment */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Deixe uma palavra de apoio..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      className="min-h-[60px] bg-muted/30 border-border/50 focus:border-primary text-sm"
                    />
                    <Button 
                      size="icon"
                      onClick={() => handleComment(post.id)}
                      className="bg-primary hover:bg-primary/90 h-auto"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
