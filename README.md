# Painel de Acompanhamento Infantil

Aplicação full-stack para acompanhamento de crianças em situação de vulnerabilidade, com foco em leitura rápida de alertas, revisão de casos e experiência simples para técnicos.

## Objetivo

O projeto foi estruturado para atender um desafio técnico com uma solução prática, reproduzível e fácil de evoluir. A prioridade foi manter a base enxuta no início, mas com decisões consistentes para crescer sem retrabalho.

## Stack escolhida

### Backend
- Node.js
- TypeScript
- Fastify 5
- `pg` para PostgreSQL
- Zod para validação
- `@fastify/cors` para integração com o frontend
- `@fastify/jwt` reservado para autenticação

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Banco de dados
- PostgreSQL 16

### Infraestrutura
- Docker
- Docker Compose

## Decisões tomadas

### 1. Node.js + TypeScript + Fastify no backend
A escolha foi feita por produtividade, tipagem forte e simplicidade para criar uma API organizada. Fastify oferece boa performance e uma estrutura limpa para rotas, plugins e validação.

### 2. Next.js no frontend
O Next.js foi escolhido por permitir uma base moderna, com App Router, facilidade para compor telas e possibilidade de crescer para SSR, proteção de rotas e integração com a API.

### 3. PostgreSQL em vez de SQLite
O PostgreSQL foi escolhido para deixar a solução mais alinhada com um cenário real de produção, além de facilitar conexão externa via DBeaver e futuras evoluções do projeto.

### 4. Docker desde cedo
A aplicação foi dockerizada para garantir reprodutibilidade do ambiente, facilitar avaliação e permitir subir frontend, backend e banco com um único comando.

### 5. Seed oficial em `data/seed.json`
Os dados iniciais ficam centralizados em um arquivo único, versionado no repositório, e carregados automaticamente no banco quando ele sobe vazio.

### 6. Estrutura por camadas no backend
A estrutura foi organizada para separar responsabilidades:
- `routes`
- `controllers`
- `services`
- `repositories`
- `db`
- `schemas`
- `types`

Isso facilita manutenção e implementação de regras de negócio depois.

## Estrutura do projeto

### Backend
- `src/app.ts` — criação do servidor Fastify
- `src/server.ts` — bootstrap da aplicação
- `src/config/env.ts` — variáveis de ambiente
- `src/db/` — conexão, schema e seed
- `src/repositories/` — acesso ao banco
- `src/types/` — tipos de domínio

### Frontend
- `app/` — páginas do Next.js
- `components/` — componentes reutilizáveis
- `hooks/` — hooks customizados
- `services/` — integração com a API
- `lib/` — utilitários

### Infra
- `docker-compose.yml` — sobe PostgreSQL, backend e frontend
- `.dockerignore` — reduz contexto de build
- `.gitignore` — evita versionar dependências, build e arquivos de ambiente

## Banco de dados

### Tabela atual
Por enquanto, a tabela principal é `children`, suficiente para iniciar o fluxo do desafio.

Ela contém dados de:
- identificação da criança
- responsável
- bairro
- dados de saúde
- dados de Educacao
- dados de assistência social
- status de revisão

### Campos de revisão
A tabela já contempla:
- `revisado`
- `revisado_por`
- `revisado_em`

Isso permite marcar um caso como revisado sem precisar de uma tabela extra neste momento.

## Acesso ao banco com DBeaver

Com a stack em execução, o Postgres fica exposto na porta `5432`.

### Dados de conexão
- Host: `localhost`
- Porta: `5432`
- Banco: `painel`
- Usuário: `postgres`
- Senha: `postgres`

### Observação
Se o banco estiver rodando via Docker Compose, o acesso externo funciona normalmente porque a porta está publicada no `docker-compose.yml`.

## Variáveis de ambiente

### Backend
Arquivo: `backend/.env.example`

- `PORT=3333`
- `HOST=0.0.0.0`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/painel`

### Raiz do projeto
Arquivo: `.env.example`

- `POSTGRES_DB=painel`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_PORT=5432`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/painel`

## Como executar

### Com Docker
1. Subir a stack (modo desenvolvimento):
   - `docker compose up -d --build`
2. Acessar:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3333`
   - Postgres: `localhost:5432`
