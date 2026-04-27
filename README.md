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

## 🌍 Deploy e Acesso Público

A aplicação está disponível online para avaliação imediata:

- **Frontend (Vercel):** [https://painel-acompanhamento-infantil.vercel.app/](https://painel-acompanhamento-infantil.vercel.app/)
- **Backend (Render):** Infraestrutura escalável em Node.js.
- **Banco de Dados (Supabase):** Escolhido pela robustez do PostgreSQL gerenciado e pela facilidade de monitoramento, garantindo alta disponibilidade e performance para a aplicação em produção.


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
- **Estratégia de Seed:** O arquivo `seed.json` fornecido é processado automaticamente na inicialização do container (via script de seeding). Os dados são sanitizados, validados pelo Zod e inseridos no PostgreSQL, garantindo que o ambiente de teste já suba com os casos-limites perfeitamente mapeados nas tabelas relacionais.
- **Integração Real-time (WebSockets):** Adicionado `socket.io` como diferencial. Qualquer alteração (ex: um técnico marcar um cadastro como revisado) despacha eventos para que o painel (`/dashboard`) seja atualizado em tempo real.

### 2. Frontend (Next.js 14 App Router + TailwindCSS)
O **Next.js** foi a escolha natural para garantir suporte a Server Components, facilitando integrações otimizadas de SEO (caso fosse público) e roteamento limpo com o `App Router`.
- **Gerenciamento de Estado de Autenticação:** Hooks customizados (`useAuth`) aliados a `context` mantêm o JWT seguro (o qual inclui o claim `preferred_username` conforme especificado). Um interceptor de requisições cuida do logoff automático caso o token expire.
- **Componentização Avançada:** Componentes visuais inspirados no *shadcn/ui* (botões com variantes, toasts, esqueletos de carregamento) proporcionam um *look and feel* premium.
- **UX, Animações e Performance:**
  - **Responsividade Extrema (375px a 1440px):** A interface foi construída com abordagem Mobile-First. Telas complexas, como o Dashboard e a Tabela de Crianças, colapsam de forma elegante em telas pequenas (ex: transformando tabelas em listas de cards em resoluções < 768px), garantindo o uso confortável pelo técnico em campo.
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
✔️ **Prontuário Social e Memória Institucional:** Fui além do simples `PATCH /review` (status booleano). Implementei um sistema de registro onde o técnico insere o relato do acompanhamento, criando uma linha do tempo histórica para cada criança, garantindo a continuidade do cuidado na assistência social.
✔️ **Módulo de Relatórios (Bônus):** Construí uma central de relatórios que exporta o Mapa de Risco em PDF (via Puppeteer e Chart.js) e planilhas dinâmicas no formato Excel (via ExcelJS) com formatação condicional automática para alertas de vacinas!
✔️ **Deploy em Produção:** Projeto totalmente publicado e configurado em ambiente Cloud (Vercel + Render + Supabase).

---

## 🧪 Como Executar os Testes

O projeto conta com uma suíte de testes cobrindo as camadas principais.

### 1. Testes do Backend (Unitários)
Utilizamos **Vitest** para garantir a integridade das regras de negócio nos services.
```bash
# Entre na pasta do backend
cd backend
npm run test
```

### 2. Testes do Frontend (Componentes e Hooks)
Utilizamos **Vitest** + **React Testing Library** para validar a lógica da interface.
```bash
# Entre na pasta do frontend
cd frontend
npm run test
```

### 3. Testes E2E (End-to-End)
Utilizamos **Playwright** para simular o fluxo real do usuário (Login, navegação e interações).
*Nota: A aplicação deve estar rodando (`docker compose up`) antes de executar os testes E2E.*
```bash
# Entre na pasta do frontend
cd frontend
# Instale os browsers do playwright (se necessário)
npx playwright install
# Execute os testes
npm run test:e2e
```

---

## 🔮 O que faria diferente com mais tempo?

1. **Refresh Tokens (Backend):** Atualmente, a sessão é gerenciada por um JWT único. Para uma plataforma crítica, implementar `refresh_tokens` rotativos baseados em HttpOnly cookies ofereceria melhor experiência e segurança contra sequestros de sessão prolongados.
2. **Mapa Interativo Real (Leaflet):** O Dashboard calcula os bairros com alertas e há o PDF de risco por bairro, mas com tempo eu implementaria um mapa interativo usando `react-leaflet` plotando *clusters* nas coordenadas dos bairros mais afetados para visualização geoespacial (as bibliotecas de Leaflet inclusive já foram inseridas no `package.json` para isso!).
3. Mais modelos de relatórios gerados.