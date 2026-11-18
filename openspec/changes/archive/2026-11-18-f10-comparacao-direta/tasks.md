# Tasks

## 1. Shared modules

- [x] 1.1 Move `ATTRIBUTE_ORDER`, `ATTRIBUTE_LABEL`, the value format, `refusalText` and `footerSample` (as `commonSample`) to `src/utils/attributes.ts`, `Attribute` and `AttributeType` to `src/interfaces/attribute.ts`, `useSearchPlayers` to `src/hooks/` and `playerResults`, `resultSummary` and `describeSearchError` to `src/utils/searchResults.ts`, with their tests; one `refactor:` commit; verify with `npm test` and `npm run typecheck` green and no behavior change in F9 and the search

## 2. Comparison rules

- [x] 2.1 TDD of `compatiblePositions` and the `PosicaoDto` label in `src/utils/player.ts` (`G` only with `G`, `D` with `D` and `M`, `M` with `M`, `D` and `F`, `F` with `F` and `M`, unknown letter with nothing; "Meio-campo" for `MeioCampo`); `test:` red for the group
- [x] 2.2 TDD of `src/pages/comparison/utils/candidates.ts`: `comparableResults` keeps compatible results in source order and leaves out the page player and unknown letters; `filterNote` and `noComparableText` with the spec texts; same `test:` red
- [x] 2.3 TDD of `src/pages/comparison/utils/comparison.ts`: page player on the left whatever the response order; headers "Meio-campo · 1.920 min" with the common sample and missing parts left out; seven rows in the metrics order with labels and formats; strong and muted for different calculated values; neutral on a tie and beside a refused cell; refused cell with "Não publicado pela fonte"; missing attribute or calculated value without `valor` throws; same `test:` red
- [x] 2.4 TDD of `src/pages/comparison/utils/refusal.ts`: one test per reason, both `AmostraInsuficiente` texts by the page player's minutes (312 and 1920), `PosicaoDesconhecida` for one and for both players, "Posição não informada"; same `test:` red
- [x] 2.5 TDD of `src/pages/comparison/utils/comparisonError.ts`: 404 `jogador.estatisticas_nao_encontradas` with and without the clicked name, 404 `jogador.perfil_nao_encontrado`, 502 "Não foi possível comparar agora." with retry, 400 `comparacao.jogador_consigo_mesmo` "Escolha dois jogadores diferentes." without retry, unknown code generic; same `test:` red
- [x] 2.6 Green of 2.1 to 2.5 in one `feat:` commit; verify with `npx vitest run src/utils src/pages/comparison`

## 3. Mocks and data hook

- [x] 3.1 `src/mocks/fixtures/comparison.ts` and the named handlers of `src/mocks/handlers/comparison.ts` (realizada, one side refused, each refusal, the two 404, the 400, source down, pending); verify with `npm run typecheck`
- [x] 3.2 Default comparison in `src/mocks/handlers.ts` under `withAuth`, by `JogadorB` (1006, 1005, 1003, 1004, 1007, 1002) and the Copa do Brasil recorte as insufficient sample, generic realizada otherwise; `useComparison` with 5-minute `staleTime`; verify with `npm run typecheck`

## 4. Comparison components

- [x] 4.1 `ComparisonTable` (real `table` with `scope`, tones, loading with `Skeleton`, footer slot, wrapping names below 720px) and `ComparisonRefusal` (two players, reason, action), CSS Modules over the tokens only; stories per state; verify in Storybook at desktop and 375px and that no literal color, font or spacing enters the CSS

## 5. Comparison tab

- [x] 5.1 Route tests (`test:` red for the group): the "Comparação" tab is selected at `/jogadores/1001/comparacao` and the profile is not requested again; tab title "Comparação · Rafael Montes"; without `com` the intro text and the field, no comparison request; submit "atlético" lists Diego, Bruno, Lucas and Caio under the filter note, without Rafael and Pedro; "s" shows the short term message; "pedro" shows the no-comparable text; clicking Diego writes `com=1006`, shows the table with Rafael on the left, the highlights and the tie; Back returns to the search; Bruno shows "Não publicado pela fonte" and "87%" neutral; Lucas, Pedro and Miguel (by URL) show their refusal texts; Caio clicked shows the not-found text with his name, and by URL with "O jogador escolhido"; 502 twice shows the message, "Tentar de novo" refetches and "Trocar jogador" clears `com`; `com=1001` and `com=abc` are dropped without a history entry; changing to Copa do Brasil keeps `com` and shows "Rafael Montes tem 312 de 450 min nesta competição e temporada."; empty `stats` shows "Sem estatísticas publicadas para este jogador." without search; "Métricas" then "Comparação" keeps recorte and `com` without a new comparison request; placeholders while pending
- [x] 5.2 Green in one `feat:` commit: `validatePlayerSearch` with `com`, the third tab in `PlayerLayout` and the route, `src/routes/_authenticated/jogadores/$jogadorId/comparacao.tsx`, `ComparisonPage`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [x] 5.3 Stories of `ComparisonPage` inside the layout per state (no second player, results, no comparable, realizada, one side refused, each refusal, statistics not found, player not found, source down, pending, no stats); verify in Storybook at desktop and 375px

## 6. Documentation

- [x] 6.1 Highlight rule (strong and muted, no highlight on a tie or beside a refusal, never `pitch`) in `docs/design-system/README.md`, then republish the design system artifact; `CLAUDE.md` with the comparison tab, `com` and the `dev:mock` pairs; verify the texts against the code

## 7. Verification

- [x] 7.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (1001 against 1006, 1005, 1003, 1002; `com=1004`, `com=1007`, `com=1001`; Copa do Brasil; searches "atlético", "pedro", "erro", "vazio", "s") at desktop and 375px with no console errors
- [x] 7.2 Against the real API (`npm run dev` with the back-end running): compare two real midfielders, a midfielder and a goalkeeper by URL, and a player without minutes in the recorte; record the findings in `docs/divida-tecnica.md` and the delta specs

## 8. Retrospective

- [x] 8.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate f10-comparacao-direta --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `comparacao-direta`, `perfil-do-jogador`, `recorte` and `tratamento-de-erros` into `openspec/specs/`.
