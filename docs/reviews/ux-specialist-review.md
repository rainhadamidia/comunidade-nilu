## UX Specialist Review

> **Documento:** Brownfield Discovery — FASE 6 (Validação de Especialista UX/Frontend)
> **Autora:** Uma (@ux-design-expert — AIOX)
> **Data:** 2026-07-04
> **Revisa:** `docs/prd/technical-debt-DRAFT.md` §3 e §5 · Fonte primária: `docs/frontend/frontend-spec.md` (Fase 3)
> **Produto:** ILUMINNARE — SaaS de saúde emocional corporativa · App `comunidade-nilu`
> **Insumo cross-fase:** @data-engineer (Fase 5) confirmou que a persistência real do SafeSpace (FE-02) depende de tabela/RPC no backend → FE-02 é débito **cross-cutting UX↔DB**.

---

### Metodologia da revisão

Cada débito FE-* foi reconfirmado contra a evidência de código. Onde o @architect estimou esforço em faixas P/M/G/XG, converti para **horas de dev pleno/sênior** (+ apoio pontual de design onde marcado `[+D]`). Reprioizei sob a ótica de experiência do usuário na ordem pedida:

**confiança/adesão > acessibilidade > consistência visual > polish**

Legenda de prioridade UX: **U0** (bloqueia confiança/adesão — corrige antes de qualquer campanha de uso) · **U1** (acessibilidade/conformidade) · **U2** (consistência/coerência) · **U3** (higiene/polish).

---

### Débitos Validados

| ID | Débito | Severidade (validada) | Horas | Prioridade UX | Impacto UX |
|----|--------|-----------------------|-------|---------------|------------|
| FE-02 | SafeSpace finge persistir desabafo anônimo (só `useState`) | **Crítica** (mantida) | **8–16h** (parte UX/FE; +backend Dara) | **U0** | Traição de confiança no ponto mais frágil da jornada — o usuário perde um desabafo emocional e recebe confirmação que mente |
| FE-01 | Tom visual neon/gamer vs. saúde emocional (SafeSpace/Diagnostico/SelfCare) | **Alta** (mantida; borderline crítica p/ adesão) | **16–28h** `[+D 6–8h]` | **U0** | Estética "hacker/jogo" afasta abertura emocional; risco direto de baixa adesão no público corporativo |
| FE-03 | Mock data em produção em 5 páginas (≡ SYS-08) | **Alta** (mantida) | **20–32h** (depende de backend por página) | **U0** | Percepção de produto vazio/fake; usuário não distingue real de fachada — corrói credibilidade |
| FE-04 | Acessibilidade quase ausente (7 atributos em 3/19 páginas) | **Alta** (mantida; risco de conformidade) | **24–40h** (Layout ~8–12h + retrofit) | **U1** | Exclui usuários de teclado/leitor de tela; risco legal/compliance num contrato B2B corporativo |
| FE-05 | Navegação não-semântica (`<button>`+navigate, sem `aria-current`/landmark) | **Média** (mantida) | **4–6h** (≈70% coberto pelo refactor de Layout do FE-04) | **U1** | Leitor de tela não anuncia item ativo nem a região de navegação |
| FE-06 | Menu mobile sem `aria-expanded`/focus-trap/`Esc`/scroll-lock | **Média** (mantida) | **4–6h** (usar `Sheet` shadcn resolve a maioria) | **U1** | Navegação por teclado quebrada no mobile; foco escapa do overlay |
| FE-10 | Erros de leitura falham silenciosamente (`console.error` + lista vazia) | **Média → Média-alta** (elevo o impacto) | **4–8h** | **U1** | Usuário não distingue "vazio" de "falhou"; sem recuperação. Em telas sensíveis, silêncio de erro amplia ansiedade |
| FE-18 | Premium sem loop fechado (link externo + ativação manual) (≡ SYS-02) | **Média** (mantida) | **8–16h** (parte UX/FE; +webhook backend) | **U0** (dimensão confiança) / U2 (técnica) | Ansiedade pós-pagamento, sem confirmação nem status de assinatura — fricção no momento de conversão |
| FE-07 | Componente duplicado Feed (real) vs. SafeSpace (mock) | **Média** (mantida) | **8–12h** | **U2** | Manutenção divergente; comportamentos inconsistentes de post. Pré-requisito natural de FE-02 |
| FE-08 | Três sistemas de toast simultâneos (Toaster + Sonner + PointsToast) | **Média** (mantida) | **3–5h** | **U2** | Feedback fragmentado, estilos divergentes; risco de mensagens sobrepostas |
| FE-09 | Skeletons/loading ausentes (`skeleton` nunca usado) | **Média** (mantida) | **6–10h** | **U2** | Ao plugar o backend, a latência real parecerá travamento; sem percepção de progresso |
| FE-11 | Sem route guard central; proteção ad hoc por página (≡ SYS-07/DBT-S01) | **Média → Média-alta** (elevo: é adjacente à segurança) | **3–5h** | **U1/U2** | Acesso inconsistente; página que esqueça o check vaza conteúdo autenticado |
| FE-12 | Design system em camada dupla (tokens + `.glass-card/.neon-*` sem componente) | **Média** (mantida) | **16–24h** | **U2** (habilitador de FE-01) | Reuso não-governado; `Card/Sidebar/Avatar` shadcn ignorados; retrabalho a cada ajuste de tom |
| FE-13 | Boilerplate de layout focado duplicado (fundo+glow em 4 telas) | **Baixa** (mantida) | **2–4h** | **U3** | Manutenção repetida; falta `FocusLayout`/`AuthLayout` |
| FE-14 | `NavLink.tsx` código morto (nunca importado) | **Baixa** (mantida) | **0,5–1h** | **U3** | Código morto; confusão de manutenção |
| FE-15 | `use-toast` duplicado em dois caminhos | **Baixa** (mantida) | **1–2h** | **U3** | Fonte de verdade ambígua (resolver junto de FE-08) |
| FE-16 | Sem light mode apesar de `darkMode:["class"]` | **Baixa** (mantida) | **8–16h** (opcional/adiável) | **U3** | Dark-only reduz conforto de alguns usuários; não bloqueante. Sugiro **adiar** até FE-01 definir a paleta acolhedora |
| FE-17 | Inconsistência de marca "Iluminnados" vs ILUMINNARE | **Baixa** (mantida) | **0,5–1h** | **U3** | Ruído de identidade/confiança — correção trivial, ganho de percepção desproporcional |

