# Design

## Context

`src/api/client.ts` has a single `fetchClient` (`openapi-fetch`) with the `errors` middleware, which turns every non-2xx response into an `ApiError`; `$api` wraps it for React Query. The root route renders the `AppShell` around every route, and the F9 screen lives at `src/routes/jogadores/$jogadorId/metricas.tsx`. No call carries a token, and the MSW handlers answer without `Authorization`.

Product decisions are in `docs/grilling/sessao.md`. The approved wireframe is at https://claude.ai/artifact/S9FaAkGCFewhSz6seAnzwt (Entrar, Criar conta and Conta on desktop with their states, the boot skeleton, the provisional home page and the 375px screens). The `TextField`, `PasswordField`, `Notice` and `Dialog` references and the disabled `Button` are already in `docs/design-system/components/`.

ADRs applied: 0001 (tokens in `localStorage` behind a single module), 0002 (one refresh at a time, with a queue, reactive). The renewal before sending when the access token is already expired is not a timer and keeps the reactive path, so it does not contradict ADR 0002; it is recorded as an amendment to that ADR.

## Goals / Non-Goals

**Goals:**
- The renewal queue as a unit independent of React and of `openapi-fetch`, tested with a fake fetch and a fake lock.
- Every screen reads the session through one module; switching to an `httpOnly` cookie later changes only that module (ADR 0001).
- Every session state reproducible by a named MSW handler, in tests, stories and `dev:mock`.

**Non-Goals:**
- A form library or schema validator: the forms have at most three fields and the rules are small pure functions.
- Proactive renewal on a timer (ADR 0002).
- Opening the phone "Menu" (item 9).

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Create account | `POST /api/Auth/signup` | `201` with `AuthResponseDto`; 409 `usuario.email_ja_cadastrado` |
| Sign in | `POST /api/Auth/signin` | 401 `usuario.credenciais_invalidas` is a form error, never renewed |
| Renew | `POST /api/Auth/refresh` | body `{ refreshToken }`; rotates the refresh token |
| Sign out | `POST /api/Auth/signout` | body `{ refreshToken }`, bearer required |
| Sign out of all | `POST /api/Auth/signout-all` | no body; also revokes this session's refresh token |
| Change password | `POST /api/Auth/change-password` | returns a new `AuthResponseDto`; 400 `usuario.senha_atual_invalida`, 422 `usuario.senha_igual_a_atual` |
| Confirm on boot | `GET /api/Auth/me` | no `name` in the response (`docs/divida-tecnica.md`) |
| Delete account | `DELETE /api/Auth/me` | `204`, no body |

### Session storage

`src/api/session.ts` is the only code that touches the stored session. It keeps one JSON entry, `scout.session`, with `accessToken`, `accessTokenExpiresAtUtc`, `refreshToken`, `refreshTokenExpiresAtUtc`, `userId`, `name` and `email` (interface `Session` in `src/interfaces/session.ts`), and exposes `readSession`, `saveSession(authResponse)`, `clearSession`, `isAccessTokenExpired(session, now)`, `isRefreshTokenExpired(session, now)` and `subscribe(listener)` for React (`useSession` in `src/hooks/useSession.ts`, over `useSyncExternalStore`). A malformed entry reads as no session. `now` is a parameter so the rules are tested without a fake clock.

### Renewal queue

`src/api/refresh.ts` exports `createRefresher({ readSession, saveSession, requestRefresh, lock })`, returning `renew(staleAccessToken)`:

- A renewal in flight is a single promise; every caller in the tab awaits the same one.
- The renewal runs inside `lock('scout-refresh', fn)`. Inside the lock it reads the stored session again: if the access token differs from `staleAccessToken`, another tab already renewed and that pair is used without calling the API.
- `requestRefresh` calls `POST /api/Auth/refresh` through a second client without the auth middleware, so a renewal never triggers another.
- Outcomes: `renewed(session)`, `refused(code)` for a `401`, and `unavailable(error)` for anything else (network, 502, 500). `refused` clears the session; `unavailable` keeps it.
- `lock` is `navigator.locks.request` when it exists; otherwise a pass-through, leaving only the in-tab queue (Q17). Tests inject a fake lock.

