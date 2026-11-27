# Proposal

## Why

The relatório is the central product of the tool: the scout's written parecer about a player after an observação. F5 (relatório de scouting) lets the scout open a rascunho, edit it in parts, finalize it once nota, parecer and the minimum pontos are there, and fix a finalizado only through a correção that references it. The back-end already exposes every operation in `/api/Relatorio`, with optimistic concurrency (`If-Match` and `412`) on every write that replaces the document. The decisions are in `docs/grilling/f5-relatorio-de-scouting.md` (Q1 to Q28 and W1 to W7).

## What Changes

- New "Relatórios" tab in the player layout, the fifth, at `/jogadores/$jogadorId/relatorios`: the linha do tempo of the scout's relatórios about the player, grouped by correção chain ("Observado em 02/11/2026", "Correção de 05/11/2026"), each with its status ("Rascunho", "Finalizado", "Vigente"), nota and parecer, and "Escrever relatório"; the empty, loading and error states.
- The editor at `/jogadores/$jogadorId/relatorios/novo` and `/jogadores/$jogadorId/relatorios/$relatorioId`: data da observação (today by default, never in the future, read-only after the first save), relato, nota (0 to 10, one decimal, comma accepted), parecer ("Contratar", "Monitorar", "Reavaliar", "Descartar"), pontos positivos and pontos negativos.
- Explicit save with "Salvar rascunho" and the "Alterações não salvas" line; the rascunho is only created on the first save (`POST`, then a `PUT` with the remaining fields); one write in flight at a time.
- A neutral checklist of what is missing to finalize, always visible; "Finalizar relatório" enabled only when it closes, confirmed in a dialog, saving pending changes first.
- The finalizado read-only, with "Criar correção" only on the vigente, "Continuar correção" when a correção rascunho already exists, and "Corrigido pela correção de …" on the replaced ones. A correção starts with the relato of the previous relatório and the same data da observação, with nota, parecer and pontos empty.
- Concurrency: every `PUT` carries `If-Match` with the last `version`; a `412` keeps the local edits and offers "Carregar a versão atual"; a `409 relatorio.ja_finalizado` shows the finalizado.
- Leaving with unsaved changes asks "Sair sem salvar?"; closing or reloading the window uses the browser warning.
- MSW handlers for every state, with an in-memory relatório store that replicates the domain rules (version, finalizado, conteúdo mínimo, `If-Match`).

## Capabilities

### New Capabilities
- `relatorio-de-scouting`: the relatórios tab and its linha do tempo, the editor of a rascunho and of a correção, the checklist and the finalization, the read-only finalizado, saving with concurrency and the loading, empty, conflict and error states.

### Modified Capabilities
- `perfil-do-jogador`: the player layout gains the fifth tab "Relatórios"; the tab keeps the recorte and `com` params without using them; the one-line tabs on phones hold five tabs.

## Impact

- **Code:** new routes under `src/routes/_authenticated/jogadores/$jogadorId/relatorios/`; new page `src/pages/report/`; fifth tab in the player layout route and `PlayerLayout`; new components `TextArea`, `DateField`, `SegmentedControl` and `StatusBadge` in `src/components/`; `InlineError` gains a custom action label; report minimums in `src/config/scout.ts`; new fixtures, handlers and an in-memory report store for the mocks and stories.
- **API:** consumes `GET /api/Relatorio/jogador/{jogadorId}`, `GET /api/Relatorio/{relatorioId}`, `POST /api/Relatorio`, `PUT /api/Relatorio/{relatorioId}`, `PUT /api/Relatorio/{relatorioId}/finalizar` and `POST /api/Relatorio/{relatorioId}/correcoes`, with no contract change. Back-end gaps already recorded in `docs/divida-tecnica.md`: no way to delete a rascunho, an empty relato on creation answers `400` without `code`, and the back-end front-end docs do not mention `If-Match`.
- **Architecture:** ADR 0006 (writes with `If-Match` from the body `version`), complementing ADR 0004.
- **Dependencies:** none.
- **Depends on:** item 3 (Sessao: protected routes) and item 4 (Busca e perfil: player layout and profile cache). Reuses the tab pattern of items 5 and 6.
- **Unblocks:** item 8 (F7 Shortlist), which reuses ADR 0006 and the write-with-version pattern; item 9 (navegação) can link a "Relatórios" destination once a cross-player list exists.

### Out of scope

- Relatório de partida and PDF export.
- A cross-player "meus relatórios" list (the contract only lists by player).
- Deleting a rascunho (no endpoint).
- Autosave, merging concurrent edits, and editing the data da observação after the first save.
- Any relatório action on the "Perfil" tab: the "Relatórios" tab is the entry point.
