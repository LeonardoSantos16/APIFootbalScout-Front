# Tasks

## 1. Acompanhamento rules

- [x] 1.1 TDD of `src/pages/tracking/utils/window.ts`: 27.4 days from 2026-10-22 gives "Linha de base de 22/10/2026 · comparando os últimos 27 dias"; 1.6 days "comparando o último dia"; 0.2 days "Linha de base medida hoje"; 2.0 days "comparando os últimos 2 dias"; `test:` red for the group
- [x] 1.2 TDD of `src/pages/tracking/utils/measurements.ts`: order Clube, Valor de mercado, Minutagem; club change "Vila Nova Paulista → Atlético Serrano" without `change`; market value up "€8M → €9,6M" with "+20,0% alta" and down "€12,5M → €10M" with "−20,0% queda"; minutagem "820 → 1.240 min" with "+420 min a mais"; `SemMudancaRelevante` with only the current value, and without it when the API omits `atual`; `Indisponivel` with each reason text and no values; same `test:` red
- [x] 1.3 TDD of `src/pages/tracking/utils/trackingError.ts`: `isNotTracked` and `isAlreadyTracked` by status and `code`; reading 502 "Não foi possível ler o acompanhamento agora." with retry; reading 500 without code "Não foi possível concluir agora."; opening 502 "Não foi possível acompanhar agora." with retry in place of the button; opening 422 `acompanhamento.limite_atingido` "Limite de 10 acompanhamentos atingido." and `jogador.informacoes_insuficientes` below the button, without retry; same `test:` red
- [x] 1.4 Green of 1.1 to 1.3 in one `feat:` commit, with `TRACKING_LIMIT` in `src/config/scout.ts` and the limit text of `src/api/errors.ts`; verify with `npx vitest run src/pages/tracking/utils src/api`

## 2. Mocks and data hooks

- [x] 2.1 `src/mocks/fixtures/tracking.ts`, `src/mocks/trackingStore.ts` (seeded with 1001, 1002, 1003, reset in `src/test/setup.ts`) and the named handlers of `src/mocks/handlers/tracking.ts` for every leitura and opening state; verify with `npm run typecheck`
- [x] 2.2 Default leitura and opening in `src/mocks/handlers.ts` under `withAuth` (store, 1007 502, 1005 and 1006 the two 422, 409 for a stored id); new player 1008 Tiago Ferraz in the profile and search fixtures, without a club; verify with `npm test` (the existing search and comparison tests stay green)
- [x] 2.3 `useTracking` (not-tracked as `null` data, 5-minute `staleTime`, `select` with the rules of group 1) and `useOpenTracking` (invalidate and await the leitura on success and on 409, `opening` until it settles); verify with `npm run typecheck`

## 3. Components

- [x] 3.1 `ChangeChip` in `src/components/` with stories up and down; CSS Module over the tokens only; verify in Storybook
- [x] 3.2 `MeasurementCard`, `TrackingStart` and `TrackingSkeleton` in `src/pages/tracking/components/`, with stories per state (each aferição state and title; not tracked, opening, the two 422, the opening 502); verify in Storybook at desktop and 375px and that no literal color, font or spacing enters the CSS
- [x] 3.3 One-line player tabs below 720px in `src/components/Tabs/Tabs.module.css` (W8); verify in the `Tabs` story and on a player screen at 375px with the four tabs on one line

## 4. Acompanhamento tab

- [x] 4.1 Route tests (`test:` red for the group): the "Acompanhamento" tab is selected at `/jogadores/1001/acompanhamento` and the profile is not requested again; tab title "Acompanhamento · Rafael Montes"; 1001 shows the janela, "Vila Nova Paulista → Atlético Serrano", "€8M → €9,6M" with "+20,0% alta" and "820 → 1.240 min" with "+420 min a mais", without the selector; 1002 shows "Sem mudança relevante" in the three aferições with the current values; 1003 shows the club change and both reasons, even with an empty `stats`; 1008 shows "Você não acompanha este jogador.", the selector and "Acompanhar"; clicking "Acompanhar" posts the selected recorte, shows "Acompanhando…" with the button and the selector disabled, then the panel with "Linha de base medida hoje"; 409 shows the panel without a message; 1005 shows "Limite de 10 acompanhamentos atingido." below an enabled button; 1006 shows "O jogador não tem dados suficientes para servir de linha de base."; opening 502 shows "Não foi possível acompanhar agora." and "Tentar de novo" posts again with the same recorte; 1007 shows "Não foi possível ler o acompanhamento agora." after the automatic retry and "Tentar de novo" reads again; a not-tracked player with an empty `stats` shows "Sem estatísticas publicadas para este jogador." without the button; changing the recorte before tracking updates the URL without a new leitura; a different recorte in the URL does not change the tracked panel; "Métricas" then "Acompanhamento" within 5 minutes makes no new leitura; with `com=1006`, "Acompanhamento" then "Comparação" keeps the recorte and `com`; skeleton while the leitura is pending
- [x] 4.2 Green in one `feat:` commit: the fourth tab in `PlayerLayout` and the layout route, `src/routes/_authenticated/jogadores/$jogadorId/acompanhamento.tsx`, `TrackingPage`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [x] 4.3 Stories of `TrackingPage` inside the layout per state (with changes, value down, opened today, no relevant change, unavailable, not tracked, opening, limit, insufficient information, opening source down, leitura source down, pending, no stats); verify in Storybook at desktop and 375px

## 5. Documentation

- [x] 5.1 `CLAUDE.md` with the acompanhamento tab and the `dev:mock` players (1001, 1002, 1003 tracked; 1008 opens; 1005 and 1006 the two 422; 1007 source down); `scout-ui` skill if the tab added a pattern; verify the texts against the code

## 6. Verification

- [ ] 6.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (1001, 1002, 1003, 1005, 1006, 1007, 1008, and 1008 after opening) at desktop and 375px with no console errors
- [ ] 6.2 Against the real API (`npm run dev` with the back-end running): open an acompanhamento on a real player, read it, try to open it again (409) and read a player not tracked; record the findings in `docs/divida-tecnica.md` and the delta specs

## 7. Retrospective

- [ ] 7.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate f1-f2-acompanhamento --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `acompanhamento`, `perfil-do-jogador`, `recorte` and `tratamento-de-erros` into `openspec/specs/`.
