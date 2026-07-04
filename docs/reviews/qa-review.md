## QA Review - Technical Debt Assessment

> **Documento:** Brownfield Discovery — FASE 7 (QA Gate sobre o assessment completo)
> **Revisor:** Quinn (@qa — AIOX), Test Architect & Quality Advisor
> **Data:** 2026-07-04
> **Insumos revisados:** `docs/prd/technical-debt-DRAFT.md` (Fase 4 — 53 débitos), `docs/reviews/db-specialist-review.md` (Fase 5 — +DBT-S06/S07/M03), `docs/reviews/ux-specialist-review.md` (Fase 6 — +FE-19/FE-20/FE-21). Total consolidado atual: **59 débitos**.
> **Produto:** ILUMINNARE — SaaS de saúde emocional corporativa (B2B). App `comunidade-nilu`.

---

### Gate Status: **NEEDS WORK**

**Motivo em uma linha:** o material existente é de alta qualidade, rastreável e tecnicamente correto (a correção de mecanismo do DBT-S01 pela Dara é crucial e acertada). Porém o assessment **não pode ser fechado** sem cobrir três lacunas de governança que o *domínio* (saúde mental) e o *modelo de negócio* (contrato corporativo) tornam obrigatórias: (1) **LGPD / dado sensível de saúde**, (2) **estratégia de testes/validação da vulnerabilidade ativa antes de produção**, e (3) **observabilidade/auditoria + moderação**. São adições, não retrabalho — o corpo do assessment está aprovado.

> Advisory note (estilo Quinn): o *quality bar* é decisão do time. Eu **não bloqueio** o excelente trabalho das Fases 4–6; sinalizo que ir para a Fase 8 sem os débitos abaixo consolidaria um assessment que subestima exposição legal em um produto que persiste desabafos de saúde mental.

---

### Gaps Identificados

Áreas materiais **não cobertas** por nenhuma das três fases. Proponho IDs para rastreabilidade (a criação formal é da Fase 8 — Art. IV, No Invention: todos derivam de evidência já documentada).

| ID proposto | Gap | Por que importa neste domínio | Severidade | Prioridade |
|-------------|-----|-------------------------------|------------|------------|
| **GOV-L01** (LGPD) | **Ausência total de tratamento de dado sensível de saúde.** SafeSpace/Diagnostico/SelfCare coletam sofrimento emocional. Hoje o SafeSpace é fake (FE-02) — mas **o fix do FE-02 persiste esse conteúdo no DB**, criando dado sensível (LGPD Art. 5º, II — saúde) *no momento em que a correção entrar no ar*. "Anônimo" é **client-side**: se a tabela guardar `user_id` (mesmo com flag `is_anonymous`), é **pseudonimização, não anonimização** → continua dado pessoal sensível e reidentificável. Falta: base legal/consentimento, minimização, política de retenção/expurgo, direito ao apagamento, e cláusula de tratamento no contrato B2B (a empresa contratante é controladora; ILUMINNARE é operadora). | Corrigir FE-02 sem desenhar isto **cria** o passivo. É a lacuna mais séria do assessment. | **Crítica** | **P0** (deve preceder o deploy do FE-02) |
| **QA-T01** (Testes) | **Sem estratégia de testes nem test design para as correções críticas.** SYS-09 registra ~0% de cobertura, mas ninguém definiu *como validar* que DBT-S01/S02/S03/S06 foram fechados. Não há suíte de impersonação (`test-as-user`), nem E2E de paywall, nem gate de CI (typecheck/lint/test não rodam em pipeline). | A vulnerabilidade é **ativa**; sem teste de regressão de segurança, o fix vira fé. | **Alta** | **P0** (gate de release) |
| **SEC-P01** (Pentest/dinâmico) | **Achados 100% por revisão estática.** Faltou verificação dinâmica: `get_advisors` (security lint do Supabase), confirmação de que RLS está *enabled* em todas as tabelas, checagem de que nenhum `service_role` está no bundle client, e teste de fluxo de auth. DBT-S07 pede "lint de policies" mas não foi executado. | Estático não pega policy desabilitada, RLS off, ou vazamento de chave em runtime. | **Média-alta** | **P1** |
| **OBS-A01** (Observabilidade/Auditoria) | **Sem monitoramento de erros nem trilha de auditoria.** Não há Sentry/log estruturado; e — crítico pós-DBT-S01 — **nenhuma auditoria de mudança de `plan`/`points`**. Depois de mover para RPC, quem/quando promoveu alguém a premium fica sem registro. | Sem audit log, um bypass residual é indetectável; compliance B2B costuma exigir trilha. | **Média** | **P1/P2** |
| **MOD-C01** (Moderação/Abuso) | **Sem moderação server-side nem rate limiting.** Uma cita moderação como trabalho de UX (FE-02), mas não há débito de *backend*: filtro de conteúdo, denúncia persistida, rate limit em `posts`/`award_points`/SafeSpace. Em canal de desabafo há risco de conteúdo de auto-lesão, assédio e spam. | Dever de cuidado (par do FE-19) + anti-abuso. Reforça GOV-L01. | **Média** | **P1** |
| **BKP-D01** (Backup/DR) | **Sem menção a backup/PITR/retenção** do banco que passará a guardar dado sensível. | Perder desabafos de saúde é dano reputacional; e há obrigação de disponibilidade/retenção. | **Baixa-média** | **P2** |

