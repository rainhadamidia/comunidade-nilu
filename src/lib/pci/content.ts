/* ============================================================
   ILUMINNARE — Base de Conhecimento do PCI (Perfil Comportamental Individual)
   Fonte: iluminnare-novo-material/construção bc devoltiva .docx
   Portado de mvp/content.js (vanilla JS) para o app Lovable (TypeScript)
============================================================ */

export type TraitId = 'inovador' | 'comunicador' | 'articulador' | 'metodico' | 'executor';

export interface Perfil {
  id: TraitId;
  nome: string;
  base: string;
  icone: string;
  dorOrigem: string;
  dorHumana: string;
  forcaNativa: string;
  luz: string;
  sombra: string;
  abordagemHumanizada: string;
}

export const PERFIS: Record<TraitId, Perfil> = {
  inovador: {
    id: "inovador",
    nome: "Inovador Estratégico",
    base: "Esquizoide",
    icone: "💡",
    dorOrigem: "Rejeição",
    dorHumana: "Sentir-se rejeitado pelo mundo por ser \"diferente\". Na infância, entendeu que sua existência causava algum tipo de desconforto ou incômodo, refugiando-se na mente para autopreservação.",
    forcaNativa: "Um poço infinito de criatividade e lógica pura. Consegue criar mundos, soluções e caminhos onde ninguém sequer olhou.",
    luz: "Autonomia genial. Não precisa de aplausos para criar; foca na essência do problema e traz respostas disruptivas com extrema frieza e racionalidade.",
    sombra: "Isolamento defensivo. Ele se desliga das pessoas, ignora mensagens e se cala por acreditar que \"ninguém vai entender mesmo\" ou que \"será rejeitado se falar\".",
    abordagemHumanizada: "Sua mente é um refúgio de ideias brilhantes. Quando você se isola, não é por arrogância, é o seu sistema tentando se proteger do medo de não ser aceito. O mundo precisa da sua visão fora da caixa; permita-se compartilhar o rascunho."
  },
  comunicador: {
    id: "comunicador",
    nome: "Comunicador Empático",
    base: "Oral",
    icone: "🗣️",
    dorOrigem: "Abandono",
    dorHumana: "O vazio do abandono. Carrega a sensação infantil de que suas necessidades básicas de afeto, atenção ou amparo não foram totalmente supridas, gerando um medo crônico de ficar sozinho.",
    forcaNativa: "Sensibilidade e conexão profunda. Consegue ler o sentimento das pessoas pelo olhar, acolher dores alheias e comunicar-se com a alma do outro.",
    luz: "Magnetismo relacional. Une times, cativa clientes, humaniza ambientes frios e usa a intuição aguçada para fechar negócios baseados na confiança mútua.",
    sombra: "A busca desesperada por aprovação. Diz sim para tudo, anula as próprias vontades para agradar e engole sapos até ter crises de choro ou compulsão por se sentir sobrecarregado e desamparado.",
    abordagemHumanizada: "Você sente o mundo de forma intensa e seu superpoder é conectar pessoas. Mas lembre-se: dizer 'não' para os outros é dizer 'sim' para a sua saúde mental. Você não precisa carregar a carência do mundo para ser amado."
  },
  articulador: {
    id: "articulador",
    nome: "Articulador Pragmático",
    base: "Psicopata",
    icone: "⚡",
    dorOrigem: "Manipulação / perda de controle",
    dorHumana: "Sentir-se usado ou manipulado. Aprendeu cedo que as pessoas só olhavam para ele quando ele entregava um resultado, um comportamento ou uma utilidade, gerando o medo de mostrar fraqueza.",
    forcaNativa: "Liderança estratégica e articulação. Sabe ler o tabuleiro da vida, coordenar pessoas, negociar valores e encontrar o caminho mais rápido e inteligente para o topo.",
    luz: "O grande mentor. Protege sua equipe, direciona talentos para as funções certas, resolve crises com pragmatismo e não se abala com a pressão do mercado.",
    sombra: "Centralização autoritária. Começa a cobrar e vigiar tudo de forma implacável, manipulando cenários e usando as pessoas como peças frias de xadrez por puro medo de perder o controle.",
    abordagemHumanizada: "Sua capacidade de liderar e mover o jogo é admirável. Sob estresse, você tende a controlar tudo porque mostrar vulnerabilidade parece perigoso para você. Baixar a guarda com as pessoas certas não te faz fraco, te faz humano."
  },
  metodico: {
    id: "metodico",
    nome: "Protetor Metódico",
    base: "Masoquista",
    icone: "🗂️",
    dorOrigem: "Humilhação",
    dorHumana: "O peso da humilhação. Passou por situações na infância onde suas falhas, sujeiras ou ritmos foram expostos e criticados publicamente, criando uma vigilância eterna para nunca mais errar.",
    forcaNativa: "Resiliência inabalável e estrutura. É a âncora que garante que os projetos fiquem de pé. Organiza processos, limpa os erros dos outros e aguenta pressões que esmagariam qualquer um.",
    luz: "Execução impecável e lealdade. Entrega relatórios sem furos, planeja rotas seguras e protege a retaguarda do negócio com maestria e consistência.",
    sombra: "A \"Panela de Pressão\". Guarda todas as insatisfações, acumula o trabalho de quem falhou, cala-se e rumina a dor em silêncio até explodir com uma força devastadora ou adoecer fisicamente.",
    abordagemHumanizada: "Você é a força segura que sustenta as estruturas ao seu redor. Você carrega o mundo nas costas porque tem pavor de falhar com quem confia em você. Tire a mochila do excesso de cobrança; você tem o direito de errar e de pedir ajuda."
  },
  executor: {
    id: "executor",
    nome: "Executor de Alta Performance",
    base: "Rígido",
    icone: "🏆",
    dorOrigem: "Traição / Exclusão",
    dorHumana: "A dor da traição, exclusão ou de ser trocado. Na infância, sentiu que perdeu o lugar de preferência (geralmente na triangulação familiar), gerando a crença de que precisa ser perfeito para não ser substituído.",
    forcaNativa: "Velocidade, brilho e competitividade. Focado no topo, na estética, na agilidade e em quebrar recordes. É o executor que traz o resultado estonteante.",
    luz: "O realizador de sonhos. Vai para o palco, executa com paixão, mantém uma disciplina invejável e eleva a barra de qualidade de todo o ecossistema.",
    sombra: "Competitividade predatória e esgotamento. Começa a enxergar parceiros como rivais, desenvolve uma autocobrança cega por perfeição e caminha a passos largos rumo ao Burnout por não aceitar descansar.",
    abordagemHumanizada: "Seu brilho e sua velocidade movem montanhas. Mas a sua pressa em ser perfeito esconde o medo de ser trocado. Entenda que o seu valor está em quem você é, e não apenas na quantidade de troféus que você carrega."
  }
};

