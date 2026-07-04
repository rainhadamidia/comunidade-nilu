import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, Infinity as InfinityIcon, Brain, Users, BarChart3 } from 'lucide-react';

const LINK_ASSINATURA = 'https://invoice.infinitepay.io/plans/rainhadamidia-ia/x4KWrEaqAW';

const BENEFICIOS = [
  { icon: InfinityIcon, texto: 'Projetos (PSI) ilimitados, simultâneos' },
  { icon: Brain, texto: 'PCI completo: sabotadores, crenças limitantes, perfis por área da vida' },
  { icon: Sparkles, texto: 'Desafios personalizados e Desafios Anuais' },
  { icon: Users, texto: 'Interação completa na comunidade e Espaço Seguro' },
  { icon: BarChart3, texto: 'Resgate de Neural Coins por recompensas' },
];

export default function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl">👑</div>
            <h1 className="text-2xl font-bold neon-text">Iluminnados Premium</h1>
            <p className="text-muted-foreground text-sm">
              Desbloqueie todo o potencial da sua jornada de execução.
            </p>
          </div>

          <div className="space-y-3">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <b.icon className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm">{b.texto}</p>
              </div>
            ))}
          </div>

          <a href={LINK_ASSINATURA} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow">
              Assinar Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Após confirmar o pagamento, seu acesso Premium é liberado manualmente em até algumas horas.
            </p>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Início
          </Button>
        </div>
      </div>
    </div>
  );
}
