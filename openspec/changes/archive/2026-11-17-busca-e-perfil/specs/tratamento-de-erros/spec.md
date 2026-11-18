# Spec Delta

## MODIFIED Requirements

### Requirement: Error without a code
On the profile, which may respond plain text, without a `code` the system SHALL decide by status: 404 shows "Jogador não encontrado.", 502 shows "Não foi possível carregar o perfil agora.", any other the generic error. The search SHALL show "Não foi possível buscar agora." on a 502, with or without a `code`, and the generic error otherwise. On `ProblemDetails` endpoints, a missing `code` SHALL be treated as an unknown error.

#### Scenario: Nonexistent profile
- **WHEN** the profile responds 404 with the text "Player with ID 12 not found"
- **THEN** the screen shows "Jogador não encontrado." without "Tentar de novo"

#### Scenario: Search without a code
- **WHEN** the search responds 502 with a plain-text body, twice in a row
- **THEN** the screen shows "Não foi possível buscar agora." with "Tentar de novo"

#### Scenario: Metrics without a code
- **WHEN** the metrics respond 500 with a `ProblemDetails` without `code`
- **THEN** the screen shows "Não foi possível concluir agora." with "Tentar de novo"

### Requirement: Where the error appears
A profile failure SHALL replace the player layout on every player tab, without the band, the tabs or the selector. A metrics failure SHALL appear in place of the grid, with the band, the tabs and the selector visible. A search failure SHALL appear in place of the results, with the field visible.

#### Scenario: Profile failure
- **WHEN** the profile fails on the metrics tab
- **THEN** the page shows only the message, without the band or the tabs

#### Scenario: Metrics failure
- **WHEN** the metrics fail
- **THEN** the band, the tabs and the selector stay on screen, with the message in place of the grid

#### Scenario: Search failure
- **WHEN** the search fails
- **THEN** the field keeps the term and the message takes the place of the results