type ParKey = string; // "idA+idB", ordenado alfabeticamente

export interface Sinergia { nome: string; texto: string; }
export interface Conflito { nome: string; sistema: string; sentimento: string; }
export interface Impacto { titulo: string; carreira: string; relacoes: string; saudeMental: string; }

export const SINERGIAS: Record<ParKey, Sinergia> = {
  "articulador+comunicador": { nome: "O Fechador Carismático", texto: "O Comunicador cria a conexão emocional e a confiança que abrem a porta; o Articulador entra com o pragmatismo para fechar o negócio e conduzir a negociação até o resultado. Combinação de altíssima performance para vendas consultivas, relações públicas de alto nível e negociações complexas." },
  "articulador+executor": { nome: "O Comando de Elite", texto: "O Articulador traça a estratégia e comanda o tabuleiro; o Executor entra com velocidade brutal para tirar o plano do papel. Perfil de altíssima performance para turnarounds, times comerciais agressivos e situações de crise que exigem decisão rápida e execução impecável." },
  "articulador+inovador": { nome: "O Visionário de Negócios", texto: "A mente cria o impossível e o lado líder monta a estratégia para monetizar a ideia. Excelente para fundadores de startups e diretores de estratégia." },
  "articulador+metodico": { nome: "O Executivo Blindado", texto: "O Articulador define a direção estratégica e negocia com o mercado; o Metódico blinda a execução com processos seguros e sem furos. Uma dupla que constrói operações escaláveis com o mínimo de risco e o máximo de controle." },
  "comunicador+executor": { nome: "O Conectador de Massas", texto: "Junta a empatia que encanta com a energia rápida que fecha o contrato. É o perfil ideal para grandes palestrantes, líderes comerciais e relações públicas de impacto." },
  "comunicador+inovador": { nome: "O Idealizador Encantador", texto: "O Inovador cria ideias que ninguém mais enxergou; o Comunicador as traduz em uma linguagem que emociona e conecta. Combinação poderosa para criadores de conteúdo, marcas pessoais e qualquer pessoa que precise vender uma visão antes de vender um produto." },
  "comunicador+metodico": { nome: "O Cuidador de Processos Humanos", texto: "Fornece um acolhimento seguro. Sabe organizar o RH de uma empresa ou gerenciar projetos garantindo que as pessoas se sintam ouvidas e seguras." },
  "executor+inovador": { nome: "O Inventor que Entrega", texto: "O Inovador propõe o que ninguém pensou; o Executor tira do papel com velocidade e disciplina antes que a ideia esfrie. Quando equilibrados, formam o perfil clássico do fundador técnico que constrói e lança rápido." },
  "executor+metodico": { nome: "A Máquina de Entrega", texto: "O planejador desenha a rota sem riscos e o executor acelera o passo com disciplina cirúrgica. Produz resultados de altíssima escala com erro perto de zero." },
  "inovador+metodico": { nome: "O Arquiteto Científico", texto: "Foco total no mundo analítico. Cria teses complexas, softwares profundos ou estruturas de engenharia com paciência e precisão cirúrgica." }
};

