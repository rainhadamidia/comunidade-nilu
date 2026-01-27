export interface AnnualChallenge {
  id: number;
  title: string;
  description: string;
  action: string;
  reflection: string;
  month: number; // 1-12
  week: number; // 1-4
  points: number;
}

export const annualChallenges: AnnualChallenge[] = [
  // Janeiro - Fevereiro: Autoconhecimento
  {
    id: 1,
    title: "O Despertar",
    description: "Inicie o ano com consciência plena de quem você é.",
    action: "Escreva uma carta para você mesmo descrevendo quem você quer ser no final do ano.",
    reflection: "Quais mudanças você realmente quer fazer em sua vida?",
    month: 1,
    week: 1,
    points: 50,
  },
  {
    id: 2,
    title: "Raízes Profundas",
    description: "Conheça suas origens para entender seu presente.",
    action: "Converse com um familiar sobre histórias da sua família que você não conhece.",
    reflection: "Como essas histórias moldaram quem você é hoje?",
    month: 1,
    week: 3,
    points: 50,
  },
  {
    id: 3,
    title: "Sombras Reveladas",
    description: "Encare aquilo que você esconde de si mesmo.",
    action: "Liste 3 características suas que você tem dificuldade de aceitar.",
    reflection: "Por que essas características te incomodam?",
    month: 2,
    week: 1,
    points: 50,
  },
  {
    id: 4,
    title: "O Corpo Fala",
    description: "Aprenda a ouvir as mensagens do seu corpo.",
    action: "Por uma semana, anote como seu corpo reage a diferentes situações.",
    reflection: "Que padrões você percebeu nas reações do seu corpo?",
    month: 2,
    week: 3,
    points: 50,
  },

  // Março - Abril: Relacionamentos
  {
    id: 5,
    title: "Conexões Verdadeiras",
    description: "Avalie a qualidade dos seus relacionamentos.",
    action: "Liste as 5 pessoas mais importantes na sua vida e o que cada uma representa.",
    reflection: "Você tem nutrido essas relações adequadamente?",
    month: 3,
    week: 1,
    points: 50,
  },
  {
    id: 6,
    title: "Perdão Libertador",
    description: "Liberte-se do peso do ressentimento.",
    action: "Escreva uma carta de perdão (não precisa enviar) para alguém que te magoou.",
    reflection: "Como seria sua vida sem esse ressentimento?",
    month: 3,
    week: 3,
    points: 50,
  },
  {
    id: 7,
    title: "Limites Saudáveis",
    description: "Aprenda a dizer não com amor.",
    action: "Identifique uma situação onde você precisa estabelecer um limite e faça isso esta semana.",
    reflection: "O que te impede de colocar limites normalmente?",
    month: 4,
    week: 1,
    points: 50,
  },
  {
    id: 8,
    title: "Vulnerabilidade Corajosa",
    description: "A força está em mostrar sua humanidade.",
    action: "Compartilhe algo vulnerável com alguém de confiança.",
    reflection: "Como foi permitir-se ser visto de verdade?",
    month: 4,
    week: 3,
    points: 50,
  },

  // Maio - Junho: Propósito
  {
    id: 9,
    title: "Valores Centrais",
    description: "Descubra o que realmente importa para você.",
    action: "Liste seus 5 valores mais importantes e avalie se está vivendo de acordo.",
    reflection: "Suas ações diárias refletem seus valores?",
    month: 5,
    week: 1,
    points: 50,
  },
  {
    id: 10,
    title: "Legado Vivo",
    description: "Pense no impacto que você quer deixar.",
    action: "Escreva o que gostaria que dissessem sobre você daqui a 50 anos.",
    reflection: "O que você precisa mudar para criar esse legado?",
    month: 5,
    week: 3,
    points: 50,
  },
  {
    id: 11,
    title: "Talentos Ocultos",
    description: "Reconheça suas habilidades únicas.",
    action: "Pergunte a 3 pessoas diferentes qual elas acham que é seu maior talento.",
    reflection: "Você está usando seus talentos em prol de algo maior?",
    month: 6,
    week: 1,
    points: 50,
  },
  {
    id: 12,
    title: "Missão Pessoal",
    description: "Defina sua direção de vida.",
    action: "Escreva uma frase que resuma seu propósito de vida.",
    reflection: "Como você pode viver esse propósito diariamente?",
    month: 6,
    week: 3,
    points: 50,
  },

  // Julho - Agosto: Saúde Mental
  {
    id: 13,
    title: "Mente Silenciosa",
    description: "Aprenda a acalmar o ruído mental.",
    action: "Pratique meditação por 10 minutos diários durante uma semana.",
    reflection: "O que você descobriu no silêncio da sua mente?",
    month: 7,
    week: 1,
    points: 50,
  },
  {
    id: 14,
    title: "Pensamentos Conscientes",
    description: "Observe seus padrões de pensamento.",
    action: "Por 3 dias, anote pensamentos negativos automáticos que surgirem.",
    reflection: "Esses pensamentos são fatos ou interpretações?",
    month: 7,
    week: 3,
    points: 50,
  },
  {
    id: 15,
    title: "Gratidão Profunda",
    description: "Cultive a apreciação pelo que você tem.",
    action: "Mantenha um diário de gratidão por 2 semanas.",
    reflection: "Como a gratidão mudou sua perspectiva?",
    month: 8,
    week: 1,
    points: 50,
  },
  {
    id: 16,
    title: "Autocompaixão",
    description: "Trate-se com a gentileza que daria a um amigo.",
    action: "Quando cometer um erro esta semana, escreva palavras de conforto para si mesmo.",
    reflection: "Por que é mais fácil ser gentil com outros do que consigo?",
    month: 8,
    week: 3,
    points: 50,
  },

  // Setembro - Outubro: Ação
  {
    id: 17,
    title: "Medo Enfrentado",
    description: "Transforme medo em combustível.",
    action: "Faça algo que você vem adiando por medo.",
    reflection: "O que você descobriu sobre si mesmo ao enfrentar esse medo?",
    month: 9,
    week: 1,
    points: 50,
  },
  {
    id: 18,
    title: "Hábito Transformador",
    description: "Pequenas mudanças, grandes resultados.",
    action: "Escolha um novo hábito positivo e pratique por 21 dias.",
    reflection: "Como esse hábito impactou sua vida?",
    month: 9,
    week: 3,
    points: 50,
  },
  {
    id: 19,
    title: "Zona de Desconforto",
    description: "O crescimento acontece fora da zona de conforto.",
    action: "Faça algo completamente novo que nunca tentou antes.",
    reflection: "O que essa experiência te ensinou sobre seus limites?",
    month: 10,
    week: 1,
    points: 50,
  },
  {
    id: 20,
    title: "Serviço ao Próximo",
    description: "Encontre significado em ajudar outros.",
    action: "Dedique um dia a fazer algo significativo por alguém sem esperar nada em troca.",
    reflection: "Como servir outros impactou seu próprio bem-estar?",
    month: 10,
    week: 3,
    points: 50,
  },

  // Novembro - Dezembro: Integração
  {
    id: 21,
    title: "Balanço do Ano",
    description: "Reflita sobre sua jornada.",
    action: "Releia a carta que escreveu no início do ano e compare com quem você é agora.",
    reflection: "Quais foram suas maiores conquistas e aprendizados?",
    month: 11,
    week: 1,
    points: 50,
  },
  {
    id: 22,
    title: "Celebração Interior",
    description: "Reconheça suas vitórias, grandes e pequenas.",
    action: "Liste todas as suas conquistas do ano, por menores que pareçam.",
    reflection: "Você costuma celebrar suas vitórias ou já parte para o próximo objetivo?",
    month: 11,
    week: 3,
    points: 50,
  },
  {
    id: 23,
    title: "Encerramento Consciente",
    description: "Feche ciclos antes de iniciar novos.",
    action: "Identifique algo inacabado em sua vida e tome uma ação para encerrar.",
    reflection: "O que te impedia de encerrar esse ciclo antes?",
    month: 12,
    week: 1,
    points: 50,
  },
  {
    id: 24,
    title: "Renascimento",
    description: "Prepare-se para uma nova versão de si mesmo.",
    action: "Escreva suas intenções e visão para o próximo ano.",
    reflection: "Quem você está se tornando?",
    month: 12,
    week: 3,
    points: 50,
  },
];

export const getUnlockedChallenges = (completedChallenges: number[]): number[] => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // Unlock all challenges up to current month
  const unlockedByTime = annualChallenges
    .filter(c => c.month <= currentMonth)
    .map(c => c.id);
  
  // Also unlock the next challenge if previous is completed
  const unlockedByProgress = completedChallenges.map(id => id + 1).filter(id => id <= 24);
  
  return [...new Set([...unlockedByTime, ...unlockedByProgress])];
};
