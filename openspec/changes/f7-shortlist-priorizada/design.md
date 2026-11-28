# Design

## Context

The authenticated shell (`src/routes/_authenticated.tsx`) renders `AppShell` with the account link and the header search; `AppShell` prints "Acompanhamentos", "Shortlists" and "Relatórios" as plain text. The player layout (`src/routes/_authenticated/jogadores/$jogadorId.tsx` + `src/pages/player/PlayerLayout.tsx`) renders `ClubBand`, which already takes an `action` node, and the five tabs. Profiles come from `playerProfileQuery` (30-minute cache); the mock answers unknown ids with a plain-text 404. `src/api/errors.ts` already maps every `shortlist.*` code except `shortlist.alterada_por_outra_requisicao`; `describeError` gives the message and the retry flag. `fetchClient` throws `ApiError` for any non-2xx and takes the `If-Match` header declared by the contract. `Select` is a native `<select>` whose options have no `disabled`; `Dialog` (Radix), `TextField`, `Notice`, `InlineError`, `RowList`, `PlayerPhoto`, `Card` and `PageColumns` exist; `formatMoney(value, currency)` in `src/utils/number.ts` writes "€12,5M" and "€850 mil".

Product decisions are in `docs/grilling/f7-shortlist-priorizada.md` (Q1 to Q18 and W1 to W9). The approved wireframe is at https://claude.ai/artifact/EA7gt23fXjsSkXdUccK1qD (the shortlist and the shortlists page on desktop, the 375px screens, the add dialog states, the shortlist states and the new components). The `TargetRow` and `MoneyField` references and the `arrow-up` and `arrow-down` icons are already in `docs/design-system/`.

Back-end facts that shape the approach (`ShortlistController`, `Shortlist` aggregate): every answer is the whole `ShortlistResponseDto` (`shortlistId`, `nome`, `limiteDeAlvos`, `alvos` with `jogadorId`, `prioridade` and `custoEstimado`, `version`, `custoTotal` omitted when empty); the alvo writes need `If-Match: "<version>"` (428 without it, 412 `shortlist.alterada_por_outra_requisicao` with a stale one) and creating a shortlist does not; the insertion `prioridade` is required and goes from 1 to n+1, the repriorização from 1 to n; `Dinheiro` has no validation; the list has no order; nothing reads the source, so the only 502 comes from the alvos' profiles.

ADRs applied: 0004 (no optimistic state; the answer replaces the list; the moved alvo pending; 150ms to the new place), 0005 (CSS Modules), 0006 (writes with `If-Match` from the body `version`, one write in flight, the server wins on 412). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- Every shortlist rule (cost parsing, labels, dialog options, drop prioridade, announcements, error placement) as a pure function tested without React.
- One alvo write in flight per shortlist, always with the `version` of the last answer.
- Every state reproducible by a named MSW handler, with a store that behaves like the aggregate.

**Non-Goals:**
- Reordering the list locally before the answer, or a write queue.
- Limiting the concurrency of the 25 profile requests.
- The phone "Menu" destinations (item 9).

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Shortlists | `GET /api/Shortlist` | `ShortlistResponseDto[]`, unordered, with `alvos` and `version` per item |
| Create | `POST /api/Shortlist` with `{ nome }` | 201; empty name is a `400` without `code` (blocked in the client) |
| Shortlist | `GET /api/Shortlist/{shortlistId}` | 404 `shortlist.nao_encontrada` |
| Add alvo | `POST /api/Shortlist/{shortlistId}/alvos` with `{ jogadorId, prioridade, custoEstimado }` and `If-Match` | 201; 412, 422 `jogador_ja_na_lista`, `limite_de_alvos_atingido`, `moeda_divergente`, `prioridade_fora_da_ordem` |
| Repriorizar | `PUT /api/Shortlist/{shortlistId}/alvos/{jogadorId}` with `{ prioridade }` and `If-Match` | 200; 412, 404 `alvo_nao_encontrado`, 422 `prioridade_fora_da_ordem` |
| Remover | `DELETE /api/Shortlist/{shortlistId}/alvos/{jogadorId}` with `If-Match` | 200; 412, 404 `alvo_nao_encontrado` |
| Alvo profile | `GET /api/Players/{id}/profile` | `playerProfileQuery`, one per alvo; 502 and the plain-text 404 |

### Routes

| File | Path | Note |
| --- | --- | --- |
| `src/routes/_authenticated/shortlists/index.tsx` | `/shortlists` | renders `ShortlistsPage` |
| `src/routes/_authenticated/shortlists/$shortlistId.tsx` | `/shortlists/$shortlistId` | renders `ShortlistPage`; the id is a string (uuid), no search params |

`AppShell` gains `shortlistsLink?: ReactNode`, rendered in place of the "Shortlists" text; `_authenticated.tsx` passes a `Link` to `/shortlists` with `activeOptions: { exact: false }` and `aria-current="page"` when active, styled with the existing `aria-current` underline. The two other links stay text. The phone top bar is unchanged.

