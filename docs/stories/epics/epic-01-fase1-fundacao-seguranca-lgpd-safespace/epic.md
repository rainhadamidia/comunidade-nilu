# Epic 01: Fundação de Segurança + LGPD + SafeSpace Real — Brownfield Enhancement

> **Origem:** AIOX Brownfield Discovery — FASE 10 (@pm)
> **Insumos:** `docs/prd/technical-debt-assessment.md` (FASE 8, @architect) e `docs/reports/TECHNICAL-DEBT-REPORT.md` (FASE 9, @analyst)
> **Produto:** ILUMINNARE — SaaS de saúde emocional corporativa (B2B)
> **App:** `comunidade-nilu` (React + Vite + TypeScript + shadcn-ui + Tailwind + Supabase)
> **Status:** Ready — validado por Pax (@po) em 2026-07-04 (CONDITIONAL GO). Ver Change Log.
> **Responsável:** Morgan (@pm)

---

## Escopo desta Epic

Esta epic cobre **apenas a Fase 1 de negócio** (Lotes técnicos 0, 1 e 2), conforme aprovação recomendada no `TECHNICAL-DEBT-REPORT.md` (Próximo Passo 1: "Aprovar a Fase 1 — R$ 15-20 mil, 3-4 semanas — decisão desta semana"). As Fases 2 (Lotes 3-4) e 3 (Lotes 5-6) **não** estão incluídas aqui — serão novas epics, orçadas separadamente após esta fase estar em produção.

**Por que só a Fase 1:** é o menor cheque que remove o maior risco — os 3 débitos formalmente críticos (DBT-S01, FE-02, GOV-L01) mais o gate de CI/testes (QA-T01) que os mantém corrigidos. Sem CI e sem o resequenciamento (RPC→RLS, LGPD→persistência), qualquer tentativa de corrigir isoladamente quebra produção ou cria passivo jurídico — ver ADR-08.1 e ADR-08.2 no assessment.

## Epic Goal

Eliminar os 3 débitos críticos do ILUMINNARE (bypass de segurança via banco, SafeSpace que finge persistir, ausência de modelo LGPD para dado sensível de saúde) sem quebrar a operação existente (premium manual, gamificação, PSI), estabelecendo um gate de CI que sustente essa garantia no tempo.

## Epic Description

**Existing System Context:**

- Funcionalidade relevante atual: gamificação com pontos/gating (client-side e via algumas RPCs), trilhas PSI, SafeSpace ("desabafo anônimo" hoje só em `useState`, não persiste), ativação manual de plano premium.
- Stack: React + Vite + TypeScript + shadcn-ui + Tailwind + Supabase (Postgres + RLS + RPC).
- Pontos de integração: `AuthContext` (488 LOC, escreve pontos direto via `.update()`), tabelas `profiles`/`user_*_progress`/`psi_*` com RLS permissiva hoje, ausência total de CI (`typecheck`/`lint`/`test`).

**Enhancement Details:**

- O que está sendo adicionado/alterado: RPCs `SECURITY DEFINER` para pontos e progresso PSI; endurecimento de RLS/coluna em `profiles`; RPC `set_user_plan` para upgrade de plano por admin; tabela + RPC de SafeSpace com modelo LGPD (autor desacoplado do conteúdo); pipeline de CI com suíte de impersonação.
- Como integra: segue o padrão já validado em `personality_notes` (migração `useState`→DB); RPCs coexistem com o client atual até o corte final de RLS (Lote 2), evitando downtime.
- Critério de sucesso: 0 findings críticos em `get_advisors(security)`; auto-promoção a premium e forja de pontos/gating impossíveis para usuário comum; SafeSpace persiste e não reidentifica autor; CI verde bloqueando merge.

---

## Stories

> Ordem de execução é **sequencial por dependência de lote** (não apenas por prioridade) — ver "Plano de Resolução" do assessment. Lote 1 só pode subir depois do Lote 0; Lote 2 só depois do Lote 1 **em produção**.

### Story 1 — Lote 0: CI Gate + Modelo LGPD (design) + Interim Honesto do SafeSpace