export const CONFLITOS: Record<ParKey, Conflito> = {
  "articulador+comunicador": { nome: "A Guerra do Acolhimento vs. o Resultado", sistema: "O Comunicador quer ouvir, acolher e dar atenção a cada pessoa envolvida. O Articulador enxerga isso como perda de tempo e pressiona por decisão e resultado, tratando a demora emocional como fraqueza.", sentimento: "Sensação de estar dividido entre parecer \"bonzinho demais\" ou \"frio demais\" — como se fosse preciso escolher entre ser amado ou ser respeitado, nunca as duas coisas ao mesmo tempo." },
  "articulador+executor": { nome: "A Guerra do Comando", sistema: "Os dois traços querem estar no controle e no protagonismo — o Articulador quer comandar a estratégia, o Executor quer comandar a execução e os holofotes. Nenhum dos dois cede espaço com facilidade.", sentimento: "Uma inquietação de estar competindo consigo mesmo: uma parte quer decidir por trás, a outra quer aparecer executando. O resultado é a sensação de nunca estar satisfeito com o papel que está exercendo no momento." },
  "articulador+inovador": { nome: "A Guerra da Pressa vs. a Exploração", sistema: "O Articulador quer uma direção clara e uma decisão rápida para levar ao mercado. O Inovador ainda está explorando possibilidades e sente que fechar cedo demais mata o potencial da ideia.", sentimento: "Ansiedade de estar sendo apressado a entregar algo que ainda não amadureceu — ou, do outro lado, a frustração de sentir que a ideia nunca sai do papel porque \"ainda falta pensar mais um pouco\"." },
  "articulador+metodico": { nome: "A Guerra da Delegação vs. Desconfiança", sistema: "O Articulador quer dar ordens, mover as pessoas e focar no macro. O Metódico não confia que as pessoas farão com cuidado, com medo de que o erro respingue nele.", sentimento: "Sobrecarga por centralização. O usuário manda fazer, mas logo em seguida pega a tarefa de volta dizendo \"deixa que eu mesmo faço para sair direito\"." },
  "comunicador+executor": { nome: "A Guerra do Acolhimento vs. a Meta", sistema: "O Comunicador quer desacelerar para cuidar de quem está por perto. O Executor quer acelerar rumo ao resultado, e vê a pausa emocional como um obstáculo no caminho da meta.", sentimento: "Culpa por \"atropelar\" pessoas para chegar no resultado, seguida da sensação oposta de ter perdido tempo e ritmo por estar cuidando demais dos sentimentos alheios." },
  "comunicador+inovador": { nome: "A Guerra do Silêncio vs. a Partilha", sistema: "O Inovador precisa se recolher em silêncio para pensar e criar. O Comunicador sente esse silêncio como um afastamento e precisa falar, compartilhar e ser ouvido para se sentir seguro.", sentimento: "Um medo de abandono ativado pelo próprio processo criativo — como se a necessidade de solidão de uma parte de você fosse, aos olhos da outra parte, uma rejeição pessoal." },
  "comunicador+metodico": { nome: "A Guerra do Desabafo vs. Segredo", sistema: "O Comunicador quer chorar, falar, pedir colo e expor o que sente. O Metódico acha que se expor é sinônimo de humilhação, então manda calar, reter e fingir que está tudo bem.", sentimento: "Angústia no peito, nó na garganta, sensação de estar prestes a explodir e crises de ansiedade súbitas." },
  "executor+inovador": { nome: "A Guerra da Ideia Infinita vs. Perfeição Real", sistema: "O Inovador quer mudar o rumo do projeto a cada hora porque sua mente não para de criar. O Executor quer que o projeto seja perfeito e esteja pronto ontem.", sentimento: "Paralisia total. O usuário não começa o projeto porque o Executor exige perfeição de algo que o Inovador ainda não parou de alterar. Gera profunda frustração por \"pensar muito e realizar pouco\"." },
  "executor+metodico": { nome: "A Guerra do Risco vs. a Segurança", sistema: "O Executor quer velocidade e está disposto a aceitar algum risco para chegar primeiro. O Metódico trava o avanço até ter certeza absoluta de que nada vai dar errado.", sentimento: "A sensação de estar sempre com o pé no freio e no acelerador ao mesmo tempo — pressa que não sai do lugar porque a exigência de segurança nunca se sente totalmente satisfeita." },
  "inovador+metodico": { nome: "A Guerra do Recomeço vs. o Processo Fechado", sistema: "O Inovador quer reabrir o processo e questionar tudo de novo assim que uma ideia melhor aparece. O Metódico já fechou o plano e enxerga qualquer mudança de rota como um risco desnecessário.", sentimento: "Frustração por sentir que nunca dá pra \"terminar de verdade\" — ou o oposto, a sensação de estar preso a um plano que intuitivamente já não faz mais sentido." }
};

