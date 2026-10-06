# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositorio

Front-end do APIFootballScout (scouting de atletas e gestao de transferencias). O scaffold esta pronto e ainda nao ha telas; a ordem de execucao esta em `docs/plano-de-desenvolvimento.md` (secao 8). A skill `scout-ui` (`.claude/skills/scout-ui/`) guia qualquer trabalho de interface; o proximo passo e a F9 Metricas. Playwright entra junto com os testes e2e, e Radix/React Aria e `@phosphor-icons/react` quando o primeiro componente precisar.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Vite em http://localhost:5173, com proxy de `/api` para `VITE_API_PROXY_TARGET` (padrao `https://localhost:7163`). A API nao tem CORS, entao o front sempre chama `/api` relativo |
| `npm run dev:mock` | Mesmo servidor com o MSW interceptando `/api` (`.env.mock`), sem back-end |
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
- **`src/api/client.ts`** e a porta unica da API: `fetchClient` (`openapi-fetch`) e `$api` (`openapi-react-query`), usado nas telas como `$api.useQuery('get', '/api/...', { params })`. O middleware `errors` transforma qualquer resposta fora de 2xx em `ApiError` (status + corpo JSON ou texto puro, ja que `Players` e `Tournament` respondem texto). O token e o refresh com fila do ADR 0002 entram como outro middleware. O `fetch` e lido a cada chamada para o MSW conseguir interceptar.
- **Mocks.** `src/mocks/http.ts` exporta o `http` do `openapi-msw`, que tipa rota, parametros e corpo dos handlers pelo contrato. `src/mocks/handlers.ts` comeca vazio: cada feature escreve os handlers dos estados que precisa (`Recusada`, `AmostraInsuficiente`, `502`) e as stories e testes sobrescrevem com `worker.use(...)` / `server.use(...)`.
- **Rotas** sao por arquivo em `src/routes/` (plugin do TanStack Router); `src/routeTree.gen.ts` e regenerado pelo Vite e versionado. O `QueryClient` vai no contexto do roteador para os loaders.
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
- A faixa do clube usa `team.teamColors` do perfil, com a regra de fallback da `ClubBand`.

## Convencoes de trabalho

- Identificadores tecnicos em ingles (`readBody`, `useQuery`, `Card`, `Button`); conceitos do dominio em portugues, com o termo do `GLOSSARY.md` (`recorte`, `AfericaoCard`, `useShortlist`, `isRecusada`). Campos da API mantem o nome do contrato. Textos da tela, docs e commits em portugues.
- Sem comentarios no codigo; nos testes, so os marcadores Arrange/Act/Assert.
- No `/tdd`, gere testes e stubs ate o red; o green e do usuario. Decida pelo doc de regras e pelo repo e declare a decisao, em vez de perguntar antes.
- Commits curtos, so o titulo, em portugues com prefixo convencional (`feat:`, `test:`, `docs:`, `chore:`). Em cada ciclo de TDD, um commit `test:` e um `feat:` separados. Sem `Co-Authored-By` do Claude.
- Specs por feature em `specs/<id-do-backend>-<nome>/` (`requisitos.md` em EARS, `design.md`, `tarefas.md`), com os mesmos identificadores do back-end (F9, F10...).
