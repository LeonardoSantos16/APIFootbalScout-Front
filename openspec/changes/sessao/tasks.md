# Tasks

## 1. Dependencies and interface components

- [x] 1.1 Install `@radix-ui/react-dialog` and verify with `npm run typecheck` and `npm run build-storybook`
- [x] 1.2 `TextField` and `PasswordField` (label above, hint or error below linked by `aria-describedby`, `aria-invalid`, disabled, "Mostrar"/"Ocultar" with `aria-pressed`); stories per state; Testing Library test for the label, the error description and the toggle
- [x] 1.3 `Notice` (`role="status"`) and `Dialog` on Radix (title, description, close button "Fechar", actions stacked below 480px); stories per state; test that `Esc` and "Fechar" call `onClose`
- [x] 1.4 `Button` disabled state from the design system; story per variant disabled; verify no literal color enters the CSS
- [x] 1.5 `AppShell` with the scout's name as a link, "Sair" as a ghost `Button` and a `loading` prop with skeleton blocks; `AuthShell` with only the app name; desktop, loading and phone stories

## 2. Session rules

- [x] 2.1 TDD of `src/api/session.ts`: save from an `AuthResponseDto`, read, clear, malformed entry as no session, `isAccessTokenExpired` and `isRefreshTokenExpired` with `now` as a parameter, `subscribe` notified on save and clear; `test:` red for the group
- [x] 2.2 TDD of `safeRedirect` (internal path kept, `//` and absolute URL and empty to `/`) and of `noticeText` per `aviso`; same `test:` red
- [x] 2.3 TDD of `src/utils/accountValidation.ts` with every message of the spec (e-mail without "@", empty password, name and password limits, confirmation differs, delete confirmation) and of `fieldForCode`; same `test:` red
- [x] 2.4 Green of 2.1 to 2.3 in one `feat:` commit; verify with `npx vitest run src/api/session src/utils`

## 3. Renewal queue and auth middleware

- [x] 3.1 TDD of `src/api/refresh.ts` with a fake `requestRefresh` and a fake lock: N concurrent `renew` calls make one request; another tab's pair inside the lock is used without a request; `refused` clears the session; `unavailable` keeps it; `test:` red for the group
- [x] 3.2 TDD of `src/api/auth.ts` against a real `fetchClient` with MSW: bearer on protected calls and none on `signin`/`signup`/`refresh`; renewal before sending with an expired access token; `401` renewed and repeated once with the body intact; second `401` ends the session; `401` on `signin` and `change-password` not renewed; `refused` calls `onSessionEnded` with the reason; `unavailable` returns the original error; same `test:` red
- [x] 3.3 Green of 3.1 and 3.2 in one `feat:` commit, registering the middleware on `fetchClient` before `errors`; verify with `npx vitest run src/api`
- [x] 3.4 Amend ADR 0002 with the renewal before sending (no timer) and verify the ADR still reads as accepted

## 4. Mocks and test base

- [x] 4.1 `src/mocks/handlers/auth.ts` with the in-memory store, token rotation and the named handlers of the `design.md` table, typed by the contract; reset in `src/test/setup.ts`; verify with `npm run typecheck`
- [x] 4.2 `withAuth` around the profile and metrics handlers (401 without a valid bearer) and access token expiring after 20 uses in `dev:mock`; verify the existing F9 route tests still pass after 4.3
- [x] 4.3 `renderRoute(url, { session })` seeding or clearing `scout.session` (signed in by default) and wiring `onSessionEnded`; seed in `src/mocks/browser.ts`; Storybook decorator with a seeded session; verify with `npm test` and by opening `npm run dev:mock` already signed in

## 5. Routes, boot and protected layout

- [x] 5.1 Route tests (`test:` red for the group): opening a protected route signed out goes to `/entrar?redirecionar=` with path and query; refresh token expired goes to `/entrar` without API calls; boot shows the header skeleton while `me` is pending; signed-in scout opening `/entrar` lands on `/`; `/` shows "Olá, Ana."; reloading keeps the session; metrics `401` renewed and repeated without a message; refresh refused lands on `/entrar` with "Sua sessão expirou. Entre novamente."; `usuario.token_sem_identificacao` shows "Sessão inválida. Entre novamente."; refresh 502 keeps the screen and the session; `storage` event without the entry goes to `/entrar`
- [x] 5.2 Green in one `feat:` commit: `__root`, `_public`, `_authenticated` (with `beforeLoad`, `me` and `pendingComponent`), move of the metrics route, `/` home page with the mock players list, `sessionSync.ts`, `onSessionEnded` in `src/main.tsx`; verify with `npm test`, `src/routeTree.gen.ts` regenerated and committed
- [x] 5.3 Stories of the home page and of the boot skeleton; update `CLAUDE.md` (session in "Estado do repositorio", the session module in "Arquitetura" and the signed-in `dev:mock`); verify in Storybook

## 6. Entrar and Criar conta

- [x] 6.1 Route tests (`test:` red for the group): sign in with a destination; external destination ignored; wrong credentials under "Senha"; validation only after the first submit and cleared while typing; sending state "Entrando…"; unknown error above the button; create account lands on `/` with the name in the header; e-mail already used under "E-mail"; "Criando conta…"; links between the two pages; notices "Sua sessão expirou. Entre novamente." and "Conta excluída." from `aviso`; page titles
- [x] 6.2 Green in one `feat:` commit: `src/hooks/useFormSubmit.ts`, `SignInPage`, `SignUpPage`; verify with `npm test`
- [x] 6.3 Stories per state of each page (empty, validation errors, server field error, sending, notices); verify in Storybook at desktop and 375px

## 7. Conta and signing out

- [ ] 7.1 Route tests (`test:` red for the group): "Sair" in the header lands on `/entrar` and reload does not restore the session, also when the call fails; name in the header opens "Conta" with name and e-mail; password changed with the notice, empty fields and the next call using the new pair; wrong current password; same password; confirmation differs without calling the API; "Alterando senha…"; "Sair de todos os dispositivos" lands on `/entrar` without a notice, also when the call fails; delete dialog disabled until the e-mail matches, "Cancelar" and "Fechar" send nothing, deletion lands on `/entrar` with "Conta excluída."
- [ ] 7.2 Green in one `feat:` commit: sign out in the `AppShell`, `AccountPage` with `ChangePasswordCard`, `SessionsCard` and `DeleteAccountCard`; verify with `npm test`
- [ ] 7.3 Stories per state of the account page and of the delete dialog (disabled and enabled); verify in Storybook at desktop and 375px

## 8. Verification

- [ ] 8.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` at desktop and 375px with no console errors, including two tabs (sign out in one, renewal after 20 uses)
- [ ] 8.2 Against the real API (`npm run dev` with the back-end running): create an account, sign in, open the metrics of a real player, change the password, sign out of all and delete the account; check the recorte `contexto` rule with real data and update `docs/divida-tecnica.md` with the result

## 9. Retrospective

- [ ] 9.1 Retrospective: what the spec did not foresee goes back to the delta specs; adjust the `scout-ui` skill and `CLAUDE.md`; verify with `openspec validate sessao --strict`

## Workflow follow-up

- Archive the change with `/openspec-archive-change` after the review, syncing `sessao`, `navegacao` and `tratamento-de-erros` into `openspec/specs/`.
