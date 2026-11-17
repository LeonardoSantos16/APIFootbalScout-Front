# Design

## Context

The F9 screen at `src/routes/_authenticated/jogadores/$jogadorId/metricas.tsx` renders `MetricsPage`, which loads the profile with `usePlayerProfile` (`staleTime` 0) and draws its own `ClubBand` inside the card header, a single "Métricas por 90" tab and the card-level profile error. `deriveSlices` in `src/utils/slice.ts` sorts by `season.id` descending. The `AppShell` shows a static "Buscar jogador" placeholder, and `/` lists the `dev:mock` test players through `TestPlayers`. There is no search code.

Product decisions are in `docs/grilling/busca-e-perfil.md` (Q1 to Q27 and W1 to W9). The approved wireframe is at https://claude.ai/artifact/JgP8Ps1hYSNdnGz6B5qwrz (search and profile on desktop, metrics inside the player layout, the search and profile states, the provisional home page and the 375px screens). The `SearchField`, `PlayerPhoto` and `RowList` references, the photo and loading state of the `ClubBand` and the link tabs are already in `docs/design-system/components/`.

Back-end facts that shape the approach: `GET /api/Players/search?q=` rejects only a blank term (400 in plain text) and, when the source fails, answers `200` with an empty `results` (`SofascorePlayerReader.SearchPlayersAsync` returns `response.Content ?? new SofaSearchResponse([])`), so a real outage reads as "no results". The profile's 502 comes as a `ProblemDetails` with `code` `sofascore.perfil_do_jogador_indisponivel`; its 404 is plain text. `playerImage` is a direct link to `api.sofascore.app`.

ADRs applied: 0003 (recorte in the URL), with the amendment already written in this item's grilling commit (the default recorte is the first `stats` item in source order); 0005 (CSS Modules). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- One profile request per player per 30 minutes, shared by the player layout, the profile, the metrics and, later, the shortlist.
- Every formatting rule of the profile (data, market value, transfers) and of the search (term, result line) as a pure function tested without React.
- Every search and profile state reproducible by a named MSW handler, in tests, stories and `dev:mock`.

**Non-Goals:**
- Route loaders that block navigation on the profile: the layout renders its own placeholders, as F9 does, so the tabs and the band never flash a pending screen.
- A combobox or suggestions in the top search.
- Persisting the query cache across reloads.

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Search | `GET /api/Players/search` with `query: { q }` | `results[].type` filtered to `player`; source failure arrives as `200` empty (`docs/divida-tecnica.md`) |
| Profile | `GET /api/Players/{id}/profile` | 404 plain text, 502 `sofascore.perfil_do_jogador_indisponivel` |

### Routes and search params

| File | Path | Note |
| --- | --- | --- |
| `src/routes/_authenticated/busca.tsx` | `/busca?termo=` | `validateSearch` keeps `termo` as a trimmed string or `undefined`; renders `SearchPage` |
| `src/routes/_authenticated/jogadores/$jogadorId.tsx` | layout | `validateSearch: validateSliceSearch` (moved from `metricas.tsx`), so both tabs share the recorte params; renders `PlayerLayout` around the `Outlet` |
| `src/routes/_authenticated/jogadores/$jogadorId/index.tsx` | `/jogadores/$jogadorId` | renders `ProfilePage`; ignores the recorte params |
| `src/routes/_authenticated/jogadores/$jogadorId/metricas.tsx` | unchanged | reads the parent's search; still corrects a missing recorte with `replace` |
| `src/routes/_authenticated/index.tsx` | `/` | `HomePage` without `TestPlayers`; `TestPlayers.tsx` is removed |

The tabs link with `search: (prev) => prev`, so going from the metrics to the profile and back keeps the recorte (Q26). A recorte row on the profile links to `metricas` with `sliceToSearch(slice)`.

### Player layout

`src/pages/player/PlayerLayout.tsx` calls `usePlayerProfile(playerId)` and renders, above `PageColumns`:

- loading: `ClubBand loading` and `PlayerTabs disabled`, then the `Outlet`, whose pages draw their own placeholders (the metrics keep the selector and the grid in blocks);
- 404: `NotFound` card with "Jogador não encontrado." and a "Buscar jogador" link button to `/busca`, no `Outlet`, `document.title` "Jogador não encontrado";
- other errors: `InlineError` from `describeError(error, { plainText: true })` with "Tentar de novo" calling `refetch`, no `Outlet`;
- success: `ClubBand` with `PlayerPhoto`, name and `playerSummary`, `PlayerTabs`, then the `Outlet`.

