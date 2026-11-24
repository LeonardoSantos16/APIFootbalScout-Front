# Design

## Context

The player layout (`src/routes/_authenticated/jogadores/$jogadorId.tsx` + `src/pages/player/PlayerLayout.tsx`) validates the recorte and `com` with `validatePlayerSearch`, picks the tab by the path suffix and renders "Perfil | Métricas | Comparação" through `Tabs`. `useSliceSelection` (`src/hooks/`) derives the recortes from the 30-minute profile cache, corrects a missing recorte with `replace` and feeds the `Select`. `src/utils/number.ts` already formats money (`formatMoney`: "€9,6M", "€8M"), percentages and minutes. `src/api/errors.ts` maps every `acompanhamento.*` and `jogador.*` code, with the limit text still saying "Encerre um para abrir outro". `createQueryClient` repeats only the 502, once, after 2 s, and only for queries.

Product decisions are in `docs/grilling/f1-f2-acompanhamento.md` (Q1 to Q17 and W1 to W8). The approved wireframe is at https://claude.ai/artifact/BzMwpv7rWYKeqeW4ursJek (the tracked panel on desktop, the 375px screens, the leitura states and the not-tracked and opening states). `MeasurementCard` and `ChangeChip` already exist in the design system; this change only adjusted the muted current value (W1) and the one-line tabs below 720px (W8) there.

Back-end facts that shape the approach: the controller only opens and reads; the leitura takes no recorte and returns none; a player without an active acompanhamento answers 404 `acompanhamento.dossie_nao_encontrado`; every leitura reads the source and can answer 502; `variacaoPercentualAbsoluta` has no sign; `MotivoDeIndisponibilidadeDto` is `MoedaInesperada` or `TemporadaVirada`; money comes as `quantiaEmCentavos` + `moeda`.

ADRs applied: 0003 (recorte in the URL, used here only before tracking), 0004 (server answer replaces local state: after opening, the panel comes from a new leitura, not from the `201`), 0005 (CSS Modules). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- Every acompanhamento rule (janela text, aferição view per state, signs, reasons, error texts) as a pure function tested without React.
- One leitura per player per 5 minutes, the not-tracked answer included.
- Every state reproducible by a named MSW handler, and an opened acompanhamento read back in `dev:mock` and in tests.

**Non-Goals:**
- Listing, counting or closing acompanhamentos (item 6b).
- Showing the recorte of the acompanhamento.
- Retrying the opening automatically.

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Leitura | `GET /api/Acompanhamento/{jogadorId}` | 200 `ConsultarMudancaAcompanhamentoResponseDto`; 404 `acompanhamento.dossie_nao_encontrado` is the not-tracked state; 502 from the source |
| Opening | `POST /api/Acompanhamento` with `AbrirAcompanhamentoRequestDto` `{ jogadorId, competicaoId, temporadaId, contexto }` | 201 `AbrirAcompanhamentoResult` (only used as a signal); 409 `acompanhamento.jogador_ja_acompanhado`; 422 `acompanhamento.limite_atingido` and `jogador.informacoes_insuficientes`; 502 |
| Profile | `GET /api/Players/{id}/profile` | from the 30-minute cache, for the recortes and the tab title |

### Routes and search params

| File | Path | Note |
| --- | --- | --- |
| `src/routes/_authenticated/jogadores/$jogadorId.tsx` | layout | the tab picker learns the `/acompanhamento` suffix; `renderTabLink` gets the fourth link with `search: (prev) => prev` |
| `src/routes/_authenticated/jogadores/$jogadorId/acompanhamento.tsx` | `/jogadores/$jogadorId/acompanhamento?competicao=&temporada=&contexto=` | renders `TrackingPage`; the recorte change navigates like the metrics (push, `replace` for the correction); `com` is kept untouched |

`PlayerTab` gains `'tracking'`, with label "Acompanhamento" and title "Acompanhamento". The slice correction of `useSliceSelection` keeps running on the tracked panel; it only rewrites the URL, which the panel ignores.