**Menores (registrar, não bloqueiam):** sem `npm audit`/varredura de dependências (SYS-16 cobre só idade, não CVE); sem verificação de contraste WCAG AA como teste automatizado (axe/Lighthouse CI) para dar objetividade a FE-04.

---

### Riscos Cruzados

| Risco | Áreas Afetadas | Mitigação |
|-------|----------------|-----------|
| **Fix do FE-02 gera passivo LGPD** — persistir "desabafo anônimo" com `user_id` transforma-o em dado sensível reidentificável no exato commit da correção. | FE-02, FE-07, GOV-L01, DBT-N01, Bloco 6 (Dara) | Desenhar o modelo de dados do SafeSpace **desacoplando autor de conteúdo** (ou consentimento + base legal explícitos) **antes** de habilitar persistência. Definir anonimização real na RLS/RPC (Dara já sinalizou "anonimização real"). Interim da Uma (botão "em breve"/desabilitado enquanto não há backend honesto) **é a mitigação certa** — não persistir nada até o modelo LGPD estar pronto. |
| **DBT-S01 é coerente, mas o endurecimento de `plan` quebra a ativação premium atual** — Premium é ativado **manualmente** (SYS-02/FE-18, sem webhook). Após `REVOKE UPDATE`/trigger de `plan`, qual caminho legítimo seta `plan='premium'`? | DBT-S01, SYS-02, FE-18, DBT-S02 | A proposta da Dara (a+c+trigger) é **tecnicamente completa e correta**, mas precisa incluir **um caminho admin/RPC sancionado para upgrade de plano** no mesmo lote, senão o Bloco 2 derruba a (manual) ativação premium. Adicionar `set_user_plan(...)` DEFINER restrita a admin ou amarrar ao webhook do FE-18. |
| **P0 de segurança arrasta refactor XG** — mover `saveUser().update({points})` para RPC (Bloco 1, Fase A) toca o god-context `AuthContext` (SYS-07, XG). O caminho crítico do fix crítico depende de um refactor grande. | DBT-S01, SYS-03, SYS-04, SYS-07, DBT-D04 | Tornar explícito na Fase 8 que a **Fase A cliente** exige recorte cirúrgico do AuthContext (extrair só a escrita de pontos), **sem** exigir o refactor completo do SYS-07 como pré-condição — desacoplar para não inflar o P0. |
| **Falsa sensação de segurança via route guard** — FE-11 (guard central) é melhoria de UX/consistência, **não** controle de segurança (client é bypassável). | FE-11, DBT-S01, SYS-05/07 | Documentar que o controle real é **server-side (RLS/RPC)**; FE-11 não substitui e não deve ser contabilizado como mitigação de DBT-S01. Ambas as revisões chegam perto — QA reforça explicitamente. |
| **Reconciliação one-shot de pontos (Q6) como vetor de inflação** — creditar `localStorage > DB` via `award_points` antes de S02 estar fechado permite inflar. | DBT-D04, DBT-S02, SYS-04 | Dara já flagou: `award_points` **endurecido (S02) antes** de expor a reconciliação. QA confirma como ordem obrigatória e como caso de teste (abaixo). |
| **DBT-S07 declarado mas não executado** — o "lint de policies" que fecharia a governança RLS ficou como recomendação, não como varredura entregue/aprovada. | DBT-S07, SEC-P01 | Rodar `get_advisors(security)` + inventário RLS enabled/policies como *artefato* antes de fechar Fase 8. |

