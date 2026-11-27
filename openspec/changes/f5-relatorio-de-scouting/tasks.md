# Tasks

## 1. Relatório rules

- [x] 1.1 TDD of `src/pages/report/utils/timeline.ts`: a chain of three in one group, original first; a correção whose parent is missing starts its own group; groups by `observadoEm` descending and items by `escritoEm` ascending; the vigente is the latest finalizado and a correção rascunho does not take it; titles "Observado em 02/11/2026" and "Correção de 05/11/2026"; details "6,5 de 10 · Monitorar" and "Sem nota · Sem parecer"; "Corrigido pela correção de 05/11/2026" only from a finalizado child; `pendingCorrectionId` on the vigente; a cycle does not loop; `test:` red for the group
- [x] 1.2 TDD of `src/pages/report/utils/reportForm.ts`: `parseRating` accepts "7,5" and "7.5", refuses "11", "-1", "7,25" and text; `cleanPoints` trims and drops empty; `validateForm` gives "Escreva o relato." for empty or blank relato, the two nota messages and "Informe a nota." for an erased saved nota; `editPayload` carries only changed fields, each list whole, nothing when clean; `isDirty` turns false again when the text is restored; `emptyForm` with today and with the relato of a corrected relatório; same `test:` red
- [x] 1.3 TDD of `src/pages/report/utils/checklist.ts`: the five items with "(1 de 2)", "(0 de 2)" and "(30 de 20)", counted on cleaned pontos; complete only when all are met; same `test:` red
- [x] 1.4 TDD of `src/pages/report/utils/reportDates.ts`, `reportError.ts` and `correctionReference.ts`: today in local time; "2026-11-24" to local midnight with the offset; "dd/mm/aaaa" in local time; 412 conflict and 409 already finalized by status and `code`; the 422 and `observacao_futura` as a notice, 500 without code next to the buttons without retry; "Corrige o relatório observado em 02/11/2026" and "Corrige a correção de 05/11/2026"; same `test:` red
- [x] 1.5 Green of 1.1 to 1.4 in one `feat:` commit, with `MIN_POSITIVE_POINTS`, `MIN_NEGATIVE_POINTS` and `MIN_POINTS_CHARACTERS` in `src/config/scout.ts`; verify with `npx vitest run src/pages/report/utils`

## 2. Mocks and data hooks

- [ ] 2.1 `src/mocks/fixtures/reports.ts` and `src/mocks/reportStore.ts` (seeded per player, reset in `src/test/setup.ts`) replicating the aggregate: version, 428, 412, 409 finalizado, 422 conclusion and minimum content, 409 future date, correção inheriting `observadoEm`; with its own unit tests in `src/mocks/reportStore.test.ts`; verify with `npx vitest run src/mocks`
- [ ] 2.2 Named handlers of `src/mocks/handlers/reports.ts` for every list, relatório and write state, and the `dev:mock` defaults in `src/mocks/handlers.ts` under `withAuth` (1001 chain and loose rascunho, 1002 vigente, 1003 empty, 1005 always 412, 1007 list 500); verify with `npm run typecheck` and `npm test`
- [ ] 2.3 `useReports`, `useReport` (with `initialData` from the list), `useSaveReport` (create or correct, then edit with `If-Match`, `setQueryData` after each step, invalidate the list) and `useFinalizeReport` (save when dirty, then finalize with the latest version); verify with `npm run typecheck`

## 3. Components

- [ ] 3.1 `TextArea`, `DateField` and `SegmentedControl` in `src/components/`, with stories per state (filled, error, disabled, read-only date, no parecer chosen) and the 2×2 parecer below 480px; verify in Storybook at desktop and 375px and that no literal color, font or spacing enters the CSS
- [ ] 3.2 `StatusBadge` in `src/components/` and `actionLabel` in `InlineError`, with stories; verify in Storybook
- [ ] 3.3 `PointList`, `FinishChecklist` and `ReportTimeline` in `src/pages/report/components/`, with stories per state (editing, read-only, empty; checklist open and complete; timeline with the 1001 chain, empty, skeleton); verify in Storybook at desktop and 375px

## 4. Relatórios tab