export const IMPACTOS: Record<string, Impacto> = {
  "articulador+comunicador": { titulo: "Predomínio Sedutor / Estratégico", carreira: "Alterna entre fases de charme irresistível e fases de desconfiança extrema com sócios e clientes, dificultando parcerias de longo prazo.", relacoes: "Relações intensas no início, que esfriam quando o medo de ser usado (Articulador) trava a entrega emocional que o Comunicador promete.", saudeMental: "Ansiedade social mascarada por extroversão — a necessidade de agradar (Comunicador) e a necessidade de controlar (Articulador) competem o tempo todo pela mesma cena." },
  "articulador+executor": { titulo: "Predomínio Comandante / Competitivo", carreira: "Ascensão rápida seguida de conflitos de liderança — dificuldade em dividir o protagonismo mesmo com quem ajudou a construir o resultado.", relacoes: "Vínculos tratados quase como alianças estratégicas; a intimidade verdadeira fica em segundo plano frente à necessidade de manter vantagem ou controle.", saudeMental: "Estado de alerta constante, medo de ser substituído ou manipulado que não desliga nem nos momentos de sucesso." },
  "articulador+inovador": { titulo: "Predomínio Estrategista Solitário", carreira: "Excelente na concepção de negócios, mas tende a centralizar decisões-chave por desconfiar da execução alheia, travando o crescimento da equipe.", relacoes: "Prefere controlar a narrativa a se expor; vulnerabilidade é tratada como risco, o que mantém as relações em uma distância segura, porém fria.", saudeMental: "Tensão mental constante de quem está sempre calculando o próximo movimento, com dificuldade real de \"desligar o jogo\" e simplesmente descansar." },
  "articulador+metodico": { titulo: "Predomínio Controlador / Perfeccionista", carreira: "Constrói estruturas sólidas, mas centraliza tanto que se torna o próprio gargalo do negócio — pouco anda sem passar antes por ele(a).", relacoes: "Cobrança rígida com quem está por perto, baseada no medo de ser exposto ao erro alheio; relações viram auditorias silenciosas.", saudeMental: "Sobrecarga crônica por acumular controle e execução ao mesmo tempo — o corpo somatiza em tensão muscular, insônia e irritabilidade." },
  "comunicador+executor": { titulo: "Predomínio Emocional / Exposto", carreira: "Histórico de exaustão emocional por carregar problemas de terceiros.", relacoes: "Sensação crônica de solidão, mesmo cercado de pessoas.", saudeMental: "Episódios de Burnout devido à incapacidade patológica de parar e descansar." },
  "comunicador+inovador": { titulo: "Predomínio Sensível / Idealista", carreira: "Fases de altíssima criatividade e conexão alternando com períodos de isolamento e desânimo profundo quando o reconhecimento não vem na medida esperada.", relacoes: "O medo duplo de abandono e rejeição faz com que se aproxime intensamente e recue de repente, confundindo quem está por perto.", saudeMental: "Oscilação emocional acentuada — euforia criativa seguida de vazio existencial, terreno fértil para ansiedade e episódios de tristeza profunda." },
  "comunicador+metodico": { titulo: "Predomínio Contido / Acolhedor", carreira: "Assume o papel de \"colo\" da equipe até se esgotar em silêncio, carregando o peso emocional dos outros sem pedir apoio para si.", relacoes: "Entrega muito e cobra pouco em troca, até que o acúmulo de mágoas não ditas transborda de uma vez.", saudeMental: "Ciclos de ansiedade seguidos de exaustão silenciosa — sente tudo intensamente, mas foi treinado a não demonstrar nada." },
  "executor+inovador": { titulo: "Predomínio Perfeccionista Inquieto", carreira: "Alterna entre explosões de produtividade genial e travamentos completos — projetos brilhantes que nunca saem do rascunho porque a barra está sempre mais alta que a entrega possível.", relacoes: "Dificuldade em pedir ajuda, por misturar o medo de ser substituído com o medo de ser rejeitado ao mostrar o trabalho ainda inacabado.", saudeMental: "Risco elevado de burnout silencioso: a mente nunca para de gerar ideias novas enquanto o corpo cobra perfeição na entrega das antigas." },
  "executor+metodico": { titulo: "Predomínio Perfeccionista Extremo", carreira: "Entrega em nível de excelência constante, mas paga um preço alto: qualquer deslize vira motivo de autopunição, somando o medo de ser substituído (Executor) ao medo de errar publicamente (Metódico).", relacoes: "Dificuldade em relaxar perto de quem ama, porque a vigilância interna nunca desliga — sempre monitorando se está fazendo o suficiente.", saudeMental: "Corpo tenso cronicamente, sono raso e uma voz interna implacável que nunca reconhece o próprio esforço como suficiente." },
  "inovador+metodico": { titulo: "Predomínio Racional / Isolado", carreira: "Rompimento de laços afetivos por parecer frio demais e perda de oportunidades profissionais por excesso de timidez ou preciosismo.", relacoes: "Distanciamento por dificuldade em se abrir emocionalmente.", saudeMental: "Dores musculares crônicas nas costas e pescoço (tensão acumulada)." }
};

