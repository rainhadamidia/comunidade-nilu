# Guia da Suíte de Impersonação (`test-as-user`)

> Story 1.1 do Epic 01 — habilitador de todo o resto do Lote 1/2 (RPCs de segurança, RLS). Os casos de teste **reais** de segurança (negativos/positivos de `DBT-S01/S02/S03/S06`) são adicionados nas Stories 2 a 5, não aqui.

## O que é

Um conjunto de testes que autentica no Supabase como um **usuário comum não-admin** (nunca `service_role`) e roda contra o banco real de desenvolvimento, para provar que RLS/RPCs se comportam como esperado sob a perspectiva de um usuário autenticado de verdade — não um mock.

## Como criar o usuário de teste

1. No painel do Supabase (ambiente de dev/staging, **nunca produção**), crie um usuário comum via Authentication → Users → Add user (email + senha).
2. Confirme que o usuário **não** tem a role `admin` na tabela `user_roles` (deve ficar com o papel padrão `user`).
3. Guarde o email/senha — eles vão virar as variáveis de ambiente abaixo.

## Configuração local

1. Copie `.env.example` para `.env` (se ainda não tiver um `.env` local).
2. Preencha `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` com as credenciais do usuário de teste criado acima.
3. Exporte essas duas variáveis no seu shell antes de rodar os testes (o projeto não usa `dotenv`/carregamento automático de `.env` para variáveis sem prefixo `VITE_`):

   ```bash
   export TEST_USER_EMAIL="seu-usuario-de-teste@exemplo.com"
   export TEST_USER_PASSWORD="sua-senha-de-teste"
   npm run test
   ```

   No Windows (PowerShell):

   ```powershell
   $env:TEST_USER_EMAIL = "seu-usuario-de-teste@exemplo.com"
   $env:TEST_USER_PASSWORD = "sua-senha-de-teste"
   npm run test
   ```

4. **Nunca commitar** essas credenciais em `.env` (já ignorado pelo git) nem em nenhum arquivo versionado.

## Comportamento sem credenciais configuradas

Se `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` não estiverem definidas, os testes desta suíte são **pulados** (`describe.skipIf`), não falham — isso permite rodar `npm run test` normalmente em qualquer máquina sem quebrar o restante da suíte.

## Como roda no CI

O workflow `.github/workflows/ci.yml` injeta `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` a partir de **GitHub Actions Secrets** (Settings → Secrets and variables → Actions) no step de teste. Configure esses 2 secrets no repositório para que a suíte rode de verdade no CI em vez de ser pulada.

## Onde ficam os testes

- `src/test/security/test-as-user.setup.ts` — helper de autenticação, reusar em todos os testes desta suíte.
- `src/test/security/*.test.ts` — cada arquivo de teste de segurança (as Stories 2-5 adicionam os casos reais aqui).

## Regras

- **Nunca** usar `service_role` nesta suíte — o objetivo é simular exatamente o que um usuário comum autenticado consegue/não consegue fazer.
- Cada RPC/tabela crítica nova (Stories 2-5) deve ter pelo menos 1 teste negativo (ação que deve ser bloqueada) e 1 positivo (ação legítima que deve continuar funcionando) — ver a lista completa na seção "Suíte de testes" de `docs/prd/technical-debt-assessment.md`.