Rejected alternative: a counter of in-flight requests with a timer, as some interceptors do. It fails across tabs and does not handle the rotation.

### Auth middleware

`src/api/auth.ts` exports `createAuthMiddleware({ refresher, readSession, onSessionEnded })`, registered on `fetchClient` so that its `onResponse` runs before the `errors` middleware:

- `onRequest`: skips `signin`, `signup` and `refresh`. If the access token is expired, it awaits `renew` first. It sets `Authorization: Bearer <token>` and keeps a clone of the request for a possible repeat.
- `onResponse` with `401` on a call other than `signin` and `change-password`: it awaits `renew(tokenUsed)`. On `renewed`, it repeats the clone once with the new token and returns that response; a second `401` ends the session. On `refused`, it calls `onSessionEnded({ reason })` and lets the `401` go on to the `errors` middleware. On `unavailable`, it lets the original response go on.
- The repeat is marked so it is never renewed again.

`onSessionEnded` is wired in `src/main.tsx` (and in `renderRoute`): it clears the `QueryClient` and navigates to `/entrar` with `redirecionar` set to the current location and `aviso` set to the reason.

### Routes and search params

| File | Path | Note |
| --- | --- | --- |
| `src/routes/__root.tsx` | — | only the `Outlet`; the `AppShell` moves to the protected layout |
| `src/routes/_public.tsx` | — | pathless layout with the app name only; `beforeLoad` sends a usable session to `/` |
| `src/routes/_public/entrar.tsx` | `/entrar?redirecionar=&aviso=` | `aviso` is `sessao-expirada`, `sessao-invalida` or `conta-excluida`; anything else is dropped |
| `src/routes/_public/criar-conta.tsx` | `/criar-conta?redirecionar=` | |
| `src/routes/_authenticated.tsx` | — | pathless layout with the `AppShell`; `beforeLoad` redirects without a usable session and runs `queryClient.ensureQueryData` for `me`; `pendingComponent` is the `AppShell` in skeleton with an empty body |
| `src/routes/_authenticated/index.tsx` | `/` | provisional home page |
| `src/routes/_authenticated/conta.tsx` | `/conta` | |
| `src/routes/_authenticated/jogadores/$jogadorId/metricas.tsx` | unchanged | moved from `src/routes/jogadores/` |

The router context gains nothing new: session reads go through `session.ts`. `redirecionar` is validated by `safeRedirect(value)` in `src/utils/redirect.ts` (starts with `/`, not `//`, otherwise `/`). The `aviso` text comes from `noticeText(aviso)` in the same module as the field mapping.

Two tabs: `src/api/sessionSync.ts` listens to the `storage` event for `scout.session`. A removed entry navigates to `/entrar`; a different `userId` calls `location.reload()`. A rotated pair needs no event: the next request reads the storage.

### Pages and pure rules

| Module | Responsibility |
| --- | --- |
| `src/utils/accountValidation.ts` | `validateSignIn`, `validateSignUp`, `validatePasswordChange`, `validateDeleteConfirmation`, each returning the message per field with the texts of the spec; limits from `src/config/account.ts` (mirror of the contract) |
| `src/utils/accountErrors.ts` | `fieldForCode` (`usuario.email_ja_cadastrado` → `email`, `usuario.credenciais_invalidas` → `password`, `usuario.senha_atual_invalida` → `currentPassword`, `usuario.senha_igual_a_atual` → `newPassword`) and `noticeText(aviso)` |
| `src/utils/redirect.ts` | `safeRedirect` |
| `src/hooks/useFormSubmit.ts` | the "validate on submit, then on every change of a failed field" state, shared by the three forms |
| `src/pages/sign-in/SignInPage.tsx` | form, notice from `aviso`, `$api.useMutation('post', '/api/Auth/signin')` |
| `src/pages/sign-up/SignUpPage.tsx` | form, `$api.useMutation('post', '/api/Auth/signup')` |
| `src/pages/account/AccountPage.tsx` | `components/ChangePasswordCard`, `SessionsCard`, `DeleteAccountCard` (with the `Dialog`) |
| `src/pages/home/HomePage.tsx` | greeting and, when `VITE_API_MOCK` is on, the test players list |

