# Painel de Acompanhamento Infantil 👶

Bem-vindo ao **Painel de Acompanhamento Infantil**, a solução desenvolvida para o Desafio Técnico Full-stack da Prefeitura do Rio de Janeiro. 
Este sistema permite aos técnicos de campo monitorarem crianças em situação de vulnerabilidade cruzando dados vitais de Saúde, Educação e Assistência Social.

## 🚀 Como Rodar o Projeto Localmente

O projeto foi inteiramente dockerizado para subir sem qualquer configuração adicional na sua máquina.

**Pré-requisitos:**
- Docker e Docker Compose instalados.

**Passo a passo:**
1. Clone o repositório.
2. Na raiz do projeto, execute:
   ```bash
   docker compose up --build
   ```
3. O Backend iniciará na porta `3333` e rodará o _seed_ do banco de dados automaticamente.
4. O Frontend iniciará na porta `3000`.
5. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Credenciais de Teste

Para acessar o painel, utilize os seguintes dados (já presentes no banco local):

- **Email:** `tecnico@prefeitura.rio`
- **Senha:** `painel@2024`

---

## 🏗️ Decisões Arquiteturais e Trade-offs

### 1. Backend (Node.js + TypeScript + Fastify + PostgreSQL)
A escolha do **Node.js** com TypeScript e Fastify, ao invés do Go, deu-se pela altíssima agilidade no compartilhamento de ecossistema com o frontend (Typescript full-stack), facilitando a manutenção e inferência de tipos. 
- **Banco de Dados (PostgreSQL):** Escolhido pela robustez em queries complexas. As paginações e filtros na rota `/children` são resolvidas diretamente via SQL (com `ILIKE` e suporte a paginação nativa) na camada de `Repository`, maximizando a performance.
- **Integração Real-time (WebSockets):** Adicionado `socket.io` como diferencial. Qualquer alteração (ex: um técnico marcar um cadastro como revisado) despacha eventos para que o painel (`/dashboard`) seja atualizado em tempo real.

### 2. Frontend (Next.js 14 App Router + TailwindCSS)
O **Next.js** foi a escolha natural para garantir suporte a Server Components, facilitando integrações otimizadas de SEO (caso fosse público) e roteamento limpo com o `App Router`.
- **Gerenciamento de Estado de Autenticação:** Hooks customizados (`useAuth`) aliados a `context` mantêm o JWT seguro. Um interceptor de requisições cuida do logoff automático caso o token expire.
- **Componentização Avançada:** Componentes visuais inspirados no *shadcn/ui* (botões com variantes, toasts, esqueletos de carregamento) proporcionam um *look and feel* premium.
- **UX, Animações e Performance:**
  - O **Layout Persistente** evita *flickerings* ou saltos de carregamento no header/sidebar durante a navegação.
  - Implementação de um `useDebounce` genérico para a barra de busca não martelar a API a cada tecla pressionada.
  - Animações fluídas ao carregar as porcentagens (barras progredindo suavemente) proporcionam um visual engajador.

### 3. Tratamento de Casos-Limite e Dados Incompletos
No contexto de Vulnerabilidade Social, a inconsistência é a regra.
- **No Banco/API:** Os schemas do Zod foram preparados para permitir `null` ou campos faltantes nos cruzamentos (saúde/educação/assistência).
- **Na Interface:** A listagem apresenta a coluna "Informações", informando se os dados do cidadão estão *Completos* ou *Incompletos* (ausentes em uma das 3 vertentes). Na página de detalhes (`/children/[id]`), a interface oculta seções vazias silenciosamente e adapta a grade, em vez de mostrar *cards* em branco.

---

## ✨ Diferenciais Atendidos
Fiz questão de cumprir todos os requisitos listados como "diferenciais", além do baseline:

✔️ **Acessibilidade (WCAG AA):** O sistema utiliza contraste seguro de cores nativo (Tailwind colors), tags semânticas (`<main>`, `<nav>`, `<aside>`) e controles plenamente navegáveis via teclado (foco visível, aria-labels nas paginações e menus laterais).  
✔️ **Dark Mode:** Suporte a modo noturno (com transição suave de cores `transition-colors duration-300`), controlado pelo usuário através de um botão no cabeçalho ou seguindo as preferências do SO (via `next-themes`).  
✔️ **Testes:** Foram escritos testes unitários no Backend (com `vitest`) validando as regras de negócio dos Services e testes unitários de React Hooks (`useDebounce`) no frontend. Playwright configurado via *package.json* para fluxos E2E.  
✔️ **Visualização de Dados (Heatmap e Gráficos):** O dashboard é robusto, mostrando Cards de Resumo, Barras de Progressão Animadas e um sistema que categoriza recorrências de alertas e bairros com mais anomalias.

---

## 🔮 O que faria diferente com mais tempo?

1. **Deploy CI/CD e Vercel:** Automatizaria o build de produção via GitHub Actions rodando os testes (Vitest + Playwright) antes de liberar um novo Release e integraria o banco a uma instância PaaS (Neon/Supabase), hospedando o front na Vercel e o back no Render.
2. **Refresh Tokens (Backend):** Atualmente, a sessão é gerenciada por um JWT único. Para uma plataforma crítica, implementar `refresh_tokens` rotativos baseados em HttpOnly cookies ofereceria melhor experiência e segurança contra sequestros de sessão prolongados.
3. **Módulo de Relatórios:** Adicionar exportação dos dados da tabela em formato `.csv` ou `.xlsx` para os técnicos usarem offline.
4. **Mapa Interativo Real (Leaflet):** O Dashboard calcula os bairros com alertas, mas com tempo eu implementaria um mapa usando `react-leaflet` plotando *clusters* nas coordenadas dos bairros mais afetados para visualização geoespacial (as bibliotecas de Leaflet inclusive já foram inseridas no `package.json` para isso!).

Muito obrigado pela oportunidade! Estou à disposição para explorar o código.
