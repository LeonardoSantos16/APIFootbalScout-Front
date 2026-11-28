# Tasks

## 1. Dependencies

- [ ] 1.1 Add `@dnd-kit/core`, `@dnd-kit/sortable` and `@dnd-kit/utilities` in a `chore:` commit; verify with `npm install` and `npm run build`

## 2. Shortlist rules

- [ ] 2.1 TDD of `src/pages/shortlist/utils/cost.ts`: `parseMillions` accepts "12,5" and "12.5" as 1250000000 centavos and "0,85" as 85000000, refuses "0", "-1", "12,555" and text with "Informe um custo maior que zero." or "Use no máximo duas casas decimais."; `millionsInput` gives "12,5" for €12,5M on EUR and "" for BRL on EUR or no market value; `formatCost` gives "€12,5M", "€850 mil" and "£9,8M"; `test:` red for the group
- [ ] 2.2 TDD of `src/pages/shortlist/utils/shortlists.ts`: `sortByName` puts "Atacantes", "Conflito", "Laterais 2027", "Meias para janeiro" in order, accents included; "4 de 25 alvos" and "4 de 25" from `limiteDeAlvos`; `listCurrency` from the first alvo, none when empty; `isFull`; `validateName` trims and refuses blank with "Dê um nome à shortlist."; same `test:` red
- [ ] 2.3 TDD of `src/pages/shortlist/utils/addOptions.ts`: for 1001, "Atacantes" disabled with "Cheia (25 de 25)", "Laterais 2027" with "Já está nesta shortlist", "Conflito" enabled with "2 de 25 alvos" and chosen by default; none enabled gives no default; `priorityOptions(2)` gives "1 — no topo", "2", "3 — no fim" with 3 as default and `priorityOptions(0)` only "1 — no topo"; `addedMessage("Conflito", 3)` is "Adicionado a Conflito, na prioridade 3."; same `test:` red
- [ ] 2.4 TDD of `src/pages/shortlist/utils/reorder.ts` and `shortlistError.ts`: `canMoveUp` false on 1 and `canMoveDown` false on the last; `dropPriority` gives 1 for Diego dropped on Miguel and none when dropped on himself; "Movendo para a prioridade 1…" and "Removendo…"; the four announcements in pt-BR; 412 with `shortlist.alterada_por_outra_requisicao` is a conflict, a 422 is not; the page and dialog conflict texts; a 500 without `code` gives "Não foi possível concluir agora." without retry; same `test:` red
- [ ] 2.5 Green of 2.1 to 2.4 in one `feat:` commit, with `shortlist.alterada_por_outra_requisicao` in `src/api/errors.ts`; verify with `npx vitest run src/pages/shortlist/utils src/api`

## 3. Mocks and data hooks

- [ ] 3.1 `src/mocks/fixtures/shortlists.ts` and `src/mocks/shortlistStore.ts` (seeded, reset in `src/test/setup.ts`) replicating the aggregate: version, 428, 412, 422 duplicate, limit, currency and prioridade range, 404 alvo and shortlist, renumbering, `custoTotal` omitted when empty; with its own unit tests in `src/mocks/shortlistStore.test.ts`; verify with `npx vitest run src/mocks`
- [ ] 3.2 Named handlers of `src/mocks/handlers/shortlists.ts` for every list, shortlist and write state, and the `dev:mock` defaults in `src/mocks/handlers.ts` under `withAuth` ("Laterais 2027", "Meias para janeiro", "Atacantes", "Conflito" always 412, profile 1009 answering 502); verify with `npm run typecheck` and `npm test`
- [ ] 3.3 `useShortlists`, `useShortlist` (with `initialData` from the list), `useTargetProfiles`, `useCreateShortlist`, `useTargetWrite` (move and remove with `If-Match`, `setQueryData`, refetch on conflict) and `useAddTarget`; verify with `npm run typecheck`

## 4. Components

- [ ] 4.1 `MoneyField` in `src/components/` and `disabled` in the `Select` options, with stories (free currency, locked currency with hint, error, disabled) and the touch font below 720px; verify in Storybook at desktop and 375px and that no literal color, font or spacing enters the CSS
- [ ] 4.2 `TargetRow` in `src/pages/shortlist/components/`, with stories per state (default, first and last, profile loading, 502 with "Tentar de novo", 404, pending, dragging) and the phone second line without handle or unavailable actions; verify in Storybook at desktop and 375px

## 5. Navigation

- [ ] 5.1 Route tests (`test:` red): the top "Shortlists" opens `/shortlists` marked as current; on `/shortlists/<id>` it is current; on a profile no top link is current; "Acompanhamentos" and "Relatórios" stay text
- [ ] 5.2 Green in one `feat:` commit: `shortlistsLink` in `AppShell` and the `Link` in `_authenticated.tsx`; verify with `npm test` and the `AppShell` story

## 6. Shortlists page

- [ ] 6.1 Route tests (`test:` red for the group): Ana's four shortlists in alphabetical order with "25 de 25 alvos", "4 de 25 alvos", "€47M" and "Sem alvos"; a row opens its shortlist; three skeleton rows with the field usable while pending; "Nenhuma shortlist ainda."; "Não foi possível concluir agora." on a 500; blank name shows "Dê um nome à shortlist." without a request; "  Volantes 2027 " creates "Volantes 2027" and opens it with "0 de 25"; "Criando…" with the field disabled; a 500 on creation keeps the name with the message; tab title "Shortlists"
- [ ] 6.2 Green in one `feat:` commit: `src/routes/_authenticated/shortlists/index.tsx` and `ShortlistsPage`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 6.3 Stories of `ShortlistsPage` per state (list, empty, pending, error, name error, creating); verify in Storybook at desktop and 375px

