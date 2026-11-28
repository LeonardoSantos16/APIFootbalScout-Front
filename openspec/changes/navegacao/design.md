# Design

## Context

`src/routes/_authenticated.tsx` renders `AppShell` with the account link, `HeaderSearch` (hidden on `/busca`), the phone "Buscar" link and a `ShortlistsLink`; its `pendingComponent` is `AppShell loading` and its `errorComponent` reuses `AppShell`. `AppShell` (`src/components/AppShell/`) prints the brand as a `<span>`, a `LINKS` array where "Acompanhamentos" and "Relatórios" are text, the account with "Sair" and, below 720px, "Buscar" and an inert "Menu" `Button`. `src/routes/_public.tsx` wraps `/entrar` and `/criar-conta` in `AuthShell`, whose brand is a `<span>` and whose `<main>` has no id. `src/routes/__root.tsx` renders only `Outlet`, with no `notFoundComponent`. `src/router.ts` creates the router without `scrollRestoration`. The player route parses `jogadorId` with `Number(...)`; `$relatorioId` and `$shortlistId` are passed as strings. Fourteen pages write `document.title` in a `useEffect` with "<page> · <name>", without the app name. `/` is the provisional `HomePage` (`src/pages/home/`), centred at 640px. `useShortlists` (`src/pages/shortlist/hooks/`) reads `GET /api/Shortlist` sorted by name, and `ShortlistsPage` builds each row detail with `targetsLabel` and `formatCost` / "Sem alvos". `Dialog` (`src/components/Dialog/`) is the Radix dialog, centred only.

Product decisions are in `docs/grilling/navegacao.md` (Q1 to Q16). The approved wireframe is at https://claude.ai/artifact/RYJD2GUiUdX2MXw2yYV5oB (home page on desktop, the card states, home and menu at 375px, page not found with and without a session). The `SkipLink` reference and the `Dialog` `variant="sheet"` are already in `docs/design-system/`.

ADRs applied: 0001 (the session read through `useSession` and `readSession`, used to choose the not-found shell), 0005 (CSS Modules). No decision contradicts an ADR.

## Goals / Non-Goals

**Goals:**
- One place for the tab title rule and one for the focus rule, both pure functions tested without React.
- The not-found page reached the same way for an unknown path and for an invalid id, without a request.
- Every home state reproducible by a named MSW handler and a story.

**Non-Goals:**
- A list of acompanhamentos or relatórios, or any new endpoint.
- Redesigning page bodies found in the guidelines review beyond local fixes.

## Decisions

### Endpoints

| Use | Contract | Note |
| --- | --- | --- |
| Home shortlists | `GET /api/Shortlist` | `ShortlistResponseDto[]`, unordered; reuses `useShortlists` (sorted by name, 1-minute `staleTime`) |

### Routes and search params

| File | Path | Change |
| --- | --- | --- |
| `src/routes/__root.tsx` | root | `notFoundComponent: NotFoundRoute`, which picks the shell by `readSession()` |
| `src/routes/_authenticated/index.tsx` | `/` | renders the new `HomePage` with the shortlists card |
| `src/routes/_authenticated/jogadores/$jogadorId.tsx` | `/jogadores/$jogadorId` | `beforeLoad` checks `parsePlayerId` and throws `notFound()` before any loader or query |
| `src/routes/_authenticated/jogadores/$jogadorId/relatorios/$relatorioId.tsx` | `/jogadores/$jogadorId/relatorios/$relatorioId` | `beforeLoad` checks `isUuid` and throws `notFound()` |
| `src/routes/_authenticated/shortlists/$shortlistId.tsx` | `/shortlists/$shortlistId` | `beforeLoad` checks `isUuid` and throws `notFound()` |

No search param changes. The router gets `scrollRestoration: true` and `getScrollRestorationKey` keyed by `pathname`, with the player layout prefix (`/jogadores/<id>`) as the key for its tabs, so tab switches and search-param changes keep the position. With `notFoundMode: 'root'`, an unknown path and a `notFound()` thrown under `_authenticated` both render the root `notFoundComponent`, which picks the shell, so the choice lives in one place.

### Pure rules

| Module | Responsibility |
| --- | --- |
| `src/utils/documentTitle.ts` | `documentTitle(...parts)`: drops empty parts, joins with " · " and appends "APIFootballScout"; no parts gives "APIFootballScout" |
| `src/utils/routeParams.ts` | `parsePlayerId(raw)`: whole number from 1 (`/^[1-9]\d*$/`) or `null`; `isUuid(raw)` against the 8-4-4-4-12 hex form |
| `src/utils/pageChange.ts` | `shouldMoveFocus(previous, next)`: false on the first load (no previous), when pathnames are equal (search params only), and when both are tabs of the same player (`/jogadores/<id>` prefix); true otherwise. `scrollKey(location)` uses the same player prefix |
| `src/pages/home/utils/homeShortlists.ts` | `HOME_LIMIT = 5`; `homeShortlists(list)`: the first five and `hasMore`; the row detail reuses `targetsLabel` and `formatCost` |

### Hooks

- `useDocumentTitle(...parts)` (`src/hooks/`): sets `document.title = documentTitle(...parts)` in an effect; every page in the list above replaces its direct write, keeping its current parts (the player layout passes `TAB_TITLE[tab]` or "Jogador não encontrado").
- `usePageFocus()` (`src/hooks/`): subscribes to the router's `onResolved` and, when `shouldMoveFocus` holds, focuses the element with `data-page-heading` inside `#conteudo`, falling back to `#conteudo` itself. Mounted once in the authenticated and the public layouts. Each page's `h1` gets `tabIndex={-1}` and `data-page-heading`; the player pages mark the player name heading of the layout.

