# Proposal

## Why

The scout needs to turn the players they evaluated into an ordered list of targets for a transfer window, with an estimated cost per target and a total. F7 (shortlist priorizada) gives them named shortlists whose alvos keep a total order `1..n` without gaps, with one currency per list, a limit of 25 alvos and the custo total computed by the server. The back-end already exposes every operation in `/api/Shortlist`, every write answering the whole shortlist renumbered and guarded by `If-Match`. The decisions are in `docs/grilling/f7-shortlist-priorizada.md` (Q1 to Q18 and W1 to W9).

## What Changes

- New page `/shortlists`: the field "Nome da shortlist" with "Criar shortlist" and the scout's shortlists in alphabetical order, each with "12 de 25 alvos" and the custo total ("Sem alvos" when empty); the empty, loading and error states.
- New page `/shortlists/$shortlistId`: the name, "4 de 25" alvos, the custo total and the moeda da lista, and the alvos in prioridade order with photo, name, position and club from the cached profile and the custo estimado of the shortlist; a row whose profile is loading, failed (`502` with "Tentar de novo") or missing (`404`) keeps its prioridade, cost and actions.
- Repriorizar by dragging (pointer and keyboard, with pt-BR announcements) and by "Subir"/"Descer"; "Remover" without confirmation. No optimistic state (ADR 0004): one write at a time, the moved row pending ("Movendo para a prioridade 1…"), the list replaced by the answer.
- Below 720px the drag handle is hidden and the actions become a second line with text.
- "Adicionar à shortlist" in the club band of every player tab, opening a dialog: the shortlist (the ones that already hold the player or are full disabled with the reason), the custo estimado in millions prefilled with the market value when the currency fits, the currency locked to the moeda da lista, the prioridade (at the end by default); creating the first shortlist inside the dialog; "Adicionado a <nome>, na prioridade 3." with "Ver shortlist".
- Concurrency: every alvo write carries `If-Match` with the last `version`; a `412` reloads the shortlist and asks the scout to redo the change; the `422` codes are shown from their `code`.
- The top "Shortlists" link leads to `/shortlists`, marked as current on the shortlist pages.
- MSW handlers for every state, with an in-memory shortlist store that replicates the aggregate.

## Capabilities

### New Capabilities
- `shortlist-priorizada`: the shortlists page and creation, the shortlist page with its alvos, repriorizar and remover, adding an alvo from the player, the cost field, concurrency and the loading, empty, full, conflict and error states.

### Modified Capabilities
- `navegacao`: the top "Shortlists" link gains its destination and the current state.
- `perfil-do-jogador`: the club band gains the "Adicionar à shortlist" action on every player tab.

## Impact

- **Code:** new routes `src/routes/_authenticated/shortlists/index.tsx` and `src/routes/_authenticated/shortlists/$shortlistId.tsx`; new page folder `src/pages/shortlist/`; the add dialog under the player layout; `AppShell` with a link renderer for "Shortlists"; `ClubBand` used with an action; new `MoneyField` in `src/components/`; the `shortlist.alterada_por_outra_requisicao` message in `src/api/errors.ts`; new fixtures, handlers and an in-memory shortlist store for the mocks and stories.
- **API:** consumes `GET /api/Shortlist`, `POST /api/Shortlist`, `GET /api/Shortlist/{shortlistId}`, `POST /api/Shortlist/{shortlistId}/alvos`, `PUT /api/Shortlist/{shortlistId}/alvos/{jogadorId}` and `DELETE /api/Shortlist/{shortlistId}/alvos/{jogadorId}`, plus `GET /api/Players/{id}/profile` per alvo, with no contract change. Back-end gaps recorded in `docs/divida-tecnica.md`: no rename, delete or cost edit, `Dinheiro` without validation, the empty name answering `400` without `code`, and the list without order.
- **Architecture:** ADR 0004 (no optimistic state) and ADR 0006 (writes with `If-Match`); no new ADR.
- **Dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable` and `@dnd-kit/utilities` for accessible drag and drop.
- **Depends on:** item 3 (Sessão: protected routes), item 4 (Busca e perfil: player layout and the 30-minute profile cache) and item 7 (F5: the write-with-version pattern of ADR 0006).
- **Unblocks:** item 9 (navegação), which gets a real "Shortlists" destination for the phone menu and the home page.

### Out of scope

- Renaming or deleting a shortlist and editing an alvo's cost (no endpoint): to change the cost, the scout removes and adds again.
- Collaborative shortlists and profiles in batch.
- Adding an alvo from the shortlist page itself: alvos enter from the player.
- The "Menu" of the phone top bar, which stays without destinations until item 9.
- Showing on the profile which shortlists already hold the player.