> **Atualização do @sm:** elaborada como 3 stories independentes entre si (mesmo executor≠quality_gate por story): `docs/stories/1.1.ci-gate-pipeline-test-as-user.md` (@devops), `docs/stories/1.2.safespace-lgpd-data-model-design.md` (@data-engineer), `docs/stories/1.3.safespace-interim-honesto.md` (@dev). As 3 juntas cobrem o escopo abaixo; todas devem estar `Done` antes da Story 2 começar.

- **Descrição:** Remover `.env` do git e rotacionar chave pública (DBT-S04/SYS-01); montar pipeline de CI (`typecheck`+`lint`+`test` bloqueando merge) e esqueleto da suíte de impersonação `test-as-user` (QA-T01 setup); desenhar o modelo de dados LGPD do SafeSpace — autor desacoplado do conteúdo, base legal/consentimento, retenção/expurgo, direito ao apagamento (GOV-L01, design apenas — sem código de persistência ainda); trocar o botão do SafeSpace para "em breve"/desabilitado até o backend real subir.
- **Executor Assignment:** `executor: @devops` (CI) + `executor: @data-engineer` (modelo LGPD) — story combinada, dividir em substeps por executor. `quality_gate: @architect`
- **Quality Gate Tools:** `[ci_pipeline_validation, lgpd_model_review, ux_interim_check]`
- **Esforço:** ~10-18h
- **Gate:** bloqueia toda a Story 2/3 (nenhuma persistência sem modelo LGPD pronto).
- **Débitos endereçados:** DBT-S04, SYS-01, QA-T01 (setup), GOV-L01 (design).

### Story 2 — Lote 1a: RPCs de Pontos e Gating Server-Side

- **Descrição:** Endurecer `award_points` para derivar valor de `stage_challenges.points` (não aceitar do client) e criar `complete_user_challenge` (DBT-S02/D06); criar `complete_psi_task` e `create_psi_project` transacionais com gating server-side (DBT-S06, absorve DBT-P04).
- **Executor Assignment:** `executor: @data-engineer`, `quality_gate: @dev`
- **Quality Gate Tools:** `[schema_validation, rpc_security_review, rls_test]`
- **Esforço:** ~12-18h
- **Depende de:** Story 1 (CI verde para validar as RPCs via `test-as-user`).
- **Débitos endereçados:** DBT-S02, DBT-D06, DBT-S06, DBT-P04.

### Story 3 — Lote 1b: SafeSpace Persistido sobre Modelo LGPD + Upgrade de Plano Admin

- **Descrição:** Criar tabela + RPC de publicação anônima do SafeSpace **sobre o modelo LGPD desenhado na Story 1** (sem `user_id` reidentificável exposto) — segue padrão `personality_notes` (ADR-08.2); criar `set_user_plan(_user_id, _plan)` `SECURITY DEFINER` restrita a admin (`has_role`) como caminho sancionado de upgrade de plano, no mesmo lote do endurecimento futuro de RLS (ADR-08.1).
- **Executor Assignment:** `executor: @data-engineer`, `quality_gate: @dev`
- **Quality Gate Tools:** `[schema_validation, rls_test, lgpd_reidentification_test]`
- **Esforço:** ~8-14h
- **Depende de:** Story 1 (modelo LGPD pronto).
- **Débitos endereçados:** DBT-N01 (núcleo), FE-02 (backend), GOV-L01 (implementação), ADR-08.1 (`set_user_plan`).

### Story 4 — Lote 1c: Client — Recorte Cirúrgico das Escritas de Pontos

- **Descrição:** Extrair as escritas diretas de pontos do `AuthContext` (`saveUser().update({points})`) e de `MeuProjeto.tsx` para as novas RPCs (Story 2); implementar reconciliação one-shot de `localStorage`→DB, **só habilitada após `award_points` endurecido** (evita vetor de inflação — replay 2× deve creditar 1× via flag `points_reconciled`). Não é o refactor completo do `AuthContext` (isso é uma epic futura, Fase 3/Lote 5) — é só o recorte de escrita de pontos.
- **Executor Assignment:** `executor: @dev`, `quality_gate: @architect`
- **Quality Gate Tools:** `[code_review, regression_test, reconciliation_replay_test]`
- **Esforço:** ~8-16h
- **Depende de:** Story 2 (RPCs precisam existir e estar endurecidas).
- **Débitos endereçados:** SYS-04 (recorte), DBT-D04 (recorte).
- **Gate de saída do Lote 1:** deploy em produção; suíte de impersonação (Story 1) **verde** antes de avançar para a Story 5.

