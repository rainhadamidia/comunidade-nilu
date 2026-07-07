# Frontend / UX Specification — comunidade-nilu (ILUMINNARE)

> **Documento:** Fase 3 do Brownfield Discovery
> **Autor:** Uma (@ux-design-expert) — AIOX Squad
> **Data:** 2026-07-04
> **Produto:** ILUMINNARE — SaaS de saúde emocional empresarial (IA, gamificação, mentoria)
> **App analisado:** `comunidade-nilu` (React + Vite + TypeScript + shadcn-ui + Tailwind)
> **Deploy:** https://comunidade-nilu.vercel.app/
> **Público-final:** colaboradores de empresas usando a plataforma para saúde emocional/mental

## Contexto herdado (Fases 1 e 2)

- **@architect (Fase 1):** mock data em produção em ≥5 páginas; "features sociais" (tips/likes/comentários) 100% em memória/localStorage, sem persistência real nem sync entre dispositivos; `AuthContext.tsx` é god-context (488 linhas, 18 métodos).
- **@data-engineer (Fase 2):** sistema de pontos com split-brain entre RPC Supabase e localStorage; Feed/Ranking re-buscam tudo a cada evento realtime.

Este documento cobre a camada de UX/UI e conecta esses achados ao impacto na experiência do usuário.

---

## 1. Inventário de Componentes UI

### 1.1 Biblioteca shadcn-ui (`src/components/ui/`)
Biblioteca completa instalada — **~49 componentes** (default style, baseColor `slate`, CSS variables ligado):
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip.

**Observação:** biblioteca superdimensionada para o uso real. Muitos componentes-chave para consistência **não estão sendo usados** onde deveriam:
- `skeleton.tsx` existe mas **nenhuma página usa** para loading (Feed usa texto "Carregando posts...").
- `card.tsx` existe mas as páginas usam a classe utilitária custom `.glass-card` em `<div>` cru — o componente `Card` do design system é ignorado.
- `sidebar.tsx` existe mas `Layout.tsx` implementa a sidebar do zero com `<aside>` + `<button>`.
- `avatar.tsx` existe mas avatares são emojis em `<div>` cru.

### 1.2 Componentes customizados (`src/components/`)
| Componente | Papel | Observação |
|-----------|-------|------------|
| `Layout.tsx` | Shell de navegação (sidebar desktop + header/menu mobile) | Não usa `Sidebar` do shadcn; nav via `<button>` não-semânticos |
| `NavLink.tsx` | Wrapper de `react-router NavLink` com `activeClassName` | **Componente morto** — não é importado em nenhum lugar (Layout usa `<button>` + `navigate()`) |
| `PointsToast.tsx` | Toast custom de ganho de pontos | Terceiro sistema de toast simultâneo (ver §7) |

### 1.3 Camada de tokens/estilo custom (`src/index.css`)
Classes utilitárias proprietárias em `@layer components`: `.neon-text`, `.neon-text-accent`, `.neon-text-secondary`, `.glass-card`, `.neon-border`, `.neon-glow`, `.gradient-bg`, `.progress-glow`, `.challenge-locked/-active/-completed`, `.avatar-ring`, `.nav-item`, `.nav-item-active`. Animações: `pulse-neon`, `float`, `glow`, `slide-up`, `fade-in`.

---

## 2. Design System / Tokens

### 2.1 Definição (`tailwind.config.ts` + `src/index.css`)
- **Tokens de cor centralizados via CSS variables** (`--primary`, `--secondary`, `--accent`, `--muted`, etc.) mapeados no Tailwind com `hsl(var(--…))`. **Disciplina boa:** as páginas consomem quase 100% via classes de token (`bg-primary`, `text-muted-foreground`) — praticamente **zero cores hardcoded** (a única ocorrência `text-[10px]` em `Diagnostico.tsx` é tamanho de fonte, não cor).
- **Tipografia:** `Inter` (sans) + `Space Grotesk` (display/headings), importadas via Google Fonts em `@import` no CSS.
- **Radius:** `--radius: 0.75rem` com escala md/sm derivada.
- **Paleta:** tema **dark-only cyberpunk/neon** — `--background: 230 25% 8%` (quase preto), `--primary: 180 100% 50%` (ciano neon), `--secondary: 270 100% 65%` (roxo), `--accent: 160 100% 45%` (verde neon), além de `--neon-cyan/magenta/green/purple/orange`. Sombras de "glow" e text-shadow neon.