Mutations do not use the 502 retry of the queries. A form error without a field goes through `describeError` into an `InlineError` above the main button.

### Components

- New in `src/components/`: `TextField`, `PasswordField`, `Notice` and `Dialog` (on `@radix-ui/react-dialog`: focus trap, `Esc`, focus returning to the trigger), each with stories per state.
- `Button`: disabled state from the design system (`surface-strong`, `ink-soft`; `ghost` with `ink-subtle`).
- `AppShell`: the scout's name as a link to `/conta`, "Sair" as a ghost `Button` that calls the sign out, and a `loading` prop that swaps the search, the links and the account for skeleton blocks.
- `AuthShell` (in `src/components/`): the top with only the app name and the centered card for the public pages.

### MSW per state

`src/mocks/handlers/auth.ts` keeps an in-memory store (`createAuthStore()`, reset in `src/test/setup.ts`) with one user ("Ana Ribeiro", `ana.ribeiro@exemplo.com`, password `senhaboa123`) and opaque tokens (`mock-access-1`, `mock-refresh-1`...). Every successful auth response rotates both. In `dev:mock` an access token expires after 20 uses, to exercise the renewal by hand.

The profile and metrics handlers are wrapped by `withAuth`, which answers `401` without a valid bearer.

| Handler | State |
| --- | --- |
| `authHandlers` | the default flow: signup, signin, refresh, signout, signout-all, change-password, me, delete |
| `signInWrongCredentials` | 401 `usuario.credenciais_invalidas` |
| `signUpEmailTaken` | 409 `usuario.email_ja_cadastrado` |
| `signInPending` / `signUpPending` | never resolves, for the sending state |
| `accessTokenExpiredOnce` | the next protected call answers 401, then the default |
| `refreshRefused` | 401 `usuario.refresh_token_invalido` |
| `refreshWithoutIdentification` | 401 `usuario.token_sem_identificacao` |
| `refreshUnavailable` | 502 |
| `meUnauthorized` | 401 on `me` |
| `changePasswordWrongCurrent` | 400 `usuario.senha_atual_invalida` |
| `changePasswordSameAsCurrent` | 422 `usuario.senha_igual_a_atual` |
| `signOutFailing` | network error on `signout` and `signout-all` |

`dev:mock` starts signed in: `src/mocks/browser.ts` seeds `scout.session` with the mock user when the entry is missing. `renderRoute(url, { session })` seeds or clears the entry before creating the router; the default is signed in. Stories of the public pages run without a session; stories of the protected pages get a seeded session in a decorator.

## Risks / Trade-offs

- [`openapi-fetch` middleware order and repeated requests] → the middleware tests run against a real `fetchClient` with MSW, not a mock of `openapi-fetch`; the repeat uses a clone taken in `onRequest`, so a consumed body is never re-sent.
- [`StrictMode` and the boot running `me` twice] → `ensureQueryData` dedups by key; the renewal is a single promise.
- [jsdom has no `navigator.locks`] → the lock is injected; the cross-tab case is covered by the fake lock, and checked by hand with two tabs in `dev:mock`.
- [Signing out on phones is unreachable until item 9] → accepted; recorded in the proposal.
- [Other sessions keep access for up to 15 minutes after "Sair de todos" or a password change] → the texts say so; the back-end fix is in `docs/divida-tecnica.md`.
- [`usuario.nao_encontrado` on `change-password` comes as 401] → it is a `401` on a call that is never renewed, so it shows as a form error ("Usuário não encontrado."), which only happens for an account deleted in another device.

## Migration Plan

The F9 route moves under `_authenticated`, so its URL does not change. Against the real API, the front only works signed in from this change on. Rollback is reverting the change; no stored data needs migration, and a leftover `scout.session` entry is harmless.

## Open Questions

- The `contexto` rule of the recorte (`docs/divida-tecnica.md`) still needs checking against real data. It does not change this change's specs; it is the first manual check once the front runs signed in against the real API.
