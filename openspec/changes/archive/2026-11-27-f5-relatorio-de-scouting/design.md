# Design

## Context

The player layout (`src/routes/_authenticated/jogadores/$jogadorId.tsx` + `src/pages/player/PlayerLayout.tsx`) validates the recorte and `com` with `validatePlayerSearch`, picks the tab by the path suffix and renders "Perfil | Métricas | Comparação | Acompanhamento" through `Tabs`, which already holds the tabs on one line below 720px. The profile comes from the 30-minute cache of `usePlayerProfile`. `src/api/errors.ts` already maps every `relatorio.*` and `nota.*` code; `describeError` turns an error into a message and a retry flag. `fetchClient` (`openapi-fetch`) throws `ApiError` for any non-2xx and accepts typed header params, so `If-Match` is declared by the contract on `PUT /{relatorioId}` and `PUT /{relatorioId}/finalizar`. `createQueryClient` repeats only the 502, once, and only for queries. `Dialog` (Radix), `TextField`, `Notice`, `InlineError`, `RowList` and `Card` exist; `InlineError` always labels its action "Tentar de novo". The router is TanStack Router 1.170, whose `useBlocker` takes `shouldBlockFn`, `enableBeforeUnload` and `withResolver`.

Product decisions are in `docs/grilling/f5-relatorio-de-scouting.md` (Q1 to Q28 and W1 to W7). The approved wireframe is at https://claude.ai/artifact/K4QfFWZxsiSkBYu4oBNj9o (the linha do tempo and the editor on desktop, both at 375px, the tab states, the save and conflict states, the finalizado and the correção, the dialogs and the server refusals). The new components were added to the design system first (`docs/design-system/components/`: `TextArea`, `DateField`, `SegmentedControl`, `StatusBadge`, `PointList`, `FinishChecklist`, `ReportTimeline`).

Back-end facts that shape the approach (`RelatorioController`, `Relatorio` aggregate): creating needs `texto` and `observadoEm` and nothing else; `PUT` treats `null` as "keep", replaces each list whole and cannot change `observadoEm`; `PUT` and `finalizar` need `If-Match: "<version>"` (428 without it, 412 `relatorio.alterado_por_outra_requisicao` with a stale one); `finalizar` has no body and overwrites `escritoEm`; a correção needs `texto`, takes no `If-Match` and inherits `jogadorId` and `observadoEm`; the list comes ordered by `observadoEm` descending with `version` in every item; nothing reads the source, so there is no 502.

ADRs applied: 0004 (the server answer replaces the saved state), 0005 (CSS Modules), 0006 (writes with `If-Match` from the body `version`, one write in flight, the server wins on 412). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- Every relatório rule (chains, vigente, row texts, form parsing and validation, the edit payload, the checklist, error placement) as a pure function tested without React.
- One write in flight per relatório, always with the `version` of the last answer.
- Every state reproducible by a named MSW handler, with a store that behaves like the aggregate.

**Non-Goals:**
- Autosave or a write queue.
- Merging local edits with a newer version.
- Any cross-player list of relatórios.

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Linha do tempo | `GET /api/Relatorio/jogador/{jogadorId}` | `RelatorioResponseDto[]`, with `version` per item |
| Relatório | `GET /api/Relatorio/{relatorioId}` | 404 `relatorio.nao_encontrado` |
| Open rascunho | `POST /api/Relatorio` with `{ jogadorId, texto, observadoEm }` | 201; 409 `relatorio.observacao_futura` |
| Edit rascunho | `PUT /api/Relatorio/{relatorioId}` with `EditarRascunhoRelatorioRequestDto` and `If-Match` | 200; 412, 409 `relatorio.ja_finalizado`, 400 `nota.*` and `relatorio.texto_obrigatorio` |
| Finalize | `PUT /api/Relatorio/{relatorioId}/finalizar` with `If-Match` | 200; 412, 409, 422 `relatorio.conclusao_ausente` and `relatorio.conteudo_minimo_nao_atendido` |
| Correção | `POST /api/Relatorio/{relatorioId}/correcoes` with `{ texto }` | 201; 409 `relatorio.correcao_de_rascunho` |
| Profile | `GET /api/Players/{id}/profile` | from the 30-minute cache, for the tab title |

### Routes and search params

| File | Path | Note |
| --- | --- | --- |
| `src/routes/_authenticated/jogadores/$jogadorId.tsx` | layout | the tab picker selects `reports` when the path contains `/relatorios`; `renderTabLink` gets the fifth link with `search: (prev) => prev` |
| `src/routes/_authenticated/jogadores/$jogadorId/relatorios/index.tsx` | `/jogadores/$jogadorId/relatorios` | renders `ReportsPage` |
| `src/routes/_authenticated/jogadores/$jogadorId/relatorios/novo.tsx` | `/jogadores/$jogadorId/relatorios/novo?corrige=` | `corrige` optional, kept only when it is a string; renders `ReportEditorPage` for a new relatório or a new correção |
| `src/routes/_authenticated/jogadores/$jogadorId/relatorios/$relatorioId.tsx` | `/jogadores/$jogadorId/relatorios/$relatorioId` | renders `ReportEditorPage` for a saved rascunho or the reading of a finalizado |