**Nota de não-duplicação de esforço:** FE-04, FE-05 e FE-06 compartilham ~8–12h de refatoração do `Layout.tsx` (nav semântica + menu mobile via `Sheet`). Contabilizadas por débito acima, mas o **custo líquido combinado** é menor que a soma (ver Resumo). Igualmente, FE-01 e FE-12 compartilham a introdução de variantes de tema em componentes governados.

---

### Débitos Adicionados

Como especialista de UX de um produto de **saúde emocional**, identifiquei três débitos genuínos que não foram capturados nas Fases 1–3 (nenhum inventado — todos rastreáveis a evidência de código/fluxo já documentada em `frontend-spec.md`):

| ID | Débito | Evidência | Severidade | Horas | Prioridade UX | Impacto UX |
|----|--------|-----------|------------|-------|---------------|------------|
| **FE-19** | **Ausência de rede de segurança / recurso de crise nas telas sensíveis.** SafeSpace/Diagnostico/SelfCare recebem conteúdo emocional vulnerável mas não oferecem nenhuma rota de escalada (contato de emergência, CVV 188, canal de RH/psicólogo, sinalização de risco). Para produto de saúde mental, isso é lacuna de dever de cuidado, não só de UX. | Fluxo em `frontend-spec.md §4`; `SafeSpace.tsx` (composer sem affordance de ajuda) | **Alta** | **6–12h** `[+D/conteúdo/legal]` | **U0** | Num momento de vulnerabilidade real (ideação, sofrimento agudo) o usuário fica sem saída; risco reputacional e de responsabilidade para a empresa contratante |
| **FE-20** | **Sem `prefers-reduced-motion`.** A UI é saturada de animações (`pulse-neon`, `float`, `glow`, `slide-up`) aplicadas globalmente. Para usuários com ansiedade/vestibular/foto-sensibilidade — exatamente o público de saúde emocional — movimento constante é nocivo, além de violar WCAG 2.3.3 / 2.2.2. | `index.css` (animações em `@layer`); ausência de media query `prefers-reduced-motion` | **Média** | **3–6h** | **U1** | Desconforto/gatilho em população sensível; conformidade de acessibilidade de movimento |
| **FE-21** | **Onboarding longo antes do "aha".** Auth → Diagnóstico (20 perguntas) → NovoProjeto → Dashboard exige alto investimento antes de qualquer valor percebido. Já sinalizado como fricção em `frontend-spec.md §4`, mas não elevado a débito com ID/estimativa. | Sequência de rotas em `App.tsx`; `Diagnostico.tsx` (20 itens) | **Média** | **8–16h** `[+D]` | **U0** (adesão) | Abandono precoce no público corporativo (adesão é a métrica-mãe do contrato); investir muito antes de ver valor derruba ativação |

