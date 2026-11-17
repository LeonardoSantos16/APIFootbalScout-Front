# Proposal

## Why

The front end has no screens yet. F9 (Metricas por 90) is the first complete feature: small, read-only and rich in states. It introduces the three rules shared by every analysis screen: the recorte derived from the profile and kept in the URL, a refusal treated as a result, and an error handled by its `code`. Everything runs with `npm run dev:mock`, without depending on the session.

## What Changes

- New route for a player's per-90 metrics screen, opened by direct URL until search and profile exist (item 4).
- Competition and season selector derived from the profile's `stats`, with the recorte in the search params, a default recorte and silent correction of a missing or invalid recorte (ADR 0003).
- Grid of seven fixed metrics per recorte: calculated ones with value, unit and sample; refused ones visible with the reason and the numbers.
- Minimal player header (name, position, age, club) on the club band, always in the `club` color while the contract does not expose `teamColors`.
- Error handling by the `code` of the `ProblemDetails`, falling back to the status on plain-text endpoints, with an automatic retry and "Tentar de novo" on 502 and on unknown errors.
- Page skeleton: top navigation with the search and links that lead nowhere yet, account with "Sair", body with the player card and an empty support column.
- First production components from the design system (club band, card, metric cell, grid, inline error, button, selector), pt-BR formatters, MSW handlers per scenario and stories per state.

## Capabilities

### New Capabilities
- `recorte`: a player's list of recortes derived from the profile, club or national team contexto, default recorte, recorte in the URL and its correction.
- `metricas-por-90`: a player's seven per-90 metrics in a recorte, calculated or refused, with unit, sample and the loading states.
- `tratamento-de-erros`: message and behavior by the `code` of the `ProblemDetails`, status fallback without a `code`, retry and what never reaches the screen.
- `navegacao`: the page skeleton (top navigation, account, two-column body), completed by item 9.

### Modified Capabilities
None: there are no specs in `openspec/specs/` yet.

## Impact

- **Code:** new routes in `src/routes/`, first components and CSS Modules, error message module, formatters, handlers and fixtures in `src/mocks/`, MSW setup in tests and stories.
- **API:** consumes `GET /api/Players/{id}/profile` and `GET /api/Analise/{jogadorId}/metricas-por-90`, with no contract change. Back-end gaps are tracked in `docs/divida-tecnica.md`.
- **Dependencies:** `@phosphor-icons/react` for the approved icons; an MSW addon for Storybook.
- **Depends on:** item 1 (CI), so the TDD cycles run against it.
- **Unblocks:** item 3 (Sessao), item 4 (Busca e perfil) and item 5 (F10 Comparacao direta), which reuse the recorte, the error handling and the page skeleton.

### Out of scope

- Player search and full profile (item 4); the header links and the other player tabs lead nowhere.
- Login, session and token (item 3): F9 runs against MSW.
- Radar chart and comparison (item 5).
- Navigation destinations, active item, open phone menu and home page (item 9).
- Club colors from the API and checking the `contexto` rule against real data (`docs/divida-tecnica.md`).
