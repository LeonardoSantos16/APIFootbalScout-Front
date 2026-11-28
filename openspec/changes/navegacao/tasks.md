# Tasks

## 1. Navigation rules

- [x] 1.1 TDD of `src/utils/documentTitle.ts`: `documentTitle("Métricas por 90", "Rafael Montes")` is "Métricas por 90 · Rafael Montes · APIFootballScout"; `documentTitle("Shortlists")` is "Shortlists · APIFootballScout"; empty or missing parts are dropped ("Métricas por 90", "" gives "Métricas por 90 · APIFootballScout"); no parts gives "APIFootballScout"; `test:` red for the group
- [x] 1.2 TDD of `src/utils/routeParams.ts`: `parsePlayerId` gives 1001 for "1001" and `null` for "abc", "0", "-3", "01", "1.5" and ""; `isUuid` true for a seeded shortlist id and false for "123" and "abc"; same `test:` red
- [x] 1.3 TDD of `src/utils/pageChange.ts`: `shouldMoveFocus` false without a previous location, false for `/busca?termo=a` to `/busca?termo=b`, false for `/jogadores/1001` to `/jogadores/1001/metricas`, true for `/jogadores/1001/metricas` to `/jogadores/1002`, true for `/busca` to `/jogadores/1001`; `scrollKey` gives the same key for the tabs of 1001 and different keys for 1001 and 1002 and for `/busca` and `/shortlists`; same `test:` red
- [x] 1.4 TDD of `src/pages/home/utils/homeShortlists.ts`: six sorted shortlists give the first five and `hasMore` true; four give four and `hasMore` false; the detail is "4 de 25 alvos · €47M" and "0 de 25 alvos · Sem alvos"; same `test:` red
- [x] 1.5 Green of 1.1 to 1.4 in one `feat:` commit; verify with `npx vitest run src/utils src/pages/home/utils`

## 2. Components

- [ ] 2.1 `SkipLink` in `src/components/SkipLink/` with its CSS Module and a focused story, moving the focus to `#conteudo` on click; and `Dialog` `variant="sheet"` with the `Sheet` story; component tests for the focus move and for the sheet closing with Esc; verify in Storybook at desktop and 375px with no literal color, font or spacing in the CSS
- [ ] 2.2 `AppShell` without `LINKS`, with `homeLink`, `SkipLink`, `<main id="conteudo" tabIndex={-1}>`, the single link placeholder while loading, 44px targets below 720px and the `PhoneMenu` sheet with render props and the `pitch` dot on `[aria-current='page']`; `AuthShell` with `SkipLink` and the `main` target; stories `Desktop`, `Phone`, `PhoneMenuOpen`, `Loading`, `AccountCurrent`; verify in Storybook at desktop and 375px

## 3. Mocks

- [ ] 3.1 `shortlistsMoreThanFive` (six shortlists, "Zagueiros sub-23" last) and `shortlistsSourceDown` (502) in `src/mocks/handlers/shortlists.ts`; verify with `npm run typecheck`

## 4. Shell and navigation

- [ ] 4.1 Route tests (`test:` red for the group): the top shows "APIFootballScout", "Shortlists", the name and "Sair" without "Acompanhamentos" nor "Relatórios"; "APIFootballScout" opens `/`; the name is current on `/conta`; nothing is current on a profile; "Shortlists" stays current on `/shortlists/<id>`; "Entrar" shows only the app name, not a link; the first Tab focuses "Pular para o conteúdo" and activating it focuses the main content; at 375px "Menu" opens "Início", "Shortlists", "Ana Ribeiro" with "Conta" and "Sair", "Início" current on `/`; "Shortlists" in the menu opens `/shortlists` and closes it; Esc closes it with the focus on "Menu"; "Sair" in the menu opens "Entrar"
- [ ] 4.2 Route tests for focus and scroll (same `test:` red): opening a profile from the results of "silva" focuses the profile heading; the "Métricas" tab keeps the focus on the tab; a recorte change keeps the focus on the selector; the first load of `/` does not move the focus; the router is created with scroll restoration keyed by `scrollKey`
- [ ] 4.3 Green of 4.1 and 4.2 in one `feat:` commit: `_authenticated.tsx` and `_public.tsx` with the links, the menu closing on `onResolved`, `usePageFocus` and `data-page-heading` with `tabIndex={-1}` on every page heading; `scrollRestoration` and `getScrollRestorationKey` in `src/router.ts`; verify with `npm test`

