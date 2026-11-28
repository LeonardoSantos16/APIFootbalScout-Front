# Proposal

## Why

Each feature (items 2 to 8) shipped with a minimal top bar: "Acompanhamentos" and "Relatórios" are plain text without a destination, the phone "Menu" button opens nothing, `/` is still the provisional home page, an unknown URL renders nothing and the browser tab titles do not name the app. Item 9 of `docs/planejamento-base.md` (navegação e acessibilidade, no back-end identifier) consolidates the shell before the e2e tests and the deploy. The decisions are in `docs/grilling/navegacao.md` (Q1 to Q16).

## What Changes

- The top bar loses "Acompanhamentos" and "Relatórios", which have no list in the contract; the app name becomes a link to `/`. "Shortlists" stays marked as current on the shortlist pages and the scout's name on `/conta`.
- Below 720px, "Menu" opens a full-screen menu with "Início", "Shortlists", the scout's name (to `/conta`) and "Sair", marking the current page; it closes with the close button, Esc and on navigation.
- The real home page: "Olá, {nome}.", the player search and the card "Suas shortlists" with up to five shortlists in name order, "Ver todas as shortlists" when there are more, and its loading, empty ("Você ainda não tem shortlists.") and error states. **BREAKING** for the spec: the provisional home page requirement is removed.
- A "Página não encontrada." page for any URL without a route and for a player id that is not a whole number from 1, or a relatório or shortlist id that is not a uuid, without calling the API; inside the scout's shell with a session, in the "Entrar" shell without one.
- Accessibility of the shell: the "Pular para o conteúdo" link as the first focusable element, focus moved to the page heading when the page changes (not between the tabs of a player nor on search param changes), 44px touch targets on the phone top bar, and every browser tab title ending in " · APIFootballScout".
- Scroll: a new page opens at the top; back and forward restore the position.
- A review of every page with the web interface guidelines, at 375px and 768px: shell issues are fixed here, page issues that need more than a local fix go to `docs/divida-tecnica.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `navegacao`: the top navigation without the links that have no destination and with the app name leading home; the phone menu; the current-page marks (replacing the "Shortlists link" requirement); the real home page (replacing the provisional one); the "Página não encontrada." page; the skip link, focus on page change, scroll restoration and the app name in every tab title.

The tab titles defined by `metricas-por-90`, `perfil-do-jogador`, `busca-de-jogadores`, `comparacao-direta`, `acompanhamento`, `relatorio-de-scouting`, `shortlist-priorizada` and `sessao` keep their text; the new `navegacao` requirement states that each one is followed by " · APIFootballScout", so those specs do not change.

## Impact

- **Code:** `AppShell` (links, brand link, phone menu, skip link, `main` target), `AuthShell` (skip link, `main` target), `Dialog` with a full-screen variant, new `SkipLink` in `src/components/`, a new `useDocumentTitle` hook replacing every direct `document.title` write, a focus-on-navigation hook in the authenticated and public layouts, `notFoundComponent` on the root route, param validation on `$jogadorId`, `$relatorioId` and `$shortlistId`, `scrollRestoration` in `src/router.ts`, the new home page in `src/pages/home/` reusing `useShortlists`.
- **API:** consumes `GET /api/Shortlist` on the home page, with no contract change. Back-end gap recorded in `docs/divida-tecnica.md`: no list of the scout's relatórios.
- **Architecture:** no ADR applies or changes; ADR 0005 (CSS Modules) for the new styles.
- **Dependencies:** none new (the phone menu uses the Radix Dialog already installed).
- **Depends on:** items 2 to 8 (every page the shell wraps), especially item 3 (Sessão: authenticated and public layouts) and item 8 (F7: `/shortlists` and `useShortlists`).
- **Unblocks:** item 10 (e2e tests), which navigates through the final shell, and item 11 (deploy).

### Out of scope

- "Acompanhamentos" in the top bar and the list of acompanhamentos (item 6b, waiting on the back-end).
- A "Relatórios" destination (no endpoint lists the scout's relatórios).
- "Vistos recentemente" on the home page, creating a shortlist from the home page.
- A breakpoint between 720px and 1024px, the light theme and PWA.