### 2.2 Problemas
- **Não há light mode.** `darkMode: ["class"]` está declarado no config, mas só existe o bloco `:root` (nenhum `.dark {}` nem alternância). O tema é fixo escuro.
- **Tom visual desalinhado com o domínio.** Ver §critical — estética neon/gamer para produto de saúde emocional corporativa.
- **Camada dupla de "design system":** metade em tokens Tailwind (bom), metade em classes CSS custom (`.glass-card`, `.neon-*`) que não têm equivalente em componente React — dificulta manutenção e reuso governado.
- **`text-shadow` neon em títulos** (`.neon-text`) reduz legibilidade de texto — antipadrão de acessibilidade tipográfica.

---

## 3. Padrões de Layout

- `Layout.tsx` provê: **sidebar fixa de 256px no desktop** (`md:`), **header + menu-overlay no mobile**. Conteúdo em `<main>` com `max-w-6xl mx-auto` e padding responsivo (`p-4 md:p-8`).
- **Aplicação inconsistente do shell:** `Layout` é importado por **13 das 19 páginas**. As 6 páginas de fluxo focado — `Auth`, `Diagnostico`, `NovoProjeto`, `Premium`, `Index`, `NotFound` — não usam Layout (decisão razoável para telas sem chrome).
- **Boilerplate de layout duplicado:** `Auth`, `Diagnostico`, `NovoProjeto` e `Premium` repetem **manualmente** o mesmo bloco de fundo (`min-h-screen flex items-center justify-center` + dois `blur-3xl` de glow). Falta um `FocusLayout`/`AuthLayout` para encapsular esse padrão — cada tela mantém sua própria cópia.
- **Título de navegação divergente:** o header/sidebar exibe "Iluminnados", enquanto o produto é "ILUMINNARE"/"comunidade-nilu" — inconsistência de naming/marca.

---

## 4. Fluxos de Usuário

Fluxo principal reconstruído a partir de `App.tsx` (rotas) + `AuthContext`:

```
Index (/)  →  Auth (/auth: login/signup + avatar emoji)
   → Diagnostico (/diagnostico: PCI, 20 perguntas, salva em Supabase, +Neural Coins)
   → NovoProjeto (/novo-projeto)  →  MeuProjeto (/meu-projeto)
   → Dashboard/Home (/: jornada, comunidade, bônus)
   → Comunidade & engajamento: Feed, Ranking, Challenges, AnnualChallenges,
     Community, SafeSpace, SelfCare, Contents, Personalities
   → Premium (/premium: link externo InfinitePay, ativação manual)
   → Profile (/profile) · Admin (/admin, se isAdmin)
```

### Fricções de fluxo
- **Sem route guard central.** Todas as rotas são públicas no `App.tsx`; a proteção é feita ad hoc dentro de cada página (ex.: `Feed` faz `navigate('/auth')` em `useEffect`). Páginas que esquecem esse check ficam desprotegidas — inconsistência de acesso.
- **Onboarding longo antes do "aha":** Auth → Diagnóstico (20 perguntas) → NovoProjeto → Dashboard. Muito atrito antes do usuário ver valor — risco de abandono no público corporativo.
- **Premium sem loop de conversão fechado:** paga em link externo e o acesso é "liberado manualmente em até algumas horas" (`Premium.tsx`). Sem status de assinatura no app, sem confirmação de compra, sem retorno guiado — fricção alta e ansiedade pós-pagamento.

---

## 5. Responsividade

