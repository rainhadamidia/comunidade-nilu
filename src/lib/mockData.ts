// Mock data for Iluminnados app

export interface Challenge {
  id: number;
  title: string;
  description: string;
  action: string;
  reflection: string;
  status: 'locked' | 'active' | 'completed';
}

export interface CommunityMember {
  id: string;
  nickname: string;
  avatar: string;
  status: 'online' | 'em jornada' | 'offline';
}

export interface Activity {
  id: string;
  type: 'advance' | 'share' | 'complete' | 'join';
  message: string;
  timestamp: Date;
}

export interface SafeSpacePost {
  id: string;
  content: string;
  timestamp: Date;
  comments: { id: string; content: string; timestamp: Date }[];
  likes: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'book' | 'movie' | 'meditation' | 'music';
  liked: boolean;
  saved: boolean;
}

export interface Personality {
  id: string;
  name: string;
  description: string;
  situations: string[];
}

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "O Primeiro Passo",
    description: "Toda jornada começa com um único passo consciente.",
    action: "Escreva 3 coisas que você está evitando enfrentar.",
    reflection: "Por que você acredita que está evitando essas situações?",
    status: 'active'
  },
  {
    id: 2,
    title: "O Espelho Interior",
    description: "Conhecer a si mesmo é o início de toda sabedoria.",
    action: "Observe suas reações em 3 situações hoje. Anote o que sentiu.",
    reflection: "Suas reações refletem quem você realmente é ou quem você foi condicionado a ser?",
    status: 'locked'
  },
  {
    id: 3,
    title: "Silêncio Sagrado",
    description: "No silêncio encontramos respostas que o barulho esconde.",
    action: "Passe 15 minutos em silêncio absoluto, sem distrações.",
    reflection: "O que surgiu em sua mente quando o silêncio tomou conta?",
    status: 'locked'
  },
  {
    id: 4,
    title: "Gratidão Consciente",
    description: "A gratidão transforma o que temos em suficiente.",
    action: "Liste 5 coisas pelas quais você é genuinamente grato.",
    reflection: "Quantas dessas coisas você costuma ignorar no dia a dia?",
    status: 'locked'
  },
  {
    id: 5,
    title: "O Medo Revelado",
    description: "Nomear o medo é o primeiro passo para superá-lo.",
    action: "Identifique seu maior medo atual e escreva sobre ele.",
    reflection: "Esse medo é real ou uma construção da sua mente?",
    status: 'locked'
  },
  {
    id: 6,
    title: "Conexão Autêntica",
    description: "Conexões verdadeiras exigem vulnerabilidade.",
    action: "Tenha uma conversa honesta com alguém sobre seus sentimentos.",
    reflection: "Como foi permitir-se ser vulnerável?",
    status: 'locked'
  },
  {
    id: 7,
    title: "Perdão Libertador",
    description: "Perdoar não é esquecer, é escolher a liberdade.",
    action: "Escreva uma carta de perdão (não precisa enviar).",
    reflection: "Que peso você carrega por não perdoar?",
    status: 'locked'
  },
  {
    id: 8,
    title: "Propósito Emergente",
    description: "Seu propósito não é encontrado, é construído.",
    action: "Liste suas 3 maiores paixões e 3 maiores habilidades.",
    reflection: "Onde essas listas se encontram?",
    status: 'locked'
  }
];

export const communityMembers: CommunityMember[] = [
  { id: '1', nickname: 'Luz_Interior', avatar: '🌟', status: 'online' },
  { id: '2', nickname: 'Caminhante_Zen', avatar: '🧘', status: 'em jornada' },
  { id: '3', nickname: 'Alma_Livre', avatar: '🦋', status: 'online' },
  { id: '4', nickname: 'Ser_Desperto', avatar: '☀️', status: 'em jornada' },
  { id: '5', nickname: 'Consciência_Plena', avatar: '🌙', status: 'offline' },
  { id: '6', nickname: 'Buscador_Eterno', avatar: '🔮', status: 'online' },
  { id: '7', nickname: 'Flor_de_Lotus', avatar: '🪷', status: 'em jornada' },
  { id: '8', nickname: 'Guerreiro_Paz', avatar: '⚔️', status: 'online' },
];