`PlayerTabs` (`src/pages/player/components/`) builds the two items with TanStack `Link` targets. Child pages read the same profile with `usePlayerProfile`, which hits the cache; they no longer handle the profile error, because the layout does not render them on error.

`MetricsPage` loses `ClubBand`, `PlayerTabs` and the profile error branch. It keeps the card titled "Métricas por 90" with the selector and the grid, its own tab title, and the "Sem estatísticas publicadas para este jogador." state.

### Profile cache

`src/hooks/usePlayerProfile.ts` exports `playerProfileQuery(id)` (`$api.queryOptions` with `staleTime` and `gcTime` of 30 minutes) and the hook over it, so the shortlist can call `useQueries` with the same options later. The search hook uses `staleTime` 5 minutes; both keep the default `gcTime` or longer, so Back from a profile finds the results.

### Search

| Module | Responsibility |
| --- | --- |
| `src/utils/search.ts` | `SEARCH_TERM_MIN` (2), `SHORT_TERM_MESSAGE` ("Digite pelo menos 2 letras do nome."), `normalizeTerm(raw)` (trim, `undefined` when blank) and `validateTerm(raw)` (the message or `undefined`); global because the header, the home page and the search page use them |
| `src/hooks/useSearchForm.ts` | the field state, the error after the first submit and on every change after that, and `submit` that navigates to `/busca` with `termo` (push) |
| `src/pages/search/utils/results.ts` | `playerResults(response)` (only `type === 'player'`, source order) and `resultSummary(entity)` (position from `positionFromLetter`, `team.name`, `country.name`, joined with ", ") |
| `src/pages/search/utils/searchError.ts` | `describeSearchError(error)`: 502 gives "Não foi possível buscar agora." with retry; otherwise `describeError` (a 400 in plain text becomes the generic error without retry) |
| `src/pages/search/hooks/useSearchPlayers.ts` | `$api.useQuery('get', '/api/Players/search', { params: { query: { q } } }, { enabled: q !== undefined && q.length >= 2, staleTime: 5 min, select: playerResults })` |
| `src/pages/search/SearchPage.tsx` | the `SearchField` with the term, focused when there is none, and the `RowList` of results, the five placeholder rows, the empty text or the error |

`HeaderSearch` (`src/components/HeaderSearch/`) is the compact `SearchField` wired to `useSearchForm`, hidden when the current path is `/busca` (`useRouterState`), with a fresh empty value on every route change. The `AppShell` gets it through a `search` slot, and gets the phone "Buscar" link through a `searchLink` slot, which the protected layout omits on `/busca`. `HomePage` renders the default `SearchField` with the same hook.

### Profile page

| Module | Responsibility |
| --- | --- |
| `src/utils/number.ts` | `formatMoney(value, currency)`: `€`, `US$`, `R$`, `£` for EUR, USD, BRL, GBP, otherwise the code and a space; from 1 million, up to one decimal and "M" ("€12,5M", "€12M"); from 1 thousand, no decimals and " mil" ("€850 mil"); below that, the integer. Global, because the follow-up and the shortlist show money too |
| `src/pages/profile/utils/playerData.ts` | `playerData(profile, today)`: the list of `{ value, label }` of the "Dados" card in the fixed order, leaving out what is missing, an unknown letter or foot (`Right` Direito, `Left` Esquerdo, `Both` Ambos) and a height of 0; `positionLabel` with `positionsDetailed`; `nationalTeamValue` with singular and plural; `formatBirth` ("14/03/2001 (24 anos)", UTC) |
| `src/pages/profile/utils/sliceRows.ts` | `sliceRows(profile)`: zips `stats` with `deriveSlices` (same order, now unsorted) into rows with the selector text, the five cells and the `Slice` for the link |
| `src/pages/profile/utils/transfers.ts` | `transferRows(historyTransfer)`: newest first by `transferDateTimestamp` (seconds), title from `fromTeamName`/`toTeamName` with the `transferFrom`/`transferTo` names as fallback, detail with `formatMonthYear` ("jan. 2024", UTC) and `transferFee` (`formatMoney` above 0, then the description map, otherwise nothing) |
| `src/pages/profile/utils/marketValue.ts` | `marketValue(details)`: the formatted value or `undefined` for missing or 0 |
| `src/pages/profile/ProfilePage.tsx` | the `PageColumns` with "Dados" and "Recortes" on the left and "Valor de mercado" and "Transferências" on the right; `useState` for the two "Mostrar todos" buttons (10 recortes, 5 transfers); `document.title` with the name, or "Perfil" |

