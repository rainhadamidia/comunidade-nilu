# Relatório Executivo de Awareness — ILUMINNARE / comunidade-nilu

> **Para:** Fundadores e investidores do ILUMINNARE
> **De:** Alex (@analyst — AIOX) · FASE 9 do Brownfield Discovery
> **Data:** 2026-07-04
> **Assunto:** Saúde do produto em produção, riscos ativos de negócio e decisão de orçamento
> **Base técnica:** `docs/prd/technical-debt-assessment.md` (assessment final — 65 débitos, validado por arquitetura, banco de dados, UX e QA)
> **Confidencialidade:** Interno — contém descrição de vulnerabilidade ativa. Não distribuir fora do círculo de decisão.

---

## Sumário Executivo (1 página)

O **comunidade-nilu** — o app da plataforma ILUMINNARE, já no ar em produção (`comunidade-nilu.vercel.app`) — é hoje um **MVP funcional com usuários reais interagindo**, não um protótipo de vitrine. Ele funciona, entrega a experiência central e valida a proposta. Mas passou por uma auditoria técnica completa que encontrou **65 pontos de dívida técnica**, sendo **3 deles críticos e ativos neste momento**:

1. **Furo de segurança no "cofre" de premium e pontos (DBT-S01).** Hoje, um usuário comum autenticado consegue, na prática, **se auto-promover para premium e forjar sua própria pontuação** manipulando o sistema pelo navegador. Isto não é teórico: o caminho está aberto em produção agora. Para um SaaS B2B que cobra por acesso premium, é um **vazamento de receita e um risco de churn** no dia em que um cliente descobrir.

2. **O SafeSpace "finge" guardar os desabafos anônimos (FE-02).** A ferramenta de desabafo anônimo — o coração emocional do produto — **não salva nada**. O usuário escreve, o texto some no refresh. Um app de **saúde mental** que dá a entender que acolheu e guardou um desabafo, mas descartou, é um risco **reputacional e de confiança** de primeira ordem.

3. **Exposição à LGPD com dado sensível de saúde (GOV-L01).** No momento em que corrigirmos o SafeSpace e passarmos a guardar desabafos, estaremos **criando dado sensível de saúde** (o mais protegido pela LGPD). Sem base legal, consentimento, política de retenção e desacoplamento do autor, a correção **cria um passivo jurídico no mesmo instante** — a menos que a fundação de compliance seja construída antes.

**A boa notícia:** os problemas estão mapeados, sequenciados e têm solução clara. **Estancar os três riscos críticos custa cerca de R$ 15 a 20 mil** (o "caminho crítico" de segurança + LGPD) e leva **3 a 4 semanas** com um desenvolvedor. Sanear o produto por completo (os 65 débitos) custa da ordem de **R$ 65 a 81 mil** ao longo de ~13-15 semanas.

**O custo de NÃO agir é assimétrico e desfavorável:** um único contrato B2B perdido por descoberta do bypass, ou um único incidente reputacional/LGPD com dado de saúde mental, **supera com folga o custo total de resolver** — e um incidente de LGPD com dado sensível pode ser **existencial** para uma empresa em estágio inicial.

> **Recomendação central:** Aprovar imediatamente a **Fase 1 ("Estancar o Sangramento")** — R$ 15-20 mil, 3-4 semanas. É o menor cheque que remove o maior risco. As Fases 2 e 3 podem ser orçadas em seguida, com o produto já seguro.

**Premissa de custo declarada:** R$ 150/hora de desenvolvimento pleno/sênior (ajustável — todos os valores escalam linearmente com a taxa real contratada).

---

## Premissas e Metodologia

| Item | Valor | Observação |
|------|-------|------------|
| Custo-base de desenvolvimento | **R$ 150/hora** | Dev pleno/sênior. Se a taxa real for diferente, multiplique proporcionalmente. |
| Esforço total (assessment) | **~480h** (faixa 430-540h) | Validado por 4 especialistas técnicos. |
| Apoio de design | 12-16h (~R$ 1,8-2,4 mil) | Adicional ao esforço de dev. |
| Fonte dos riscos de negócio | Estimativas com premissas declaradas | Não temos dados de receita/ACV reais — cenários usam faixas típicas de wellness corporativo B2B, sinalizados com nível de confiança. |
| Nível de confiança dos custos técnicos | **Alto** | Vêm de assessment técnico revisado por pares. |
| Nível de confiança dos riscos financeiros | **Médio** | Dependem de dados comerciais que o fundador tem e nós não — os números são ilustrativos e devem ser calibrados com o faturamento real. |

