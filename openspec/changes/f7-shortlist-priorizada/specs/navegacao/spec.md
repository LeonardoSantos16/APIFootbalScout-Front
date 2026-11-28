# Spec Delta

## MODIFIED Requirements

### Requirement: Top navigation
Every scout page SHALL have at the top the app name, the "Buscar jogador" field, the links "Acompanhamentos", "Shortlists" and "Relatórios" and, on the right, the scout's name and "Sair". The name SHALL lead to the "Conta" page, "Shortlists" SHALL lead to `/shortlists` and be marked as current on `/shortlists` and on every shortlist page, and "Sair" SHALL end the session; the other links lead nowhere while their features do not exist. The "Entrar" and "Criar conta" pages SHALL show only the app name at the top.

#### Scenario: Metrics page
- **WHEN** the scout opens the per-90 metrics screen
- **THEN** the top shows "Buscar jogador", "Acompanhamentos", "Shortlists", "Relatórios", the scout's name and "Sair"

#### Scenario: Name leads to the account
- **WHEN** the scout clicks their name at the top
- **THEN** the "Conta" page opens

#### Scenario: Shortlists link
- **WHEN** the scout clicks "Shortlists" at the top
- **THEN** `/shortlists` opens with "Shortlists" marked as current

#### Scenario: Inside a shortlist
- **WHEN** the scout opens `/shortlists/<id>`
- **THEN** "Shortlists" is marked as current at the top

#### Scenario: Other pages
- **WHEN** the scout opens a player's profile
- **THEN** no top link is marked as current

#### Scenario: Entrar page
- **WHEN** a scout without a session opens "Entrar"
- **THEN** the top shows only the app name