`deriveSlices` drops `byMostRecent`; the first recorte is `stats[0]`. The mock fixtures are reordered newest first, as the source sends them, so F9's default stays "Brasileirão Série A · 2025".

### Components

- New in `src/components/`: `SearchField` (default and compact, error below linked by `aria-describedby`, 16px text below 720px), `PlayerPhoto` (image with `onError` to initials, `role="img"` with the name) and `RowList` (rows as links or plain, optional columns that collapse into a support line below 720px, footer slot), each with a CSS Module and stories per state.
- `ClubBand`: `photo` slot before the text; the loading state also shows a round placeholder and drops the club color.
- `Tabs`: items may carry a TanStack `Link` target (`to`, `params`, `search`); then the tabs render a `nav` of links with `aria-current="page"` on the selected one, and `disabled` renders plain text. The button form stays for in-page sections.
- `AppShell`: `search` and `searchLink` slots replace the static placeholder.

### MSW per state

`src/mocks/fixtures/search.ts` builds `SofaSearchResult` items from the profile fixtures (1001 Rafael Montes, 1002 Caio Ventura, 1003 Lucas Prado, 1005 Bruno Lacerda, 1006 and 1007 below) and one `type: 'team'` result. `src/mocks/fixtures/profiles.ts` gains transfers (three on 1001, with a fee, a "Loan" and an unknown description), `positionsDetailed`, `buildManyRecortesProfile` (1006: 14 `stats` items and 8 transfers, one pair with `season.id` out of chronological order) and `buildSparseProfile` (1007: no market value, no birth date, height 0, no shirt, no transfers, unknown foot).

| Handler (`src/mocks/handlers/search.ts`) | State |
| --- | --- |
| `searchResults` | filters the fixtures by name, ignoring case and accents, plus the team result |
| `searchEmpty` | `200` with no results |
| `searchOnlyTeams` | `200` with teams and a competition only |
| `searchSourceDown` | 502 in plain text |
| `searchPending` | never resolves |

| Handler (`src/mocks/handlers/profile.ts`) | State |
| --- | --- |
| `completeProfile`, `nationalTeamOnlyProfile`, `profileWithoutStats`, `profileNotFound`, `profileSourceDown` | existing |
| `manyRecortesProfile`, `sparseProfile` | the two new fixtures |
| `profilePending` | never resolves |

`src/mocks/handlers.ts` (default for tests and `dev:mock`) gains the search, wrapped by `withAuth`: the terms "erro" and "vazio" force the 502 and the empty list (Q23); everything else goes through `searchResults`. `PROFILES` gains 1006 and 1007.

## Risks / Trade-offs

- [The search hides a source outage as "no results"] → the screen still handles a 502 for when the back-end is fixed; the gap goes to `docs/divida-tecnica.md` with the expected fix (let `FonteExternaIndisponivelException` reach the global handler).
- [`api.sofascore.app` may refuse the image outside its site] → `PlayerPhoto` falls back to initials; the conference against the real API checks it, and a proxy becomes a debt item if it is always blocked.
- [The transfer description map is built from guesses ("Free", "Loan", "End of loan")] → an unknown description is left out instead of shown raw; the conference against the real API lists the texts that appear and the map is adjusted there.
- [Moving the band, the tabs and the profile error out of `MetricsPage` breaks F9's tests and stories] → they move to the player layout tests in the same group; the metrics tests keep only what is theirs.
- [Child search params inherited from the layout] → the metrics route test covers a link with a recorte, the correction with `replace` and the tab round trip.
- [A non-numeric `jogadorId`] → the API answers 404 for `/api/Players/NaN/profile`, so the page shows "Jogador não encontrado."; no extra parsing.

## Migration Plan

URLs of the metrics screen do not change. `/jogadores/$jogadorId`, which did not exist, becomes the profile. The `dev:mock` home page loses the test player links; the players are reachable by searching their names. Rollback is reverting the change; nothing is stored.

## Open Questions

None left. The conference against the real API answered the two that were open: `playerImage` loads outside the source's site (no proxy needed), and the transfer descriptions seen were "Free", "-" and fee texts such as "90M €", which `transferFeeRaw` already covers; "Loan" did not show up in the sample and stays in the map. It also found country names in English and the "No team" club text from the source, recorded in `docs/divida-tecnica.md`.