---

## 1. Situação Atual — em linguagem simples

Pense no comunidade-nilu como uma **loja já aberta e atendendo clientes**, não como uma maquete. As portas estão abertas, tem gente dentro usando, e a experiência principal funciona. O problema é que a auditoria encontrou três coisas graves acontecendo **enquanto a loja opera**:

- **A "porta dos fundos" do estoque premium está destrancada.** Qualquer cliente com um pouco de conhecimento consegue pegar o produto premium sem pagar e ainda "carimbar" o próprio cartão de fidelidade com pontos que não ganhou. Do lado de fora tudo parece normal; por dentro, o controle de quem pode o quê depende de uma tranca que hoje não fecha direito.

- **A "caixa de desabafos" é uma caixa sem fundo.** Colocamos na loja uma urna onde a pessoa deposita um bilhete anônimo com o que está sentindo. Ela deposita confiando que foi guardado. Só que a urna não tem fundo — o bilhete cai fora e some. Para uma loja de **cuidado emocional**, essa é a pior quebra de confiança possível.

- **No dia em que colocarmos fundo na urna, ela vira um arquivo de prontuários.** Guardar desabafos de saúde mental é guardar **dado sensível** — o tipo de informação com as regras mais rígidas da LGPD. Se ligarmos o "fundo da urna" sem antes montar o arquivo com tranca, etiqueta de consentimento, prazo de descarte e separação entre o bilhete e quem o escreveu, criamos um problema legal exatamente no ato de consertar.

O resto dos 65 pontos são melhorias importantes de qualidade, acessibilidade, performance e organização — necessárias para escalar, mas que **não são incêndios ativos**. Os três acima são.

**Distribuição da dívida (do assessment técnico):**

| Prioridade | Quantidade | O que significa para o negócio |
|-----------|-----------|-------------------------------|
| **P0 — Crítico** | 7 débitos | Bloqueiam um lançamento seguro. Contêm os 3 riscos ativos. |
| **P1 — Alto** | 22 débitos | Fundação de confiança, integridade de dados e experiência. |
| **P2 — Médio** | 20 débitos | Qualidade, performance, acessibilidade. |
| **P3 — Higiene** | 16 débitos | Limpeza e organização, baixo risco. |

---

## 2. Os 3 Riscos Críticos Ativos — traduzidos para negócio

### Risco A — Bypass de paywall e pontos (DBT-S01) · Vulnerabilidade ATIVA

**O que é:** o controle de quem é premium e quantos pontos alguém tem é aplicado pelo navegador do usuário, não travado no servidor. Isso permite que um usuário comum se conceda premium e forje pontuação.

**Por que importa para o negócio:**
- **Vazamento de receita:** premium consumido sem pagamento.
- **Churn B2B:** se um cliente corporativo (ou o time de TI dele, que costuma auditar fornecedores) descobrir que o paywall é burlável, é motivo direto de **cancelamento de contrato** e perda de confiança na marca.
- **Efeito dominó comercial:** em vendas B2B, um único cliente insatisfeito que comenta o problema em uma comunidade de RH contamina o pipeline.

**Custo de correção:** ~R$ 15-20 mil (caminho crítico de segurança, ver Fase 1).

### Risco B — SafeSpace que "mente" persistência (FE-02) · Quebra de confiança

**O que é:** a ferramenta de desabafo anônimo não guarda o que o usuário escreve. Dá a entender que acolheu; na verdade descartou.

**Por que importa para o negócio:**
- **Dano reputacional desproporcional:** é uma ferramenta de **saúde mental**. "Enganar" o usuário sobre o acolhimento de um desabafo não é um bug qualquer — fere a promessa central do produto.
- **Risco de dever de cuidado:** telas sensíveis sem rede de crise (CVV, escalada para RH/psicólogo) somam-se a esse risco.
- **Alavanca comercial invertida:** a persistência real do SafeSpace é justamente o que a análise de UX aponta como **o maior gerador de confiança e adesão** — ou seja, hoje o produto está deixando de capturar seu principal diferencial e ainda correndo risco de contradição.

**Custo de correção:** 8-16h de frontend + backend, dependente da fundação LGPD (ver Fase 1).

### Risco C — Exposição à LGPD com dado de saúde (GOV-L01) · Risco legal/compliance