> **Observação:** FE-19 e FE-21 impactam diretamente **adesão e confiança** — as duas alavancas comerciais do produto B2B — e por isso entram na faixa U0 apesar de esforço moderado. FE-20 reforça FE-04 (acessibilidade) e deve ser executado no mesmo lote.

---

### Respostas ao Architect (§5 — Fase 6)

**1. FE-01 (tom visual) — retrabalho de design system ou ajuste de paleta?**
Nenhum dos extremos. É um **tema com escopo ("modo acolhimento") de esforço médio e baixo risco** — recomendo a **rota localizada, não a re-paleta global**.
- *Por que é viável sem reescrever tudo:* a disciplina de tokens do projeto é boa (spec §2.1: ~100% das telas consomem `bg-primary`/`text-muted-foreground`, quase zero cor hardcoded). Basta **redefinir os valores das CSS variables sob um escopo** (`data-theme="acolhimento"` no wrapper das 3 rotas sensíveis) — background suave, primárias dessaturadas, `--radius` mais generoso, **desligando `glow`/`text-shadow`/animações neon** naquele escopo. Como as telas já leem tokens, a troca **propaga automaticamente**. O trabalho manual concentra-se em neutralizar as classes utilitárias custom (`.neon-*`, `.glass-card`) dentro do escopo.
- *Por que rejeito a re-paleta global:* alto risco de descaracterizar a gamificação (Ranking/Challenges/desafios), onde o tom energético é intencional e funciona. Global = mais esforço **e** mais risco.
- **Esforço:** 16–28h dev `[+ 6–8h design]` para definir a paleta calma e restilizar SafeSpace/Diagnostico/SelfCare. Preserva a identidade gamer só nas áreas de conquista.

**2. FE-02 (SafeSpace fake) — majoritariamente backend ou há trabalho de UX?**
A **fundação da persistência é backend** (Dara: tabela + RPC + RLS com anonimização real — confirmado na Fase 5). Mas **há trabalho de UX relevante e inegociável** por cima:
- anonimização **de verdade na camada de apresentação** (nunca exibir/derivar autoria; deixar claro para o usuário *como* o anonimato é garantido — texto de privacidade);
- **empty/loading/error states** reais (hoje inexistentes fora do Feed);
- affordance de **moderação/denúncia** (conteúdo emocional exige contenção);
- amarração ao **`<PostFeed>`/`<PostComposer>` compartilhado (FE-07) desde já** — sim, deve nascer compartilhado, para não construir um SafeSpace descartável.
- **Divisão de esforço:** UX/FE ≈ 8–16h **sobre** a base de backend. **Ownership cross-cutting UX↔DB** — sequenciar com Dara: backend primeiro (destino real), UX conecta em seguida.

