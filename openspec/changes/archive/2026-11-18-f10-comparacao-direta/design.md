# Design

## Context

The player layout (`src/routes/_authenticated/jogadores/$jogadorId.tsx` + `src/pages/player/PlayerLayout.tsx`) validates the recorte search params with `validateSliceSearch` and renders the "Perfil | Métricas" tabs; the tab is picked by the path suffix. `MetricsPage` derives the recortes with `deriveSlices` (`src/utils/slice.ts`, global; `Slice` already carries `minutesPlayed`), corrects a missing recorte with `replace`, and formats the grid through `src/pages/metrics/utils/metrics.ts` (`ATTRIBUTE_ORDER`, `ATTRIBUTE_LABEL`, value format, `refusalText`, `footerSample`). The players search lives in `src/pages/search/` (`useSearchPlayers`, `playerResults`, `resultSummary`, `describeSearchError`), and `SearchField`, `RowList`, `Select`, `Card` and `InlineError` are global components. `src/api/errors.ts` already maps `comparacao.jogador_consigo_mesmo`, `jogador.perfil_nao_encontrado` and `jogador.estatisticas_nao_encontradas`.

Product decisions are in `docs/grilling/f10-comparacao-direta.md` (Q1 to Q18 and W1 to W7). The approved wireframe is at https://claude.ai/artifact/F34DYWNWTip2ERRdorhcLq (the "Realizada" table on desktop, the second player search states, the result states, the four refusal reasons and the 375px screens). No new design system component: the table stays in the page folder (Q15); only the highlight rule goes to `docs/design-system/README.md`.

Back-end facts that shape the approach: the comparison takes a single recorte for both players; the source position letter maps 1:1 to `Posicao` (`SofascoreTradutor.TraduzirPosicao`); compatible positions are `Ataque`–`MeioCampo`, `Defesa`–`MeioCampo` and each with itself (`ScoutConfig.PosicoesCompativeis`); the whole comparison is refused for sample only when one side is under 450 min, and the response does not say which side; `jogadores` and `valores` are maps keyed by player id.

ADRs applied: 0003 (recorte in the URL, now with `com` beside it), 0005 (CSS Modules). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- Every comparison rule (compatibility, column order, highlight, refusal texts) as a pure function tested without React.
- One comparison request per pair and recorte per 5 minutes.
- Every comparison state reproducible by a named MSW handler, in tests, stories and `dev:mock`.

**Non-Goals:**
- A radar chart or more than two players.
- Checking the second player's profile before comparing (Q4).
- Keeping the comparison search term in the URL (Q10).

## Decisions

### Endpoint

| Use | Contract | Note |
| --- | --- | --- |
| Comparison | `GET /api/Analise/comparacao` with `query: { JogadorA, JogadorB, CompeticaoId, TemporadaId, Contexto }` | `JogadorA` is always the page player; 400 `comparacao.jogador_consigo_mesmo`, 404 `jogador.estatisticas_nao_encontradas` and `jogador.perfil_nao_encontrado`, 502 from the source |
| Search | `GET /api/Players/search` | reused as is |
| Profile | `GET /api/Players/{id}/profile` | from the 30-minute cache; gives the page player's position letter and minutes per recorte |

### Routes and search params

| File | Path | Note |
| --- | --- | --- |
| `src/routes/_authenticated/jogadores/$jogadorId.tsx` | layout | `validateSearch` becomes `validatePlayerSearch`: the recorte params plus `com` (positive integer, otherwise `undefined`); the tab picker learns the `/comparacao` suffix |
| `src/routes/_authenticated/jogadores/$jogadorId/comparacao.tsx` | `/jogadores/$jogadorId/comparacao?competicao=&temporada=&contexto=&com=` | renders `ComparisonPage`; corrects a missing recorte with `replace` like the metrics; drops `com` equal to `jogadorId` with `replace`; choosing and clearing the second player navigate with push |

The three tabs keep linking with `search: (prev) => prev`, so `com` survives a trip to "Perfil" or "Métricas" (spec delta of `perfil-do-jogador`). `validateSliceSearch` stays for the metrics route, which ignores `com`.

### Shared modules moved

| From | To | Why |
| --- | --- | --- |
| `src/pages/metrics/utils/metrics.ts`: `ATTRIBUTE_ORDER`, `ATTRIBUTE_LABEL`, the value format and `refusalText` | `src/utils/attributes.ts` | the comparison uses the same order, labels, formats and refusal text |
| `footerSample` (most common sample) | `src/utils/attributes.ts` as `commonSample` | the column header sample |
| `src/pages/search/hooks/useSearchPlayers.ts` | `src/hooks/useSearchPlayers.ts` | the comparison search |
| `src/pages/search/utils/results.ts` (`playerResults`, `resultSummary`) and `searchError.ts` | `src/utils/searchResults.ts` | the comparison renders the same rows and errors |

`Attribute` and `AttributeType` move from `src/pages/metrics/interfaces/` to `src/interfaces/attribute.ts`. The move is one `refactor:` commit before the first TDD group, with the existing tests moved alongside and green.

### Comparison rules

