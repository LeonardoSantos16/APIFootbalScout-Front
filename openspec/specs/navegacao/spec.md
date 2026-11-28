# navegacao Specification

## Purpose

Defines the common skeleton of the scout's pages: the top navigation, the account and the two-column body, which later features fill in.

## Requirements

### Requirement: Top navigation
Every scout page SHALL have at the top the app name as a link to `/`, the "Buscar jogador" field, the "Shortlists" link and, on the right, the scout's name and "Sair". The name SHALL lead to the "Conta" page and "Sair" SHALL end the session. The top SHALL NOT show "Acompanhamentos" nor "Relatórios". The "Entrar" and "Criar conta" pages SHALL show only the app name at the top, without a link.

#### Scenario: Metrics page
- **WHEN** the scout opens the per-90 metrics screen
- **THEN** the top shows "APIFootballScout", "Buscar jogador", "Shortlists", the scout's name and "Sair", and neither "Acompanhamentos" nor "Relatórios"

#### Scenario: App name leads home
- **WHEN** the scout clicks "APIFootballScout" at the top of a profile
- **THEN** `/` opens

#### Scenario: Name leads to the account
- **WHEN** the scout clicks their name at the top
- **THEN** the "Conta" page opens

#### Scenario: Entrar page
- **WHEN** a scout without a session opens "Entrar"
- **THEN** the top shows only the app name, which is not a link

### Requirement: Two-column body
On desktop, the player page body SHALL have the main card at about two thirds of the width and a support column on the right. Below 720px, it SHALL become a single column, with the support below the card.

#### Scenario: Phone width
- **WHEN** the page is opened at 375px wide
- **THEN** the card takes the full width and the support column sits below it

### Requirement: Navigation on phones
Below 720px, the top SHALL show the app name, a "Buscar" text link to `/busca` and a "Menu" button instead of the search field, the links and the account. On `/busca`, the "Buscar" link SHALL be hidden. The app name, "Buscar" and "Menu" SHALL each have a touch target of at least 44px.

#### Scenario: Top on a phone
- **WHEN** the profile is opened at 375px wide
- **THEN** the top shows the app name, "Buscar" and the "Menu" button

#### Scenario: Buscar link
- **WHEN** the scout taps "Buscar" at 375px wide
- **THEN** the `/busca` page opens with the field focused

### Requirement: Top search field
Submitting the top "Buscar jogador" field with Enter SHALL open `/busca?termo=` with the trimmed term, following the minimum length of the search page, with the message below the field. The field SHALL be empty on every route and SHALL be hidden on `/busca`, whose own field already holds the term.

#### Scenario: Searching from a profile
- **WHEN** the scout types "silva" in the top field on a profile and presses Enter
- **THEN** `/busca?termo=silva` opens and the top no longer shows the field

#### Scenario: Short term at the top
- **WHEN** the scout types "s" in the top field and presses Enter
- **THEN** the top field shows "Digite pelo menos 2 letras do nome." and the page does not change

#### Scenario: Leaving the search page
- **WHEN** the scout opens a profile from the results of "silva"
- **THEN** the top shows the "Buscar jogador" field empty

### Requirement: Phone menu
At 375px wide, "Menu" SHALL open a full-screen menu titled "Menu" with, in order, "Início", "Shortlists", the scout's name with "Conta" below it, and "Sair". The menu SHALL keep the focus inside it, SHALL close with "Fechar", with Esc and when the scout follows one of its links, and SHALL return the focus to "Menu" when closed without navigating.

#### Scenario: Opening the menu
- **WHEN** the scout taps "Menu" at 375px wide
- **THEN** the menu shows "Início", "Shortlists", "Ana Ribeiro" with "Conta" and "Sair"

#### Scenario: Following a link
- **WHEN** the scout taps "Shortlists" in the menu
- **THEN** `/shortlists` opens and the menu is closed

#### Scenario: Closing with Esc
- **WHEN** the scout presses Esc with the menu open
- **THEN** the menu closes and the focus is on "Menu"

#### Scenario: Sair in the menu
- **WHEN** the scout taps "Sair" in the menu
- **THEN** the session ends and "Entrar" opens

