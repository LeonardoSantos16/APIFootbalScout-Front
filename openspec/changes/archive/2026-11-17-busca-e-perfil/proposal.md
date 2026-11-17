# Proposal

## Why

The search is the only way for the scout to reach a player, and the profile is where every action starts: per-90 metrics now, and later comparison, following, reports and shortlists. Today the scout can only open the metrics of test players by typing an id in the URL or using the `dev:mock` links on the home page. Search and profile have no back-end feature identifier (F1 to F10 are analysis features). The decisions are in `docs/grilling/busca-e-perfil.md`.

## What Changes

- New `/busca?termo=` page: a search field and the list of players the source returns for the term, filtered to `type === 'player'`, in source order. The search only runs on submit, with at least 2 characters.
- The top "Buscar jogador" field becomes a working form that leads to `/busca?termo=`. It is not shown on `/busca`, and below 720px it becomes a "Buscar" text link.
- New player profile at `/jogadores/$jogadorId`: club band with the player's photo, the "Perfil | Métricas" tabs and the "Dados", "Recortes", "Valor de mercado" and "Transferências" cards. Missing or zero fields are left out, long lists are cut with a "Mostrar todos" button, and each recorte row opens the metrics in that recorte.
- `/jogadores/$jogadorId` becomes the player layout: it loads the profile once and shows the band and the tabs for the profile and the metrics. **BREAKING** for the metrics screen: its own header, its single "Métricas por 90" tab and its card-level profile error move to the layout, and the tab is renamed "Métricas".
- The default recorte becomes the first item of `stats` in source order, instead of the largest `season.id` (amendment to ADR 0003).
- Profiles stay cached for 30 minutes and searches for 5 minutes, so the shortlist can reuse the profile cache later.
- The provisional home page swaps "A busca de jogadores chega em breve." and the `dev:mock` test player links for the search field.
- New production components from the design system: `SearchField`, `PlayerPhoto` and `RowList`; the club band gains a photo and the tabs become links.
- MSW handlers for the search (results, empty, only other types, source down) and richer profile fixtures (transfers, national team, missing market value).

## Capabilities

### New Capabilities
- `busca-de-jogadores`: searching players by name, the term in the URL, the minimum length, the results list and its loading, empty and error states.
- `perfil-do-jogador`: the player layout (band, tabs, loading and profile errors) and the profile page with the player data, recortes, market value and transfers.

### Modified Capabilities
- `recorte`: options and the default recorte follow the source order of `stats`; the empty-statistics state no longer shows its own player header.
- `metricas-por-90`: the player header, the tabs and the profile loading come from the player layout; the tab is "Métricas"; the tab title stays per screen.
- `navegacao`: the top search field works and is hidden on `/busca`; on phones, a "Buscar" link; the home page shows the search field instead of the test players.
- `tratamento-de-erros`: a profile failure takes the player layout on both tabs; the search has its own source-down message.

## Impact

- **Code:** new routes `src/routes/_authenticated/busca.tsx`, `src/routes/_authenticated/jogadores/$jogadorId.tsx` (layout) and `src/routes/_authenticated/jogadores/$jogadorId/index.tsx`; pages `src/pages/search/` and `src/pages/profile/`; changes to `MetricsPage`, `AppShell`, `ClubBand`, `Tabs`, `HomePage`, `usePlayerProfile` and `src/utils/slice.ts`; new components, formatters, MSW handlers, fixtures and stories.
- **API:** consumes `GET /api/Players/search` and `GET /api/Players/{id}/profile`, with no contract change. New back-end gap in `docs/divida-tecnica.md`: when the source fails, the search answers `200` with an empty list instead of `502`.
- **Dependencies:** none.
- **Depends on:** item 2 (F9 Metricas por 90, whose screen moves into the player layout) and item 3 (Sessao, every route is protected).
- **Unblocks:** items 5 (F10 Comparacao direta), 6 (F1/F2 Acompanhamento), 7 (F5 Relatorio de scouting) and 8 (F7 Shortlist priorizada), which add their actions and tabs to the profile and reuse the search and the profile cache.

### Out of scope

- Searching clubs and competitions.
- Search while typing, pagination of results and photos in the results list.
- Actions on the profile (follow, compare, write a report, add to a shortlist): each feature adds its own.
- Club colors on the band: `teamColors` is not in the contract (`docs/divida-tecnica.md`).
- An image proxy for the player photo, unless the real API shows the source always blocks it.
- Opening the phone "Menu" and the real home page (item 9).