### Story 5 — Lote 2: Endurecimento de RLS em `profiles` + Limpeza de Policies

- **Descrição:** `REVOKE UPDATE ON profiles` + `GRANT UPDATE (display_name, avatar_url)` + trigger que só permite mudança de `plan`/`points` via `set_user_plan`/RPCs (fix real do DBT-S01 — **não** é adicionar `WITH CHECK`, é column-level); `DROP` das policies de UPDATE direto em `user_*_progress` e `psi_weeks`/`psi_tasks`/`psi_projects` (DBT-S03 + parte RLS de S06); rodar `get_advisors(security)` + inventário de RLS *enabled* + confirmar ausência de `service_role` no bundle (DBT-S07 + SEC-P01), entregar como artefato.
- **Executor Assignment:** `executor: @data-engineer`, `quality_gate: @dev`
- **Quality Gate Tools:** `[rls_test, security_advisor_scan, negative_positive_test_suite]`
- **Esforço:** ~10-14h
- **Depende de:** Story 4 (Lote 1 **precisa estar em produção** antes — endurecer RLS antes disso derruba produção).
- **Débitos endereçados:** DBT-S01, DBT-S03, DBT-S06 (parte RLS), DBT-S07, SEC-P01.
- **Gate final:** testes negativos (auto-promoção, forja de pontos/gating) devem falhar/no-op para usuário comum; testes positivos (display_name, upgrade admin via `set_user_plan`, conclusão PSI sequencial) devem continuar OK.

---

## Compatibility Requirements

- [ ] APIs existentes (RPCs já em uso) permanecem funcionando durante a transição Lote 1→2
- [ ] Mudanças de schema são backward compatible até o corte de RLS no Lote 2 (app não pode quebrar entre deploys)
- [ ] Ativação de plano premium permanece possível em todo momento (via `set_user_plan` a partir da Story 3)
- [ ] Nenhuma persistência de dado sensível (SafeSpace) antes do modelo LGPD (Story 1) estar pronto

## Risk Mitigation

- **Risco primário:** endurecer RLS (Story 5) antes do Lote 1 estar em produção derruba a aplicação (client ainda escreveria pontos direto).
  - **Mitigação:** sequenciamento rígido — Story 5 só inicia após deploy confirmado da Story 4 e suíte de impersonação verde.
  - **Rollback:** Lotes são deploys incrementais; Lote 2 pode ser revertido (re-conceder UPDATE) sem afetar dados já migrados no Lote 1.
- **Risco secundário:** fix do SafeSpace (Story 3) cria passivo LGPD se subir antes do modelo de dados.
  - **Mitigação:** Story 3 tem dependência dura da Story 1 (modelo LGPD); interim honesto mantém o botão desabilitado até lá.
- **Risco terciário:** reconciliação de pontos (Story 4) vira vetor de inflação se habilitada antes do `award_points` endurecido.
  - **Mitigação:** ordem obrigatória Story 2 → Story 4; teste de replay 2× obrigatório no QA gate.

## Definition of Done

- [ ] Todas as 5 stories completas com acceptance criteria atendidos
- [ ] Suíte de impersonação (`test-as-user`) verde: negativos bloqueados, positivos OK (ver lista completa em `technical-debt-assessment.md`, seção "Suíte de testes")
- [ ] `get_advisors(security)` sem findings críticos; RLS enabled em 100% das tabelas afetadas
- [ ] SafeSpace persiste, sobrevive a refresh, e teste de reidentificação confirma que autor não é exposto
- [ ] Ativação de plano premium funcional via `set_user_plan`
- [ ] CI (`typecheck`+`lint`+`test`) bloqueando merge, verde
- [ ] Nenhuma regressão nas funcionalidades existentes (gamificação, PSI, premium)