**O que é:** corrigir o SafeSpace cria dado sensível de saúde. "Anônimo" hoje seria pseudonimizado (reidentificável via `user_id`), não anônimo de verdade. Faltam base legal, consentimento, minimização, política de retenção/expurgo, direito ao apagamento e a cláusula operador↔controlador no contrato B2B.

**Por que importa para o negócio:**
- **Sanção da ANPD:** a LGPD prevê multas de até **2% do faturamento (limitadas a R$ 50 milhões por infração)**, além de advertências, bloqueio e publicização da infração — esta última especialmente danosa para uma marca de bem-estar.
- **Barreira de venda B2B:** clientes corporativos exigem que seus fornecedores de dados sensíveis estejam em conformidade. O DPO do cliente **audita** o operador. Sem o modelo LGPD, o ILUMINNARE pode ser **reprovado no due diligence de compliance** e perder o negócio antes de assinar.
- **Risco existencial em estágio inicial:** um incidente público envolvendo dado de saúde mental mal tratado pode encerrar a reputação de uma startup jovem.

**Custo de correção:** 16-30h de fundação de dados/compliance (ver Fase 1).

> **Ponto de sequenciamento crítico (do assessment):** esses três não podem ser corrigidos isoladamente nem na ordem errada. Endurecer a segurança antes de mover a lógica para o servidor **derruba a produção**; persistir o SafeSpace antes do modelo LGPD **cria o passivo jurídico no exato commit da correção**. Há uma ordem certa — e ela já está desenhada.

---

## 3. Custo de Resolver vs Custo de Não Resolver

### 3.1 Custo de RESOLVER (dados técnicos — confiança alta)

| Escopo | Esforço | Custo @ R$150/h | Prazo (1 dev) |
|--------|---------|-----------------|---------------|
| **Caminho crítico (só os 3 riscos ativos + gate de teste)** | 90-130h | **R$ 13,5 - 19,5 mil** | 3-4 semanas |
| **Fase 1 completa (estancar o sangramento)** | 60-97h de execução* | **R$ 15 - 20 mil** | 3-4 semanas |
| **Programa completo (65 débitos)** | ~480h (430-540h) | **R$ 65 - 81 mil** | 13-15 semanas |
| Apoio de design | 12-16h | + R$ 1,8 - 2,4 mil | Em paralelo |

*A Fase 1 e o "caminho crítico" se sobrepõem: ambos entregam segurança + LGPD + SafeSpace fundacional. A faixa R$ 15-20 mil é a referência de decisão para "parar o incêndio".

### 3.2 Custo de NÃO resolver (risco de negócio — confiança média, calibrar com dados reais)

> **Premissas ilustrativas** (substituir pelos números reais do fundador): ACV típico de wellness corporativo B2B na faixa de **R$ 20-60 mil/ano por cliente**; pipeline em estágio inicial com poucos contratos, onde cada cliente pesa muito.

| Cenário de inação | Gatilho | Impacto estimado | Comparação com custo de resolver |
|-------------------|---------|------------------|----------------------------------|
| **Cliente B2B descobre o bypass de paywall** | Auditoria de TI do cliente | Perda de 1 contrato = R$ 20-60 mil/ano + dano de reputação no pipeline | **1x a 4x** o custo da Fase 1 — por um único cliente |
| **Incidente com o SafeSpace "mentindo"** | Usuário/RH percebe que o desabafo não foi guardado | Churn + boca a boca negativo em comunidade de RH; erosão da promessa central | Difícil de reverter; custa mais que prevenir |
| **Sanção ou notificação da ANPD (LGPD)** | Reclamação, vazamento ou fiscalização | Multa até 2% do faturamento (teto R$ 50 mi) + publicização + bloqueio | Potencialmente **existencial** para estágio inicial |
| **Reprovação em due diligence de compliance** | DPO do cliente audita o operador | Negócios B2B travados antes de assinar | Bloqueia a própria receita que sustenta a empresa |
| **Custo de oportunidade (velocidade)** | Dívida acumulada (god-context, ~0% de testes, mock em produção) | Cada feature nova fica mais lenta e arriscada de entregar | Juros compostos silenciosos sobre o roadmap |

**Leitura executiva:** os custos de resolver são **conhecidos, limitados e pequenos** (dezenas de milhares de reais). Os custos de não resolver são **incertos, mas assimétricos** — a maioria dos cenários ruins, isoladamente, já paga o programa inteiro; os piores (LGPD com dado de saúde) são de outra ordem de grandeza. Essa assimetria é o argumento central para agir.