### Requirement: Current page in the navigation
"Shortlists" SHALL be marked as current on `/shortlists` and on every shortlist page, and the scout's name on `/conta`, both at the top and in the phone menu. "Início" SHALL be marked as current on `/` in the phone menu. The app name at the top SHALL never show the current-page underline. On any other page no link SHALL be marked as current.

#### Scenario: Shortlists link
- **WHEN** the scout clicks "Shortlists" at the top
- **THEN** `/shortlists` opens with "Shortlists" marked as current

#### Scenario: Inside a shortlist
- **WHEN** the scout opens `/shortlists/<id>`
- **THEN** "Shortlists" is marked as current at the top

#### Scenario: Account page
- **WHEN** the scout opens `/conta`
- **THEN** the scout's name is marked as current at the top

#### Scenario: Home in the phone menu
- **WHEN** the scout opens the menu on `/` at 375px wide
- **THEN** "Início" is marked as current in the menu

#### Scenario: Other pages
- **WHEN** the scout opens a player's profile
- **THEN** nothing in the top nor in the menu is marked as current

### Requirement: Home page
`/` SHALL show "Olá, {nome}." with the scout's first name, a search field labelled "Nome do jogador" with the "Buscar" button, which follows the search rules and leads to `/busca?termo=`, and below them the card "Suas shortlists", in one column. The browser tab title SHALL be "APIFootballScout".

#### Scenario: Home after signing in
- **WHEN** the scout "Ana Ribeiro" signs in without a destination
- **THEN** `/` shows "Olá, Ana.", the search field and "Suas shortlists"

#### Scenario: Searching from the home page
- **WHEN** the scout types "silva" on the home page and clicks "Buscar"
- **THEN** `/busca?termo=silva` opens with the results for "silva"

#### Scenario: Home tab title
- **WHEN** the scout opens `/`
- **THEN** the tab title is "APIFootballScout"

### Requirement: Shortlists on the home page
The card "Suas shortlists" SHALL list at most five of the scout's shortlists in name order, each as a link to its page with "<n> de <limiteDeAlvos> alvos" and the custo total, or "Sem alvos". With more than five, the card SHALL end with "Ver todas as shortlists", leading to `/shortlists`. A failure SHALL stay inside the card, the search keeps working.

#### Scenario: Loading
- **WHEN** the home page opens before the shortlists answer
- **THEN** the card shows three placeholder rows in the shape of the final rows

#### Scenario: More than five shortlists
- **WHEN** the scout has six shortlists, "Zagueiros sub-23" last in name order
- **THEN** the card shows the first five, not "Zagueiros sub-23", and "Ver todas as shortlists"

#### Scenario: Up to five shortlists
- **WHEN** the scout has "Laterais 2027" with 4 alvos costing €47M and "Meias para janeiro" without alvos
- **THEN** the card shows "Laterais 2027" with "4 de 25 alvos · €47M" and "Meias para janeiro" with "0 de 25 alvos · Sem alvos", without "Ver todas as shortlists"

#### Scenario: Opening a shortlist
- **WHEN** the scout clicks "Laterais 2027" in the card
- **THEN** the page of "Laterais 2027" opens

#### Scenario: No shortlists
- **WHEN** the scout has no shortlist
- **THEN** the card shows "Você ainda não tem shortlists." and a "Criar shortlist" link to `/shortlists`

#### Scenario: Unknown error
- **WHEN** the shortlists answer with a 500 without `code`
- **THEN** the card shows "Não foi possível concluir agora." with "Tentar de novo" and the search field still works

#### Scenario: Source failure
- **WHEN** the shortlists answer with a 502
- **THEN** the card shows the message with "Tentar de novo", which asks for the shortlists again

### Requirement: Page not found
A URL without a route SHALL show "Página não encontrada." with "O endereço não existe ou foi digitado errado.". With a session, it SHALL show inside the scout's top bar with the "Ir para o início" link to `/`; without one, inside the "Entrar" shell with an "Entrar" link. The browser tab title SHALL be "Página não encontrada · APIFootballScout".

#### Scenario: Unknown URL with a session
- **WHEN** the scout opens `/xyz`
- **THEN** the page shows "Página não encontrada." with "Ir para o início" and the scout's top bar, with nothing marked as current

