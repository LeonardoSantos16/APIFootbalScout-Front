# Tasks

## 1. Test base, mocks and dependencies

- [x] 1.1 Install `@phosphor-icons/react` and `msw-storybook-addon` and verify with `npm run typecheck` and `npm run build-storybook`
- [x] 1.2 Create `src/mocks/server.ts` (`msw/node`) and wire it in `src/test/setup.ts` with `onUnhandledRequest: 'error'`; verify with a test that fails when calling a route without a handler
- [x] 1.3 Extract `createQueryClient()` to `src/api/queryClient.ts` (retries only 502, once, 2000 ms; configurable `retryDelay`) and use it in `src/main.tsx`; verify with a `test:` commit for the policy (502 retries once, 404 does not) and a separate `feat:` commit
- [ ] 1.4 Wire `msw-storybook-addon` in `.storybook/preview.ts` with the `QueryClient` in a decorator; verify with a story that reads a handler

## 2. Formatting and configuration

- [ ] 2.1 `src/config/scout.ts` with `AMOSTRA_MINIMA_DE_MINUTOS = 450` and a reference in `docs/README.md`; verify with `npm run typecheck`
- [ ] 2.2 TDD of `src/format/numero.ts` (`2,10`, `7,12`, `86,4%`, `1.284 min`, rounding): `test:` commit on red and `feat:` on green; verify with `npx vitest run src/format`

## 3. Recorte

- [ ] 3.1 TDD of `derivarRecortes`: one recorte per `stats` item, contexto `Selecao` by the `nationalTeamStats` rule, all `Clube` without `nationalTeamStats`; `test:` and `feat:` commits
- [ ] 3.2 TDD of the order (`season.id` descending, tie-break by minutes) and of `rotuloDoRecorte` (with and without the contexto prefix); `test:` and `feat:` commits
- [ ] 3.3 TDD of `encontrarRecorte` and of the search params validation (missing, malformed, not in `stats`); `test:` and `feat:` commits

## 4. Metrics and player

- [ ] 4.1 TDD of `montarLinhas`: fixed order, labels with units, fails on a missing attribute, ignores an unknown type; `test:` and `feat:` commits
- [ ] 4.2 TDD of the footer sample (mode) and of the per-row sample only when it differs; `test:` and `feat:` commits
- [ ] 4.3 TDD of the refusal text (`AmostraInsuficiente` with and without sample, `FonteNaoAtribuiu`); `test:` and `feat:` commits
- [ ] 4.4 TDD of `src/domain/jogador.ts` (position from the letter, age, support line without an unknown position); `test:` and `feat:` commits

## 5. Error handling

- [ ] 5.1 TDD of `src/api/errors.ts`: message by `code` (whole table from `docs/erros.md` with accents), internal and unknown codes to the generic one, `podeRepetir` only on 502 and unknown; `test:` and `feat:` commits
- [ ] 5.2 TDD of the plain-text status fallback (404 "Jogador não encontrado.", 502, others) and of logging the `instance` to the console; `test:` and `feat:` commits

## 6. Interface components

- [ ] 6.1 `Button`, `Card`, `Skeleton` and `InlineError` with CSS Modules over the tokens; a story per variant and state; verify in Storybook and with `npm run lint`
- [ ] 6.2 `Select` (native, label, `caret-down`, skeleton) and `Tabs`; a story per state; label accessibility test with Testing Library
- [ ] 6.3 `ClubBand` on the `club` fallback; story; verify that no literal color enters the CSS
- [ ] 6.4 `MetricaCell` and `MetricasGrid` (calculated, refused, loading, `sample`, footer); a story per state; test that the seven rows appear with everything refused
- [ ] 6.5 `AppShell` with the top bar, "Sair", "Menu" button below 720px and a two-column body; desktop and phone stories

## 7. Mocks per state

- [ ] 7.1 Profile fixtures (complete, national team only, without `stats`) and metrics fixtures (calculated, insufficient sample, incomplete) typed by the contract; verify with `npm run typecheck`
- [ ] 7.2 Handlers named after the `design.md` table and default handlers per `jogadorId` in `src/mocks/handlers.ts`; verify by opening each player in `npm run dev:mock`

## 8. Per-90 metrics screen

- [ ] 8.1 Route `src/routes/jogadores/$jogadorId/metricas.tsx` with `validateSearch` and `AppShell` in `__root.tsx`; `test:` route test for opening without a recorte (URL corrected with `replace`) and `feat:` commit
- [ ] 8.2 `test:` and `feat:` route test for the recorte change (`push`, Back returns the previous one, only the grid goes back to the skeleton)
- [ ] 8.3 `test:` and `feat:` route test for visible refused rows, the whole grid refused without an error message and the profile without `stats`
- [ ] 8.4 `test:` and `feat:` route test for the errors: profile 404 without button, profile 502, metrics 502 with "Tentar de novo" repeating the call, metrics without `code`, incomplete response
- [ ] 8.5 Tab title ("Métricas por 90 · <nome>" and just "Métricas por 90"); `test:` and `feat:` route test
- [ ] 8.6 Screen story per scenario in the `design.md` table; verify in Storybook that each state matches the wireframe

## 9. Integration

- [ ] 9.1 Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` without failures and walk the five players in `npm run dev:mock` on desktop and at 375px
- [ ] 9.2 Retrospective: update the `scout-ui` skill ("Nota" texts and the footer sample in `references/textos.md`), `CLAUDE.md` and the specs with what the implementation revealed; verify with `openspec validate f9-metricas-por-90 --strict`

## Workflow follow-up

- Archive with `/openspec-archive-change` after the review.
- First task of item 3: check the `contexto` rule and the `season.id` order against the real API.