---

## 4. Impacto no Negócio

| Vetor de negócio | Situação hoje | Após resolução |
|------------------|---------------|----------------|
| **Conversão (free → premium)** | Paywall burlável mina a monetização; premium sem loop de pagamento fechado | Paywall confiável no servidor; upgrade sancionado; webhook de pagamento fechando o loop |
| **Retenção / adesão** | SafeSpace não entrega seu valor; onboarding longo antes do "aha" | SafeSpace real (principal alavanca de confiança); onboarding encurtado |
| **Risco de churn B2B** | Alto — um cliente que descobre o bypass tem motivo direto para sair | Baixo — segurança auditável vira argumento de venda |
| **Compliance / legal** | Exposto — sem base legal para dado sensível; contrato B2B sem cláusula de operador | Conforme — base legal, retenção, apagamento, cláusula operador↔controlador |
| **Velocidade de entrega futura** | Freada — ~0% de testes, mock em produção, god-context frágil | Acelerada — CI, testes de segurança como rede, base modular |
| **Confiança de marca** | Frágil em pontos sensíveis (saúde mental, anonimato) | Sólida — coerência entre o que o produto promete e o que entrega |

---

## 5. Timeline Recomendado — 3 Fases de Negócio

Resumo executivo do plano técnico de 7 lotes, consolidado em três fases de decisão orçamentária. A **ordem é obrigatória** (ditada por dependências técnicas: servidor antes de trancar segurança; LGPD antes de persistir desabafo; testes verdes antes de tocar produção).

### Fase 1 — Estancar o Sangramento (P0) · R$ 15-20 mil · 3-4 semanas
**O que entrega:** fecha os três riscos ativos.
- Move o controle de premium e pontos para o **servidor** (não mais burlável pelo navegador).
- **Tranca a segurança** (RLS endurecida) sem derrubar a ativação premium — via caminho de admin sancionado.
- Constrói a **fundação LGPD** e passa o SafeSpace a **persistir de verdade e com anonimato real**.
- Instala o **gate de testes de segurança** (impersonação + CI) como rede de proteção permanente.
- *Interim honesto:* enquanto não sobe, o botão do SafeSpace mostra "em breve" — melhor não prometer do que mentir.
> **Esta é a fase que precisa de aprovação imediata.**

### Fase 2 — Fundação de Confiança e Experiência (P1) · R$ 19-27 mil · 5-6 semanas
**O que entrega:** transforma o MVP corrigido em produto B2B vendável com confiança.
- Integridade de dados (chaves estrangeiras, reconciliação de pontos) + **trilha de auditoria** de plano/pontos.
- **Experiência de acolhimento:** tom visual adequado à saúde emocional, remoção de dados fake, **rede de crise** (CVV/escalada) nas telas sensíveis, onboarding encurtado.
- **Acessibilidade** (público sensível) e **moderação server-side** + limite de abuso.
- Fecha o **loop de pagamento premium** (webhook).

### Fase 3 — Otimização e Escala (P1/P2/P3) · R$ 20-39 mil · ~4-5 semanas
**O que entrega:** prepara para crescer sem acumular juros de dívida.
- Refatorações estruturais grandes (organização do código central, cobertura ampla de testes).
- Performance, code-splitting, cache; **backup/PITR** (obrigatório com dado sensível guardado); e higiene geral.
- *(Esta fase absorve os itens estruturais de maior esforço — por isso a faixa de custo mais larga.)*

**Total do programa:** ~R$ 65-81 mil · ~13-15 semanas com 1 dev. **Com 1 dev de banco + 1 de UX em paralelo a partir da Fase 2, comprime para ~8-9 semanas.**

---

## 6. ROI da Resolução

**A conta que importa é a da Fase 1.** Por ~R$ 15-20 mil e 3-4 semanas, o ILUMINNARE:
- remove uma vulnerabilidade de receita **ativa agora**;
- elimina o risco reputacional do SafeSpace "mentindo";
- constrói a base de compliance que **destrava** vendas B2B (deixa de ser reprovado em due diligence);
- ganha uma rede de testes que impede regressões futuras.

**Retorno assimétrico:** usando as premissas ilustrativas (ACV R$ 20-60 mil/ano), **evitar a perda de um único contrato B2B já paga a Fase 1 inteira — de 1x a 4x.** E isso ignora o cenário LGPD, cujo custo evitado é potencialmente de outra ordem de grandeza (multa + reputação + travamento comercial).