3. Desenvolvimento contínuo:
   - As alterações em `frontend/` e `backend/` refletem automaticamente (hot reload/watch)
   - Não é necessário usar `docker compose down` a cada mudança de código

### Observação importante (VS Code e tipagem)
- O `docker-compose.yml` está configurado para instalar dependências automaticamente no startup (`npm ci`) e montar `node_modules` no host.
- Isso evita erros locais de tipagem/import no editor após subir o projeto do zero em uma máquina nova.
- Se atualizar dependências (`package.json`), rode novamente:
  - `docker compose up -d --build`

### Sem Docker
#### Backend
1. Entrar na pasta do backend
2. Instalar dependências
3. Definir `DATABASE_URL`
4. Executar o seed e iniciar a API

#### Frontend
1. Entrar na pasta do frontend
2. Instalar dependências
3. Definir `NEXT_PUBLIC_API_URL=http://localhost:3333`
4. Rodar o projeto em desenvolvimento

## Scripts principais

### Backend
- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build TypeScript
- `npm run start` — inicia o build compilado
- `npm run seed` — executa o seed do banco
- `npm run db:seed` — executa o seed do banco

### Frontend
- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build do Next.js
- `npm run start` — inicia o frontend compilado
- `npm run lint` — checagem de lint

## Design e Acessibilidade (WCAG 2.1)

Um dos pilares deste projeto foi garantir que as informacoes criticas de saude e educacao fossem acessiveis a todos os gestores. Por isso, a interface foi ajustada para seguir WCAG 2.1 nivel AA como requisito tecnico de produto, e nao como acabamento visual.

### Decisoes de contraste

A paleta original foi otimizada para garantir que nenhum elemento textual ou informativo ficasse com contraste inferior a 4.5:1 em relacao ao fundo.

- Tipografia e hierarquia: tons de cinza claro foram substituidos por `#525F6A` (5.4:1), melhorando leitura de metas, subtitulos e legendas.
- Identidade visual: o azul oficial foi consolidado em `#004A8D` para titulos, KPIs e elementos de destaque, com contraste de 10.5:1 sobre branco.
- Feedback visual: cores semanticas de alerta e sucesso foram calibradas para manter legibilidade e significado funcional (`#C53030` e `#276749`, ambas > 5:1).

### Tabela de cores utilizada

| Elemento | Hex | Contraste | Objetivo |
|---|---|---|---|
| Primaria | `#004A8D` | 10.5:1 | Titulos e numeros principais (KPIs) |
| Secundaria | `#525F6A` | 5.4:1 | Subtitulos e informacoes de apoio (metas) |
| Alerta | `#C53030` | 5.3:1 | Destaque de areas criticas e notificacoes |
| Sucesso | `#276749` | 5.1:1 | Indicadores de progresso e metas atingidas |
| Background neutro | `#F8F9FA` | N/A | Fundo de cards para separar blocos de informacao |

### Componentes inclusivos

- Barra de progresso: trilho ajustado para `#E2E8F0` e preenchimento em `#004A8D` para reforcar a percepcao de progresso total x atual.
- Tipografia de dados densos: rotulos de bairros usam `font-weight: 600` e cor `#2D3748` para facilitar escaneamento visual.

## Estado atual

### Já implementado
- autenticação via JWT
- endpoints de resumo, listagem, detalhe e revisão
- dashboard, login, listagem e detalhe no frontend
- integração com PostgreSQL e seed inicial
- Docker com frontend, backend e banco
- hot reload em frontend e backend via Docker
- acesso externo ao banco para DBeaver

### Próximos passos
- testes automatizados (backend, frontend e e2e)
- refinamento final de UI/UX
- preparação de ambiente de entrega (compose de produção separado)

## Convenções adotadas

- Código em TypeScript
- Comunicação em português no contexto do projeto
- Arquitetura separada por responsabilidades
- Decisões pragmáticas antes de excesso de abstração
- Foco em entrega funcional antes de sofisticação desnecessária