**3. FE-04 (a11y) — retrofit incremental por página ou refatorar `Layout.tsx` primeiro?**
**Layout.tsx primeiro** — é a dependência de maior alavancagem. Ele é o shell de 13/19 páginas; corrigir nav semântica (`<nav aria-label>`, `aria-current`, landmarks, skip-link) + menu mobile acessível (via `Sheet` shadcn, que já entrega focus-trap/`Esc`/scroll-lock) **resolve FE-05 e FE-06 de uma vez** e eleva a base de todas as telas com chrome.
- *Depois*, retrofit incremental **independente** nas telas de fluxo focado (Auth/Diagnostico/NovoProjeto/Premium) e nos **controles de formulário** (seleção de avatar em Auth e escala do Diagnóstico precisam de `role="radio"`/`aria-pressed` para anunciar seleção). Isso não depende do Layout.
- **Esforço para AA nas ~15 páginas sem atributos:** 24–40h totais, dos quais ~8–12h é o Layout (feito uma vez). Recomendo executar **FE-20 (`prefers-reduced-motion`) no mesmo lote** — é a11y de movimento.

**4. FE-12 (design system duplo) — conflita ou converge com FE-01? Fazer juntos?**
**Converge — e devem ser feitos como um único workstream.** Transformar `.glass-card/.neon-*` em componentes governados (adotando `Card/Sidebar/Avatar` do shadcn) é exatamente o **veículo** para introduzir a variante "acolhimento" do FE-01: o tom vira **variante/prop de componente**, não classe CSS duplicada.
- Se re-tonalizar (FE-01) **antes** de governar os componentes (FE-12), você ajusta classes CSS cruas e depois as arranca — **retrabalho garantido**.
- **Sequência correta:** governar componentes (FE-12) → aplicar variantes de tema (FE-01) na mesma passada. Estimativa combinada com sobreposição: ~28–40h em vez de 16–24 + 16–28 somados isoladamente.

**5. FE-07 — esforço de extrair `<PostFeed>`/`<PostComposer>`? Divergências impedem unificação?**
Esforço **médio: 8–12h**. As divergências existem mas **são parametrizáveis, não bloqueantes**:
- **Identidade:** Feed = autoria identificada; SafeSpace = anônimo. Resolve-se com prop de estratégia (`identity: 'user' | 'anon'`) controlando cabeçalho do post e composer.
- **Recompensa/pontos:** podem diferir por contexto → prop opcional.
- **Sensibilidade de moderação:** SafeSpace exige tom de contenção + denúncia; Feed é mais leve → variante de composer.
- **Fonte de dados:** mesmo destino/tabela recomendável (spec §7), diferindo só no flag de anonimato.
- **Conclusão:** a renderização e a composição unificam totalmente; o que varia (identidade, dados, moderação) entra como configuração. Extrair **antes** de plugar FE-02 evita construir descartável.

**6. Sequenciamento — tom visual antes ou depois de consolidar componentes?**
**Consolidar componentes primeiro (ou junto), tom visual em cima.** Re-tonalizar componentes governados propaga uma vez; re-tonalizar telas/classes duplicadas obriga a refazer quando você consolidar depois. Ordem UX recomendada, minimizando retrabalho:

1. **FE-12 (governar componentes) + FE-07 (`<PostFeed>` compartilhado)** — base estrutural.
2. **FE-01 (tema "acolhimento" como variante)** — sobre os componentes já governados.
3. **FE-02 + FE-03 (dados reais + estados)** — conectar backend, remover mock, usando os componentes/tema prontos.
4. **FE-04/FE-05/FE-06/FE-20 (a11y, Layout-first)** — pode correr **em paralelo** desde o início, pois o refactor de Layout é largamente independente e é pré-requisito de qualidade de todas as telas.
5. **FE-19 (rede de crise) + FE-21 (onboarding)** — logo após as telas sensíveis estarem acolhedoras e persistentes.
6. **FE-08/09/10/11 + higiene (FE-13–17)** — consolidação e polish.

---

### Recomendações de Design (priorizadas)