| Module | Responsibility |
| --- | --- |
| `src/utils/player.ts` | `compatiblePositions(letter)`: the set of compatible letters (`G`→{G}, `D`→{D,M}, `M`→{M,D,F}, `F`→{F,M}); unknown letter gives an empty set; `positionFromLetter` already gives the label |
| `src/pages/comparison/utils/candidates.ts` | `comparableResults(results, pagePlayerId, pageLetter)`: keeps compatible, known-letter results other than the page player, in source order; `filterNote(pageLetter)` ("Mostrando só jogadores comparáveis com meio-campo.") and `noComparableText(pageLetter, term)` |
| `src/pages/comparison/utils/comparison.ts` | `buildComparison(response, pageId, otherId)`: the two `ComparisonColumn` (name, position label, `commonSample`) left = page player, and seven `ComparisonRow` in `ATTRIBUTE_ORDER` with each cell `{ text, tone: 'strong' | 'muted' | 'neutral' | 'refused' }`; strong/muted only when both are calculated and differ; throws `IncompleteResponseError` like the metrics when an attribute or a calculated value is missing |
| `src/pages/comparison/utils/refusal.ts` | `refusalMessage(response, pageId, otherId, pageMinutes)`: the text per `MotivoDaRecusaDaComparacaoDto` (spec texts; `PosicoesIncompativeis` reads "<second player's position> e <page player's position in lower case> não são comparáveis."), plus `positionLabel` for the refused header ("Posição não informada") |
| `src/pages/comparison/utils/comparisonError.ts` | `describeComparisonError(error, otherName, sliceText)`: 404 `jogador.estatisticas_nao_encontradas` and `jogador.perfil_nao_encontrado` become the not-found state with "Escolher outro jogador"; 502 gives "Não foi possível comparar agora." with retry; otherwise `describeError` |

`PosicaoDto` to label: `Goleiro` Goleiro, `Defesa` Defesa, `MeioCampo` Meio-campo, `Ataque` Ataque, in `src/utils/player.ts` beside the letter map.

### Page

`src/pages/comparison/hooks/useComparison.ts`: `$api.useQuery('get', '/api/Analise/comparacao', …, { enabled: slice && otherId, staleTime: 5 min })`.

`src/pages/comparison/ComparisonPage.tsx` receives `playerId`, `search`, `onSliceChange`, `onChoose(id, name)`, `onClear()` and `renderResultLink` (the stories run without a router). It keeps the clicked result's name in state to feed the not-found text; a shared URL has no name. Inside one `Card` titled "Comparação":

- profile pending: selector and table placeholders; profile without `stats`: "Sem estatísticas publicadas para este jogador.";
- no `com`: the intro text (W1), `SearchField` with local state (submit sets the term, short term error as the search page), `RowList` of `comparableResults` with the filter note, loading rows, empty texts and `describeSearchError`;
- `com` and pending: `ComparisonTable` in loading;
- `Realizada`: `ComparisonTable` with the footer (the per-90 rule) and "Trocar jogador";
- `Recusada`: `ComparisonRefusal` (both players, reason text, "Escolher outro jogador");
- not found: text and "Escolher outro jogador"; other errors: `InlineError` with retry when allowed and "Trocar jogador" on the 502 (W4).

`document.title` is "Comparação · <nome>", or "Comparação".

### Components

In `src/pages/comparison/components/`, each with a CSS Module over the tokens and stories per state:

- `ComparisonTable`: a real `<table>` with `scope` headers; tones map to `--ink` at 700 (strong), `--ink-muted` at 500 (muted), `--ink-soft` at 500 (neutral) and the refused style of `MetricCell`; loading renders the same grid with `Skeleton` blocks; below 720px the selector goes full width and names wrap (W6).
- `ComparisonRefusal`: the two players in a two-column grid, the reason and the action.

### MSW per state

`src/mocks/fixtures/comparison.ts` builds `ComparacaoDiretaResponseDto` from the profile names and a values table (Rafael 1001 against Diego 1006 with wins on both sides and a tie in "Interceptacoes"; against Bruno 1005 with "PrecisaoDePasse" refused for Bruno).

| Handler (`src/mocks/handlers/comparison.ts`) | State |
| --- | --- |
| `comparisonRealizada` | all calculated, tie included |
| `comparisonOneSideRefused` | "PrecisaoDePasse" refused for the second player |
| `comparisonIncompatiblePositions`, `comparisonUnknownPosition`, `comparisonUnknownPositions`, `comparisonInsufficientSample`, `comparisonDivergentRecorte` | the refusals |
| `comparisonStatisticsNotFound`, `comparisonPlayerNotFound`, `comparisonSamePlayer` | 404 and 400 by `code` |
| `comparisonSourceDown` | 502 |
| `comparisonPending` | never resolves |

`src/mocks/handlers.ts` answers the `dev:mock` by `JogadorB` (Q14): 1006 realizada, 1005 one side refused, 1003 insufficient sample, 1004 incompatible positions, 1007 unknown position, 1002 statistics not found; the Copa do Brasil recorte, where 1001 has 312 min, answers insufficient sample for any pair; any other pair a generic realizada. `RecorteDivergente` stays out of `dev:mock` (W5). The search handler already returns the six players.

## Risks / Trade-offs

- [The `AmostraInsuficiente` refusal does not say which side is short] → the page player's minutes in the recorte decide the text; when both are short the text names only the page player, which is still true. Recorded in `docs/divida-tecnica.md`.
- [The search position letter could disagree with the analysis position] → both come from the same `details.position`; if they disagree, the API refuses and the refused state explains it.
- [Moving the metric formatters touches F9] → a separate `refactor:` commit with the F9 tests green before any comparison code.