**Confirmação pedida no briefing:** a proposta de RPCs server-side da Dara para DBT-S01↔SYS-03/04 é **coerente e, na dimensão de dados, completa** — o sequenciamento Fase A (cliente) → Fase B (migração) evita corretamente a regressão. A única incompletude é organizacional/cross-team: o caminho de *upgrade de plano* pós-endurecimento (risco 2 acima) e o corte do AuthContext (risco 3).

---

### Dependências Validadas

**Veredito: a ordenação de cada especialista é internamente sólida; o conjunto tem 2 pontos de fricção cross-team que a Fase 8 precisa costurar.**

Coerência confirmada:
- **Dara Bloco 1 (RPCs) → Bloco 2 (RLS hardening)** — correto e inegociável; endurecer RLS antes de mover escritas para RPC quebra produção. ✅
- **Uma "backend-first"** para FE-02/FE-03 casa com o fato de que persistência é pré-requisito. ✅
- **Uma FE-12 (governar componentes) → FE-01 (tema) → FE-02/03 (dados)** minimiza retrabalho; a11y Layout-first em paralelo. Sequência sã. ✅

Fricções de sequenciamento a resolver (Fase 8):
1. **UX U0 quer persistência cedo; DB agenda persistência tarde.** FE-02 (SafeSpace) e FE-03 (mock→real) são U0 para a Uma (confiança/adesão), mas o backend que os alimenta é o **Bloco 6 (DBT-N01, último)** no plano da Dara, e o SafeSpace nem tem tabela/RPC ainda. **Conflito real.** Mitigação: **puxar o backend de persistência do SafeSpace/social para frente** (par com o Bloco 1), OU aceitar o interim honesto da Uma ("em breve"/estado vazio) até o backend existir. Recomendo: backend do SafeSpace sobe **junto do Bloco 1** (é o mesmo padrão `personality_notes` já validado) **e já com o modelo LGPD do GOV-L01** — assim FE-02 não vira descartável nem passivo legal.
2. **P0 de segurança depende de recorte do AuthContext (SYS-07 XG).** Ver risco cruzado 3 — sequenciar como extração cirúrgica, não refactor completo.

Sem essas duas costuras, DB e UX podem seguir em paralelo. Não há mais bloqueios mútuos.

---

### Testes Requeridos

Priorizados. **Gate de release inegociável: a suíte de segurança RLS/RPC (bloco 1) deve estar verde antes de QUALQUER migração dos Blocos 1–2 tocar produção** — DBT-S01 é vulnerabilidade ativa.

**1. Segurança / Impersonação (`test-as-user`) — P0, gate de release:**
- **Negativos (devem FALHAR/no-op para usuário comum autenticado):**
  - `UPDATE profiles SET plan='premium'` → 403/rejeitado.
  - `UPDATE profiles SET points=999999` → rejeitado.
  - `UPDATE user_challenge_progress/user_stage_progress SET completed_at=now()` direto → rejeitado (DBT-S03).
  - `UPDATE psi_weeks SET status='completed', unlocked_at=now()` (destrancar tudo) → rejeitado (DBT-S06).
  - `UPDATE psi_projects SET status=...` para burlar "1 PSI ativo" → rejeitado.
  - `award_points(_amount = 999999)` e `_amount` negativo → rejeitado/clampado (DBT-S02).
  - Reconciliação de pontos chamada 2×/replay → creditada só 1× (flag `points_reconciled`).
- **Positivos (regressão — devem CONTINUAR funcionando):**
  - `UPDATE profiles SET display_name/avatar_url` do próprio usuário → OK.
  - Ganho de ponto legítimo via `complete_user_challenge` → OK, valor derivado de `stage_challenges.points`.
  - **Upgrade de plano pelo caminho admin/RPC sancionado** → OK (valida o risco cruzado 2).
  - Conclusão sequencial legítima de tarefa PSI via `complete_psi_task` → OK; pular etapa → bloqueado.

**2. Migrações / Integridade — P1, antes de aplicar em prod:**
- Rodar a query de detecção de órfãos da Dara (3 tabelas) em cópia/branch; validar caminho `NOT VALID → limpar → VALIDATE`.
- Idempotência de seed: reaplicar migração de `stages`/`stage_challenges` → sem duplicação (DBT-M02).
- Paridade `bootstrap_full_schema.sql` × soma das migrations (DBT-M03).
- CHECK `points >= 0` rejeita valor negativo (DBT-D05).