export interface EstrategiaPSI {
  gargalo: string;
  perfilProvavel: TraitId[];
  estrategia: string;
}

export const PSI_ESTRATEGIAS: Record<string, EstrategiaPSI> = {
  tracao: {
    gargalo: "Tirar a ideia da cabeça (falta de tração)",
    perfilProvavel: ["inovador", "metodico"],
    estrategia: "Regra do MVP (Produto Mínimo Viável). Sua mente exige um plano perfeito antes de começar. Entenda que a perfeição de bastidor não sobrevive ao mercado. Escreva a sua ideia em uma folha de papel e valide-a com um cliente em menos de 48 horas. Substitua o medo da rejeição pela métrica do aprendizado rápido."
  },
  foco: {
    gargalo: "Se perder no meio do caminho (falta de foco)",
    perfilProvavel: ["comunicador", "inovador"],
    estrategia: "Sinalização de Checkpoints e SLAs. Você se empolga no início, mas abandona o projeto quando surge a necessidade de rotina ou quando o brilho da novidade passa. Crie marcos semanais curtos de entrega e arrume um \"parceiro de accountability\" (uma pessoa para quem você é obrigado a prestar contas toda sexta-feira). Não confie na sua motivação; confie na estrutura."
  },
  entrega: {
    gargalo: "Concluir e entregar (medo do julgamento)",
    perfilProvavel: ["executor", "metodico"],
    estrategia: "Data de Corte Inegociável (Hard Deadline). Você atrasa o lançamento final porque \"sempre falta um detalhe para ajustar\". O perfeccionismo é o medo do julgamento fantasiado de virtude. Defina a data de entrega com terceiros (clientes ou mercado) para que você não possa adiar. Lembre-se: o mercado só premia quem conclui, não quem quase fez perfeito."
  }
};

