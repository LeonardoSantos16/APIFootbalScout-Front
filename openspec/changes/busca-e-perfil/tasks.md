# Tasks

## 1. Interface components

- [ ] 1.1 `SearchField` (default with "Buscar", compact without button, error below linked by `aria-describedby`, `aria-invalid`, hidden label, 16px text below 720px); stories per state; Testing Library test that Enter and "Buscar" call `onSubmit` and the error describes the input
- [ ] 1.2 `PlayerPhoto` (image, initials on missing `src` and on `onError`, `role="img"` with the name, band and small sizes); stories with photo and initials; test that a failing image turns into "RS"
- [ ] 1.3 `RowList` (link and plain rows, detail line, optional columns with a header that collapse into a support line with labels below 720px, footer slot); stories for results, recortes and transfers; test that a row with `href` is one link with the title
- [ ] 1.4 `ClubBand` with the `photo` slot and the loading state with a round placeholder and no club color; `Tabs` with link items (`nav`, `aria-current="page"`) and `disabled`; stories per state; verify the F9 stories still render
- [ ] 1.5 `AppShell` with `search` and `searchLink` slots replacing the static placeholder; desktop and phone stories; verify no literal color, font or spacing enters the CSS Modules

## 2. Search, profile and recorte rules

- [ ] 2.1 TDD of `src/utils/search.ts` (`normalizeTerm` trims and turns blank into `undefined`; `validateTerm` returns "Digite pelo menos 2 letras do nome." under 2 characters) and of `src/pages/search/utils/results.ts` (`playerResults` keeps only `player` in source order; `resultSummary` with every part, without club, with only a name, unknown letter); `test:` red for the group
- [ ] 2.2 TDD of `formatMoney` in `src/utils/number.ts` ("€12,5M", "€12M", "€850 mil", "R$", "US$", "£", unknown code) and of `src/pages/profile/utils/marketValue.ts` (missing and 0 give nothing); same `test:` red
- [ ] 2.3 TDD of `src/pages/profile/utils/playerData.ts`: full card order and texts, "Posição · MC, ME", "14/03/2001 (24 anos)", "178 cm", feet mapped and unknown left out, height 0 and missing shirt left out, "Brasil, 1 jogo, 1 gol" and plural, empty list when nothing is left; same `test:` red
- [ ] 2.4 TDD of `src/pages/profile/utils/transfers.ts` (newest first by seconds, "Serra Azul → Atlético Serrano", "jan. 2024 · €3,2M", "Livre", "Empréstimo", "Fim de empréstimo", unknown description leaves only the date) and of `src/pages/profile/utils/sliceRows.ts` (source order, selector text with and without contexto, the five cells with 0 shown); same `test:` red
- [ ] 2.5 TDD of `deriveSlices` keeping the source order (the "Season ids out of chronological order" scenario of `recorte`), updating the old sort test; same `test:` red
- [ ] 2.6 Green of 2.1 to 2.5 in one `feat:` commit; verify with `npx vitest run src/utils src/pages/search src/pages/profile`

## 3. Mocks and data hooks

- [ ] 3.1 Profile fixtures in source order (newest first), with transfers, `positionsDetailed`, `buildManyRecortesProfile` (1006) and `buildSparseProfile` (1007); named handlers `manyRecortesProfile`, `sparseProfile` and `profilePending`; verify with `npm run typecheck` and that the F9 tests still pass with "Brasileirão Série A · 2025" as default
- [ ] 3.2 `src/mocks/fixtures/search.ts` and `src/mocks/handlers/search.ts` with `searchResults` (case and accent insensitive, plus one team), `searchEmpty`, `searchOnlyTeams`, `searchSourceDown` and `searchPending`; default search in `src/mocks/handlers.ts` under `withAuth`, with "erro" and "vazio" forcing 502 and empty, and 1006 and 1007 in `PROFILES`; verify with `npm run typecheck`
- [ ] 3.3 `playerProfileQuery(id)` with 30-minute `staleTime` and `gcTime` in `usePlayerProfile`, `useSearchPlayers` with 5-minute `staleTime` and the `player` filter, and `describeSearchError`; verify with `npm run typecheck` (behavior covered by the route tests of groups 4 and 5)

