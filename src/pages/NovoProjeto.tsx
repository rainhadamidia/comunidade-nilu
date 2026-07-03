import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import type { TraitId } from '@/lib/pci/content';
import { gerarPlanoPSI } from '@/lib/psi/taskTemplates';

const CATEGORIAS = ['Negócio', 'Carreira', 'Financeiro', 'Relacionamento', 'Saúde', 'Pessoal', 'Outro'];

export default function NovoProjeto() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [prazoDias, setPrazoDias] = useState('90');
  const [prioridade, setPrioridade] = useState('media');
  const [categoria, setCategoria] = useState('Negócio');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!nome.trim() || !objetivo.trim()) {
      toast({ title: 'Preencha nome e objetivo', variant: 'destructive' });
      return;
    }

    setSalvando(true);
    try {
      const { data: pciResult } = await supabase
        .from('pci_results')
        .select('id, dominante')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const dominante = (pciResult?.dominante ?? 'inovador') as TraitId;

      const { data: project, error: projectError } = await supabase
        .from('psi_projects')
        .insert({
          user_id: user.id,
          pci_result_id: pciResult?.id ?? null,
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          objetivo: objetivo.trim(),
          prazo_dias: Number(prazoDias),
          prioridade,
          categoria,
        })
        .select('id')
        .single();

      if (projectError) throw projectError;

      const plano = gerarPlanoPSI(dominante);

      for (const semana of plano) {
        const { data: week, error: weekError } = await supabase
          .from('psi_weeks')
          .insert({
            project_id: project.id,
            numero: semana.numero,
            titulo: semana.titulo,
            status: semana.numero === 1 ? 'active' : 'locked',
            unlocked_at: semana.numero === 1 ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        if (weekError) throw weekError;

        const tarefasParaInserir = semana.tarefas.map(t => ({
          week_id: week.id,
          ordem: t.ordem,
          titulo: t.titulo,
          descricao: t.descricao,
          objetivo: t.objetivo,
          tempo_estimado_min: t.tempoEstimadoMin,
          dificuldade: t.dificuldade,
        }));

        const { error: tasksError } = await supabase.from('psi_tasks').insert(tarefasParaInserir);
        if (tasksError) throw tasksError;
      }

      toast({ title: 'Projeto criado!', description: 'Sua jornada de 4 semanas já está pronta.' });
      navigate('/');
    } catch (err) {
      console.error('Erro ao criar PSI:', err);
      toast({ title: 'Erro ao criar projeto', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 animate-float">🗂️</div>
          <h1 className="text-2xl font-bold neon-text">Cadastre seu primeiro PSI</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Projeto, Sonho ou Ideia. Vamos quebrar isso em 4 semanas de execução.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do projeto</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Lançar minha consultoria" className="bg-muted/50 border-border/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo final</Label>
            <Input id="objetivo" value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="Ex: Fechar os primeiros 3 clientes" className="bg-muted/50 border-border/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Conte um pouco mais sobre o projeto" className="bg-muted/50 border-border/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prazo desejado</Label>
              <Select value={prazoDias} onValueChange={setPrazoDias}>
                <SelectTrigger className="bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="180">180 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger className="bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={salvando}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
          >
            {salvando ? 'Gerando seu plano de 4 semanas...' : (
              <span className="flex items-center gap-2">Começar minha jornada <ArrowRight className="w-5 h-5" /></span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
