import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { personalities } from '@/lib/mockData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Brain, AlertCircle, Save, Check, Lightbulb } from 'lucide-react';

export default function Personalities() {
  const [reports, setReports] = useState<{ [key: string]: string }>({});
  const [savedReports, setSavedReports] = useState<{ [key: string]: string[] }>({});

  const handleSaveReport = (personalityId: string) => {
    const report = reports[personalityId]?.trim();
    if (!report || report.length < 20) {
      toast({
        title: 'Relato muito curto',
        description: 'Descreva a situação com mais detalhes para um melhor autoconhecimento.',
        variant: 'destructive',
      });
      return;
    }

    setSavedReports(prev => ({
      ...prev,
      [personalityId]: [...(prev[personalityId] || []), report]
    }));
    setReports({ ...reports, [personalityId]: '' });
    
    toast({
      title: '✅ Relato salvo!',
      description: 'Seu relato foi salvo em seu perfil.',
    });
  };

  const getPersonalityColor = (id: string) => {
    const colors: { [key: string]: string } = {
      esquizoide: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      oral: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      psicopata: 'from-red-500/20 to-orange-500/20 border-red-500/30',
      masoquista: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
      rigido: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    };
    return colors[id] || 'from-muted to-muted border-border';
  };

  const getPersonalityEmoji = (id: string) => {
    const emojis: { [key: string]: string } = {
      esquizoide: '🌌',
      oral: '💔',
      psicopata: '🎭',
      masoquista: '⚔️',
      rigido: '📐',
    };
    return emojis[id] || '🧠';
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-secondary" />
            <h1 className="text-3xl font-bold">
              Consciência de <span className="neon-text-secondary">Personalidade</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore padrões de comportamento e reconheça-se. Este conteúdo é educativo e não substitui acompanhamento profissional.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="glass-card p-4 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-400">Importante</p>
              <p className="text-sm text-muted-foreground mt-1">
                As estruturas de personalidade aqui apresentadas são baseadas em teorias de desenvolvimento humano. 
                Este material é para autoconhecimento e reflexão, não para diagnóstico clínico.
              </p>
            </div>
          </div>
        </div>

        {/* Personalities Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {personalities.map((personality) => (
            <AccordionItem 
              key={personality.id} 
              value={personality.id}
              className={`glass-card border bg-gradient-to-br ${getPersonalityColor(personality.id)} overflow-hidden`}
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getPersonalityEmoji(personality.id)}</span>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {personality.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique para explorar
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Entendendo a estrutura
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {personality.description}
                    </p>
                  </div>

                  {/* Common Situations */}
                  <div>
                    <h4 className="font-semibold mb-3">Situações comuns</h4>
                    <ul className="space-y-2">
                      {personality.situations.map((situation, index) => (
                        <li 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{situation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Personal Report */}
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold mb-3">Relate uma situação sua</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Identificou-se com algum padrão? Escreva uma situação que você viveu:
                    </p>
                    <Textarea
                      placeholder="Descreva uma situação que você viveu relacionada a esse padrão..."
                      value={reports[personality.id] || ''}
                      onChange={(e) => setReports({ ...reports, [personality.id]: e.target.value })}
                      className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary mb-3"
                    />
                    <Button 
                      onClick={() => handleSaveReport(personality.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar no meu perfil
                    </Button>

                    {/* Saved Reports */}
                    {savedReports[personality.id]?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Seus relatos salvos:</p>
                        <div className="space-y-2">
                          {savedReports[personality.id].map((report, index) => (
                            <div 
                              key={index}
                              className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm"
                            >
                              {report}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
