# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Provisional home page
Until the real home page exists (item 9), `/` SHALL show "Olá, {nome}." with the scout's first name and "A busca de jogadores chega em breve.". With the mock API, it SHALL also list the test players 1001 to 1005, each leading to its per-90 metrics. The page title SHALL be "APIFootballScout".

#### Scenario: Home after signing in
- **WHEN** the scout "Ana Ribeiro" signs in without a destination
- **THEN** `/` shows "Olá, Ana."

#### Scenario: Test players
- **WHEN** the app runs with the mock API and the scout clicks "1001"
- **THEN** the per-90 metrics screen of player 1001 opens
