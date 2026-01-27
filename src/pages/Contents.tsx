import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth, UserTip } from '@/contexts/AuthContext';
import { contents as initialContents, ContentItem } from '@/lib/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Book, 
  Film, 
  Brain, 
  Music, 
  Heart, 
  Bookmark, 
  BookOpen, 
  Headphones,
  Plus,
  MessageCircle,
  Send,
  Sparkles
} from 'lucide-react';

const contentTypes = [
  { id: 'book', label: 'Livros', icon: Book },
  { id: 'movie', label: 'Filmes', icon: Film },
  { id: 'meditation', label: 'Meditações', icon: Brain },
  { id: 'music', label: 'Músicas', icon: Music },
  { id: 'community', label: 'Da Comunidade', icon: Sparkles },
];

export default function Contents() {
  const { user, userTips, addUserTip, likeUserTip, saveUserTip, commentOnTip } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>(initialContents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTip, setNewTip] = useState({
    title: '',
    description: '',
    howItHelped: '',
    type: 'book' as 'book' | 'movie' | 'music' | 'selfcare',
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const handleLike = (id: string) => {
    setContents(contents.map(item => 
      item.id === id ? { ...item, liked: !item.liked } : item
    ));
    const item = contents.find(c => c.id === id);
    if (item && !item.liked) {
      toast({
        title: '❤️ Curtido!',
        description: `"${item.title}" adicionado aos favoritos.`,
      });
    }
  };

  const handleSave = (id: string) => {
    setContents(contents.map(item => 
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
    const item = contents.find(c => c.id === id);
    if (item && !item.saved) {
      toast({
        title: '📚 Salvo!',
        description: `"${item.title}" salvo para depois.`,
      });
    }
  };

  const handleAddTip = () => {
    if (!newTip.title.trim() || !newTip.description.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e descrição.',
        variant: 'destructive',
      });
      return;
    }

    addUserTip(newTip);
    toast({
      title: '🌟 Dica compartilhada!',
      description: '+5 pontos por contribuir com a comunidade!',
    });
    setNewTip({ title: '', description: '', howItHelped: '', type: 'book' });
    setIsAddDialogOpen(false);
  };

  const handleComment = (tipId: string) => {
    const comment = commentInputs[tipId]?.trim();
    if (!comment) return;
    
    commentOnTip(tipId, comment);
    setCommentInputs(prev => ({ ...prev, [tipId]: '' }));
    toast({
      title: '💬 Comentário adicionado!',
      description: '+5 pontos por interagir!',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'movie': return <Film className="w-5 h-5" />;
      case 'meditation': return <Brain className="w-5 h-5" />;
      case 'music': return <Headphones className="w-5 h-5" />;
      case 'selfcare': return <Sparkles className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-primary/20 text-primary';
      case 'movie': return 'bg-secondary/20 text-secondary';
      case 'meditation': return 'bg-accent/20 text-accent';
      case 'music': return 'bg-orange-500/20 text-orange-400';
      case 'selfcare': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'book': return 'Livro';
      case 'movie': return 'Filme';
      case 'music': return 'Música';
      case 'selfcare': return 'Autocuidado';
      default: return type;
    }
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
              Curadoria especial e dicas da comunidade para apoiar sua jornada.
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
                  <label className="text-sm text-muted-foreground mb-1 block">Tipo</label>
                  <Select
                    value={newTip.type}
                    onValueChange={(value) => setNewTip({ ...newTip, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">📚 Livro</SelectItem>
                      <SelectItem value="movie">🎬 Filme</SelectItem>
                      <SelectItem value="music">🎧 Música</SelectItem>
                      <SelectItem value="selfcare">🧘 Prática de Autocuidado</SelectItem>
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
                  <label className="text-sm text-muted-foreground mb-1 block">Como te ajudou?</label>
                  <Textarea
                    placeholder="Conte como isso impactou sua vida..."
                    value={newTip.howItHelped}
                    onChange={(e) => setNewTip({ ...newTip, howItHelped: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddTip} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Compartilhar (+5 pontos)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="book" className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-muted/50 p-1 rounded-xl">
            {contentTypes.map((type) => (
              <TabsTrigger 
                key={type.id} 
                value={type.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all"
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Original content tabs */}
          {contentTypes.slice(0, 4).map((type) => (
            <TabsContent key={type.id} value={type.id} className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contents
                  .filter(item => item.type === type.id)
                  .map((item) => (
                    <div 
                      key={item.id}
                      className="glass-card p-5 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLike(item.id)}
                          className={`flex-1 ${item.liked ? 'border-secondary/50 text-secondary' : ''}`}
                        >
                          <Heart className={`w-4 h-4 mr-1.5 ${item.liked ? 'fill-secondary' : ''}`} />
                          {item.liked ? 'Curtido' : 'Curtir'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(item.id)}
                          className={`flex-1 ${item.saved ? 'border-primary/50 text-primary' : ''}`}
                        >
                          <Bookmark className={`w-4 h-4 mr-1.5 ${item.saved ? 'fill-primary' : ''}`} />
                          {item.saved ? 'Salvo' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}

          {/* Community content tab */}
          <TabsContent value="community" className="mt-6">
            {userTips.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhuma dica ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a compartilhar uma dica com a comunidade!
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Dica
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userTips.map((tip) => (
                  <div key={tip.id} className="glass-card p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{tip.userAvatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{tip.userNickname}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(tip.type)}`}>
                            {getTypeLabel(tip.type)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">{tip.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{tip.description}</p>
                        {tip.howItHelped && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/30">
                            <p className="text-sm">
                              <span className="text-accent">💡 Como ajudou:</span> {tip.howItHelped}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4">
                          <button
                            onClick={() => likeUserTip(tip.id)}
                            className={`flex items-center gap-1 text-sm ${
                              tip.likedBy.includes(user?.id || '') 
                                ? 'text-secondary' 
                                : 'text-muted-foreground hover:text-secondary'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${tip.likedBy.includes(user?.id || '') ? 'fill-secondary' : ''}`} />
                            {tip.likes}
                          </button>
                          <button
                            onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {tip.comments.length}
                          </button>
                          <button
                            onClick={() => saveUserTip(tip.id)}
                            className={`flex items-center gap-1 text-sm ${
                              tip.savedBy.includes(user?.id || '') 
                                ? 'text-primary' 
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${tip.savedBy.includes(user?.id || '') ? 'fill-primary' : ''}`} />
                            Salvar
                          </button>
                        </div>

                        {/* Comments section */}
                        {expandedTip === tip.id && (
                          <div className="mt-4 pt-4 border-t border-border">
                            {tip.comments.length > 0 && (
                              <div className="space-y-3 mb-4">
                                {tip.comments.map((comment) => (
                                  <div key={comment.id} className="flex gap-2 text-sm">
                                    <span className="font-medium">{comment.nickname}:</span>
                                    <span className="text-muted-foreground">{comment.content}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Adicione um comentário..."
                                value={commentInputs[tip.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ 
                                  ...prev, 
                                  [tip.id]: e.target.value 
                                }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment(tip.id)}
                                className="flex-1"
                              />
                              <Button size="sm" onClick={() => handleComment(tip.id)}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Saved/Liked Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Seus Favoritos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-secondary" />
                <span className="font-medium">Curtidos</span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {contents.filter(c => c.liked).length + userTips.filter(t => t.likedBy.includes(user?.id || '')).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-4 h-4 text-primary" />
                <span className="font-medium">Salvos</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {contents.filter(c => c.saved).length + userTips.filter(t => t.savedBy.includes(user?.id || '')).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