`PlayerTab` gains `'reports'`, label "Relatórios". After the first save, `novo` navigates to `$relatorioId` with `replace: true`. The recorte and `com` stay in the URL untouched.

### Relatório rules

| Module | Responsibility |
| --- | --- |
| `src/pages/report/utils/timeline.ts` | `buildTimeline(reports)`: groups by root (climbing `corrigeRelatorioId` while the parent is in the list, with a guard against cycles), groups by `observadoEm` descending, items by `escritoEm` ascending; per item the status (`draft`, `finalized`, `current`: the latest finalizado of the group by `escritoEm`), the title ("Observado em dd/mm/aaaa" for the root, "Correção de dd/mm/aaaa" by `escritoEm` otherwise), the detail ("6,5 de 10 · Monitorar", "Sem nota · Sem parecer"), the note "Corrigido pela correção de dd/mm/aaaa" from the latest finalizado child, and `pendingCorrectionId` on the vigente when a rascunho child exists |
| `src/pages/report/utils/reportForm.ts` | `toForm(report)` and `emptyForm(today, narrative?)`; `parseRating("7,5")` (comma or dot, 0 to 10, one decimal); `cleanPoints(list)` (trim, drop empty); `validateForm(form, saved)` with the messages "Escreva o relato.", "A nota deve estar entre 0 e 10.", "A nota aceita no máximo uma casa decimal." and "Informe a nota." (a saved nota erased); `editPayload(saved, form)` with only the changed fields, lists whole; `isDirty(saved, form)` |
| `src/pages/report/utils/checklist.ts` | `buildChecklist(form)` over the cleaned pontos with `MIN_POSITIVE_POINTS`, `MIN_NEGATIVE_POINTS` and `MIN_POINTS_CHARACTERS` from `src/config/scout.ts` (2, 2, 20, the `ScoutConfig` values); `isComplete(checklist)` |
| `src/pages/report/utils/reportDates.ts` | `todayInput()` in local time; `observationToApi("2026-11-24")` as local midnight with the local offset; `formatDate(iso)` "dd/mm/aaaa" in local time |
| `src/pages/report/utils/reportError.ts` | `isConflict(error)` (412 `relatorio.alterado_por_outra_requisicao`), `isAlreadyFinalized(error)` (409 `relatorio.ja_finalizado`), `describeWriteError(error)`: the 422 and 409 `observacao_futura` as a notice above the buttons, the rest by `describeError` next to the buttons without retry |
| `src/pages/report/utils/correctionReference.ts` | "Corrige o relatório observado em dd/mm/aaaa" or "Corrige a correção de dd/mm/aaaa" from the corrected relatório |

### Data hooks

- `useReports(playerId)`: `$api.useQuery('get', '/api/Relatorio/jogador/{jogadorId}')` with a 1-minute `staleTime` and `select: buildTimeline`.
- `useReport(reportId)`: `$api.useQuery('get', '/api/Relatorio/{relatorioId}')` with a 1-minute `staleTime` and `initialData` from the cached list when the item is there.
- `useSaveReport(playerId)`: one `useMutation` that receives `{ saved?, form, correctionOf? }` and runs, in order, `POST /api/Relatorio` or `POST /{id}/correcoes` when there is no saved relatório, then `PUT /{id}` with `If-Match: "<version>"` when `editPayload` is not empty. Each answer goes to the relatório query with `setQueryData` before the next step, so a failure after the `POST` leaves the created rascunho in the cache and the page on its URL. On settle it invalidates the list.
- `useFinalizeReport(playerId)`: saves first when dirty (the same steps), then `PUT /{id}/finalizar` with the latest `version`, `setQueryData` and invalidates the list.
- Neither mutation is retried. A 412 sets `conflict` in the page state until "Carregar a versão atual" refetches the relatório and resets the form; a 409 `relatorio.ja_finalizado` refetches and shows the reading.

### Page

`src/pages/report/ReportsPage.tsx` (the tab) receives `playerId`, `renderReportLink` and `renderNewLink` (stories run without a router): the card "Relatórios" with "Escrever relatório" in the header (secondary) and `ReportTimeline`; skeleton rows while pending; the empty text with the primary button; `InlineError` with "Tentar de novo" on failure.

`src/pages/report/ReportEditorPage.tsx` receives `playerId`, `reportId?`, `correctionOf?` and the link renderers, under `PageColumns`:

- relatório or corrected relatório pending: the editor in skeleton;
- 404: `Card` "Relatório" with "Relatório não encontrado." and "Voltar aos relatórios";
- finalizado: `ReportReading` (status, dates, nota and parecer above their labels, relato, pontos, the replaced note or the reference, "Criar correção" or "Continuar correção" on the vigente);
- rascunho or new: `ReportForm` on the left (back link, title and status, `DateField`, `TextArea`, the nota `TextField`, `SegmentedControl`, two `PointList`) and `ReportActions` in the support column (`FinishChecklist`, the notice, the error, "Alterações não salvas", "Salvar rascunho" secondary and "Finalizar relatório" primary), stacked below the form under 720px.

The form state lives in the page (`useState` seeded by `toForm`), reset when a new `version` arrives from a save or a reload. `useBlocker({ shouldBlockFn: () => isDirty, enableBeforeUnload: () => isDirty, withResolver: true })` drives the "Sair sem salvar?" `Dialog` (the primary action "Continuar editando"); the first-save navigation and the reload after a conflict skip the blocker. `document.title` follows the browser tab title requirement.

### Components

- `src/components/TextArea/`, `src/components/DateField/` (with the read-only text form), `src/components/SegmentedControl/` (native radios in a `fieldset`), `src/components/StatusBadge/`: CSS Modules over the tokens, stories per state, as in the design system.
- `src/components/InlineError/` gains `actionLabel` for "Carregar a versão atual" (W1), keeping "Tentar de novo" as the default.
- `src/pages/report/components/PointList/`, `FinishChecklist/`, `ReportTimeline/` (over `RowList` rows, with the indented correções), `ReportForm/`, `ReportActions/`, `ReportReading/`, with stories per state.
- `Tabs` gains `shortLabel`: below 720px the tabs use the `label` text style (13px, weight 600) and "Acompanhamento" reads "Acompanh.", with the full label as the accessible name (W7, decided in the browser check: 352px of labels plus 48px of gaps did not fit in 343px).
- `ReportTimeline` renders its own rows with the `RowList` look instead of reusing `RowList`, which has no slot for the status, the note and the indented correções.
- `Button` exposes `buttonClassName` and `linkButtonClassName` (`src/components/Button/buttonClassName.ts`) so a router `Link` can look like a button ("Escrever relatório", "Criar correção", "Voltar aos relatórios").
- The leave blocker lives in `src/routes/_authenticated/jogadores/$jogadorId/relatorios/-ReportEditorRoute.tsx` (ignored by the route generator), shared by `novo` and `$relatorioId`; the page only reports whether it has unsaved changes. A rascunho created by a first save whose second request failed carries the local edits and the error to the new URL (`carriedEdits`).

### MSW per state

`src/mocks/fixtures/reports.ts` builds `RelatorioResponseDto` items (relato, nota, parecer, pontos, dates). `src/mocks/reportStore.ts` keeps the relatórios by id, seeded per player and reset in `src/test/setup.ts`; its operations replicate the aggregate: `version` starting at 1 and rising on every write, 428 without `If-Match`, 412 on a stale version, 409 on a finalizado, 422 for the conclusion and the minimum content, 409 for a future `observadoEm`, a correção inheriting `observadoEm`.

| Handler (`src/mocks/handlers/reports.ts`) | State |
| --- | --- |
| `reportsList`, `reportsEmpty`, `reportsUnknownError`, `reportsPending` | the list states |
| `reportFound`, `reportNotFound`, `reportPending` | the relatório states |
| `createReport`, `editReport`, `finalizeReport`, `correctReport` | the store operations |
| `editReportConflict`, `editReportAlreadyFinalized`, `editReportUnknownError`, `finalizeReportMinimumContent`, `finalizeReportConclusionMissing`, `createReportFutureDate`, `writePending` | the refusals and the pending write |

`src/mocks/handlers.ts` answers the `dev:mock` under `withAuth` from the store (Q24): 1001 with the chain (original finalizado, correção vigente, correção of the correção in rascunho) and a loose rascunho; 1002 with one vigente; 1003 empty; 1005 with a rascunho whose `PUT` always answers 412; 1007 with the list answering 500; any other player starts empty and writes go to the store.

## Risks / Trade-offs

- [`observadoEm` stored as UTC by the back-end] → the date is sent as local midnight with the offset and shown in local time, so it reads back the same day in the scout's time zone; a scout in another zone sees the shifted day. Accepted for the first version.
- [Two requests on the first save] → the `POST` can succeed and the `PUT` fail; the page moves to the new URL with the fields kept and the next save sends only the `PUT` (Q17).
- [Abandoned rascunhos accumulate] → no delete endpoint; recorded in `docs/divida-tecnica.md`.
- [`escritoEm` changes on finalization] → the correção title shows the finalization date once finalized; the order inside a group stays right because a correção is always finalized after the relatório it corrects.
- [Five tabs at 375px] → resolved with the 13px tabs and the short "Acompanh." label on phones (W7), recorded in the spec.