export const activities: Activity[] = [
  { id: '1', type: 'advance', message: 'Luz_Interior avançou para o Desafio 4', timestamp: new Date(Date.now() - 120000) },
  { id: '2', type: 'share', message: 'Novo compartilhamento na comunidade', timestamp: new Date(Date.now() - 300000) },
  { id: '3', type: 'complete', message: 'Caminhante_Zen completou "O Espelho Interior"', timestamp: new Date(Date.now() - 600000) },
  { id: '4', type: 'join', message: 'Ser_Desperto entrou na Praça', timestamp: new Date(Date.now() - 900000) },
  { id: '5', type: 'advance', message: 'Alma_Livre desbloqueou um novo bônus', timestamp: new Date(Date.now() - 1200000) },
];

export const safeSpacePosts: SafeSpacePost[] = [
  {
    id: '1',
    content: 'Às vezes sinto que estou vivendo no piloto automático. Acordo, trabalho, durmo. Repito. Não sei mais o que me faz feliz de verdade.',
    timestamp: new Date(Date.now() - 3600000),
    comments: [
      { id: 'c1', content: 'Você não está sozinho nisso. Reconhecer já é um grande passo. 💙', timestamp: new Date(Date.now() - 3000000) }
    ],
    likes: 12
  },
  {
    id: '2',
    content: 'Tenho medo de decepcionar as pessoas ao meu redor. É exaustivo tentar ser o que esperam de mim o tempo todo.',
    timestamp: new Date(Date.now() - 7200000),
    comments: [
      { id: 'c2', content: 'Você merece ser você mesmo. Pessoas que te amam vão entender.', timestamp: new Date(Date.now() - 6800000) },
      { id: 'c3', content: 'Também passo por isso. É libertador quando aceitamos nossas imperfeições.', timestamp: new Date(Date.now() - 6500000) }
    ],
    likes: 23
  },
  {
    id: '3',
    content: 'Hoje percebi que passei anos fugindo das minhas emoções. Agora elas estão todas vindo de uma vez e é avassalador.',
    timestamp: new Date(Date.now() - 14400000),
    comments: [],
    likes: 18
  },
];

export const contents: ContentItem[] = [
  // Livros
  { id: 'b1', title: 'O Poder do Agora', description: 'Eckhart Tolle nos guia para viver no presente.', category: 'Autoconhecimento', type: 'book', liked: false, saved: false },
  { id: 'b2', title: 'Mindset', description: 'Carol Dweck revela o poder da mentalidade de crescimento.', category: 'Desenvolvimento', type: 'book', liked: false, saved: false },
  { id: 'b3', title: 'O Corpo Fala', description: 'Entenda a linguagem não-verbal do seu corpo.', category: 'Corpo', type: 'book', liked: false, saved: false },
  { id: 'b4', title: 'Inteligência Emocional', description: 'Daniel Goleman explora a importância das emoções.', category: 'Emoções', type: 'book', liked: false, saved: false },
  
  // Filmes
  { id: 'm1', title: 'Soul', description: 'Uma jornada sobre propósito e o que realmente importa.', category: 'Animação', type: 'movie', liked: false, saved: false },
  { id: 'm2', title: 'Em Busca da Felicidade', description: 'A história real de Chris Gardner.', category: 'Drama', type: 'movie', liked: false, saved: false },
  { id: 'm3', title: 'O Fabuloso Destino de Amélie Poulain', description: 'Encontre alegria nas pequenas coisas.', category: 'Romance', type: 'movie', liked: false, saved: false },
  
  // Meditações
  { id: 'med1', title: 'Respiração Consciente', description: '10 minutos para acalmar a mente.', category: 'Básico', type: 'meditation', liked: false, saved: false },
  { id: 'med2', title: 'Body Scan', description: 'Conecte-se com cada parte do seu corpo.', category: 'Corpo', type: 'meditation', liked: false, saved: false },
  { id: 'med3', title: 'Meditação do Perdão', description: 'Liberte-se de ressentimentos.', category: 'Emocional', type: 'meditation', liked: false, saved: false },
  
  // Músicas
  { id: 'mus1', title: 'Weightless', description: 'Marconi Union - A música mais relaxante do mundo.', category: 'Relaxamento', type: 'music', liked: false, saved: false },
  { id: 'mus2', title: 'River Flows in You', description: 'Yiruma - Piano para meditação.', category: 'Piano', type: 'music', liked: false, saved: false },
  { id: 'mus3', title: 'Om Meditation', description: 'Sons tibetanos para concentração profunda.', category: 'Mantras', type: 'music', liked: false, saved: false },
];