### Shell

- `AppShell`: `SkipLink` first; the brand through a new `homeLink` render prop (a `Link` to `/` from the route, text in stories); `LINKS` removed, only `shortlistsLink`; `<main id="conteudo" tabIndex={-1}>`; below 720px, "Menu" opens `PhoneMenu`. The loading skeleton keeps one link placeholder instead of three.
- `PhoneMenu` (`src/components/AppShell/PhoneMenu.tsx`): `Dialog` with `variant="sheet"`, title "Menu", children are render props from the route (`homeLink`, `shortlistsLink`, `accountLink`, each closing the menu on click) and "Sair" as a ghost `Button` with `sign-out`. The route closes it on `onResolved` as well, for links followed from elsewhere. The current link gets `aria-current="page"` from `Link` (`activeProps`, `activeOptions: { exact: true }` for `/`, prefix for `/shortlists`) and the `pitch` dot through CSS on `[aria-current='page']`.
- `Dialog` gains `variant?: 'centered' | 'sheet'`, with the sheet styles of the design system reference.
- `SkipLink` (`src/components/SkipLink/`): `<a href="#conteudo">Pular para o conteúdo</a>` off-screen until `:focus-visible`; its click moves focus to `#conteudo` explicitly, since hash links do not focus a `tabIndex=-1` target in every browser.
- `AuthShell`: `SkipLink` and `<main id="conteudo" tabIndex={-1}>`; the brand stays text.
- 44px targets: the brand link and "Buscar" get `min-height: 44px`; "Menu" already is a `Button`.

### Pages

- `HomePage` (`src/pages/home/`): receives `name`, `onSearch` and `renderShortlistLink(shortlistId, props)` / `renderAllShortlistsLink(props)` (stories run without a router). The greeting card as today, then `HomeShortlists`: `Card` titled "Suas shortlists"; three `RowList` skeleton rows while pending; `RowList` of `homeShortlists` with the footer "Ver todas as shortlists" when `hasMore`; empty text "Você ainda não tem shortlists." with "Criar shortlist" (secondary button look, link to `/shortlists`); `InlineError` with `describeError` and `onRetry` only when `canRetry`. Single column at the existing 640px width; the row keeps the `RowList` look (no trailing caret, which the wireframe drew but the component does not have).
- `NotFoundPage` (`src/pages/not-found/`): `Card` with the `h1` "Página não encontrada.", "O endereço não existe ou foi digitado errado." and the link from `renderLink` ("Ir para o início" or "Entrar"); title through `useDocumentTitle('Página não encontrada')`.
- `NotFoundRoute` (`src/routes/-NotFoundRoute.tsx`): with a session (`readSession()` and a non-expired refresh), the authenticated `AppShell` with the not-found page and "Ir para o início"; without, `AuthShell` with "Entrar". It does not call `me`: the top only needs the session name.

### Components and stories

- `src/components/SkipLink/`: story focused.
- `src/components/Dialog/`: story `Sheet`.
- `src/components/AppShell/`: stories `Desktop`, `Phone`, `PhoneMenuOpen`, `Loading`, `AccountCurrent`.
- `src/pages/home/`: stories `WithShortlists`, `MoreThanFive`, `Empty`, `Loading`, `UnknownError`, `SourceDown`, each also at 375px through the viewport parameter.
- `src/pages/not-found/`: stories `SignedIn`, `SignedOut`.

### MSW per state

| Handler (`src/mocks/handlers/shortlists.ts`) | State |
| --- | --- |
| `shortlistsList` (existing) | the four seeded shortlists |
| `shortlistsMoreThanFive` (new) | six shortlists, "Zagueiros sub-23" last by name |
| `shortlistsEmpty`, `shortlistsPending`, `shortlistsUnknownError` (existing) | empty, loading, 500 without `code` |
| `shortlistsSourceDown` (new) | 502 |

`src/mocks/handlers.ts` keeps the `dev:mock` seed of item 8; the home shows its four shortlists without "Ver todas as shortlists".

### Guidelines review

Run the `web-design-guidelines` skill over `src/components/` and `src/pages/` after the shell is done, then walk every page at 375px and 768px in `dev:mock`. Findings in the shell are fixed in this change; findings inside a page that need more than a local CSS or attribute fix get an entry in `docs/divida-tecnica.md` under "Front".

## Risks / Trade-offs

- [The title rule changes the text the other specs show in their scenarios] → the `navegacao` requirement states the suffix once; tests of those pages assert the full title, so they are updated in the same group as the hook.
- [Focus moves on every page change] → limited by `shouldMoveFocus` to real page changes; the first load and the tabs keep the focus, which is what a keyboard user expects there.
- [`notFoundComponent` reading `readSession()` without `me`] → a session whose refresh is valid but rejected by the server shows the scout's top until the next request; the next navigation goes through `_authenticated` and its `beforeLoad`.
- [Scroll key by player prefix] → a long profile and a short metrics tab share one position; switching tabs keeps the scroll, as decided.
- [Removing "Acompanhamentos" and "Relatórios"] → the scout reaches them only through each player's tabs until item 6b and a back-end list of relatórios.