- **Estratégia mobile-first parcial:** breakpoint único relevante `md:` (768px) alterna sidebar↔header. `use-mobile.tsx` (`MOBILE_BREAKPOINT = 768`) existe mas é usado quase só internamente pelo shadcn `sidebar`, não pelas páginas.
- **Menu mobile funcional** (overlay `fixed inset-0`), mas: sem trava de scroll do body, sem `aria-expanded`, sem foco gerenciado (ver §6).
- **Grids adaptam** (`grid md:grid-cols-2`, `grid-cols-2 md:grid-cols-4`) — ok no geral.
- **Escala do Diagnóstico:** `grid-cols-1 sm:grid-cols-5` — no mobile os 5 botões da escala empilham verticalmente, funcional mas ocupa muita altura.
- **Sem breakpoints `lg`/`xl` de refinamento** — layout salta de 1 coluna direto para o alvo em `md`.

---

## 6. Acessibilidade (a11y) — **estado crítico**

Varredura por `aria-*`, `role=`, `alt=`, `sr-only`: apenas **7 ocorrências em 3 arquivos** (`Auth`, `NovoProjeto`, `Feed`). **~15 páginas têm zero atributos de acessibilidade.**

- **Navegação não-semântica:** `Layout` usa `<button onClick={navigate}>` em vez de links (`<a>`/`NavLink`). Sem `aria-current` no item ativo, sem `aria-label` no `<nav>`, sem landmark de navegação nomeado.
- **Menu mobile:** botão toggle sem `aria-expanded`/`aria-controls`/`aria-label`; overlay sem focus-trap, sem `Esc` para fechar, sem retorno de foco.
- **Ícones/emojis como única informação:** avatares (emoji), status (`✓`/`🔒`), decorações neon — sem texto alternativo. Ícones `lucide` decorativos sem `aria-hidden`.
- **Contraste em risco:** `--muted-foreground: 215 20% 55%` sobre fundo `230 25% 8%` fica próximo do limite AA para texto pequeno; `text-shadow` neon degrada legibilidade de títulos.
- **Estados de foco fracos:** inputs usam apenas `focus:border-primary` (mudança sutil de borda), sem anel de foco visível robusto para navegação por teclado.
- **Seleções sem estado acessível:** seleção de avatar (`Auth`) e escala (`Diagnostico`) usam `<button>` sem `aria-pressed`/`role="radio"` — leitor de tela não anuncia o item selecionado.
- **Ponto positivo:** formulário de `Auth` usa `<Label htmlFor>` corretamente e o `Feed` usa `<article>`/`<header>` semânticos.

> Para um produto de **saúde emocional acessado no ambiente corporativo** (inclui usuários com deficiência), a ausência quase total de a11y é um risco de conformidade e de exclusão.

---

## 7. Consistência Visual

- **Estética uniforme** (todas as telas seguem o mesmo tema neon/glass) — consistência visual "de superfície" é alta.
- **Porém, divergência funcional entre telas mock e reais:**
  - `Feed.tsx` (real, Supabase + realtime) e `SafeSpace.tsx` (mock, estado em memória) implementam **quase o mesmo padrão** "feed com post anônimo" — **componente duplicado** com dois destinos de dados diferentes. Deveriam compartilhar um `<PostFeed>`/`<PostComposer>`.
  - Páginas mock (`Dashboard`, `Community`, `Profile`, `Personalities`, `SafeSpace`) parecem completas mas exibem dados fictícios (`communityMembers`, `activities`, `userBonuses`, `safeSpacePosts`, `personalities` de `src/lib/mockData.ts`). O usuário não distingue o que é real do que é fachada.
- **Três sistemas de toast simultâneos** montados em `App.tsx`: `Toaster` (shadcn) + `Sonner` + `PointsToast` (custom). Feedback fragmentado e risco de estilos divergentes.
- **Dois `use-toast`** duplicados no repo: `src/hooks/use-toast.ts` e `src/components/ui/use-toast.ts`.

---

## 8. Performance Percebida (loading / erro)