#### Scenario: Unknown URL without a session
- **WHEN** a visitor without a session opens `/xyz`
- **THEN** the page shows "Página não encontrada." with "Entrar" and only the app name at the top

#### Scenario: Going home
- **WHEN** the scout clicks "Ir para o início"
- **THEN** `/` opens

### Requirement: Invalid ids in the URL
A player id that is not a whole number from 1, and a relatório id or shortlist id that is not a uuid, SHALL show the "Página não encontrada." page without asking the API.

#### Scenario: Player id with letters
- **WHEN** the scout opens `/jogadores/abc`
- **THEN** "Página não encontrada." shows and no profile is requested

#### Scenario: Player id zero or negative
- **WHEN** the scout opens `/jogadores/0/metricas` or `/jogadores/-3`
- **THEN** "Página não encontrada." shows and no profile is requested

#### Scenario: Shortlist id that is not a uuid
- **WHEN** the scout opens `/shortlists/123`
- **THEN** "Página não encontrada." shows and no shortlist is requested

#### Scenario: Relatório id that is not a uuid
- **WHEN** the scout opens `/jogadores/1001/relatorios/abc`
- **THEN** "Página não encontrada." shows and no relatório is requested

### Requirement: Skip link
Every page SHALL start with the link "Pular para o conteúdo" as the first focusable element, hidden until it has the keyboard focus, which moves the focus to the main content.

#### Scenario: First Tab
- **WHEN** the scout presses Tab once after a profile loads
- **THEN** "Pular para o conteúdo" is visible and focused

#### Scenario: Skipping the top
- **WHEN** the scout activates "Pular para o conteúdo"
- **THEN** the focus is on the main content and the next Tab reaches the first element after the top bar

### Requirement: Focus on page change
When the scout goes to another page, the focus SHALL move to the page's main heading. It SHALL stay where it is on the first load of the app, when the scout switches between the tabs of the same player, when only the search params change, such as the recorte, the compared player or the search term, and when the new page already put the focus in its content, such as the search field.

#### Scenario: Opening a profile from the search
- **WHEN** the scout opens a player's profile from the results of "silva"
- **THEN** the focus is on the heading of the profile page

#### Scenario: Switching player tabs
- **WHEN** the scout clicks the "Métricas" tab on a player's profile
- **THEN** the focus stays on the "Métricas" tab

#### Scenario: Changing the recorte
- **WHEN** the scout picks another recorte on the metrics page
- **THEN** the focus stays on the recorte selector

#### Scenario: Opening the search
- **WHEN** the scout taps "Buscar" at the top at 375px wide
- **THEN** the focus is on the search field, not on the page heading

#### Scenario: First load
- **WHEN** the scout opens the app on `/`
- **THEN** the focus is not moved to the heading

### Requirement: Scroll on page change
A new page SHALL open scrolled to the top; going back or forward in the browser SHALL restore the scroll position the page had. Switching between the tabs of the same player and changing only the search params SHALL keep the scroll position.

#### Scenario: Opening a profile from the end of the results
- **WHEN** the scout scrolls to the end of the results of "silva" and opens a profile
- **THEN** the profile opens scrolled to the top

#### Scenario: Going back to the results
- **WHEN** the scout goes back in the browser from that profile
- **THEN** the results of "silva" show at the position they were scrolled to

### Requirement: App name in the tab title
Every browser tab title that another capability defines SHALL be followed by " · APIFootballScout", such as "Métricas por 90 · Rafael Montes · APIFootballScout" and "Entrar · APIFootballScout". The home page title SHALL be "APIFootballScout" alone.

#### Scenario: Metrics tab title
- **WHEN** the metrics of "Rafael Montes" load
- **THEN** the tab title is "Métricas por 90 · Rafael Montes · APIFootballScout"

#### Scenario: Shortlists tab title
- **WHEN** the scout opens `/shortlists`
- **THEN** the tab title is "Shortlists · APIFootballScout"

#### Scenario: Entrar tab title
- **WHEN** a visitor without a session opens "Entrar"
- **THEN** the tab title is "Entrar · APIFootballScout"
