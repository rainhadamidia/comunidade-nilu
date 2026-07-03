import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PERGUNTAS, ESCALA, PERFIS, type TraitId } from '@/lib/pci/content';
import { calcularScores, gerarRelatorio, type Respostas, type RelatorioPCI } from '@/lib/pci/engine';

type Etapa = 'intro' | 'quiz' | 'resultado';

export default function Diagnostico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('intro');
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [relatorio, setRelatorio] = useState<RelatorioPCI | null>(null);
  const [salvando, setSalvando] = useState(false);

  const perguntaAtual = PERGUNTAS[indice];
  const progresso = (indice / PERGUNTAS.length) * 100;

  const responder = async (valor: number) => {
    const novasRespostas = { ...respostas, [perguntaAtual.id]: valor };
    setRespostas(novasRespostas);

    if (indice < PERGUNTAS.length - 1) {
      setIndice(indice + 1);
      return;
    }

    // Última pergunta: calcula e salva
    setSalvando(true);
    try {
      const scores = calcularScores(novasRespostas);
      const rel = gerarRelatorio(scores);
      setRelatorio(rel);

      if (user) {
        const { error } = await supabase.from('pci_results').insert({
          user_id: user.id,
          respostas: novasRespostas,
          scores,
          dominante: rel.dominante,
          secundario: rel.secundario,
          terciario: rel.terciario,
        });
        if (error) throw error;
      }

      setEtapa('resultado');
    } catch (e) {
      console.error('Erro ao salvar PCI:', e);
      toast({
        title: 'Erro ao salvar seu diagnóstico',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
    }
  };

  const voltar = () => {
    if (indice > 0) setIndice(indice - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {etapa === 'intro' && (
          <div className="glass-card p-8 text-center space-y-6">
            <div className="text-6xl animate-float">🧭</div>
            <h1 className="text-3xl font-bold neon-text">Seu Diagnóstico Comportamental</h1>
            <p className="text-muted-foreground">
              Antes de começar seu primeiro projeto, vamos entender como sua mente funciona.
              São 20 perguntas rápidas — leva menos de 5 minutos e é obrigatório apenas uma vez.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Esta análise é de caráter educativo e de autoconhecimento, não constituindo
              diagnóstico psicológico, psiquiátrico ou clínico.
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              onClick={() => setEtapa('quiz')}
            >
              Começar diagnóstico
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {etapa === 'quiz' && (
          <div className="glass-card p-8 space-y-8">
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Pergunta {indice + 1} de {PERGUNTAS.length}</span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <Progress value={progresso} className="h-2 bg-muted" />
            </div>

            <p className="text-xl font-medium text-center leading-relaxed min-h-[4.5rem] flex items-center justify-center">
              {perguntaAtual.texto}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {ESCALA.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  disabled={salvando}
                  onClick={() => responder(opcao.valor)}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-primary/20 hover:neon-border transition-all text-sm disabled:opacity-50"
                >
                  <div className="font-bold text-lg mb-1">{opcao.valor}</div>
                  <div className="text-xs text-muted-foreground">{opcao.label}</div>
                </button>
              ))}
            </div>

            {indice > 0 && (
              <button
                type="button"
                onClick={voltar}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
          </div>
        )}

        {etapa === 'resultado' && relatorio && (
          <ResultadoPCI relatorio={relatorio} onContinuar={() => navigate('/novo-projeto')} />
        )}
      </div>
    </div>
  );
}

function ResultadoPCI({ relatorio, onContinuar }: { relatorio: RelatorioPCI; onContinuar: () => void }) {
  const dominante = PERFIS[relatorio.dominante];
  const secundario = PERFIS[relatorio.secundario];
  const sinergia = relatorio.dinamica.find(b => b.tipo === 'sinergia');
  const conflito = relatorio.dinamica.find(b => b.tipo === 'conflito');

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl">{dominante.icone}</div>
        <h1 className="text-2xl font-bold neon-text">{dominante.nome}</h1>
        <p className="text-sm text-muted-foreground">
          Perfil dominante · {relatorio.scores[relatorio.dominante]}%
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(relatorio.scores) as [TraitId, number][])
          .sort((a, b) => b[1] - a[1])
          .map(([id, valor]) => (
            <div key={id} className="text-center">
              <div className="text-2xl">{PERFIS[id].icone}</div>
              <div className="text-sm font-bold">{valor}%</div>
              <div className="text-[10px] text-muted-foreground truncate">{PERFIS[id].nome.split(' ')[0]}</div>
            </div>
          ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <p className="text-sm leading-relaxed">{dominante.abordagemHumanizada}</p>
      </div>

      {sinergia && (
        <div>
          <h2 className="font-semibold text-primary mb-1">✨ {sinergia.nome}</h2>
          <p className="text-sm text-muted-foreground">{sinergia.texto}</p>
        </div>
      )}

      {conflito && (
        <div>
          <h2 className="font-semibold text-secondary mb-1">⚡ {conflito.nome}</h2>
          <p className="text-sm text-muted-foreground">{conflito.sistema}</p>
        </div>
      )}

      {relatorio.psi && (
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
          <h2 className="font-semibold mb-1">🎯 Seu gargalo mais provável em projetos</h2>
          <p className="text-sm text-muted-foreground mb-2">{relatorio.psi.gargalo}</p>
          <p className="text-sm">{relatorio.psi.estrategia}</p>
        </div>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
        onClick={onContinuar}
      >
        Continuar para minha jornada
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
