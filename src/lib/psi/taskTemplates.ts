/* ============================================================
   ILUMINNARE — Banco de Tarefas do PSI por Perfil
   Fonte: iluminnare-novo-material/Logica para as atividades .docx
          (Schema 5 — Jornada de Execução e Prosperidade por Perfil)
          + Estrutura do PSI.docx (quebra em 4 semanas)

   Cada perfil dominante tem um arco de 4 semanas (Ideação → Estruturação
   → Articulação → Conclusão, conforme Schema 6) com tarefas diárias
   desenhadas para o gargalo específico daquele perfil.
============================================================ */

import type { TraitId } from '../pci/content';

export interface TaskTemplate {
  ordem: number;
  titulo: string;
  descricao: string;
  objetivo: string;
  tempoEstimadoMin: number;
  dificuldade: 'facil' | 'media' | 'dificil';
}

export interface WeekTemplate {
  numero: number;
  titulo: string;
  tarefas: TaskTemplate[];
}

type PlanoPorPerfil = Record<TraitId, WeekTemplate[]>;

export const PLANOS_PSI: PlanoPorPerfil = {
  inovador: [
    {
      numero: 1,
      titulo: 'Ideação — Tirar a ideia da cabeça',
      tarefas: [
        { ordem: 1, titulo: 'Mapeamento visual', descricao: 'Desenhe sua ideia em um papel, mapa mental ou bloco de notas — tire ela da cabeça e coloque no mundo real.', objetivo: 'Sair do estágio puramente mental.', tempoEstimadoMin: 30, dificuldade: 'facil' },
        { ordem: 2, titulo: 'Validação confiável', descricao: 'Escolha uma única pessoa de extrema confiança e apresente o rascunho do seu projeto para ela.', objetivo: 'Quebrar o ciclo de isolamento.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Micro-ação real', descricao: 'Realize uma ação física que custe zero reais: compre o domínio do site, crie uma pasta no Drive, ou mande um e-mail de sondagem.', objetivo: 'Primeira prova de que o projeto existe fora da sua mente.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Definir o nome', descricao: 'Escolha (ou confirme) o nome do projeto.', objetivo: 'Dar identidade concreta à ideia.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 5, titulo: 'Pesquisa de mercado rápida', descricao: 'Converse com 2-3 pessoas do seu público-alvo sobre o problema que você quer resolver.', objetivo: 'Validar que a dor é real antes de construir a solução.', tempoEstimadoMin: 45, dificuldade: 'media' },
      ],
    },
    {
      numero: 2,
      titulo: 'Estruturação — Dar corpo ao projeto',
      tarefas: [
        { ordem: 1, titulo: 'Proposta de valor', descricao: 'Escreva em 1 frase o que seu projeto resolve e para quem.', objetivo: 'Clareza de direção antes de continuar.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Identidade visual mínima', descricao: 'Defina cores, nome e um logo simples (pode ser rascunho).', objetivo: 'Dar cara ao projeto.', tempoEstimadoMin: 45, dificuldade: 'facil' },
        { ordem: 3, titulo: 'Estrutura formal básica', descricao: 'Se aplicável, inicie o processo de formalização (CNPJ, domínio, etc.).', objetivo: 'Tirar do papel para o mundo institucional.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 4, titulo: 'Compartilhar publicamente', descricao: 'Publique uma versão do projeto (rascunho, teaser, post) para pessoas fora do seu círculo de confiança.', objetivo: 'Vencer o medo de rejeição gradualmente.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 5, titulo: 'Registro do tempo de incubação', descricao: 'Anote quantos dias se passaram desde a ideia até a primeira ação real.', objetivo: 'Consciência do seu próprio ritmo de execução.', tempoEstimadoMin: 10, dificuldade: 'facil' },
      ],
    },
    {
      numero: 3,
      titulo: 'Articulação — Trazer para o mundo real',
      tarefas: [
        { ordem: 1, titulo: 'Convite a 1 colaborador', descricao: 'Convide alguém para contribuir com uma parte específica do projeto.', objetivo: 'Sair do isolamento definitivamente.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Versão mínima navegável', descricao: 'Construa a menor versão possível do projeto que já possa ser mostrada.', objetivo: 'Regra do MVP — perfeição não sobrevive ao mercado.', tempoEstimadoMin: 60, dificuldade: 'dificil' },
        { ordem: 3, titulo: 'Teste com 1 cliente real', descricao: 'Apresente essa versão mínima para uma pessoa do público-alvo.', objetivo: 'Substituir o medo da rejeição pela métrica do aprendizado rápido.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Ajuste com base no feedback', descricao: 'Faça 1 ajuste concreto a partir do que ouviu.', objetivo: 'Provar a si mesmo que o mundo real é mais gentil que a mente imagina.', tempoEstimadoMin: 30, dificuldade: 'media' },
      ],
    },
    {
      numero: 4,
      titulo: 'Conclusão — Lançar de vez',
      tarefas: [
        { ordem: 1, titulo: 'Data de lançamento pública', descricao: 'Anuncie uma data de lançamento para alguém fora do seu controle (cliente, redes sociais).', objetivo: 'Criar compromisso externo inegociável.', tempoEstimadoMin: 20, dificuldade: 'media' },
        { ordem: 2, titulo: 'Últimos ajustes essenciais', descricao: 'Liste só o que é realmente bloqueante para lançar — resolva apenas isso.', objetivo: 'Evitar perfeccionismo de última hora.', tempoEstimadoMin: 45, dificuldade: 'media' },
        { ordem: 3, titulo: 'Lançamento', descricao: 'Coloque o projeto no ar/no mundo, do jeito que está.', objetivo: 'Sonho realizado — sair da ideia para a entrega.', tempoEstimadoMin: 60, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Celebração e registro', descricao: 'Registre o que foi feito e o que aprendeu no processo.', objetivo: 'Reconhecer a conquista de ter concluído.', tempoEstimadoMin: 20, dificuldade: 'facil' },
      ],
    },
  ],
  comunicador: [
    {
      numero: 1,
      titulo: 'Ideação — Canalizar a energia inicial',
      tarefas: [
        { ordem: 1, titulo: 'Compartilhar a ideia em voz alta', descricao: 'Conte sobre o projeto para 3 pessoas diferentes, prestando atenção em como cada uma reage.', objetivo: 'Usar sua conexão natural para testar a ideia.', tempoEstimadoMin: 30, dificuldade: 'facil' },
        { ordem: 2, titulo: 'Parceiro de accountability', descricao: 'Convide um amigo ou mentor para uma ligação de 5 minutos toda sexta-feira, só para dizer o que foi feito.', objetivo: 'Criar estrutura externa, já que a motivação inicial vai oscilar.', tempoEstimadoMin: 15, dificuldade: 'media' },
        { ordem: 3, titulo: 'Definir o nome com quem você confia', descricao: 'Decida o nome do projeto ouvindo 2-3 pessoas de confiança.', objetivo: 'Envolver pessoas desde o início, do seu jeito.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Mapear quem pode ajudar', descricao: 'Liste 3 pessoas da sua rede que poderiam contribuir de alguma forma.', objetivo: 'Canalizar sua rede de relacionamentos a favor do projeto.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 5, titulo: 'A Dieta do Não', descricao: 'Olhe sua agenda da semana e recuse um compromisso que não tem relação com o projeto.', objetivo: 'Proteger tempo e energia para o que importa.', tempoEstimadoMin: 15, dificuldade: 'dificil' },
      ],
    },
    {
      numero: 2,
      titulo: 'Estruturação — Manter o ritmo além da empolgação inicial',
      tarefas: [
        { ordem: 1, titulo: 'Checkpoint semanal com o parceiro', descricao: 'Faça a ligação combinada de 5 minutos e relate o progresso real.', objetivo: 'Sustentar constância mesmo quando o brilho da novidade passar.', tempoEstimadoMin: 15, dificuldade: 'media' },
        { ordem: 2, titulo: 'Identidade visual com apoio', descricao: 'Peça ajuda de alguém para desenhar cores/logo simples.', objetivo: 'Envolver pessoas sem perder o próprio ritmo.', tempoEstimadoMin: 40, dificuldade: 'facil' },
        { ordem: 3, titulo: 'Bloco técnico + socialização', descricao: 'Divida uma tarefa técnica cansativa em blocos, intercalando com uma conversa ou áudio de incentivo.', objetivo: 'Ritual de energia — equilibrar rotina chata com conexão.', tempoEstimadoMin: 45, dificuldade: 'media' },
        { ordem: 4, titulo: 'Dizer não de novo', descricao: 'Recuse mais um pedido de terceiros que não é sobre o seu projeto.', objetivo: 'Reforçar o limite protetor da semana anterior.', tempoEstimadoMin: 10, dificuldade: 'dificil' },
        { ordem: 5, titulo: 'Compartilhar um progresso público', descricao: 'Poste uma atualização real do andamento do projeto.', objetivo: 'Usar a visibilidade como combustível de constância.', tempoEstimadoMin: 20, dificuldade: 'media' },
      ],
    },
    {
      numero: 3,
      titulo: 'Articulação — Levar para o mundo real',
      tarefas: [
        { ordem: 1, titulo: 'Apresentar para um cliente real', descricao: 'Mostre o projeto para uma pessoa do público-alvo e ouça a reação.', objetivo: 'Testar a conexão emocional que o projeto provoca de verdade.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Ajuste sem se anular', descricao: 'Incorpore 1 feedback recebido, mas mantenha a essência do que você acredita.', objetivo: 'Equilíbrio entre acolher opinião alheia e não se perder.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Checkpoint semanal', descricao: 'Ligação de 5 minutos com o parceiro de accountability.', objetivo: 'Manter a estrutura que substitui a motivação.', tempoEstimadoMin: 15, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Delegar 1 tarefa emocionalmente difícil', descricao: 'Passe adiante uma tarefa que normalmente você assumiria "para não decepcionar ninguém".', objetivo: 'Praticar dizer não também a si mesmo.', tempoEstimadoMin: 20, dificuldade: 'dificil' },
      ],
    },
    {
      numero: 4,
      titulo: 'Conclusão — Entregar com os outros por perto',
      tarefas: [
        { ordem: 1, titulo: 'Anunciar a data de lançamento', descricao: 'Compartilhe publicamente quando o projeto vai ao ar.', objetivo: 'Compromisso externo que sustenta o fechamento.', tempoEstimadoMin: 15, dificuldade: 'media' },
        { ordem: 2, titulo: 'Últimos ajustes com apoio', descricao: 'Peça ajuda pontual para o que falta, sem tentar resolver tudo sozinho(a).', objetivo: 'Reforçar que pedir ajuda não é fraqueza.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 3, titulo: 'Lançamento', descricao: 'Coloque o projeto no ar e comunique para sua rede.', objetivo: 'Concluir o que começou.', tempoEstimadoMin: 45, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Agradecer quem ajudou', descricao: 'Reconheça publicamente quem apoiou o processo.', objetivo: 'Fechar o ciclo dando e recebendo, não só doando energia.', tempoEstimadoMin: 15, dificuldade: 'facil' },
      ],
    },
  ],
  articulador: [
    {
      numero: 1,
      titulo: 'Ideação — Definir o tabuleiro',
      tarefas: [
        { ordem: 1, titulo: 'Alinhamento de ganhos', descricao: 'Escreva como a conclusão desse projeto aumenta seu poder, liberdade financeira ou posicionamento de mercado.', objetivo: 'Clareza estratégica do "porquê" antes de agir.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Arquitetura de funções', descricao: 'Desenhe um organograma do projeto (mesmo trabalhando sozinho ainda), listando o que é estratégico (seu) e o que é tático/operacional.', objetivo: 'Separar comando de execução desde o início.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Definir o nome e posicionamento', descricao: 'Escolha o nome do projeto pensando em como ele soa no mercado.', objetivo: 'Já nascer com direção estratégica.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Mapear 1 parceria estratégica', descricao: 'Identifique 1 pessoa ou empresa que poderia acelerar o projeto.', objetivo: 'Pensar em escala desde o começo.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 5, titulo: 'Micro-ação concreta', descricao: 'Tome uma decisão real e executável hoje (ex: reservar domínio, marcar 1 reunião).', objetivo: 'Sair do "planejar" para o "fazer".', tempoEstimadoMin: 20, dificuldade: 'facil' },
      ],
    },
    {
      numero: 2,
      titulo: 'Estruturação — Delegar em vez de centralizar',
      tarefas: [
        { ordem: 1, titulo: 'Delegação baseada em critérios', descricao: 'Delegue ou terceirize pelo menos 1 tarefa operacional, com um checklist claro de como deve ser entregue.', objetivo: 'Vencer a tendência de centralizar por desconfiança.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 2, titulo: 'Estrutura formal básica', descricao: 'Inicie o processo de formalização se aplicável (CNPJ, contratos, domínio).', objetivo: 'Dar solidez institucional ao projeto.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 3, titulo: 'Negociar 1 recurso ou parceria', descricao: 'Entre em contato com a parceria estratégica mapeada na semana 1.', objetivo: 'Usar sua força natural de negociação a favor do projeto.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 4, titulo: 'Checar se a tarefa delegada saiu como pedido', descricao: 'Revise o que foi delegado sem reassumir a tarefa — só ajuste o que for essencial.', objetivo: 'Treinar confiar no processo, não só em si mesmo.', tempoEstimadoMin: 20, dificuldade: 'dificil' },
        { ordem: 5, titulo: 'Marco de liderança da semana', descricao: 'Registre 1 decisão de alto nível tomada nesta semana.', objetivo: 'Medir avanço macro, não só execução.', tempoEstimadoMin: 15, dificuldade: 'facil' },
      ],
    },
    {
      numero: 3,
      titulo: 'Articulação — Mover o jogo',
      tarefas: [
        { ordem: 1, titulo: 'Fechar 1 parceria ou recurso', descricao: 'Conclua a negociação iniciada na semana anterior.', objetivo: 'Transformar articulação em resultado concreto.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 2, titulo: 'Delegar mais uma tarefa operacional', descricao: 'Amplie o que já não precisa mais fazer sozinho(a).', objetivo: 'Consolidar o hábito de liderar, não executar tudo.', tempoEstimadoMin: 20, dificuldade: 'media' },
        { ordem: 3, titulo: 'Teste com 1 cliente ou mercado real', descricao: 'Leve uma versão do projeto para validação externa.', objetivo: 'Confrontar o plano com a realidade do mercado.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Ajustar a estratégia com dados reais', descricao: 'Revise o plano com base no que o mercado respondeu.', objetivo: 'Pragmatismo: seguir o que funciona, não o que parecia certo no papel.', tempoEstimadoMin: 30, dificuldade: 'media' },
      ],
    },
    {
      numero: 4,
      titulo: 'Conclusão — Comandar o lançamento',
      tarefas: [
        { ordem: 1, titulo: 'Data de corte inegociável', descricao: 'Defina a data de lançamento com um terceiro (cliente, mercado), sem possibilidade de adiar.', objetivo: 'Usar pressão externa a seu favor.', tempoEstimadoMin: 15, dificuldade: 'media' },
        { ordem: 2, titulo: 'Distribuir as últimas tarefas', descricao: 'Delegue o que puder do que falta, mantendo só as decisões estratégicas com você.', objetivo: 'Chegar ao lançamento sem se sobrecarregar.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Lançamento', descricao: 'Coloque o projeto no ar e comande a comunicação do lançamento.', objetivo: 'Resultado no mundo real, não só estratégia no papel.', tempoEstimadoMin: 45, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Reconhecer quem executou', descricao: 'Dê crédito público a quem ajudou a tirar o plano do papel.', objetivo: 'Fortalecer a confiança para a próxima delegação.', tempoEstimadoMin: 15, dificuldade: 'facil' },
      ],
    },
  ],
  metodico: [
    {
      numero: 1,
      titulo: 'Ideação — Pacto do MVP',
      tarefas: [
        { ordem: 1, titulo: 'Pacto do MVP', descricao: 'Defina a versão mais simples possível do projeto que já possa ir para a rua (ex: um PDF em vez de um curso inteiro gravado).', objetivo: 'Evitar meses de planejamento antes da primeira ação.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 2, titulo: 'Mapear os riscos de uma vez', descricao: 'Escreva a lista de possíveis erros do projeto e, ao lado de cada um, a solução processual — de uma vez, sem revisar depois.', objetivo: 'Despessoalizar o erro antes de começar.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 3, titulo: 'Definir o nome (sem revisar 5 vezes)', descricao: 'Escolha o nome do projeto e siga em frente — não volte a essa decisão depois.', objetivo: 'Treinar decidir sem paralisar.', tempoEstimadoMin: 20, dificuldade: 'media' },
        { ordem: 4, titulo: 'Micro-ação real', descricao: 'Execute uma ação concreta e irreversível (comprar domínio, criar pasta, mandar e-mail).', objetivo: 'Provar que dá pra agir sem ter 100% de certeza.', tempoEstimadoMin: 20, dificuldade: 'media' },
        { ordem: 5, titulo: 'Compromisso público de entrega', descricao: 'Anuncie para alguém de fora que o projeto está em andamento.', objetivo: 'Criar obrigação externa de fechamento desde já.', tempoEstimadoMin: 15, dificuldade: 'dificil' },
      ],
    },
    {
      numero: 2,
      titulo: 'Estruturação — Processo sem paralisia',
      tarefas: [
        { ordem: 1, titulo: 'Cronograma com prazos rígidos', descricao: 'Defina prazos semanais e trate-os como inegociáveis.', objetivo: 'Estrutura que impede a procrastinação por excesso de análise.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Identidade visual — 1 rodada só', descricao: 'Defina cores/logo em uma única sessão, sem revisar depois.', objetivo: 'Praticar fechar decisões sem revisão infinita.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 3, titulo: 'Estrutura formal básica', descricao: 'Avance com a formalização (CNPJ, domínio) mesmo que não pareça "perfeito" ainda.', objetivo: 'Ação real supera plano perfeito.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 4, titulo: 'Contador de revisões', descricao: 'Anote quantas vezes você voltou a mexer na mesma etapa esta semana — se passar de 3, force o avanço.', objetivo: 'Tornar visível o loop de revisão antes que ele trave o projeto.', tempoEstimadoMin: 10, dificuldade: 'facil' },
        { ordem: 5, titulo: 'Compartilhar mesmo incompleto', descricao: 'Mostre o progresso a alguém mesmo sem estar "pronto".', objetivo: 'Dessensibilizar o medo do julgamento.', tempoEstimadoMin: 20, dificuldade: 'dificil' },
      ],
    },
    {
      numero: 3,
      titulo: 'Articulação — Testar antes de estar perfeito',
      tarefas: [
        { ordem: 1, titulo: 'Versão para teste real', descricao: 'Leve a versão atual (mesmo incompleta) para 1 cliente real.', objetivo: 'Confrontar a exigência interna de perfeição com a realidade.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 2, titulo: 'Aplicar só os ajustes essenciais', descricao: 'Corrija apenas o que o feedback apontou como bloqueante, ignore o resto por ora.', objetivo: 'Treinar priorização em vez de revisão total.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Cumprir o prazo da semana', descricao: 'Feche a etapa combinada, mesmo que ainda existam ajustes possíveis.', objetivo: 'Adesão ao cronograma acima da vontade de revisar mais.', tempoEstimadoMin: 20, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Delegar 1 verificação', descricao: 'Peça para outra pessoa revisar algo, em vez de fazer sozinho(a) mais uma vez.', objetivo: 'Compartilhar a responsabilidade pelo erro.', tempoEstimadoMin: 20, dificuldade: 'media' },
      ],
    },
    {
      numero: 4,
      titulo: 'Conclusão — Lançar mesmo sem estar 100%',
      tarefas: [
        { ordem: 1, titulo: 'Data de corte inegociável', descricao: 'Marque a data de lançamento com terceiros e não a mova por nenhum motivo.', objetivo: 'O mercado só premia quem conclui, não quem quase fez perfeito.', tempoEstimadoMin: 15, dificuldade: 'media' },
        { ordem: 2, titulo: 'Última revisão (única)', descricao: 'Faça uma única checagem final da lista de riscos mapeada na semana 1.', objetivo: 'Fechar o ciclo de revisão de vez.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 3, titulo: 'Lançamento', descricao: 'Coloque o projeto no ar do jeito que está.', objetivo: 'Concluído é melhor que perfeito guardado na gaveta.', tempoEstimadoMin: 45, dificuldade: 'dificil' },
        { ordem: 4, titulo: 'Registrar o que ficou pra depois', descricao: 'Anote os ajustes que vão ficar para uma próxima versão — não agora.', objetivo: 'Aceitar que ajustar depois não é fracasso.', tempoEstimadoMin: 15, dificuldade: 'facil' },
      ],
    },
  ],
  executor: [
    {
      numero: 1,
      titulo: 'Ideação — Sair do zero rápido',
      tarefas: [
        { ordem: 1, titulo: 'Ação física imediata', descricao: 'Realize uma ação concreta hoje mesmo (domínio, pasta, primeiro contato).', objetivo: 'Usar sua velocidade natural a favor da tração inicial.', tempoEstimadoMin: 20, dificuldade: 'facil' },
        { ordem: 2, titulo: 'Definir o nome e seguir', descricao: 'Escolha o nome do projeto e avance sem voltar atrás.', objetivo: 'Velocidade de decisão.', tempoEstimadoMin: 15, dificuldade: 'facil' },
        { ordem: 3, titulo: 'Meta numérica da semana', descricao: 'Defina 1 número concreto para alcançar até o fim da semana.', objetivo: 'Canalizar a busca por recordes para o projeto certo.', tempoEstimadoMin: 15, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Pausa estratégica obrigatória', descricao: 'Agende um bloco de 2h de desconexão total nesta semana, sem celular.', objetivo: 'Prevenir o burnout desde a largada.', tempoEstimadoMin: 120, dificuldade: 'dificil' },
        { ordem: 5, titulo: 'Compartilhar o início', descricao: 'Anuncie publicamente que o projeto começou.', objetivo: 'Compromisso visível desde o dia 1.', tempoEstimadoMin: 15, dificuldade: 'media' },
      ],
    },
    {
      numero: 2,
      titulo: 'Estruturação — Ritmo sem esgotamento',
      tarefas: [
        { ordem: 1, titulo: 'Sprint de execução', descricao: 'Bloqueie 2h contínuas só para avançar o projeto, sem interrupções.', objetivo: 'Aproveitar sua alta capacidade de foco em blocos.', tempoEstimadoMin: 120, dificuldade: 'media' },
        { ordem: 2, titulo: 'Identidade visual rápida', descricao: 'Defina cores/logo em uma sessão só, sem otimizar demais.', objetivo: 'Regra dos 90% — não travar em detalhe estético.', tempoEstimadoMin: 30, dificuldade: 'facil' },
        { ordem: 3, titulo: 'Estrutura formal básica', descricao: 'Avance a formalização (CNPJ, domínio) no ritmo rápido de sempre.', objetivo: 'Manter a velocidade como vantagem competitiva.', tempoEstimadoMin: 30, dificuldade: 'facil' },
        { ordem: 4, titulo: 'Pausa estratégica (de novo)', descricao: 'Repita o bloco de 2h de desconexão total.', objetivo: 'Consistência no descanso, não só na entrega.', tempoEstimadoMin: 120, dificuldade: 'dificil' },
        { ordem: 5, titulo: 'Divisão de holofotes', descricao: 'Envolva 1 parceiro e celebre um resultado intermediário junto com ele.', objetivo: 'Reduzir o peso de carregar o sucesso sozinho(a).', tempoEstimadoMin: 20, dificuldade: 'media' },
      ],
    },
    {
      numero: 3,
      titulo: 'Articulação — Validar sem comparar',
      tarefas: [
        { ordem: 1, titulo: 'Teste com cliente real', descricao: 'Leve a versão atual para 1 pessoa do público-alvo.', objetivo: 'Validação real, não só velocidade de entrega.', tempoEstimadoMin: 30, dificuldade: 'media' },
        { ordem: 2, titulo: 'Ajustar sem comparar com concorrentes', descricao: 'Aplique o feedback recebido sem checar o que "os outros" estão fazendo.', objetivo: 'Reduzir a comparação destrutiva que alimenta o burnout.', tempoEstimadoMin: 30, dificuldade: 'dificil' },
        { ordem: 3, titulo: 'Sprint final de ajustes', descricao: 'Bloqueie 1h para os ajustes mais importantes apontados no teste.', objetivo: 'Foco em entrega, não em perfeição.', tempoEstimadoMin: 60, dificuldade: 'media' },
        { ordem: 4, titulo: 'Check de energia', descricao: 'Avalie seu nível de cansaço de 1 a 5 — se estiver baixo 3 dias seguidos, tire folga extra.', objetivo: 'Prevenir o esgotamento antes da reta final.', tempoEstimadoMin: 10, dificuldade: 'facil' },
      ],
    },
    {
      numero: 4,
      titulo: 'Conclusão — Regra dos 90%',
      tarefas: [
        { ordem: 1, titulo: 'Regra dos 90%', descricao: 'Aceite que o projeto está pronto ao atingir 90% da perfeição idealizada — os 10% restantes é preciosismo.', objetivo: 'Vencer a autocobrança que atrasa o lucro.', tempoEstimadoMin: 20, dificuldade: 'dificil' },
        { ordem: 2, titulo: 'Últimos ajustes bloqueantes', descricao: 'Resolva só o que realmente impede o lançamento.', objetivo: 'Não deixar o perfeccionismo adiar a entrega.', tempoEstimadoMin: 40, dificuldade: 'media' },
        { ordem: 3, titulo: 'Lançamento', descricao: 'Coloque o projeto no ar.', objetivo: 'Realização do sonho — sair do plano para o resultado.', tempoEstimadoMin: 45, dificuldade: 'media' },
        { ordem: 4, titulo: 'Celebrar com o time', descricao: 'Divida o crédito do lançamento com quem esteve por perto.', objetivo: 'Reduzir o peso de carregar o brilho do sucesso sozinho(a).', tempoEstimadoMin: 20, dificuldade: 'facil' },
      ],
    },
  ],
};

export function gerarPlanoPSI(perfilDominante: TraitId): WeekTemplate[] {
  return PLANOS_PSI[perfilDominante];
}