### Acompanhamento rules

| Module | Responsibility |
| --- | --- |
| `src/pages/tracking/utils/window.ts` | `windowText(janela)`: "Linha de base de dd/mm/aaaa · comparando os últimos N dias" with `Math.floor(duracaoEmDias)`, "comparando o último dia" for 1, "Linha de base medida hoje" below 1; the date from `janela.de` in `pt-BR`, UTC |
| `src/pages/tracking/utils/measurements.ts` | `buildMeasurements(response)`: three `MeasurementView` (`title`, `state`, `previous`, `current`, `change?: { direction, text }`, `reason?`) in the order Clube, Valor de mercado, Minutagem; money as `formatMoney(quantiaEmCentavos / 100, moeda)`; market value `change` "+20,0% alta" or "−20,0% queda" by `atual` against `anterior`, with `formatDecimal(…, 1)` and the minus sign `−`; minutagem `previous` without unit and `current` with `formatMinutes`, `change` "+420 min a mais"; club with no `change`; `SemMudancaRelevante` keeps only `current` (absent when the API omits it); `Indisponivel` maps `motivo` to the design system texts |
| `src/pages/tracking/utils/trackingError.ts` | `isNotTracked(error)` (404 with `acompanhamento.dossie_nao_encontrado`); `isAlreadyTracked(error)` (409 `acompanhamento.jogador_ja_acompanhado`); `describeReadingError(error)`: 502 "Não foi possível ler o acompanhamento agora." with retry, otherwise `describeError`; `describeOpeningError(error)`: 502 "Não foi possível acompanhar agora." with retry and `placement: 'replace'`, the two 422 by `describeError` with `placement: 'below'`, otherwise `describeError` in place of the button |

`src/config/scout.ts` gains `TRACKING_LIMIT = 10` (the `LimiteObservacoesJogadores` of `ScoutConfig`), and `src/api/errors.ts` writes the limit text as `Limite de ${TRACKING_LIMIT} acompanhamentos atingido.`.

### Data hooks

`src/pages/tracking/hooks/useTracking.ts`: a `useQuery` with the key of `$api.queryOptions('get', '/api/Acompanhamento/{jogadorId}', …)` and a `queryFn` that calls `fetchClient.GET` and returns `null` when `isNotTracked(error)`, so the not-tracked answer is data and stays in the cache for the 5-minute `staleTime` (an error would be refetched on every mount). `select` returns `{ window: windowText(...), measurements: buildMeasurements(...) }` or `null`.

`src/pages/tracking/hooks/useOpenTracking.ts`: a `useMutation` whose `mutationFn` takes the `Slice`, calls `fetchClient.POST('/api/Acompanhamento')`, swallows `isAlreadyTracked` (so the 409 ends as a success and never reaches the error state) and then awaits `queryClient.invalidateQueries` of the leitura key; the mutation stays pending from the click until that refetch settles, so the button reads "Acompanhando…" until the panel can render. The mutation is not retried.

### Page

`src/pages/tracking/TrackingPage.tsx` receives `playerId`, `search` and `onSliceChange` (the stories run without a router), under `PageColumns`:

- profile or leitura pending: `TrackingPanel` without a view (janela line and three cards in skeleton, announced as `role="status"` "Carregando acompanhamento");
- leitura failed: `Card` titled "Acompanhamento" with `InlineError` from `describeReadingError`;
- not tracked and profile without `stats`: `Card` with "Sem estatísticas publicadas para este jogador.";
- not tracked: `TrackingStart` in a `Card` titled "Acompanhamento": both texts, `Select` (`SLICE_SELECT_LABEL`), the primary `Button` "Acompanhar" / "Acompanhando…" (disabled with the select while `opening`), `Notice` below for `placement: 'below'`, `InlineError` in place of the button for `placement: 'replace'` (its "Tentar de novo" calls the mutation again with the same recorte);
- tracked: the section title "Acompanhamento", the janela line and the three `MeasurementCard`, with no selector.

