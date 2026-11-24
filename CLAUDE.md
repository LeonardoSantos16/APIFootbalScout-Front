# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositorio

Front-end do APIFootballScout (scouting de atletas e gestao de transferencias). A ordem dos itens, o escopo de cada um e as perguntas para o grilling estao em `docs/planejamento-base.md`. A primeira tela, metricas por 90 (item 2, change `f9-metricas-por-90`), esta implementada em `/jogadores/$jogadorId/metricas`. A busca e o perfil (item 4, change `busca-e-perfil`) ficam em `/busca?termo=` e `/jogadores/$jogadorId`; no `dev:mock`, os jogadores 1001 a 1008 sao achados pelo nome ("rafael", "diego", "tiago"...) ou pelo clube ("atlético"), e os termos "erro" e "vazio" forcam a fonte fora e a lista vazia. A comparacao direta (item 5, change `f10-comparacao-direta`) e a aba `/jogadores/$jogadorId/comparacao?com=`; no `dev:mock`, contra o 1001: 1006 realizada, 1005 com um atributo recusado de um lado, 1003 sem amostra, 1004 posicoes incompativeis, 1007 sem posicao, 1002 sem estatisticas no recorte (404), e a Copa do Brasil recusa por amostra do proprio 1001. O acompanhamento (item 6, change `f1-f2-acompanhamento`) e a aba `/jogadores/$jogadorId/acompanhamento`; no `dev:mock`, 1001 com mudanca nas tres afericoes, 1002 sem mudanca relevante e 1003 com o clube mudado e valor e minutagem indisponiveis ja sao acompanhados; 1008 abre o acompanhamento, 1005 e 1006 recusam a abertura (limite e jogador sem base) e 1007 tem a fonte fora na leitura. A lista e o encerramento de acompanhamentos esperam o back-end (item 6b). A sessao (item 3, change `sessao`) poe toda rota fora de `/entrar` e `/criar-conta` atras do login; o `dev:mock` ja abre logado. O item 1, CI, ainda nao teve grilling. A skill `scout-ui` (`.claude/skills/scout-ui/`) guia qualquer trabalho de interface. Playwright entra junto com os testes e2e; o Radix entrou com o `Dialog`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Vite em http://localhost:5173, com proxy de `/api` para `VITE_API_PROXY_TARGET` (padrao `https://localhost:7163`). A API nao tem CORS, entao o front sempre chama `/api` relativo. Rodando o back-end no depurador, ele pausa nas excecoes de dominio (senha errada, regra de negocio) e trava todas as requisicoes: desligue a parada nessas excecoes ou use Ctrl+F5 |
| `npm run dev:mock` | Mesmo servidor com o MSW interceptando `/api` (`.env.mock`), sem back-end, ja logado como Ana Ribeiro (`ana.ribeiro@exemplo.com` / `senhaboa123`); o access token vence a cada 20 chamadas para exercitar a renovacao |
| `npm run lint` / `npm run typecheck` | oxlint e `tsc -b` |
| `npm test` | Vitest uma vez; `npx vitest run caminho/do.test.tsx -t "nome"` roda um teste so; `npm run test:watch` fica observando |
| `npm run build` | `tsc -b` + build do Vite |
| `npm run storybook` / `npm run build-storybook` | Storybook em :6006, stories em `src/**/*.stories.tsx` |
| `npm run api:snapshot [origem]` | Baixa `/openapi/v1.json` da API rodando (padrao `https://localhost:7163`) para `openapi/v1.json` |
| `npm run gen:api` | Gera `src/api/schema.d.ts` a partir de `openapi/v1.json` |
| `npm run gen:tokens` | Gera `src/styles/tokens.css` a partir de `docs/design-system/tokens.json` |

A CI (`.github/workflows/ci.yml`) roda os dois `gen:*` e falha em `git diff --exit-code`: depois de mudar o contrato ou os tokens, rode a geracao e commite o resultado junto.

## Arquitetura