export const personalities: Personality[] = [
  {
    id: 'esquizoide',
    name: 'Esquizoide',
    description: 'Tendência ao isolamento e desconexão emocional. Pessoas com essa estrutura frequentemente se sentem diferentes dos outros e podem ter dificuldade em expressar emoções ou manter conexões profundas.',
    situations: [
      'Preferir ficar sozinho mesmo quando há oportunidades sociais',
      'Sentir-se como um observador da vida ao invés de participante',
      'Dificuldade em expressar o que sente, mesmo para pessoas próximas',
      'Sensação de não pertencer a nenhum grupo'
    ]
  },
  {
    id: 'oral',
    name: 'Oral',
    description: 'Busca constante por preenchimento e conexão. Pode haver uma sensação de vazio ou carência que leva à dependência emocional ou necessidade excessiva de aprovação.',
    situations: [
      'Medo intenso de abandono ou rejeição',
      'Dificuldade em ficar sozinho por longos períodos',
      'Tendência a cuidar demais dos outros esperando retribuição',
      'Sensação frequente de que algo está faltando'
    ]
  },
  {
    id: 'psicopata',
    name: 'Psicopata',
    description: 'Estrutura voltada para controle e poder. Não relacionada a psicopatia clínica, mas a padrões de manipulação, sedução e necessidade de estar no comando.',
    situations: [
      'Necessidade de controlar situações e pessoas',
      'Dificuldade em confiar nos outros',
      'Usar charme ou sedução para conseguir o que deseja',
      'Medo de ser traído ou manipulado'
    ]
  },
  {
    id: 'masoquista',
    name: 'Masoquista',
    description: 'Padrão de auto-sabotagem e submissão. Dificuldade em colocar limites e tendência a aceitar situações prejudiciais por medo de conflito.',
    situations: [
      'Dificuldade em dizer não, mesmo quando quer',
      'Sentir-se preso em situações ou relacionamentos',
      'Tendência a se sacrificar pelos outros constantemente',
      'Guardar ressentimentos ao invés de expressar descontentamento'
    ]
  },
  {
    id: 'rigido',
    name: 'Rígido',
    description: 'Busca por perfeição e controle através de regras. Estrutura marcada por autoexigência elevada e dificuldade em relaxar ou aceitar imperfeições.',
    situations: [
      'Autocobrança excessiva e perfeccionismo',
      'Dificuldade em relaxar ou ser espontâneo',
      'Julgamento severo de si mesmo e dos outros',
      'Medo de perder o controle das emoções'
    ]
  }
];

export const userBonuses = [
  { id: '1', name: 'Primeiro Passo', description: 'Completou seu primeiro desafio', unlocked: true, icon: '🌱' },
  { id: '2', name: 'Autoconhecimento', description: 'Completou 3 desafios', unlocked: false, icon: '🔮' },
  { id: '3', name: 'Iluminnado', description: 'Completou 5 desafios', unlocked: false, icon: '⭐' },
  { id: '4', name: 'Mestre Interior', description: 'Completou todos os desafios', unlocked: false, icon: '👑' },
];
