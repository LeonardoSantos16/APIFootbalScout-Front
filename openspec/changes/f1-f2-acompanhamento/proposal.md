# Proposal

## Why

The scout follows a player over weeks, but today the front only shows a snapshot: the profile and the per-90 metrics of the moment. F1 (acompanhamento) freezes a linha de base of club, market value and minutagem when the scout starts tracking, and F2 (detecção de mudança) answers "what changed since then" on every leitura. The back-end already opens and reads an acompanhamento; an aferição that cannot be made (`Indisponivel`) is a result to show, never "sem mudança" and never an error. The decisions are in `docs/grilling/f1-f2-acompanhamento.md` (Q1 to Q17 and W1 to W8).

## What Changes

- New "Acompanhamento" tab in the player layout, at `/jogadores/$jogadorId/acompanhamento`, after "Perfil", "Métricas" and "Comparação".
- Not tracked (the leitura answers 404 `acompanhamento.dossie_nao_encontrado`): "Você não acompanha este jogador.", a line on what the linha de base holds, the recorte selector and the "Acompanhar" button, which opens the acompanhamento in the selected recorte.
- Tracked: the janela ("Linha de base de 22/10/2026 · comparando os últimos 27 dias", with "comparando o último dia" and "Linha de base medida hoje") and three independent aferições, "Clube", "Valor de mercado" and "Minutagem", each `ComMudanca` (previous → current, with a signed change for market value and minutagem), `SemMudancaRelevante` (current value muted) or `Indisponivel` (the reason in full for `MoedaInesperada` and `TemporadaVirada`). The tracked tab shows no recorte and no selector, and ignores the recorte in the URL.
- Opening: the button reads "Acompanhando…" until the new leitura arrives; `409 acompanhamento.jogador_ja_acompanhado` just reads again; `422 acompanhamento.limite_atingido` and `422 jogador.informacoes_insuficientes` show their own messages below the button; 502 offers "Tentar de novo".
- Leitura states: loading in skeleton, 502 with "Tentar de novo", other errors by `code`. The leitura stays cached for 5 minutes, the not-tracked answer included.
- Below 720px, the player tabs sit on one line spread across the width instead of wrapping.
- MSW handlers for each acompanhamento state, with an in-memory store so an opened acompanhamento is read back in `dev:mock` and in tests.

## Capabilities

### New Capabilities
- `acompanhamento`: the acompanhamento tab, opening an acompanhamento in a recorte, the janela, the three aferições and their states, and the loading, error and limit states of opening and reading.

### Modified Capabilities
- `perfil-do-jogador`: the player layout gains the "Acompanhamento" tab and the one-line tabs on phones; the tab keeps the recorte and `com` params when the scout leaves it.
- `recorte`: the profile-without-statistics state also applies to the not-tracked acompanhamento tab.
- `tratamento-de-erros`: a leitura failure appears in place of the aferições, with the band and the tabs visible.

## Impact

- **Code:** new route `src/routes/_authenticated/jogadores/$jogadorId/acompanhamento.tsx`; new page `src/pages/tracking/`; fourth tab in the player layout route and `PlayerLayout`; `ChangeChip` in `src/components/`; one-line tabs below 720px in `Tabs`; tracking limit constant in `src/config/scout.ts`; the `acompanhamento.limite_atingido` text in `src/api/errors.ts`; new fixtures, handlers, an in-memory tracking store for the mocks and stories.
- **API:** consumes `POST /api/Acompanhamento` and `GET /api/Acompanhamento/{jogadorId}`, with no contract change. Back-end gaps already recorded in `docs/divida-tecnica.md`: no endpoint lists, counts or closes acompanhamentos, and the leitura does not return its recorte.
- **Dependencies:** none.
- **Depends on:** item 2 (F9 Metricas por 90: recorte selector and derivation), item 3 (Sessao: protected routes) and item 4 (Busca e perfil: player layout and profile cache). Reuses the tab pattern of item 5 (F10).
- **Unblocks:** item 6b (lista e encerramento de acompanhamentos), once the back-end publishes the endpoints; item 9 (navegação) gets the "Acompanhamentos" destination from 6b.

### Out of scope

- The list of tracked players, the "7 de 10" usage and disabling "Acompanhar" before the 422 (item 6b).
- Closing an acompanhamento and reading a closed one (item 6b).
- Showing the recorte of the acompanhamento (the leitura does not return it).
- An accumulated series between the linha de base and the leitura, and alerts.
- An "Acompanhar" action on the profile tab: the acompanhamento tab is the entry point.
