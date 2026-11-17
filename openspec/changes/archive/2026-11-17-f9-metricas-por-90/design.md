# Design

## Context

The scaffold has the API client (`src/api/client.ts`, with the middleware that turns every non-2xx response into an `ApiError` with `status` and `body`, JSON or text), the typed `http` from `openapi-msw`, an empty `/` route and the `QueryClient` created in `src/main.tsx` without a retry policy. There are no components, no MSW server in the tests and no MSW in Storybook, and `@phosphor-icons/react` is not installed yet.

The product decisions are in `docs/grilling/f9-metricas-por-90.md`. The approved wireframe is at https://claude.ai/artifact/SfHiMqyk6vuFgr79WqHnkD (full page with the top navigation and the phone layout; card states on the second page). The visual reference for the components is in `docs/design-system/components/`, which already includes the `Select` and the `sample` of the `StatCell`.

ADRs applied: 0003 (recorte in the URL, with the amendment on order, tie-break and `push`/`replace`) and 0005 (CSS Modules). No decision below contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- Domain rules (recortes, metrics, player, errors, formatting) as pure functions, tested without React.
- The screen only orchestrates: it reads the URL, calls `$api` and hands ready data to the components.
- Every screen state reproducible by a named MSW handler, in tests, stories and `dev:mock`.

**Non-Goals:**
- Router loader and prefetch: F9 loads inside the component; the loader comes when search leads to the profile (item 4).
- A schema validation library for the search params: validation is a small, tested function of our own.
- Radix or React Aria: no component in this change needs them (the selector is native).

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Profile and recortes | `GET /api/Players/{id}/profile` | plain-text errors, without `code` (`docs/divida-tecnica.md`) |
| Metrics | `GET /api/Analise/{jogadorId}/metricas-por-90?CompeticaoId=&TemporadaId=&Contexto=` | PascalCase query, as the contract publishes it |

### Routes and search params

- `src/routes/__root.tsx` renders the page skeleton (`AppShell`) around the `Outlet`.
- `src/routes/jogadores/$jogadorId/metricas.tsx` only declares the route and renders `MetricsPage` from `src/pages/metrics/`. Its `validateSearch` accepts `competicao` and `temporada` as positive integers and `contexto` as `Clube` or `Selecao`; any other value becomes `undefined` (missing recorte). Search params in Portuguese, as in ADR 0003; the translation to `CompeticaoId`/`TemporadaId`/`Contexto` happens only in the API call.
- The recorte correction happens in the page: once the profile is loaded, if the URL recorte is not in the derived list, an effect (with `useEffectEvent`) calls `onSliceChange(first, { replace: true })`, which the route turns into `navigate({ search, replace: true })`. The page gets `playerId`, `search` and `onSliceChange` as props and never imports the route, so the screen stories run without a router. Rejected alternative: a `redirect` in the loader, which would require moving the profile into the loader and swapping the skeleton for a `pendingComponent` too early.
- Changing via the selector uses `navigate({ search })` without `replace`.

### Folder layout

The project convention: shared code lives in global folders under `src/` (`components/`, `hooks/`, `utils/` for pure functions, `interfaces/` for types); code used by a single screen lives in that screen's folder under `src/pages/<screen>/`, with the same `components/`, `hooks/`, `utils/` and `interfaces/` subfolders. Route files in `src/routes/` stay thin and import the page. `src/api/`, `src/config/` and `src/mocks/` are infrastructure and stay as they are.

### Pure functions and types

| Module | Responsibility |
| --- | --- |
| `src/utils/slice.ts` (types in `src/interfaces/slice.ts`) | `deriveSlices(profile)` (context by the `nationalTeamStats` rule, order by `season.id` and minutes), `sliceLabel`, `validateSliceSearch`, `findSlice(slices, search)`, `sliceToSearch`, `sliceToQuery` |
| `src/pages/metrics/utils/metrics.ts` (types in `src/pages/metrics/interfaces/metrics.ts`) | fixed order and labels of the seven `TipoDeAtributoDto`, `buildRows(response)` (fails on a missing attribute, ignores unknown ones), `footerSample` (mode), `footerText`, `refusalText` per reason |
| `src/utils/player.ts` (`PlayerProfile` and `PlayerDetails` in `src/interfaces/player.ts`) | `positionFromLetter`, `age` from `dateOfBirth`, `playerSummary` (header support line) |
| `src/utils/number.ts` | `formatDecimal(value, digits)`, `formatPercent`, `formatMinutes`, on top of `Intl.NumberFormat('pt-BR')` |
| `src/config/scout.ts` | `MIN_SAMPLE_MINUTES = 450`, mirror of `ScoutConfig` (`docs/README.md`) |
| `src/api/errors.ts` | `code -> message` dictionary with the whole table from `docs/erros.md`, `describeError(error, { plainText })` returning `{ message, canRetry }` and logging the `instance` |