- **Contrato -> tipos.** `openapi/v1.json` e um snapshot versionado do contrato, atualizado com `api:snapshot`. `scripts/gen-api.mjs` roda o `openapi-typescript` e escreve um arquivo so, `src/api/schema.d.ts` (nunca editado a mao). Antes de gerar, o script alinha o nome dos parametros de rota com o segmento da URL, porque o back-end publica `JogadorId` em `/api/Acompanhamento/{jogadorId}`. Os parametros de query vem em PascalCase (`CompeticaoId`), como o back-end publica.
- **`src/api/client.ts`** e a porta unica da API: `fetchClient` (`openapi-fetch`) e `$api` (`openapi-react-query`), usado nas telas como `$api.useQuery('get', '/api/...', { params })`. O middleware `errors` transforma qualquer resposta fora de 2xx em `ApiError` (status + corpo JSON ou texto puro, ja que `Players` e `Tournament` respondem texto). O middleware de `src/api/auth.ts`, registrado depois dele (o `onResponse` roda em ordem inversa), poe o token, renova antes de enviar quando o access token venceu e, no `401`, renova uma vez pela fila de `src/api/refresh.ts` (lock entre abas, ADR 0002) e repete a chamada. O `fetch` e lido a cada chamada para o MSW conseguir interceptar.
- **Sessao.** `src/api/session.ts` e o unico codigo que le ou grava o par de tokens, o nome e o e-mail (`scout.session` no `localStorage`, ADR 0001); telas usam `useSession()`. `src/router.ts` cria o roteador e liga `onSessionEnded` (sessao recusada -> limpa o cache e vai para `/entrar?redirecionar=&aviso=`) e a sincronizacao entre abas. Rotas protegidas ficam sob `src/routes/_authenticated` (confirma com `me` no `beforeLoad`, topo em skeleton enquanto isso); `/entrar` e `/criar-conta` sob `_public`.
- **Mocks.** `src/mocks/http.ts` exporta o `http` do `openapi-msw`, que tipa rota, parametros e corpo dos handlers pelo contrato. Cada feature escreve handlers nomeados pelo estado em `src/mocks/handlers/<area>.ts`, com fixtures em `src/mocks/fixtures/`. `src/mocks/handlers.ts` responde o `dev:mock` por `jogadorId` e e o padrao dos testes (`src/mocks/server.ts`, ligado em `src/test/setup.ts` com `onUnhandledRequest: 'error'`); testes sobrescrevem com `server.use(...)` e stories com `beforeEach({ msw }) { msw.use(...) }` (`msw-storybook-addon`). A sessao do mock fica em `src/mocks/authStore.ts` e os jogadores acompanhados em `src/mocks/trackingStore.ts` (os dois zerados a cada teste; no `dev:mock`, ate recarregar a pagina); os handlers padrao de perfil e metricas passam por `withAuth` e respondem `401` sem token valido. `renderRoute(url, { session })` comeca logado; `session: 'signed-out'` ou um par pronto mudam isso. Stories comecam logadas pelo loader do `.storybook/preview.tsx`; as das paginas publicas usam `parameters.session: 'signed-out'`.
- **Jogador.** `src/routes/_authenticated/jogadores/$jogadorId.tsx` e a rota de layout das telas do jogador: valida o recorte e o segundo jogador da comparacao (`com`) nos search params (herdados pelas filhas, que os mantem ao trocar de aba) e renderiza o `PlayerLayout` (`src/pages/player/`), com a faixa do clube, as abas "Perfil | Métricas | Comparação | Acompanhamento" (numa linha so abaixo de 720px) e o erro do perfil. O seletor de recorte das abas de analise sai de `useSliceSelection` (`src/hooks/`), que tambem corrige o recorte ausente. O perfil vem de `usePlayerProfile`/`playerProfileQuery` (`src/hooks/`), que vale 30 min no cache e e reaproveitado por todas as telas; a busca vale 5 min. Paginas recebem os links do roteador por props (`renderLink`, `renderTabLink`), entao as stories rodam sem roteador com `StoryShell`/`PlayerStoryShell` de `src/test/StoryShell.tsx`.
- **Consultas.** `createQueryClient()` (`src/api/queryClient.ts`) e o unico `QueryClient` da app, dos testes e das stories: repete so o `502`, uma vez, depois de 2 s. Erro vira texto com `describeError` de `src/api/errors.ts`. Teste de tela usa `renderRoute(url)` de `src/test/renderRoute.tsx`, que monta o roteador de `src/router.ts`.
- **Rotas** sao por arquivo em `src/routes/` (plugin do TanStack Router); `src/routeTree.gen.ts` e regenerado pelo Vite e versionado. O `QueryClient` vai no contexto do roteador para os loaders. O arquivo da rota so declara a rota (search params, titulo) e renderiza a pagina de `src/pages/`.
- **Pastas.** O que mais de uma tela usa fica nas pastas globais de `src/`: `components/`, `hooks/`, `utils/` (funcoes puras) e `interfaces/` (tipos). O que so uma tela usa fica na pasta dela, `src/pages/<tela>/`, com as mesmas subpastas e a pagina na raiz (`src/pages/metrics/MetricsPage.tsx`). Tipo de objeto e `interface`; uniao e apelido do contrato sao `type`. `src/api/`, `src/config/` e `src/mocks/` sao infraestrutura.
- **Estilo.** CSS Modules (`Componente.module.css`, ADR 0005). `src/styles/global.css` importa `tokens.css`; use as variaveis (`var(--surface)`, `font: var(--text-stat-value)`) e nunca valores literais de cor, fonte ou espaco.