- [ ] 4.1 Route tests (`test:` red for the group): "Relatórios" is the fifth tab and selected at `/jogadores/1001/relatorios`, also inside `/relatorios/novo` and `/relatorios/<id>`, and the profile is not requested again; tab title "Relatórios · Rafael Montes"; 1001 shows the loose rascunho group first and the chain with "Finalizado", "Vigente" and "Rascunho", "Corrigido pela correção de 05/11/2026" and "Continuar" on the rascunhos; 1003 shows "Nenhum relatório sobre este jogador." and "Escrever relatório"; 1007 shows "Não foi possível concluir agora." and "Tentar de novo" reads again; skeleton with an enabled "Escrever relatório" while pending; no recorte selector; with `com=1006`, "Relatórios" then "Comparação" keeps the recorte and `com`
- [ ] 4.2 Green in one `feat:` commit: the fifth tab in `PlayerLayout` and the layout route, `src/routes/_authenticated/jogadores/$jogadorId/relatorios/index.tsx` and `ReportsPage`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 4.3 Stories of `ReportsPage` inside the layout per state (chain, empty, error, pending); verify in Storybook at desktop and 375px, with the five tabs on one line (W7)

## 5. Editor

- [ ] 5.1 Route tests for writing (`test:` red for the group): "Escrever relatório" opens `novo` with today's date and no request; empty relato shows "Escreva o relato." without a request; "11" and "7,25" show the nota messages; the first save with every field creates, then edits with `If-Match` and the returned version, and the URL shows the id with `novo` replaced in the history; the request carries the cleaned pontos and the nota 7.5 from "7,5"; "Salvando…" with fields and buttons disabled while pending; "Alterações não salvas" appears and disappears; a saved rascunho shows the date as text with its hint; erasing a saved nota shows "Informe a nota."; a 500 on save shows "Não foi possível concluir agora." next to the buttons and keeps the text; `POST` ok and `PUT` failing leaves the new URL and the next save only edits; `relatorio.observacao_futura` shows its notice; 1005 answers 412 with "Este relatório foi alterado em outra aba.", both buttons disabled, and "Carregar a versão atual" reloads and discards the edits; 409 `relatorio.ja_finalizado` shows the reading with "Este relatório já foi finalizado."; unknown id shows "Relatório não encontrado." and "Voltar aos relatórios"; skeleton while pending; tab titles "Relatório · Rafael Montes"
- [ ] 5.2 Route tests for finalizing, reading and correção (same `test:` red): checklist "(1 de 2)" with "Finalizar relatório" disabled; complete checklist opens "Finalizar relatório?", "Voltar" sends nothing, confirming with a pending change saves then finalizes and shows the reading; the two 422 show their notices; the 1002 vigente shows "Vigente", "8,0 de 10", "Contratar", relato and pontos without fields, and "Criar correção" opens `novo?corrige=` with the relato prefilled, the inherited date and its hint, empty nota, parecer and pontos, "Alterações não salvas" and title "Correção · <nome>"; the first save of a correção posts to `correcoes`; the 1001 vigente shows "Continuar correção" opening the rascunho; the 1001 original shows "Corrigido pela correção de 05/11/2026" and no "Criar correção"; a correção shows "Corrige o relatório observado em 02/11/2026"; editing and clicking "Métricas" asks "Sair sem salvar?", "Continuar editando" stays and "Sair" leaves; without changes, no dialog
- [ ] 5.3 Green of 5.1 and 5.2 in one `feat:` commit: `relatorios/novo.tsx` and `relatorios/$relatorioId.tsx`, `ReportEditorPage`, `ReportForm`, `ReportActions`, `ReportReading`, the blocker dialog; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 5.4 Stories of `ReportEditorPage` inside the layout per state (new, saved rascunho with changes, saving, conflict, save error, created but not completed, checklist complete, finalize dialog, the two 422, finalizado vigente, replaced finalizado, vigente with a pending correção, new correção, not found, pending, leave dialog); verify in Storybook at desktop and 375px

## 6. Documentation

- [ ] 6.1 `CLAUDE.md` with the relatórios tab, the routes and the `dev:mock` players (1001 chain and loose rascunho, 1002 vigente, 1003 empty, 1005 conflict, 1007 list error); `scout-ui` skill with the write-with-version pattern of ADR 0006 and the explicit save; verify the texts against the code

## 7. Verification

- [ ] 7.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (1001, 1002, 1003, 1005, 1007, a new relatório and a new correção) at desktop and 375px with no console errors
- [ ] 7.2 Against the real API (`npm run dev` with the back-end running): write a rascunho, save it twice, finalize it, create and finalize a correção, cause a 412 with two tabs, and read the linha do tempo; record the findings in `docs/divida-tecnica.md` and the delta specs

## 8. Retrospective

- [ ] 8.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate f5-relatorio-de-scouting --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `relatorio-de-scouting` and `perfil-do-jogador` into `openspec/specs/`.
