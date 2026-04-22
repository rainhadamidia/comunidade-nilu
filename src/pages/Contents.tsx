import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Book,
  Film,
  Brain,
  Music,
  BookOpen,
  Headphones,
  Plus,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

type ContentCategory = 'book' | 'movie' | 'meditation' | 'music' | 'community';

interface Conteudo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  how_it_helped: string | null;
  category: ContentCategory;
  created_at: string;
  author_name?: string;
}

const contentTypes: { id: ContentCategory; label: string; icon: typeof Book }[] = [
  { id: 'book', label: 'Livros', icon: Book },
  { id: 'movie', label: 'Filmes', icon: Film },
  { id: 'meditation', label: 'Meditações', icon: Brain },
  { id: 'music', label: 'Músicas', icon: Music },
  { id: 'community', label: 'Da Comunidade', icon: Sparkles },
];

export default function Contents() {
  const { user } = useAuth();
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTip, setNewTip] = useState({
    title: '',
    description: '',
    how_it_helped: '',
    category: 'book' as ContentCategory,
  });

  const fetchConteudos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conteudos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar conteúdos',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set((data ?? []).map((c) => c.user_id)));
    let profilesMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      profilesMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
    }

    const enriched: Conteudo[] = (data ?? []).map((c) => ({
      ...(c as Conteudo),
      author_name: profilesMap.get(c.user_id) ?? 'Iluminado',
    }));

    setConteudos(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchConteudos();

    const channel = supabase
      .channel('conteudos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conteudos' },
        () => fetchConteudos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTip = async () => {
    if (!user) {
      toast({ title: 'Faça login para compartilhar', variant: 'destructive' });
      return;
    }
    if (!newTip.title.trim() || !newTip.description.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e descrição.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('conteudos').insert({
      user_id: user.id,
      title: newTip.title.trim(),
      description: newTip.description.trim(),
      how_it_helped: newTip.how_it_helped.trim() || null,
      category: newTip.category,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: 'Erro ao compartilhar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '🌟 Dica compartilhada!',
      description: 'Sua contribuição já está disponível para a comunidade.',
    });
    setNewTip({ title: '', description: '', how_it_helped: '', category: 'book' });
    setIsAddDialogOpen(false);
  };

  const getTypeIcon = (type: ContentCategory) => {
    switch (type) {
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'movie': return <Film className="w-5 h-5" />;
      case 'meditation': return <Brain className="w-5 h-5" />;
      case 'music': return <Headphones className="w-5 h-5" />;
      case 'community': return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ContentCategory) => {
    switch (type) {
      case 'book': return 'bg-primary/20 text-primary';
      case 'movie': return 'bg-secondary/20 text-secondary';
      case 'meditation': return 'bg-accent/20 text-accent';
      case 'music': return 'bg-orange-500/20 text-orange-400';
      case 'community': return 'bg-green-500/20 text-green-400';
    }
  };

  const getTypeLabel = (type: ContentCategory) => {
    const t = contentTypes.find((x) => x.id === type);
    return t?.label.replace(/s$/, '') ?? type;
  };

  const renderCards = (category: ContentCategory) => {
    const items = conteudos.filter((c) => c.category === category);

    if (loading) {
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 glass-card">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum conteúdo nesta categoria</h3>
          <p className="text-muted-foreground mb-4">
            Seja o primeiro a compartilhar uma dica!
          </p>
          <Button
            onClick={() => {
              setNewTip((t) => ({ ...t, category }));
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Dica
          </Button>
        </div>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass-card p-5 hover:border-primary/30 transition-all group flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${getTypeColor(item.category)}`}>
                {getTypeIcon(item.category)}
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {getTypeLabel(item.category)}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 flex-1">
              {item.description}
            </p>

            {item.how_it_helped && (
              <div className="mb-3 p-3 rounded-lg bg-muted/30">
                <p className="text-xs">
                  <span className="text-accent">💡 Como ajudou:</span>{' '}
                  {item.how_it_helped}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="truncate">{item.author_name}</span>
              <span className="ml-auto">
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Conteúdos para <span className="neon-text">Evolução</span>
            </h1>
            <p className="text-muted-foreground">
              Curadoria e dicas compartilhadas pela comunidade.
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dica
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/30">
              <DialogHeader>
                <DialogTitle>Compartilhar uma Dica</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                  <Select
                    value={newTip.category}
                    onValueChange={(value) => setNewTip({ ...newTip, category: value as ContentCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">📚 Livro</SelectItem>
                      <SelectItem value="movie">🎬 Filme</SelectItem>
                      <SelectItem value="meditation">🧘 Meditação</SelectItem>
                      <SelectItem value="music">🎧 Música</SelectItem>
                      <SelectItem value="community">✨ Da Comunidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                  <Input
                    placeholder="Nome do livro, filme, música..."
                    value={newTip.title}
                    onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                  <Textarea
                    placeholder="Do que se trata?"
                    value={newTip.description}
                    onChange={(e) => setNewTip({ ...newTip, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Como te ajudou? (opcional)</label>
                  <Textarea
                    placeholder="Conte como isso impactou sua vida..."
                    value={newTip.how_it_helped}
                    onChange={(e) => setNewTip({ ...newTip, how_it_helped: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddTip} className="w-full" disabled={submitting}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Compartilhar com a comunidade'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="book" className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-muted/50 p-1 rounded-xl h-auto">
            {contentTypes.map((type) => (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all py-2"
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {contentTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="mt-6">
              {renderCards(type.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