## Fontes da verdade

- **`GLOSSARY.md`**: o nome de cada conceito do dominio e os sinonimos a evitar. Textos da tela e nomes de dominio no codigo seguem ele.

- **Contrato da API**: OpenAPI em `/openapi/v1.json` do back-end (`https://localhost:7163`, prefixo `/api`). Rotas, payloads e enums vem dele; nunca escreva tipos a mao, gere o client. O back-end (.NET) fica em `../APIFootbalScout`; regras de negocio em `docs/regras-de-negocio.md` e features em `docs/features.md` de la.
- **`docs/README.md`**: o que o contrato nao mostra — valores do `ScoutConfig` que a validacao do front replica, tempo de vida dos tokens, convencoes de serializacao.
- **`docs/erros.md`**: tratamento por `code` do `ProblemDetails`.
- **`docs/fluxos-de-tela.md`**: jornadas, sessao/refresh e estados por feature.
- **`docs/adr/`**: decisoes de arquitetura do front (tokens, refresh, recorte na URL, shortlist, CSS Modules). Leia antes de mexer nessas areas; para reverter uma, escreva um ADR novo que a substitua.
- **`docs/design-system/`**: Scout Vestiario (so tema escuro). `README.md` tem as regras de uso, `tokens.json` os tokens. Os componentes em `components/` sao referencia em `React.createElement` + `bundle.css`, nao codigo de producao. Edite o repo primeiro e so depois republique o artefato https://claude.ai/artifact/MJ6hRhufGtPfdXq19TqkxD.

`docs/erros.md` e `docs/fluxos-de-tela.md` sao copias de `docs/frontend/` do back-end e podem divergir; na duvida, confira la.

## Regras que atravessam varias telas

- **Recorte** = `competicaoId` + `temporadaId` + `contexto` (`Clube`/`Selecao`). Metricas, comparacao e acompanhamento exigem os tres. Nao ha endpoint de competicoes/temporadas: o seletor deriva de `stats` em `GET /api/Players/{id}/profile`, que precisa carregar antes de qualquer tela de analise. O recorte vai na URL.
- **Recusa nao e erro.** `Recusada`, `Indisponivel`, `AmostraInsuficiente`, `TemporadaVirada` chegam com `200 OK`. A linha continua visivel, com o motivo e os numeros no lugar do valor ("Amostra insuficiente: 312 de 450 min"). Nunca mostre o nome do enum cru.
- **Erros**: a mensagem e o comportamento saem do campo `code`; `detail` e diagnostico e nao vai para a tela. Sem `code` = erro desconhecido (500). `Players` e `Tournament` respondem texto puro, nao JSON, e o interceptor precisa tolerar isso. Todo 502 (SofaScore fora) oferece "Tentar de novo". Recurso de outro olheiro responde 404, nunca 403.
- **Sessao**: access token de 15 min, refresh de 7 dias. Todo refresh rotaciona o refresh token; um refresh em voo por vez e as demais requisicoes aguardam e repetem. `change-password` tambem devolve par novo.
- **Serializacao**: enums como string, campos nulos omitidos do JSON (ausente = "nao se aplica"), datas ISO 8601.
- **Shortlist** sem atualizacao otimista: o estado local e substituido pela resposta. Use `limiteDeAlvos` da resposta, nao um literal.
- **Payload do SofaScore** muda conforme a fonte: use so os campos que a tela le. `entity.position` da busca (`"M"`, `"F"`...) nao e o enum `Posicao` da analise. Filtre a busca por `type === 'player'`.