## 4. Search screen, top search and home page

- [ ] 4.1 Route tests (`test:` red for the group): `/busca?termo=silva` lists only the players, in source order, with the support lines; `/busca` without a term focuses the field and makes no request; Enter with "  silva " writes `termo=silva`; typing without submitting makes no request; "s" shows "Digite pelo menos 2 letras do nome." and clears on the next letter; `?termo=s` shows no message and makes no request; placeholder rows while pending; empty and only-teams texts; 502 twice shows "Não foi possível buscar agora." and "Tentar de novo" refetches; 400 in plain text shows the generic error without retry; clicking a result opens `/jogadores/1001`; Back from the profile shows the results without a new request; Back after a second search restores the first; the top field submits to `/busca?termo=` and is hidden there; a short term at the top shows the message; the top field is empty after leaving `/busca`; the home page shows "Olá, Ana." and its field searches; tab title "Buscar jogador"
- [ ] 4.2 Green in one `feat:` commit: `src/hooks/useSearchForm.ts`, `src/routes/_authenticated/busca.tsx`, `SearchPage`, `HeaderSearch` and the slots in the protected layout, `HomePage` with the field, removal of `TestPlayers`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 4.3 Stories of `SearchPage` per state (no term, short term, pending, results, empty, only teams, source down) and of the home page; verify in Storybook at desktop and 375px

## 5. Player layout, profile and metrics

- [ ] 5.1 Route tests (`test:` red for the group): `/jogadores/1001` shows the band with "Meio-campo, …, Atlético Serrano", initials in place of the photo, "Perfil" selected and the four cards with the spec's texts; tab title is the name; placeholders and disabled tabs while pending; 404 shows "Jogador não encontrado." and "Buscar jogador" opens `/busca`, with tab title "Jogador não encontrado"; 502 twice shows "Não foi possível carregar o perfil agora." with "Tentar de novo" on both tabs, without requesting the metrics; 1006 shows 10 recortes and "Mostrar todos os recortes (14)", then 14, and 5 of 8 transfers; 1007 hides "Valor de mercado", "Transferências", "Altura", "Camisa" and "Pé preferido"; empty `stats` shows "Sem estatísticas publicadas para este jogador." on both tabs; clicking a recorte row opens the metrics with that recorte; metrics → Perfil → Métricas keeps the recorte; switching tabs and reopening the profile within 30 minutes make no new profile request; the metrics tab title stays "Métricas por 90 · <nome>"; existing F9 tests adjusted to the band and tabs of the layout and the "Métricas" tab
- [ ] 5.2 Green in one `feat:` commit: `src/routes/_authenticated/jogadores/$jogadorId.tsx` with the moved `validateSearch`, `$jogadorId/index.tsx`, `PlayerLayout` with `PlayerTabs`, `ProfilePage`, `MetricsPage` without band, tabs and profile error; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 5.3 Stories of `ProfilePage` inside the layout per state (complete, many recortes expanded and collapsed, sparse, no stats, pending, not found, source down) and of `MetricsPage` inside the layout; verify in Storybook at desktop and 375px

## 6. Documentation

- [ ] 6.1 `docs/divida-tecnica.md`: the search answering `200` empty when the source fails, with the expected fix; the provisional home page item updated to the search field; verify the two items read against the code
- [ ] 6.2 `CLAUDE.md`: search and profile in "Estado do repositorio" (search the mock players by name in `dev:mock`) and the player layout and profile cache in "Arquitetura"; verify the commands listed still run

## 7. Verification

- [ ] 7.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (search "rafael", "erro", "vazio", "s"; profiles 1001, 1003, 1004, 1006, 1007; tabs with a recorte) at desktop and 375px with no console errors
- [ ] 7.2 Against the real API (`npm run dev` with the back-end running): search a real player, open the profile, check whether `playerImage` loads, list the `transferFeeDescription` texts that appear and adjust the map, and confirm the default recorte is the most recent; record the findings in `docs/divida-tecnica.md` and the delta specs

## 8. Retrospective

- [ ] 8.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate busca-e-perfil --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `busca-de-jogadores`, `perfil-do-jogador`, `recorte`, `metricas-por-90`, `navegacao` and `tratamento-de-erros` into `openspec/specs/`.