**U0 — Confiança & adesão (corrigir antes de escalar uso):**
1. **Eliminar o feedback falso-positivo do SafeSpace (FE-02)** — nenhuma confirmação de "publicado" sem persistência real. Enquanto o backend não existir, o botão deve refletir o estado verdadeiro (desabilitado/"em breve") — mentir é pior que não ter.
2. **"Modo acolhimento" localizado (FE-01)** — paleta quente/dessaturada, sem glow, sem animação pulsante, tipografia calma, em SafeSpace/Diagnostico/SelfCare; gamificação neon preservada só em Ranking/Challenges. Via escopo `data-theme` sobre a arquitetura de tokens existente.
3. **Rede de segurança nas telas sensíveis (FE-19)** — bloco persistente de ajuda (CVV 188, contato de RH/psicólogo, escalada), independente de campanha. É dever de cuidado do domínio.
4. **Substituir mock por dados reais + estados honestos (FE-03)** — priorizar Dashboard/Community/Profile; onde não houver dado, empty state honesto em vez de fachada.
5. **Fechar o loop do Premium (FE-18)** e **encurtar o onboarding (FE-21)** — status de assinatura no app; permitir "provar valor" antes das 20 perguntas (ex.: diagnóstico progressivo ou preview do Dashboard).

**U1 — Acessibilidade & conformidade:**
6. **Layout-first a11y (FE-04/05/06):** `<nav aria-label>`, `aria-current`, skip-link, menu mobile via `Sheet` shadcn (focus-trap/`Esc`/scroll-lock), `role="radio"`/`aria-pressed` nos seletores de avatar e escala, `aria-hidden` em ícones decorativos, anel de foco visível robusto.
7. **`prefers-reduced-motion` (FE-20)** e revisão de contraste do `--muted-foreground`/`text-shadow` neon — no mesmo lote.
8. **Erros visíveis com recuperação (FE-10)** e **route guard central (FE-11)** — nunca falhar em silêncio; um único `ProtectedRoute`.

**U2 — Consistência:**
9. **`<PostFeed>`/`<PostComposer>` compartilhados (FE-07)**, **um único sistema de toast (FE-08/FE-15)**, **skeletons reais (FE-09)** antes de plugar backend, **componentes governados (FE-12)** absorvendo `.glass-card/.neon-*`.

**U3 — Higiene/polish:**
10. `FocusLayout` (FE-13), remover `NavLink` morto (FE-14), corrigir marca "Iluminnados"→ILUMINNARE (FE-17), light mode adiado (FE-16) até a paleta acolhedora do FE-01 estar definida.

---

### Resumo (para o QA Gate / @architect — Fase 7/8)

- **Total de débitos UX:** 18 validados + 3 adicionados = **21** (FE-01→FE-21).
- **Esforço UX bruto estimado:** ~**185–235h**; **líquido realista ~170–200h** de dev pleno/sênior (`+ ~12–16h de apoio de design`), descontando sobreposições de Layout (FE-04/05/06) e de tema/componentes (FE-01/FE-12).
- **Cluster U0 (confiança/adesão) — corrigir primeiro:** FE-02 + FE-01 + FE-03 + FE-19 + FE-18 + FE-21 ≈ **70–100h**. É onde está o risco comercial do produto (adesão B2B).
- **Cross-cutting:** FE-02 depende de tabela/RPC do backend (Dara, Fase 5); FE-18 depende de webhook. Sequenciar UX **após** o destino de dados existir.
- **Menor esforço, maior alavancagem estrutural:** refatorar `Layout.tsx` primeiro (resolve FE-04/05/06 de uma vez) e governar componentes **antes** de retonalizar (FE-12→FE-01), evitando retrabalho.
- **Recomendação de prioridade:** **confiança/adesão (U0) antes de tudo** — SafeSpace honesto + tom acolhedor + rede de crise + fim do mock. Acessibilidade (U1) em paralelo via Layout-first. Consistência (U2) e polish (U3) na sequência. Um SafeSpace bonito que mente é pior que um SafeSpace honesto e simples.
