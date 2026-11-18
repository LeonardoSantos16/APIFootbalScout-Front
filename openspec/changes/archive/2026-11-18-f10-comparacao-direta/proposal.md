# Proposal

## Why

The scout reads one player at a time today: the per-90 metrics show a player alone, with no reference. F10 (comparação direta) puts two players side by side in the same recorte, so the scout can judge a target against another one. The back-end already answers `GET /api/Analise/comparacao`, and the refusal of the whole comparison, or of an attribute for one side only, is a result to show and not a failure. The decisions are in `docs/grilling/f10-comparacao-direta.md` (Q1 to Q18 and W1 to W7).

## What Changes

- New "Comparação" tab in the player layout, at `/jogadores/$jogadorId/comparacao`, next to "Perfil" and "Métricas". The page player is always the first player, the recorte comes from the layout's search params and the second player lives in the new `com` search param.
- Without a second player, the tab shows a search field (on submit, at least 2 characters) whose results keep only positions compatible with the page player, by the source's position letter, and hide the page player and players without a position. Clicking a result writes `com` to the URL.
- With a second player, a "Realizada" comparison shows a table with the seven fixed attributes, one column per player with the name, position and sample, the higher value highlighted without the `pitch` color, and the refused cell of one side with its reason and no highlight.
- A "Recusada" comparison shows both players and a text per reason (`PosicoesIncompativeis`, `PosicaoDesconhecida`, `AmostraInsuficiente`, `RecorteDivergente`). For `AmostraInsuficiente`, the page player's minutes in the recorte tell which side is short.
- Own states for a second player without statistics in the recorte (404 `jogador.estatisticas_nao_encontradas`) and an unknown second player (404 `jogador.perfil_nao_encontrado`), plus loading, source down (502) and the shared generic error.
- "Trocar jogador" and "Escolher outro jogador" clear `com` and go back to the search. A `com` equal to the page player or not numeric is dropped silently.
- The comparison stays cached for 5 minutes.
- The metric formatters (order, label, value, refusal text) and the search hook leave the metrics and search pages for the shared folders, because the comparison uses them too.
- MSW handlers for each comparison state, keyed by the pair of players in `dev:mock`.

## Capabilities

### New Capabilities
- `comparacao-direta`: the comparison tab, the choice of the second player, the "Realizada" table and its highlight, the "Recusada" reasons, and the loading, not-found and error states of the comparison.

### Modified Capabilities
- `perfil-do-jogador`: the player layout gains the "Comparação" tab; the recorte and `com` params are kept across the three tabs.
- `recorte`: the profile-without-statistics state also applies to the comparison tab.
- `tratamento-de-erros`: a comparison failure appears in place of the table, with the band, the tabs and the selector visible.

## Impact

- **Code:** new route `src/routes/_authenticated/jogadores/$jogadorId/comparacao.tsx`; new page `src/pages/comparison/`; changes to the player layout route and `PlayerLayout` (third tab, `com` param); metric formatters moved from `src/pages/metrics/utils/` to `src/utils/`; the search hook moved from `src/pages/search/hooks/` to `src/hooks/`; new MSW fixtures, handlers and stories; the highlight rule in `docs/design-system/README.md`.
- **API:** consumes `GET /api/Analise/comparacao`, with no contract change. New back-end gap already recorded in `docs/divida-tecnica.md`: the `AmostraInsuficiente` refusal does not say which player is short.
- **Dependencies:** none.
- **Depends on:** item 2 (F9 Metricas por 90: attributes, formatters and refusal texts), item 3 (Sessao: protected routes) and item 4 (Busca e perfil: player layout, profile cache and search).
- **Unblocks:** nothing directly; items 6 to 8 reuse the highlight rule and the tab pattern.

### Out of scope

- Radar chart (needs percentiles over a league corpus, out of the back-end scope).
- More than two players, or a second player in a different recorte.
- A "Comparar" action on the profile: the tab is the entry point.
- Anticipating the `AmostraInsuficiente` refusal before calling the API.
- Search while typing and keeping the comparison search term in the URL.
