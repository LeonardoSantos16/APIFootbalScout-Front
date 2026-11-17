# Spec Delta

## MODIFIED Requirements

### Requirement: Top navigation
Every scout page SHALL have at the top the app name, the "Buscar jogador" field, the links "Acompanhamentos", "Shortlists" and "Relatórios" and, on the right, the scout's name and "Sair". The name SHALL lead to the "Conta" page and "Sair" SHALL end the session; the other links lead nowhere while their features do not exist. The "Entrar" and "Criar conta" pages SHALL show only the app name at the top.

#### Scenario: Metrics page
- **WHEN** the scout opens the per-90 metrics screen
- **THEN** the top shows "Buscar jogador", "Acompanhamentos", "Shortlists", "Relatórios", the scout's name and "Sair"

#### Scenario: Name leads to the account
- **WHEN** the scout clicks their name at the top
- **THEN** the "Conta" page opens

#### Scenario: Entrar page
- **WHEN** a scout without a session opens "Entrar"
- **THEN** the top shows only the app name

### Requirement: Navigation on phones
Below 720px, the top SHALL show the app name, a "Buscar" text link to `/busca` and a "Menu" button instead of the search field and the links. On `/busca`, the "Buscar" link SHALL be hidden.

#### Scenario: Top on a phone
- **WHEN** the profile is opened at 375px wide
- **THEN** the top shows the app name, "Buscar" and the "Menu" button

#### Scenario: Buscar link
- **WHEN** the scout taps "Buscar" at 375px wide
- **THEN** the `/busca` page opens with the field focused

### Requirement: Provisional home page
Until the real home page exists (item 9), `/` SHALL show "Olá, {nome}." with the scout's first name and a search field labelled "Nome do jogador" with the "Buscar" button, which follows the search rules and leads to `/busca?termo=`. The page title SHALL be "APIFootballScout".

#### Scenario: Home after signing in
- **WHEN** the scout "Ana Ribeiro" signs in without a destination
- **THEN** `/` shows "Olá, Ana." and the search field

#### Scenario: Test players
- **WHEN** the app runs with the mock API
- **THEN** `/` no longer lists the test players, which are found by searching their names

#### Scenario: Searching from the home page
- **WHEN** the scout types "silva" on the home page and clicks "Buscar"
- **THEN** `/busca?termo=silva` opens with the results for "silva"

## ADDED Requirements

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