## 5. Tab titles

- [ ] 5.1 Route tests (`test:` red): "Métricas por 90 · Rafael Montes · APIFootballScout", "Shortlists · APIFootballScout", "Entrar · APIFootballScout", "APIFootballScout" on `/`; update the title assertions of the existing page tests to the full title in the same commit
- [ ] 5.2 Green in one `feat:` commit: `useDocumentTitle` in `src/hooks/` replacing the direct `document.title` writes of the fourteen pages and of `PlayerLayout`; verify with `npm test` and `grep -rn "document.title =" src` finding only the hook

## 6. Page not found

- [ ] 6.1 Route tests (`test:` red for the group): `/xyz` with a session shows "Página não encontrada.", "O endereço não existe ou foi digitado errado.", "Ir para o início" and the scout's top with nothing current, and "Ir para o início" opens `/`; `/xyz` without a session shows "Entrar" and only the app name; `/jogadores/abc`, `/jogadores/0/metricas` and `/jogadores/-3` show it without a profile request; `/shortlists/123` without a shortlist request; `/jogadores/1001/relatorios/abc` without a relatório request; tab title "Página não encontrada · APIFootballScout"
- [ ] 6.2 Green in one `feat:` commit: `NotFoundPage` in `src/pages/not-found/`, `-NotFoundRoute.tsx` as the root `notFoundComponent` with `notFoundMode: 'root'`, and the `beforeLoad` checks on `$jogadorId`, `$relatorioId` and `$shortlistId`; verify with `npm test` and `src/routeTree.gen.ts` regenerated
- [ ] 6.3 Stories `SignedIn` and `SignedOut` of `NotFoundPage`; verify in Storybook at desktop and 375px

## 7. Home page

- [ ] 7.1 Route tests (`test:` red for the group): "Olá, Ana.", the search field and "Suas shortlists"; "silva" and "Buscar" open `/busca?termo=silva`; three placeholder rows while pending; Ana's four seeded shortlists in name order without "Ver todas as shortlists"; "Laterais 2027" with "4 de 25 alvos · €47M" opens its page; six shortlists show five without "Zagueiros sub-23" and with "Ver todas as shortlists" leading to `/shortlists`; empty shows "Você ainda não tem shortlists." with "Criar shortlist" to `/shortlists`; a 500 shows "Não foi possível concluir agora." without "Tentar de novo" and the search still works; a 502 shows "Tentar de novo", which asks again
- [ ] 7.2 Green in one `feat:` commit: `HomePage` with `HomeShortlists` and the route passing the shortlist links; remove the "Pagina inicial provisoria" entry from `docs/divida-tecnica.md`; verify with `npm test`
- [ ] 7.3 Stories of `HomePage` per state (`WithShortlists`, `MoreThanFive`, `Empty`, `Loading`, `UnknownError`, `SourceDown`); verify in Storybook at desktop and 375px

## 8. Guidelines review

- [ ] 8.1 Run the `web-design-guidelines` skill over `src/components/` and `src/pages/`; fix the shell findings in a `fix:` commit and record page findings that need more than a local fix in `docs/divida-tecnica.md` under "Front"; verify with `npm test`
- [ ] 8.2 Walk every page in `npm run dev:mock` at 375px and 768px; fix local CSS breaks inside the current layout without a new breakpoint; verify with no horizontal page scroll and no console errors

## 9. Documentation

- [ ] 9.1 `CLAUDE.md` with the final top bar, the phone menu, the home page, the not-found page and the title rule; `scout-ui` skill with `useDocumentTitle`, `data-page-heading` and the `SkipLink`; verify the texts against the code

## 10. Verification

- [ ] 10.1 `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass; walk every state of the wireframe in `npm run dev:mock` (home with the four shortlists, the phone menu, `/xyz` signed in and out, `/jogadores/abc`, the skip link and the focus after opening a profile) at desktop and 375px with no console errors
- [ ] 10.2 Against the real API (`npm run dev` with the back-end running): sign in, see the home shortlists, open one, use the phone menu, open `/xyz` and an invalid player id; record the findings in `docs/divida-tecnica.md` and the delta spec

## 11. Retrospective

- [ ] 11.1 Retrospective: what the spec did not foresee, adjustments to the delta spec, the `scout-ui` skill and `CLAUDE.md`, before `/openspec-archive-change`
