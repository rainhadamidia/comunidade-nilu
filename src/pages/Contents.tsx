import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { contents as initialContents, ContentItem } from '@/lib/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Book, Film, Brain, Music, Heart, Bookmark, BookOpen, Headphones } from 'lucide-react';

const contentTypes = [
  { id: 'book', label: 'Livros', icon: Book },
  { id: 'movie', label: 'Filmes', icon: Film },
  { id: 'meditation', label: 'Meditações', icon: Brain },
  { id: 'music', label: 'Músicas', icon: Music },
];

export default function Contents() {
  const [contents, setContents] = useState<ContentItem[]>(initialContents);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'movie': return <Film className="w-5 h-5" />;
      case 'meditation': return <Brain className="w-5 h-5" />;
      case 'music': return <Headphones className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-primary/20 text-primary';
      case 'movie': return 'bg-secondary/20 text-secondary';
      case 'meditation': return 'bg-accent/20 text-accent';
      case 'music': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Conteúdos para <span className="neon-text">Evolução</span>
          </h1>
          <p className="text-muted-foreground">
            Curadoria especial de livros, filmes, meditações e músicas para apoiar sua jornada.
          </p>
        </div>

        <Tabs defaultValue="book" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
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

          {contentTypes.map((type) => (
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
                {contents.filter(c => c.liked).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-4 h-4 text-primary" />
                <span className="font-medium">Salvos</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {contents.filter(c => c.saved).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
