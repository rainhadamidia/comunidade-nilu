/* ============================================================
   ILUMINNARE — Motor de Scoring + Relatório Dinâmico do PCI
   Portado de mvp/engine.js (vanilla JS) para o app Lovable (TypeScript)
============================================================ */

import {
  PERFIS, SINERGIAS, CONFLITOS, IMPACTOS, PSI_ESTRATEGIAS, PERGUNTAS,
  type TraitId, type Perfil, type Sinergia, type Conflito, type Impacto, type EstrategiaPSI,
} from './content';

export const TRAIT_IDS = Object.keys(PERFIS) as TraitId[];

export type Respostas = Record<number, number>; // { [perguntaId]: valor(1-5) }
export type Scores = Record<TraitId, number>; // soma 100

function chavePar(idA: TraitId, idB: TraitId): string {
  return [idA, idB].sort().join('+');
}

/** Recebe as respostas do quiz (1-5 por pergunta) e retorna o percentual de cada traço, somando 100. */
export function calcularScores(respostas: Respostas): Scores {
  const somaPorTraco = {} as Record<TraitId, number>;
  TRAIT_IDS.forEach(id => { somaPorTraco[id] = 0; });

  PERGUNTAS.forEach(p => {
    const valor = Number(respostas[p.id]) || 0;
    somaPorTraco[p.perfil] += valor;
  });

  const somaTotal = Object.values(somaPorTraco).reduce((a, b) => a + b, 0);

  const scores = {} as Scores;
  TRAIT_IDS.forEach(id => {
    scores[id] = somaTotal > 0 ? Math.round((somaPorTraco[id] / somaTotal) * 1000) / 10 : 0;
  });
  return scores;
}

/** Retorna os ids de traço ordenados do maior para o menor percentual. */
export function traitsRankeados(scores: Scores): TraitId[] {
  return (Object.entries(scores) as [TraitId, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

export interface BlocoDinamica {
  tipo: 'sinergia' | 'conflito' | 'fallback';
  nome: string;
  texto?: string;
  sistema?: string;
  sentimento?: string;
}

/** Gera os blocos de dinâmica entre os 2 traços dominantes: sinergia (luz) e conflito (sombra). */
export function gerarDinamica(idA: TraitId, idB: TraitId): BlocoDinamica[] {
  const chave = chavePar(idA, idB);
  const perfilA = PERFIS[idA];
  const perfilB = PERFIS[idB];
  const blocos: BlocoDinamica[] = [];

  if (SINERGIAS[chave]) blocos.push({ tipo: 'sinergia', ...SINERGIAS[chave] });
  if (CONFLITOS[chave]) blocos.push({ tipo: 'conflito', ...CONFLITOS[chave] });

  if (blocos.length === 0) {
    blocos.push({
      tipo: 'fallback',
      nome: `${perfilA.nome} + ${perfilB.nome}`,
      texto: `Essa combinação ainda não tem um mapeamento fino na base de conhecimento, mas dá pra entender pelas partes: em alta performance, ${perfilA.nome} traz ${perfilA.luz.split('.')[0].toLowerCase()}, enquanto ${perfilB.nome} contribui com ${perfilB.luz.split('.')[0].toLowerCase()}. Sob estresse, fique de olho quando ${perfilA.nome.toLowerCase()} cai em "${perfilA.sombra.split('.')[0].toLowerCase()}" ao mesmo tempo em que ${perfilB.nome.toLowerCase()} cai em "${perfilB.sombra.split('.')[0].toLowerCase()}".`,
    });
  }
  return blocos;
}

/** Impacto de longo prazo — usa o bucket exato do par dominante, senão fallback genérico. */
export function gerarImpacto(idA: TraitId, idB: TraitId): Impacto {
  const chave = chavePar(idA, idB);
  if (IMPACTOS[chave]) return IMPACTOS[chave];

  const perfilA = PERFIS[idA];
  return {
    titulo: `Predomínio ${perfilA.nome}`,
    carreira: 'Padrões de repetição da dor de origem tendem a se manifestar em decisões profissionais impulsivas ou travadas, dependendo do gatilho.',
    relacoes: 'A dor de origem do seu traço dominante tende a se repetir nos vínculos mais próximos até ser reconhecida conscientemente.',
    saudeMental: 'O acúmulo do padrão não gerenciado tende a se somar a estresse crônico e sintomas físicos de tensão.',
  };
}

/** Infere a estratégia PSI mais provável com base nos 2 traços dominantes. */
export function gerarEstrategiaPSI(idA: TraitId, idB: TraitId): (EstrategiaPSI & { chave: string }) | null {
  const dominantes = [idA, idB];
  let melhor: (EstrategiaPSI & { chave: string }) | null = null;
  let melhorPontuacao = -1;

  Object.entries(PSI_ESTRATEGIAS).forEach(([chave, bloco]) => {
    const pontuacao = bloco.perfilProvavel.filter(id => dominantes.includes(id)).length;
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhor = { chave, ...bloco };
    }
  });
  return melhor;
}

export interface RelatorioPCI {
  scores: Scores;
  dominante: TraitId;
  secundario: TraitId;
  terciario: TraitId;
  perfis: Record<string, Perfil>;
  dinamica: BlocoDinamica[];
  impacto: Impacto;
  psi: (EstrategiaPSI & { chave: string }) | null;
  geradoEm: string;
}

/** Função principal: recebe scores calculados e devolve o relatório completo do PCI. */
export function gerarRelatorio(scores: Scores): RelatorioPCI {
  const [dominante, secundario, terciario] = traitsRankeados(scores);
  return {
    scores,
    dominante,
    secundario,
    terciario,
    perfis: {
      [dominante]: PERFIS[dominante],
      [secundario]: PERFIS[secundario],
    },
    dinamica: gerarDinamica(dominante, secundario),
    impacto: gerarImpacto(dominante, secundario),
    psi: gerarEstrategiaPSI(dominante, secundario),
    geradoEm: new Date().toISOString(),
  };
}