Slice, player and number formatting are global because item 4 and F10 reuse them; the metrics rows belong to this screen. Object types are `interface`; unions and contract aliases are `type`. Every identifier is in English (`Slice` is the code name of recorte); contract fields, enum values, URL paths and search params keep their Portuguese names. The unit under test is the domain rule; the feature flow is tested at the route.

### Retry policy

The `QueryClient` moves from `src/main.tsx` to `src/api/queryClient.ts` (`createQueryClient()`), used by the app, the tests and the stories. `retry` repeats only an `ApiError` with status 502, once; `retryDelay` of 2000 ms. Tests create the client with `retryDelay: 0`.

### Components

Port of `docs/design-system/components/` to React with CSS Modules over `tokens.css`, without copying the bundle's `React.createElement`.

- `src/components/`: `Button`, `Card`, `Select`, `InlineError`, `Tabs` (display only in this change), `Skeleton`, `ClubBand` (always on the `club` fallback).
- `src/components/AppShell`: top bar with the app name, "Buscar jogador" field, links and "Sair" (Phosphor icons); "Menu" button below 720px; the page content goes in a `<main>` below it. The top items are not interactive until item 9.
- `src/components/PageColumns`: the two-column body (main card at about two thirds, support column on the right, one column below 720px). It is separate from `AppShell` because `AppShell` wraps every route in `__root.tsx`, while the two columns belong to the player page.
- `src/hooks/usePlayerProfile.ts`: the profile query, reused by item 4 and F10.
- `src/pages/metrics/`: `MetricsPage.tsx` (orchestrates profile, recorte, metrics and errors); `hooks/useMetricsPer90.ts` (the metrics query for the recorte); `components/` with `MetricCell` (calculated, refused and loading states, optional `sample`), `MetricsGrid` (seven rows and footer) and `SliceSelect` (the `Select` with the options from `slice.ts`).

### MSW per state

Fixtures in `src/mocks/fixtures/`, handlers named by state in `src/mocks/handlers/`:

| Handler | State |
| --- | --- |
| `completeProfile` (player 1001) | club and national team, several seasons |
| `nationalTeamOnlyProfile` (1002) | every `stats` item with a national team |
| `profileWithoutStats` (1003) | empty `stats` |
| `profileNotFound` (1004) | plain-text 404 |
| `profileSourceDown` | 502 with `code` |
| `calculatedMetrics` | six calculated, Interceptacoes refused with `FonteNaoAtribuiu`, Precisao with its own sample |
| `insufficientSampleMetrics` | seven refused, 312 min |
| `metricsSourceDown` (1005) | 502 with `code` |
| `metricsWithoutCode` | 500 without `code` |
| `incompleteMetrics` | six attributes |

`src/mocks/handlers.ts` exports the default handlers per `jogadorId` for `dev:mock`: 1001 Rafael Montes (club and national team; the Copa do Brasil 2025 recorte, with 312 min, answers with insufficient sample), 1002 national team only, 1003 without `stats`, 1004 and any unknown id plain-text 404, 1005 full profile with metrics 502. Fixtures live in `src/mocks/fixtures/` (`buildFullProfile`, `buildNationalTeamOnlyProfile`, `buildProfileWithoutStats`, attribute lists) and the error bodies in `src/mocks/responses.ts`. Tests use `src/mocks/server.ts` (`msw/node`) wired in `src/test/setup.ts` with `onUnhandledRequest: 'error'`; stories use `msw-storybook-addon` (`mswLoader` from `msw-storybook-addon/csf3`) and apply handlers per story with `beforeEach({ msw }) { msw.use(...) }`; `parameters.msw` is deprecated in the addon.

### New dependencies

- `@phosphor-icons/react`: approved icons, regular, 20px.
- `msw-storybook-addon`: one handler per story, reusing the same handlers as the tests.

## Risks / Trade-offs

- [The `contexto` rule was never checked against real SofaScore data] → isolated in `deriveSlices` and tested; the check is the first task of item 3, and the fix, if needed, is exposing `contexto` in the back end (`docs/divida-tecnica.md`).
- [`season.id` may not grow over time in every competition] → the order lives in a single place in `slice.ts`; if the item 3 check shows otherwise, the criterion changes without touching the screen.
- [`msw-storybook-addon` may not keep up with Storybook 10] → alternative: a custom decorator that starts the `worker` and applies `worker.use(...)` per story.
- [Correcting the recorte in the page renders once with the wrong recorte before the navigation] → the screen shows a skeleton while the recorte is invalid, so nothing wrong is ever shown.
- [Top links without a destination may look broken] → they render as non-interactive items until item 9.

## Open Questions

- The app name in the top bar stays "APIFootballScout" until there is a brand; changing the text does not change specs or tasks.