- **Skeletons ausentes:** o componente `skeleton.tsx` existe mas nenhuma página o usa. `Feed` mostra texto simples "Carregando posts..."; a maioria das páginas mock renderiza instantaneamente (dados síncronos) — não representa a latência real quando forem plugadas ao backend.
- **Empty states:** só o `Feed` tem estado vazio decente ("Seja o primeiro a compartilhar algo."). Demais telas assumem que sempre há dados (herança do mock).
- **Tratamento de erro visível:** concentrado em `toast` de erro (Auth, Diagnostico, Feed). Erros de leitura (ex.: `fetchPosts` falhando) **falham silenciosamente** — `Feed` só faz `console.error` e mostra lista vazia sem avisar o usuário.
- **Feedback falso-positivo (grave):** em `SafeSpace`, ao publicar um desabafo o toast confirma *"Sua mensagem foi publicada anonimamente"*, mas o dado vive apenas em `useState` — **some no refresh**. Confirmação visual mente sobre a persistência.

---

## CRÍTICO — Tom visual vs. domínio de saúde emocional

O produto trata **saúde emocional/mental de colaboradores**, e as telas mais sensíveis — **`SafeSpace` (Espaço Seguro), `Diagnostico`, `SelfCare`** — precisam transmitir **acolhimento, calma e confiança**. A UI atual entrega o oposto:

- **Estética neon/cyberpunk/gamer:** fundo quase preto, ciano e roxo saturados, "glow", `animate-pulse-neon`, `neon-glow`, avatares/ícones lúdicos (👑, ⚔️, 🎭). Linguagem visual de jogo/hacker, não de bem-estar.
- **`SafeSpace`** — a tela onde o usuário se abre emocionalmente — usa `Shield` neon e mesma pegada visual "energética" de gamificação. Falta a paleta suave/quente e o ritmo calmo esperados de um espaço terapêutico.
- **Risco de confiança:** para um colaborador expor vulnerabilidade dentro de uma ferramenta da empresa, o tom precisa sinalizar segurança e sobriedade. O contraste neon + persistência falsa (§8) corrói a confiança justamente no ponto mais frágil da jornada.

**Recomendação de alto nível:** introduzir um "modo acolhimento" (paleta suave, sem glow, tipografia calma) para SafeSpace/Diagnostico/SelfCare, ou reposicionar toda a paleta para tons mais quentes e menos saturados, preservando a gamificação apenas nas áreas de desafio/ranking.

---

## Débitos Técnicos Identificados (Frontend/UX)