---

## Validation Checklist

**Scope Validation:**
- [x] Escopo definido: Lotes 0-2 (Fase 1 de negócio), Fases 2-3 ficam para epics futuras
- [x] Não requer documentação de arquitetura adicional — já coberta por `system-architecture.md`, `SCHEMA.md`, `DB-AUDIT.md`
- [x] Segue padrão já validado (`personality_notes`) para migração useState→DB
- [ ] Integração com pagamento (webhook, FE-18) **não** está nesta epic — fica para Fase 2

**Risk Assessment:**
- [x] Risco documentado e mitigado via sequenciamento rígido (ADR-08.1, ADR-08.2)
- [x] Rollback plan viável por lote
- [x] Suíte de testes de impersonação como gate obrigatório

**Completeness Check:**
- [x] Epic goal claro e alcançável
- [x] 5 stories com escopo definido, executor/quality_gate atribuídos
- [x] Critérios de sucesso mensuráveis (ver Definition of Done)
- [x] Dependências mapeadas (sequência estrita Story 1→2→3→4→5, com 3 podendo rodar em paralelo com 2)

---

## Handoff — Story Manager (@sm)

"Por favor, desenvolva as user stories detalhadas desta epic brownfield. Considerações-chave:

- Este é um enhancement de segurança/compliance sobre um sistema em produção (`comunidade-nilu`, Supabase).
- Pontos de integração críticos: `AuthContext`, tabelas `profiles`/`user_*_progress`/`psi_*`, RLS policies existentes.
- Padrão existente a seguir: migração `personality_notes` (`useState`→DB) como referência para a Story 3 (SafeSpace).
- Requisito de compatibilidade crítico: **a ordem Story 1→2→3→4→5 não é negociável** — RPCs antes de RLS, modelo LGPD antes de persistência (ver ADR-08.1/08.2 em `docs/prd/technical-debt-assessment.md`).
- Cada story deve incluir verificação de que a funcionalidade existente (gamificação, PSI, premium) permanece intacta.
- A Story 1 (CI + modelo LGPD) é bloqueadora de todo o resto — priorizar seu `*draft` primeiro.

A epic deve manter a integridade do sistema existente entregando os 3 débitos críticos corrigidos (DBT-S01, FE-02, GOV-L01) mais o gate de CI que sustenta essa correção no tempo."

---

## Próximas Epics (fora de escopo aqui — aguardando aprovação)

| Epic futura | Lotes | Esforço estimado | Gatilho |
|---|---|---|---|
| Epic 02 — UX de confiança/acessibilidade/moderação | Lote 3 + Lote 4 | ~125-177h | Após Epic 01 em produção; orçamento aprovado (Próximo Passo 6 do relatório) |
| Epic 03 — Qualidade estrutural + performance/DR/higiene | Lote 5 + Lote 6 | ~130-180h | Após Epic 02; sem pressão de P0 |

---

*Epic produzida por Morgan (@pm) — AIOX Brownfield Discovery, FASE 10. Consolida o assessment técnico (FASE 8) e o relatório executivo (FASE 9) em stories executáveis. Rastreabilidade total preservada (Constituição AIOX, Art. IV): todo débito citado tem ID correspondente em `technical-debt-assessment.md` — nenhum item foi inventado. Próximo passo: `@sm *draft` para elaborar cada story em detalhe.*

---

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-07-04 | Morgan (@pm) | Epic criada — FASE 10 do Brownfield Discovery |
| 2026-07-04 | Pax (@po) | `*validate-story-draft` executado (PO Master Checklist, seções brownfield). Verdict: **CONDITIONAL GO**. Status alterado Draft → Ready. 2 recomendações não bloqueantes registradas para incorporação no `*draft` de cada story: (1) considerar log temporário de tentativas negadas durante a Story 5 (janela de risco do endurecimento de RLS), dado que `OBS-A01` só está previsto para a Epic 02; (2) `@sm` deve detalhar uma linha de "Rollback" própria em cada story (2, 3 e 4), não só no nível da epic. |