## 7. Shortlist page

- [ ] 7.1 Route tests for reading (`test:` red for the group): "Laterais 2027" header "4 de 25", "€47M", "EUR" with their labels; rows 1 to 4 with names, clubs and costs; "Rafael Montes" opens `/jogadores/1001`; a cached profile is not requested again; row 4 "Jogador #1009" with "Não foi possível carregar o perfil agora." and "Tentar de novo" retrying; a 404 profile shows "Perfil não encontrado." without retry; a row waiting for its profile shows cost and enabled actions; "Meias para janeiro" shows "0 de 25", "Nenhum alvo ainda. Adicione jogadores pelo perfil." and "Buscar jogador"; "Atacantes" shows "A shortlist atingiu o limite de 25 alvos."; skeleton while pending; "Shortlist não encontrada." with "Voltar às shortlists"; 500 message; tab title "Shortlist · Laterais 2027" and "Shortlist" while pending
- [ ] 7.2 Route tests for writing (same `test:` red): "Subir" on Rafael asks prioridade 1 with `If-Match` and the answer puts him first; "Subir" disabled on 1 and "Descer" on 4; keyboard drag of Diego with Space, two up arrows and Space announces "Diego Albuquerque pego, prioridade 3 de 4" and "solto na prioridade 1" and sends one request for 1; Escape announces "cancelado" and sends nothing; while pending, "Movendo para a prioridade 1…" and every action disabled; "Remover" on Miguel without a dialog leaves "3 de 25" and "€39M"; "Removendo…" while pending; `prioridade_fora_da_ordem`, `alvo_nao_encontrado` and 500 show their notice with the order unchanged and the notice goes away on the next success; "Descer" on "Conflito" reads again and shows "Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança."
- [ ] 7.3 Green of 7.1 and 7.2 in one `feat:` commit: `src/routes/_authenticated/shortlists/$shortlistId.tsx`, `ShortlistPage`, `ShortlistHeader`, `TargetList` with the sortable context, the 150ms move and `prefers-reduced-motion`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 7.4 Stories of `ShortlistPage` per state (Laterais 2027, profile 502 and 404, empty, full, pending, moving, removing, refused, conflict, not found, error); verify in Storybook at desktop and 375px, with the actions on the second line and pointer drag working on desktop

## 8. Add dialog

- [ ] 8.1 Route tests (`test:` red for the group): "Adicionar à shortlist" in the band on the five tabs and absent while the profile loads; no shortlist request before the click; the dialog with "Rafael Montes", "Atacantes — Cheia (25 de 25)" and "Laterais 2027 — Já está nesta shortlist" disabled and "Conflito" chosen; fields in skeleton while pending; cost "12,5" from the market value with "EUR" locked and "A moeda da lista é EUR."; empty cost for a market value in another currency; "Meias para janeiro" with the free currency, "O primeiro alvo define a moeda da lista." and only "1 — no topo"; "Conflito" with "3 — no fim" chosen; "0" and "12,555" show their messages without a request; adding to "Meias para janeiro" sends 1250000000 centavos in EUR, prioridade 1 and `If-Match`, shows "Adicionado a Meias para janeiro, na prioridade 1." and "Ver shortlist" opens it with "1 de 25" and "€12,5M"; "Adicionando…" while pending; the three 422 and the 500 show their texts in the dialog; adding to "Conflito" reads the list again, keeps the cost and shows "Esta shortlist foi alterada em outra aba. Confira e tente de novo."; a scout without shortlists sees "Você ainda não tem shortlist. Crie uma para adicionar Rafael Montes." and continues with the new shortlist
- [ ] 8.2 Green in one `feat:` commit: `AddToShortlist` under `src/pages/player/components/`, passed to `ClubBand` by `PlayerLayout`; verify with `npm test`
- [ ] 8.3 Stories of the dialog per state (choosing, locked and free currency, cost error, adding, added, the refusals, conflict, no shortlist, pending) and of the band with the action; verify in Storybook at desktop and 375px, with the stacked buttons below 480px

## 9. Documentation

- [ ] 9.1 `CLAUDE.md` with the shortlist routes and the `dev:mock` shortlists (Laterais 2027 with 1009 in 502, Meias para janeiro empty, Atacantes full, Conflito always 412) and the `AppShell` link; `scout-ui` skill with the no-optimism list pattern of ADR 0004 and the `MoneyField`; verify the texts against the code

## 10. Verification

- [ ] 10.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (the four shortlists, creating one, the dialog on Rafael Montes and on a player without shortlist room, drag by pointer and keyboard) at desktop and 375px with no console errors
- [ ] 10.2 Against the real API (`npm run dev` with the back-end running): create a shortlist, add three alvos from the profiles (one in the middle), drag and "Subir", remove one, cause a 412 with two tabs and try a second currency; record the findings in `docs/divida-tecnica.md` and the delta specs

## 11. Retrospective

- [ ] 11.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate f7-shortlist-priorizada --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `shortlist-priorizada`, `navegacao` and `perfil-do-jogador` into `openspec/specs/`.