## Design system em resumo

Detalhes em `docs/design-system/README.md`; os pontos que mais se erram:

- Texto em pt-BR, so a primeira letra maiuscula, sem emoji, numeros no padrao brasileiro (`2,10`, `€12,5M`) e toda metrica com unidade.
- `pitch` e o unico acento (aba selecionada, foco, ponto ativo), nunca decoracao. Mudancas usam `up`/`down` sempre com sinal e palavra.
- Archivo para nomes, titulos e numeros (`tabular-nums`); Figtree para o resto. Rotulo embaixo do valor, sem caixa alta.
- Cartoes sem sombra; carregamento com skeleton no formato final; sem animacao de entrada.
- Icones so do Phosphor (`@phosphor-icons/react`, regular, 20px), da lista aprovada em `assets/Icons/`.
- A faixa do clube usaria `team.teamColors` do perfil, mas o contrato ainda nao expoe o campo: ate la a `ClubBand` usa o token `club` (`docs/divida-tecnica.md`).

## Convencoes de trabalho

- Todo identificador do codigo em ingles, inclusive os conceitos do dominio, com o nome de codigo da tabela "Nomes no codigo" do `GLOSSARY.md` (`Slice` para recorte, `PlayerProfile`, `MetricsPage`, `isClientError`). Ficam em portugues so o que vem de fora do codigo: campos e enums do contrato (`amostraEmMinutos`, `Selecao`), caminhos e search params da URL (`/jogadores/$jogadorId/metricas?competicao=`) e as descricoes dos testes. Textos da tela, docs e commits em portugues; os artefatos do OpenSpec (proposal, specs, design, tasks) em ingles, com os textos da tela em pt-BR entre aspas.
- Sem comentarios no codigo; nos testes, so os marcadores Arrange/Act/Assert.
- No `/tdd`, gere testes e stubs ate o red; o green e do usuario. Decida pelo doc de regras e pelo repo e declare a decisao, em vez de perguntar antes.
- Commits curtos, so o titulo, em portugues com prefixo convencional (`feat:`, `test:`, `docs:`, `chore:`). Em cada ciclo de TDD, um commit `test:` e um `feat:` separados. Sem `Co-Authored-By` do Claude.
- SDD com OpenSpec (`openspec/`, schema `spec-driven`). Cada change em `openspec/changes/<nome>/` tem `proposal.md`, specs delta em `specs/<capability>/spec.md` (requisitos com SHALL/MUST e cenarios WHEN/THEN), `design.md` e `tasks.md`. O nome da change leva o identificador do back-end (`f9-metricas-por-90`); a capability leva o termo do glossario (`metricas-por-90`, `recorte`). Contexto e regras por artefato ficam em `openspec/config.yaml`.
- Fluxo de cada item do `docs/planejamento-base.md` (detalhado la, na secao "Fluxo de cada item"), numa branch `feat/<change>` a partir de `develop`: skill `grilling` para fechar as decisoes (registradas em `docs/grilling/<change>.md`) -> wireframe de cada tela como artefato no claude.ai (nao versionado; o link vai no `design.md` da change), aprovado antes da spec (itens sem tela pulam); componente novo que o wireframe pedir entra antes no design system -> spec no OpenSpec (`/openspec-propose`, validada com `openspec validate <change> --strict`) -> TDD pelo `/openspec-apply-change`, um grupo do `tasks.md` por vez (red do grupo inteiro em `test:`, depois o green em `feat:`) -> conferencia no `dev:mock` e no Storybook, em desktop e 375px, e contra a API real quando o item tem back-end (navegador pelo `agent-browser`, com sessao propria: `agent-browser session id --scope worktree --prefix task`) -> retrospectiva e `/openspec-archive-change`, que sincroniza as specs principais. Um item por vez; a change so e criada quando o item entra em execucao.