### Shortlist rules

| Module | Responsibility |
| --- | --- |
| `src/pages/shortlist/utils/cost.ts` | `parseMillions("12,5")` (comma or dot, up to two decimals, greater than zero) to centavos (`1250000000`), with "Informe um custo maior que zero." and "Use no máximo duas casas decimais."; `millionsInput(raw, currency)` from `proposedMarketValueRaw` to "12,5" when the currency matches, "" otherwise; `formatCost(dinheiro)` through `formatMoney(quantiaEmCentavos / 100, moeda)`; `CURRENCIES` EUR, BRL, USD, GBP |
| `src/pages/shortlist/utils/shortlists.ts` | `sortByName(list)` with `localeCompare('pt-BR')`; `targetsCount(shortlist)` "4 de 25 alvos" and the header form "4 de 25"; `listCurrency(shortlist)` (the first alvo's `moeda` or none); `isFull(shortlist)` against `limiteDeAlvos`; `validateName(nome)` with "Dê um nome à shortlist." and the trimmed name |
| `src/pages/shortlist/utils/addOptions.ts` | `shortlistOptions(shortlists, jogadorId)`: label "<nome>", reason "Já está nesta shortlist" or "Cheia (25 de 25)" with `disabled`, else "<n> de <limite> alvos"; `defaultShortlist(options)` the first enabled; `priorityOptions(count)` "1 — no topo" … "<n+1> — no fim" with the last as default; `addedMessage(nome, prioridade)` |
| `src/pages/shortlist/utils/reorder.ts` | `canMoveUp`, `canMoveDown`; `dropPriority(alvos, activeId, overId)` the prioridade of the row dropped on, or none when unchanged; `pendingText(kind, prioridade)` "Movendo para a prioridade 1…" / "Removendo…"; `announcements(nameOf, count)` with "<nome> pego, prioridade 3 de 4", "movido para a prioridade 1", "solto na prioridade 1", "cancelado" |
| `src/pages/shortlist/utils/shortlistError.ts` | `isShortlistConflict(error)` (412 with `shortlist.alterada_por_outra_requisicao` or without `code`); `conflictText('page' \| 'dialog')`; `writeErrorText(error)` from `describeError` without retry |

### Data hooks

- `useShortlists({ fresh })`: `$api.useQuery('get', '/api/Shortlist')` with `select: sortByName`; 1-minute `staleTime` on the page, `staleTime: 0` and `refetchOnMount: 'always'` in the dialog.
- `useShortlist(shortlistId)`: `$api.useQuery('get', '/api/Shortlist/{shortlistId}')`, 1-minute `staleTime`, `initialData` from the cached list when the item is there.
- `useTargetProfiles(alvos)`: `useQueries` over `playerProfileQuery(jogadorId)` for every alvo, so the cache is shared with the player pages.
- `useCreateShortlist()`: `POST`, then `setQueryData` on the new shortlist and invalidate the list.
- `useTargetWrite(shortlistId)`: one `useMutation` for `{ kind: 'move', jogadorId, prioridade }` and `{ kind: 'remove', jogadorId }`, with `If-Match: "<version>"` of the cached shortlist; on success `setQueryData` with the answer and invalidate the list; on a conflict `refetch` the shortlist and set the conflict notice; no retry. The page reads `isPending` and `variables` to mark the pending row and disable every action.
- `useAddTarget()`: `POST /alvos` with the `version` of the chosen list item; on success `setQueryData` on that shortlist and invalidate the list; on a conflict refetch the list and keep the form.

### Shortlist page

`src/pages/shortlist/ShortlistPage.tsx` receives `shortlistId` and `renderLink` (stories run without a router), under `PageColumns` with the support column empty:

- pending: header and five `TargetRow` in skeleton;
- 404: `Card` with "Shortlist não encontrada." and "Voltar às shortlists"; other errors: the `describeError` message;
- loaded: back link, `ShortlistHeader` (name, the three values above their labels), the full notice, the write notice (conflict or refusal), then `TargetList` or the empty card with "Buscar jogador".

`TargetList` wraps the rows in `DndContext` + `SortableContext` (`verticalListSortingStrategy`), with `PointerSensor` (small activation distance, so the name link still clicks) and `KeyboardSensor` with `sortableKeyboardCoordinates`, and `accessibility` with the pt-BR `announcements` and screen reader instructions ("Para reordenar, pressione espaço, use as setas e pressione espaço de novo. Esc cancela."). `onDragEnd` calls `dropPriority` and, when it returns a prioridade, the write; the list itself is never reordered locally, so the rows return to the server order on drop and move when the answer replaces the data. `useSortable` takes `animateLayoutChanges: () => true` and a 150ms transition, turned off under `prefers-reduced-motion`. Each row is a `TargetRow` fed by its profile query.

### Shortlists page

`src/pages/shortlist/ShortlistsPage.tsx` receives `renderShortlistLink` and `onCreated`: the title, a `Card` with `TextField` "Nome da shortlist" and the primary "Criar shortlist" ("Criando…"), the name error below the field, and a `Card` with a `RowList` of the sorted shortlists (aside "€47M" or "Sem alvos", detail "4 de 25 alvos"); three skeleton rows while pending; "Nenhuma shortlist ainda."; the error message.

### Add dialog

`src/pages/player/components/AddToShortlist/AddToShortlist.tsx` is the secondary `Button` with the `plus` icon passed as the `ClubBand` action by `PlayerLayout` once the profile arrives; it owns the `Dialog` and mounts its content only when open, so nothing is requested before the click. Content states: fields in skeleton while the list loads; without shortlists, the name field and "Criar shortlist" (reusing `useCreateShortlist`); otherwise the `Select` "Shortlist" (options disabled with the reason in the label: "Atacantes — Cheia (25 de 25)"), the `MoneyField` and the `Select` "Prioridade"; the `InlineError` next to the buttons; after success, the check line in `pitch`, "Ver shortlist" (link) and "Fechar". Changing the shortlist resets the prioridade to its end and the currency to the moeda da lista.

### Components

- `src/components/MoneyField/`: the quantity input with the "M" suffix and the currency `<select>` or the locked code, label, hint and error, as in the design system; stories per state.
- `src/components/Select/`: `SelectOption` gains `disabled`.
- `src/pages/shortlist/components/TargetRow/`: the row of the design system (prioridade, photo, name link, detail, cost, handle, "Subir", "Descer", "Remover"), with `handleProps` and `style` for the sortable wrapper, the pending, dragging, loading and unavailable states, the phone second line hiding the handle and the unavailable actions; stories per state.
- `src/pages/shortlist/components/ShortlistHeader/`, `TargetList/`: stories per state.
- `AppShell` and `_authenticated.tsx` as in Routes; `PlayerLayout` passes the action to `ClubBand`.

### MSW per state

`src/mocks/fixtures/shortlists.ts` builds `ShortlistResponseDto` items. `src/mocks/shortlistStore.ts` keeps the scout's shortlists by id, seeded and reset in `src/test/setup.ts` and on page load in `dev:mock`; its operations replicate the aggregate: `version` starting at 1 and rising on every write, 428 without `If-Match`, 412 on a stale version, 422 for a duplicate player, the limit, another currency and a prioridade out of `1..n+1` (insertion) or `1..n` (repriorização), 404 for an unknown alvo or shortlist, renumbering after each write and `custoTotal` as the sum, omitted when empty.

| Handler (`src/mocks/handlers/shortlists.ts`) | State |
| --- | --- |
| `shortlistsList`, `shortlistsEmpty`, `shortlistsUnknownError`, `shortlistsPending` | the list states |
| `shortlistFound`, `shortlistNotFound`, `shortlistUnknownError`, `shortlistPending` | the shortlist states |
| `createShortlist`, `createShortlistUnknownError`, `addTarget`, `moveTarget`, `removeTarget` | the store operations |
| `addTargetConflict`, `addTargetDuplicate`, `addTargetLimit`, `addTargetCurrency`, `addTargetUnknownError`, `moveTargetConflict`, `moveTargetOutOfOrder`, `moveTargetUnknownError`, `removeTargetNotFound`, `writePending` | the refusals and the pending write |

`src/mocks/handlers.ts` answers the `dev:mock` under `withAuth` from the store (Q18): "Laterais 2027" with 1003 (€8M), 1001 (€12,5M), 1002 (€22M) and 1009 (€4,5M) in EUR; "Meias para janeiro" empty; "Atacantes" with 25 alvos (1001 to 1008 and 2001 to 2017) in EUR; "Conflito" with 1004 and 1005 (€9M in total), whose writes always answer 412. The profile handler answers 1009 with 502; 2001 to 2017 already fall into the plain-text 404.

## Risks / Trade-offs

- [25 profile requests at once] → each comes from the 30-minute cache when the scout visited the player; otherwise they run in parallel, and each row shows its own skeleton, so the list never waits for all of them.
- [The dragged row snaps back on drop and only moves with the answer] → required by ADR 0004; the pending text says where it is going, and a reorder is rare and deliberate.
- [`Conflito` is the first shortlist that accepts most players in `dev:mock`] → its additions always end in the conflict message; the other shortlists cover the success path, and the conflict is visible without two tabs.
- [Native `<select>` cannot style a disabled reason] → the reason goes in the option label ("Atacantes — Cheia (25 de 25)"), and the options keep the `Select` look of the design system instead of the wireframe's listbox drawing.
- [Phones reach `/shortlists` only from the dialog's "Ver shortlist"] → the phone "Menu" stays inert until item 9, which is out of scope here.
- [Two decimals typed, one shown] → "9,75" is sent exactly and displayed as "£9,8M" by `formatMoney` (W8).
