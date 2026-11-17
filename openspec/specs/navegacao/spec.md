# navegacao Specification

## Purpose

Defines the common skeleton of the scout's pages: the top navigation, the account and the two-column body, which later features fill in.

## Requirements

### Requirement: Top navigation
Every scout page SHALL have at the top the app name, the "Buscar jogador" field, the links "Acompanhamentos", "Shortlists" and "Relatórios" and, on the right, the scout's name and "Sair". The name SHALL lead to the "Conta" page and "Sair" SHALL end the session; the other items lead nowhere while their features do not exist. The "Entrar" and "Criar conta" pages SHALL show only the app name at the top.

#### Scenario: Metrics page
- **WHEN** the scout opens the per-90 metrics screen
- **THEN** the top shows "Buscar jogador", "Acompanhamentos", "Shortlists", "Relatórios", the scout's name and "Sair"

#### Scenario: Name leads to the account
- **WHEN** the scout clicks their name at the top
- **THEN** the "Conta" page opens

#### Scenario: Entrar page
- **WHEN** a scout without a session opens "Entrar"
- **THEN** the top shows only the app name

### Requirement: Two-column body
On desktop, the player page body SHALL have the main card at about two thirds of the width and a support column on the right. Below 720px, it SHALL become a single column, with the support below the card.

#### Scenario: Phone width
- **WHEN** the page is opened at 375px wide
- **THEN** the card takes the full width and the support column sits below it

### Requirement: Navigation on phones
Below 720px, the top SHALL show the app name and a "Menu" button instead of the search and the links.

#### Scenario: Top on a phone
- **WHEN** the page is opened at 375px wide
- **THEN** the top shows the app name and the "Menu" button

### Requirement: Provisional home page
Until the real home page exists (item 9), `/` SHALL show "Olá, {nome}." with the scout's first name and "A busca de jogadores chega em breve.". With the mock API, it SHALL also list the test players 1001 to 1005, each leading to its per-90 metrics. The page title SHALL be "APIFootballScout".

#### Scenario: Home after signing in
- **WHEN** the scout "Ana Ribeiro" signs in without a destination
- **THEN** `/` shows "Olá, Ana."

#### Scenario: Test players
- **WHEN** the app runs with the mock API and the scout clicks "1001"
- **THEN** the per-90 metrics screen of player 1001 opens
