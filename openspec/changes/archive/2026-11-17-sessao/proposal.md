# Proposal

## Why

Against the real API, every endpoint outside `/api/Auth` requires a bearer token, so no screen built so far works outside `npm run dev:mock`. The session is also one of the plan's biggest risks: every refresh rotates the refresh token, so two renewals in parallel (concurrent requests or two tabs) end the session. It has to be in place, with tests, before search, profile and the remaining features (items 4 to 8). The session has no back-end feature identifier (F1 to F10 are domain features); decisions are in `docs/grilling/sessao.md`.

## What Changes

- New public routes `/entrar` and `/criar-conta`, and a protected layout route that every other route moves under, preserving the destination in `?redirecionar=`.
- Token pair, scout name and e-mail kept in `localStorage` through a single module (ADR 0001).
- Bearer token on every API call and reactive renewal: one refresh at a time on the first `401`, or before sending when the access token is already expired; queued requests repeated once with the new token; coordination between tabs (ADR 0002).
- `GET /api/Auth/me` on boot behind a header skeleton; going straight to `/entrar` when there is no usable pair.
- Expired session: requests fail together, the session and query cache are cleared and the scout lands on `/entrar` with "Sua sessão expirou. Entre novamente.".
- Signing out ("Sair" in the header), signing out of all devices, changing the password and deleting the account on a new `/conta` page, with a confirmation dialog for deletion.
- Header shows the scout's name as a link to `/conta`, and "Sair" works.
- Provisional home page at `/` with "Olá, {nome}." and, in `dev:mock`, links to the test players.
- Retry rule: a `401` is repeated once after the renewal (the only 4xx that is repeated).
- New production components from the design system: text field, password field, notice and dialog; disabled button state.
- MSW handlers for `/api/Auth` with an in-memory user, the other handlers requiring `Authorization`, and `dev:mock` starting signed in.

## Capabilities

### New Capabilities
- `sessao`: creating an account, signing in, keeping and renewing the token pair, protected routes and the destination, expired session, signing out, signing out of all devices, changing the password and deleting the account.

### Modified Capabilities
- `navegacao`: the top navigation shows the scout's name and a working "Sair"; a provisional home page.
- `tratamento-de-erros`: the retry rule gains the exception of a `401` repeated once after the session renewal.

## Impact

- **Code:** new routes in `src/routes/` (public pages, protected layout, `/conta`, home), session module and fetch middleware in `src/api/`, pages in `src/pages/`, components and CSS Modules, `renderRoute` with a session option, MSW handlers and fixtures for `/api/Auth`.
- **API:** consumes every endpoint of `/api/Auth`, with no contract change. Back-end gaps (`name` missing in `me`, `sec_stamp` not checked, `erros.md` status mismatch) are in `docs/divida-tecnica.md`.
- **Dependencies:** `@radix-ui/react-dialog` for the dialog.
- **Depends on:** item 2 (F9 Metricas por 90), whose screen moves under the protected route.
- **Unblocks:** item 4 (Busca e perfil) and every later feature, which run against the real API; item 10 (e2e) gains the sign-in flow.

### Out of scope

- Refresh token in an `httpOnly` cookie (ADR 0001) and password recovery.
- Proactive renewal on a timer (ADR 0002).
- Opening the phone "Menu" (item 9): on phones, signing out stays unreachable until then.
- Real home page and navigation destinations (item 9).
- Editing the scout's name or e-mail: the contract has no endpoint for it.