**3. E2E de negócio — P1:**
- Paywall: usuário free **não** acessa recurso premium ponta a ponta (fecha o loop do DBT-S01 na camada de produto).
- SafeSpace: post sobrevive ao refresh, aparece anonimizado, e **`select user_id` via API não reidentifica autor** (teste conjunto com GOV-L01).
- Premium: ativação → status refletido no app (FE-18).

**4. Segurança dinâmica / LGPD — P1:**
- `get_advisors(type=security)` sem findings críticos; confirmar RLS *enabled* em todas as tabelas (SEC-P01/DBT-S07).
- Verificar ausência de `service_role` no bundle client; rotação da publishable key aplicada (DBT-S04).
- Teste de reidentificação: nenhum endpoint expõe autoria de conteúdo marcado anônimo (GOV-L01).
- Teste de expurgo: fluxo de apagamento de dado do usuário remove/anonimiza desabafos (direito ao apagamento).

**5. Acessibilidade — P1/P2:**
- axe-core/Lighthouse CI nas 15 páginas sem atributos (objetiva o FE-04); verificar `prefers-reduced-motion` desliga animações (FE-20); contraste AA do `--muted-foreground`/neon.

**6. Gate de CI (habilitador de tudo) — P1:**
- Pipeline rodando `typecheck` + `lint` + `test` bloqueando merge (hoje inexistente; endereça SYS-09/SYS-10 na dimensão de processo). Sem CI, nenhuma das suítes acima é garantida ao longo do tempo.

---

### Parecer Final

**Qualidade do assessment: alta.** A consolidação da Fase 4 é exemplar em rastreabilidade (nenhum ID fundido, cross-references explícitos, reclassificação do `.env` bem justificada). A Fase 5 agrega valor de primeira linha: a **correção de que `WITH CHECK` omitido é no-op e que o fix do DBT-S01 é column-level/RPC** salva a Fase 8 de desenhar uma migração que daria falsa sensação de correção — esse único achado justifica todo o gate. O DBT-S06 (PSI sem gating, pior que S03) e a varredura sistêmica (S07) mostram profundidade real. A Fase 6 traz o olhar de domínio que faltava: FE-19 (rede de crise) e a sequência FE-12→FE-01 anti-retrabalho são maduras.

**Por que NEEDS WORK e não APPROVED:** três omissões que, no contexto de um produto de **saúde mental vendido a empresas**, deixam de ser "nice to have":

1. **LGPD/dado sensível (GOV-L01)** — a correção do FE-02 *cria* dado sensível de saúde; fechar o assessment sem base legal, anonimização real vs. pseudonimização, retenção e apagamento é subestimar exposição jurídica do contratante e do produto. É P0 e deve **preceder** o deploy do FE-02.
2. **Estratégia de teste da vulnerabilidade ativa (QA-T01)** — corrigir DBT-S01/S02/S03/S06 sem suíte de impersonação e sem gate de CI é entregar segurança sem prova. Definir o test design **antes** da Fase 8.
3. **Observabilidade/auditoria + moderação (OBS-A01/MOD-C01)** — trilha de mudança de `plan`/`points` e moderação de conteúdo sensível fecham o loop de dever de cuidado e compliance.

**O que fazer para virar APPROVED (escopo enxuto, ~1 rodada):**
- Adicionar os 4–6 débitos de gap (GOV-L01, QA-T01, SEC-P01, OBS-A01, MOD-C01, BKP-D01) à matriz, com esforço/prioridade — trabalho de consolidação, não de re-análise.
- Costurar as 2 fricções cross-team (persistência SafeSpace puxada para frente + caminho admin de upgrade de plano) no sequenciamento da Fase 8.
- Registrar a suíte de testes de segurança/LGPD como **gate de release** dos Blocos 1–2.

Feito isso, o assessment está pronto para a consolidação final. O núcleo técnico já passou no meu crivo; o que falta é blindar o *domínio* (saúde/LGPD) e a *prova* (testes) — exatamente onde um produto de saúde emocional não pode ter débito silencioso.

---
*Revisão produzida por Quinn (@qa) — Fase 7 Brownfield Discovery. Gate advisory: NEEDS WORK (adições de governança, não retrabalho do núcleo). Nenhum débito inventado — todos os gaps rastreiam a evidência já documentada nas Fases 1–6 e ao domínio do produto. Autoridade QA respeitada: este documento não altera código-fonte nem os débitos existentes; propõe adições para deliberação da Fase 8 (@architect).*
