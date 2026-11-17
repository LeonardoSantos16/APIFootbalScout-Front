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
- `src/routes/jogadores/$jogadorId/metricas.tsx`: `validateSearch` accepts `competicao` and `temporada` as positive integers and `contexto` as `Clube` or `Selecao`; any other value becomes `undefined` (missing recorte). Search params in Portuguese, as in ADR 0003; the translation to `CompeticaoId`/`TemporadaId`/`Contexto` happens only in the API call.
- The recorte correction happens in the component: once the profile is loaded, if the URL recorte is not in the derived list, the screen renders `<Navigate replace search={first} />`. Rejected alternative: a `redirect` in the loader, which would require moving the profile into the loader and swapping the skeleton for a `pendingComponent` too early.
- Changing via the selector uses `navigate({ search })` without `replace`.

### Domain modules

| Module | Responsibility |
| --- | --- |
| `src/domain/recorte.ts` | `derivarRecortes(perfil)` (contexto by the `nationalTeamStats` rule, order by `season.id` and minutes), `rotuloDoRecorte`, `encontrarRecorte(lista, search)`, `recorteParaParams` |
| `src/domain/metricas.ts` | fixed order and labels of the seven `TipoDeAtributoDto`, `montarLinhas(resposta)` (fails on a missing attribute, ignores unknown ones), footer sample (mode), refusal text per reason |
| `src/domain/jogador.ts` | position from the source letter, age from `dateOfBirth`, header support line |
| `src/format/numero.ts` | `formatDecimal(valor, casas)`, `formatPercent`, `formatMinutos`, on top of `Intl.NumberFormat('pt-BR')` |
| `src/config/scout.ts` | `AMOSTRA_MINIMA_DE_MINUTOS = 450`, mirror of `ScoutConfig` (`docs/README.md`) |
| `src/api/errors.ts` | `code -> message` dictionary with the whole table from `docs/erros.md`, `describeError(error, { textoPuro })` returning `{ mensagem, podeRepetir }` and logging the `instance` |

The unit under test is the domain rule; the feature flow is tested at the route.

### Retry policy

The `QueryClient` moves from `src/main.tsx` to `src/api/queryClient.ts` (`createQueryClient()`), used by the app, the tests and the stories. `retry` repeats only an `ApiError` with status 502, once; `retryDelay` of 2000 ms. Tests create the client with `retryDelay: 0`.

### Components

Port of `docs/design-system/components/` to React with CSS Modules over `tokens.css`, without copying the bundle's `React.createElement`.

- `src/components/ui/`: `Button`, `Card`, `Select`, `InlineError`, `Tabs` (display only in this change), `Skeleton`, `ClubBand` (always on the `club` fallback).
- `src/components/layout/AppShell`: top bar with the app name, "Buscar jogador" field, links and "Sair" (Phosphor icons); "Menu" button below 720px; two-column body with an empty support column.
- `src/features/metricas/`: `MetricaCell` (calculated, refused and loading states, optional `sample`), `MetricasGrid` (seven rows and footer), `RecorteSelect` (the `Select` with the options from `recorte.ts`), `MetricasPage` (orchestrates profile, recorte, metrics and errors).

### MSW per state

Fixtures in `src/mocks/fixtures/`, handlers named by state in `src/mocks/handlers/`:

| Handler | State |
| --- | --- |
| `perfilCompleto` (player 1001) | club and national team, several seasons |
| `perfilSoSelecao` (1002) | every `stats` item with a national team |
| `perfilSemEstatisticas` (1003) | empty `stats` |
| `perfilNaoEncontrado` (1004) | plain-text 404 |
| `perfilComFonteForaDoAr` | 502 with `code` |
| `metricasCalculadas` | six calculated, Interceptacoes refused with `FonteNaoAtribuiu`, Precisao with its own sample |
| `metricasComAmostraInsuficiente` | seven refused, 312 min |
| `metricasComFonteForaDoAr` (1005) | 502 with `code` |
| `metricasSemCode` | 500 without `code` |
| `metricasIncompletas` | six attributes |

`src/mocks/handlers.ts` exports the default handlers per `jogadorId` for `dev:mock`. Tests use `src/mocks/server.ts` (`msw/node`) wired in `src/test/setup.ts` with `onUnhandledRequest: 'error'`; stories use `msw-storybook-addon` (`mswLoader` from `msw-storybook-addon/csf3`) and apply handlers per story with `beforeEach({ msw }) { msw.use(...) }`; `parameters.msw` is deprecated in the addon.

### New dependencies

- `@phosphor-icons/react`: approved icons, regular, 20px.
- `msw-storybook-addon`: one handler per story, reusing the same handlers as the tests.

## Risks / Trade-offs

- [The `contexto` rule was never checked against real SofaScore data] → isolated in `derivarRecortes` and tested; the check is the first task of item 3, and the fix, if needed, is exposing `contexto` in the back end (`docs/divida-tecnica.md`).
- [`season.id` may not grow over time in every competition] → the order lives in a single place in `recorte.ts`; if the item 3 check shows otherwise, the criterion changes without touching the screen.
- [`msw-storybook-addon` may not keep up with Storybook 10] → alternative: a custom decorator that starts the `worker` and applies `worker.use(...)` per story.
- [Correcting the recorte in the component renders once with the wrong recorte before the `Navigate`] → the screen shows a skeleton while the recorte is invalid, so nothing wrong is ever shown.
- [Top links without a destination may look broken] → they render as non-interactive items until item 9.

## Open Questions

- The app name in the top bar stays "APIFootballScout" until there is a brand; changing the text does not change specs or tasks.