| ID | Débito | Evidência (arquivo) | Severidade Preliminar | Impacto UX |
|----|--------|---------------------|-----------------------|------------|
| FE-01 | Tom visual neon/gamer conflita com domínio de saúde emocional (SafeSpace/Diagnostico/SelfCare precisam acolher) | `src/index.css` (paleta neon, `.neon-glow`), `src/pages/SafeSpace.tsx` | **Alta** | Quebra de confiança/acolhimento; risco de baixa adesão no público corporativo |
| FE-02 | Feedback falso-positivo: SafeSpace confirma "publicado anonimamente" mas só grava em `useState` (some no refresh) | `src/pages/SafeSpace.tsx:33-38` | **Alta** | Usuário perde desabafo emocional; confiança traída no ponto mais sensível |
| FE-03 | Mock data em produção em 5 páginas (dashboard/comunidade/perfil parecem reais) | `src/lib/mockData.ts` consumido por `Dashboard`, `Community`, `Profile`, `Personalities`, `SafeSpace` | **Alta** | Usuário vê membros/atividades/bônus fictícios; percepção de produto vazio/fake |
| FE-04 | Acessibilidade quase ausente (só 7 atributos a11y em 3 de 19 páginas) | Varredura `aria-*/role/alt` em `src/pages/*` | **Alta** | Exclui usuários de teclado/leitor de tela; risco de conformidade corporativa |
| FE-05 | Navegação não-semântica (`<button>`+navigate, sem `aria-current`, sem landmark) | `src/components/Layout.tsx:77-147` | **Média** | Leitor de tela não anuncia item ativo/navegação; SEO/semântica ruim |
| FE-06 | Menu mobile sem `aria-expanded`, focus-trap, `Esc` ou trava de scroll | `src/components/Layout.tsx:64-102` | **Média** | Navegação por teclado quebrada no mobile |
| FE-07 | Componente duplicado: feed anônimo em `Feed` (real) e `SafeSpace` (mock) | `src/pages/Feed.tsx` vs `src/pages/SafeSpace.tsx` | **Média** | Manutenção divergente; comportamentos inconsistentes de post |
| FE-08 | Três sistemas de toast simultâneos (Toaster + Sonner + PointsToast) | `src/App.tsx:35-37` | **Média** | Feedback fragmentado e estilos inconsistentes |
| FE-09 | Skeletons/loading states ausentes (componente `skeleton` nunca usado) | `src/components/ui/skeleton.tsx` (não importado); `src/pages/Feed.tsx:188` | **Média** | Latência real (pós-backend) parecerá travamento; sem percepção de progresso |
| FE-10 | Erros de leitura falham silenciosamente (só `console.error`, lista vazia) | `src/pages/Feed.tsx:49-53` | **Média** | Usuário não sabe se falhou ou está vazio; sem recuperação |
| FE-11 | Sem route guard central; proteção ad hoc por página | `src/App.tsx:39-59` vs `src/pages/Feed.tsx:36-40` | **Média** | Acesso inconsistente; páginas podem vazar conteúdo sem auth |
| FE-12 | Design system em camada dupla (tokens Tailwind + classes CSS `.glass-card/.neon-*` sem componente) | `src/index.css:82-147` | **Média** | Reuso não-governado; shadcn `Card`/`Sidebar`/`Avatar` ignorados |
| FE-13 | Boilerplate de layout focado duplicado (fundo+glow copiado em 4 telas) | `Auth.tsx:83-88`, `Diagnostico.tsx:74-78`, `NovoProjeto.tsx`, `Premium.tsx:19-23` | **Baixa** | Manutenção repetida; falta `FocusLayout` |
| FE-14 | `NavLink.tsx` é componente morto (nunca importado) | `src/components/NavLink.tsx` | **Baixa** | Código morto; confusão de manutenção |
| FE-15 | `use-toast` duplicado em dois caminhos | `src/hooks/use-toast.ts` e `src/components/ui/use-toast.ts` | **Baixa** | Fonte de verdade ambígua |
| FE-16 | Sem light mode apesar de `darkMode:["class"]` declarado | `tailwind.config.ts:4`, `src/index.css` (só `:root`) | **Baixa** | Dark-only pode reduzir conforto/acessibilidade de alguns usuários |
| FE-17 | Inconsistência de marca: UI diz "Iluminnados", produto é ILUMINNARE | `src/components/Layout.tsx:62,108`; `src/pages/Auth.tsx:93` | **Baixa** | Ruído de identidade/confiança |
| FE-18 | Premium sem loop fechado (link externo + ativação manual, sem status no app) | `src/pages/Premium.tsx:5,53` | **Média** | Fricção e ansiedade pós-pagamento; sem confirmação de acesso |

---

## Recomendações prioritárias (para Fase 4+)

1. **P0 — Tom acolhedor + persistência real nas telas sensíveis** (FE-01, FE-02, FE-03): repaginar SafeSpace/Diagnostico/SelfCare e eliminar feedback falso-positivo. Ligar SafeSpace ao mesmo backend do Feed.
2. **P0 — Baseline de acessibilidade** (FE-04, FE-05, FE-06): nav semântica com `aria-current`, foco visível, menu mobile acessível, `aria-hidden` em decorativos.
3. **P1 — Consolidar padrões** (FE-07, FE-08, FE-12): extrair `<PostFeed>`/`<PostComposer>`, unificar toasts, adotar `Card`/`Sidebar`/`Avatar` do shadcn e transformar `.neon-*`/`.glass-card` em componentes governados.
4. **P1 — Estados de carregamento/erro reais** (FE-09, FE-10): skeletons e mensagens de erro com recuperação antes de plugar o backend em todas as telas.
5. **P2 — Higiene** (FE-11, FE-13..FE-17): route guard central, `FocusLayout`, remover código morto, alinhar naming da marca.
