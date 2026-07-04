import { supabase } from '@/integrations/supabase/client';

/* Economia "Neural Coins" (estruturando as versões.docx), adaptada ao MVP:
   reaproveita profiles.points via a função award_points (increment atômico). */
export const NEURAL_COINS = {
  PCI_CONCLUIDO: 25,
  PSI_CADASTRADO: 25,
  TAREFA_FACIL: 10,
  TAREFA_MEDIA: 20,
  TAREFA_DIFICIL: 30,
  SEMANA_CONCLUIDA: 50,
  PROJETO_CONCLUIDO: 150,
} as const;

export async function awardPoints(userId: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc('award_points', { _user_id: userId, _amount: amount });
  if (error) {
    console.error('Erro ao conceder pontos:', error);
  }
}

export function pontosPorDificuldade(dificuldade: string): number {
  if (dificuldade === 'facil') return NEURAL_COINS.TAREFA_FACIL;
  if (dificuldade === 'dificil') return NEURAL_COINS.TAREFA_DIFICIL;
  return NEURAL_COINS.TAREFA_MEDIA;
}