export interface Pergunta {
  id: number;
  perfil: TraitId;
  texto: string;
}

export const PERGUNTAS: Pergunta[] = [
  { id: 1, perfil: "inovador", texto: "Prefiro pensar sozinho e chegar a uma solução completa antes de compartilhar minhas ideias com o time." },
  { id: 2, perfil: "inovador", texto: "Quando enfrento um problema complexo, meu instinto é buscar uma abordagem fora do óbvio, mesmo que pareça estranha para os outros." },
  { id: 3, perfil: "inovador", texto: "Em momentos de estresse, tendo a me isolar e evitar conversas, mesmo sabendo que isso pode gerar mal-entendidos." },
  { id: 4, perfil: "inovador", texto: "Prefiro explorar possibilidades e ideias novas do que executar tarefas repetitivas." },

  { id: 5, perfil: "comunicador", texto: "Consigo perceber rapidamente o que as pessoas estão sentindo, mesmo sem que digam nada." },
  { id: 6, perfil: "comunicador", texto: "Tenho dificuldade em dizer \"não\" quando alguém pede minha ajuda, mesmo estando sobrecarregado(a)." },
  { id: 7, perfil: "comunicador", texto: "Prefiro resolver conflitos conversando abertamente a deixar as coisas quietas." },
  { id: 8, perfil: "comunicador", texto: "Busco aprovação e feedback positivo das pessoas ao meu redor com bastante frequência." },

  { id: 9, perfil: "articulador", texto: "Gosto de estar no comando das decisões estratégicas e direcionar o time para o resultado." },
  { id: 10, perfil: "articulador", texto: "Sob pressão, sinto necessidade de controlar de perto o que cada pessoa está fazendo." },
  { id: 11, perfil: "articulador", texto: "Confio mais em resultados concretos do que em promessas ou boas intenções." },
  { id: 12, perfil: "articulador", texto: "Tenho facilidade para negociar e conseguir o que quero em situações difíceis." },

  { id: 13, perfil: "metodico", texto: "Prefiro seguir um processo bem definido a improvisar, mesmo sob pressão de tempo." },
  { id: 14, perfil: "metodico", texto: "Costumo guardar minhas frustrações para mim até que elas se acumulem demais." },
  { id: 15, perfil: "metodico", texto: "Reviso meu trabalho várias vezes antes de entregá-lo, para não errar." },
  { id: 16, perfil: "metodico", texto: "Sinto-me responsável por corrigir os erros que os outros deixam passar." },

  { id: 17, perfil: "executor", texto: "Gosto de agir rápido e ver resultados concretos em pouco tempo." },
  { id: 18, perfil: "executor", texto: "Tenho dificuldade em desacelerar ou descansar, mesmo quando estou exausto(a)." },
  { id: 19, perfil: "executor", texto: "Comparo meu desempenho com o de outras pessoas com frequência." },
  { id: 20, perfil: "executor", texto: "Busco constantemente superar minhas próprias marcas e recordes." }
];

export const ESCALA = [
  { valor: 1, label: "Discordo totalmente" },
  { valor: 2, label: "Discordo" },
  { valor: 3, label: "Neutro" },
  { valor: 4, label: "Concordo" },
  { valor: 5, label: "Concordo totalmente" }
];