`document.title` is "Acompanhamento · <nome>", or "Acompanhamento".

### Components

- `src/components/ChangeChip/`: `direction` (`up` | `down`) and the text; `--up` over `--up-tint`, `--down` over `--down-tint`, `--radius-sm`; stories up and down.
- `src/pages/tracking/components/MeasurementCard/`: `title`, `state` and, by state, `previous`/`current`/`change` or `reason`; `ComMudanca` with "previous → current" (previous and arrow in `--ink-muted`), `SemMudancaRelevante` with `current` in `--ink-muted` and "Sem mudança relevante" in `--ink-soft`, `Indisponivel` with the reason in `--ink-subtle` and the dashed `--line-strong` outline; stories per state and per title.
- `src/pages/tracking/components/TrackingPanel/`: the section title, the janela and the three cards in the grid, or the skeleton when it has no view; `MeasurementCard` is split into `MeasurementBody` (the content per state) and `MeasurementCardSkeleton`.
- `src/pages/tracking/components/TrackingStart/`, with stories; `Select` gains `disabled` to lock the recorte while opening (W3).
- `src/components/Tabs/Tabs.module.css`: below 720px, `justify-content: space-between` and `column-gap: var(--space-3)`, keeping `flex-wrap: wrap` (W8).

The three cards sit in a grid of three equal columns on desktop and one column below 720px.

### MSW per state

`src/mocks/fixtures/tracking.ts` builds `ConsultarMudancaAcompanhamentoResponseDto` per state (janela from a fixed `de`, `ate` and `duracaoEmDias`; club "Vila Nova Paulista" → "Atlético Serrano"; €8M → €9,6M; 820 → 1.240 min). `src/mocks/trackingStore.ts` keeps the tracked player ids, seeded with 1001, 1002 and 1003 and reset in `src/test/setup.ts` like the auth store.

| Handler (`src/mocks/handlers/tracking.ts`) | State |
| --- | --- |
| `trackingWithChanges`, `trackingMarketValueDown`, `trackingOpenedToday`, `trackingNoRelevantChange`, `trackingUnavailable` | the leitura states |
| `trackingNotTracked` | 404 `acompanhamento.dossie_nao_encontrado` |
| `trackingSourceDown`, `trackingUnknownError`, `trackingPending` | 502, 500 without code, never resolves |
| `openTracking` | 201, adds the player to the store |
| `openTrackingAlreadyTracked`, `openTrackingLimitReached`, `openTrackingInsufficientInformation`, `openTrackingSourceDown`, `openTrackingPending` | 409, the two 422, 502, never resolves |

`src/mocks/handlers.ts` answers the `dev:mock` under `withAuth` (Q13): the leitura from the store (1001 with changes, 1002 no relevant change, 1003 club change and both unavailable, any other stored id opened today), 502 for 1007, 404 for anyone else; opening answers 422 limit for 1005, 422 insufficient information for 1006, 409 for a stored id and 201 otherwise. 1004 keeps its missing profile, so the working "Acompanhar" moves to a new player 1008, Tiago Ferraz (`M` in the search without a club, full profile), found by "tiago" and kept out of the "atlético" search.

## Risks / Trade-offs

- [The leitura does not return its recorte] → the tracked panel shows none; recorded in `docs/divida-tecnica.md`.
- [The limit is only known after a 422] → the message appears on the first refused click; item 6b disables the button once the back-end exposes the usage.
- [`duracaoEmDias` and `janela.de` in UTC] → the date is formatted in UTC, so a linha de base measured late at night may show the next day in Brazil; accepted for the first version.
- [A new mock player shifts the search fixtures] → 1008 has no club in the search, so the "atlético" lists keep their players; the comparison test that lists every mock player now includes Tiago Ferraz as a comparable midfielder.
- [The real API sends `SemMudancaRelevante` without values] → found against the real API: the card shows only "Sem mudança relevante" until the back-end carries the values (`docs/divida-tecnica.md`); the muted current value of W1 only shows in `dev:mock`.