| Métrica de ROI | Leitura |
|----------------|---------|
| Payback da Fase 1 | **Menos de 1 contrato B2B preservado** |
| ROI qualitativo | Converte um risco existencial (LGPD/reputação) em custo fixo pequeno e conhecido |
| ROI de velocidade | CI + testes reduzem o custo e o risco de toda feature futura (juros compostos a favor) |
| ROI comercial | Compliance e paywall auditável viram **argumento de venda** B2B, não só defesa |

> **Enquadramento honesto:** não estamos prometendo receita nova diretamente da Fase 1 — estamos removendo os freios que impedem a receita existente de ser segura e a futura de ser vendável. É seguro de baixo custo contra perdas de alto impacto, com o bônus de destravar o pipeline B2B.

---

## 7. Próximos Passos — claros e acionáveis

1. **Aprovar a Fase 1 (R$ 15-20 mil, 3-4 semanas) — decisão desta semana.** É o menor cheque que remove o maior risco. *(Decisão do fundador.)*
2. **Ligar o "interim honesto" do SafeSpace imediatamente (custo ~zero, horas).** Trocar o botão para "em breve"/desabilitado enquanto a persistência real não sobe — para de prometer o que não entrega. *(Rápido, independente da Fase 1.)*
3. **Confirmar a taxa/hora real e o modelo de contratação** (dev interno vs. terceirizado) para calibrar todos os valores deste relatório. *(Fundador.)*
4. **Fornecer os números comerciais reais** (ACV médio, nº de clientes, faturamento) para converter os cenários de risco ilustrativos em valores concretos. *(Fundador — melhora a confiança da seção 3.2 de média para alta.)*
5. **Autorizar o time técnico a converter a Fase 1 em stories executáveis** (Fase 10 do processo: @pm gera o épico + stories). *(Handoff para @pm.)*
6. **Orçar as Fases 2 e 3 em seguida**, já com o produto seguro — sem pressa de incêndio, com priorização guiada por objetivos comerciais.

---

## Anexos

### Anexo A — Os 7 lotes técnicos → 3 fases de negócio

| Lote técnico | Foco | Fase de negócio |
|--------------|------|-----------------|
| Lote 0 | Pré-requisitos, CI, design do modelo LGPD | Fase 1 |
| Lote 1 | Fundação server-side + SafeSpace persistido + LGPD | Fase 1 |
| Lote 2 | Endurecimento da segurança (RLS) | Fase 1 |
| Lote 3 | Integridade de dados + auditoria | Fase 2 |
| Lote 4 | UX de confiança/adesão + acessibilidade + moderação | Fase 2 |
| Lote 5 | Qualidade estrutural (refatorações, testes) | Fase 3 |
| Lote 6 | Performance, backup/DR, higiene | Fase 3 |

### Anexo B — Os 3 débitos críticos formais

| ID | Nome | Natureza do risco | Esforço |
|----|------|-------------------|---------|
| DBT-S01 | Bypass de paywall/pontos via segurança de banco | Receita + churn B2B (ativo) | 4-6h (+ dependências) |
| FE-02 | SafeSpace finge persistir desabafo anônimo | Reputacional + confiança | 8-16h + backend |
| GOV-L01 | LGPD / dado sensível de saúde | Legal + compliance + comercial | 16-30h |

### Anexo C — Premissas e limites de confiança

- **Custos técnicos (alta confiança):** derivados do assessment técnico revisado por 4 especialistas (arquitetura, banco, UX, QA). Faixa 430-540h.
- **Custos de risco de negócio (média confiança):** usam faixas típicas de mercado (wellness corporativo B2B) porque não dispomos dos dados comerciais reais. Devem ser recalibrados com o faturamento e o ACV do ILUMINNARE (ver Próximo Passo 4).
- **Taxa de R$ 150/h:** premissa ajustável. Todos os valores escalam linearmente com a taxa real.
- **Referência da LGPD:** Art. 5º (dado sensível de saúde) e regime sancionatório da ANPD (multa até 2% do faturamento, teto R$ 50 mi/infração). Verificação jurídica formal recomendada antes de persistir dado sensível.

---

*Relatório produzido por Alex (@analyst) — AIOX Brownfield Discovery, FASE 9. Consolida o assessment técnico final da FASE 8 em linguagem de negócio para decisão de orçamento. Próxima fase: FASE 10 (épico + stories executáveis pelo @pm).*
