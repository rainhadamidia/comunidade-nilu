# Comunidade Nilu — ILUMINNARE

Plataforma de mapeamento comportamental (autoconhecimento) da ILUMINNARE: o usuário responde uma autoavaliação e recebe um relatório em PDF por e-mail, com conteúdo tratado conforme a LGPD.

## Sobre este projeto

Este repositório é o resultado da migração técnica completa da plataforma, que originalmente rodava sobre uma base no-code (Lovable). A migração portou o produto para uma infraestrutura própria — com banco de dados dedicado, políticas de acesso (RLS) e deploy contínuo — **sem interrupção de atendimento aos usuários ativos (zero downtime)**.

**Responsável técnica:** Emily Susan da Silva — Arquiteta de Soluções em IA & Fullstack Developer
[linkedin.com/in/rainhadamidia](https://linkedin.com/in/rainhadamidia) · [rainhadamidia.online](https://rainhadamidia.online)

## Stack técnico

- **Frontend:** Vite, React, TypeScript, shadcn-ui, Tailwind CSS
- **Backend / dados:** Supabase (PostgreSQL, Row Level Security), funções serverless (Vercel)
- **E-mail transacional:** Resend (envio do relatório em PDF)
- **Testes:** Vitest
- **Deploy:** Vercel

## Organização do projeto

O repositório segue documentação estruturada em `docs/`:

- `docs/prd` — requisitos e escopo do produto
- `docs/architecture` — decisões e desenho técnico
- `docs/stories` — histórico de desenvolvimento incremental
- `docs/testing` / `docs/reviews` — evidências de qualidade

## Por que a migração aconteceu

A base no-code original limitava governança de dados e escalabilidade. A migração eliminou essa dependência, trazendo:

- Banco de dados dedicado com controle de acesso por linha (RLS)
- Código versionado e testável, em vez de configuração de plataforma
- Conformidade com LGPD no tratamento dos dados de autoavaliação

---

*Projeto real, de cliente, migrado e mantido em produção. Desenvolvimento posteriormente pausado por decisão orçamentária do cliente — não por questão técnica.*
