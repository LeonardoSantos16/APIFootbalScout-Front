# Spec Delta

## MODIFIED Requirements

### Requirement: Profile without statistics
When the profile has no `stats`, or an empty `stats`, the metrics and comparison tabs, and the acompanhamento tab while the player is not tracked, SHALL show "Sem estatísticas publicadas para este jogador." below the player band and tabs, without the selector, the grid, the table, the second player search or the "Acompanhar" button, and MUST NOT treat the case as an error.

#### Scenario: Empty stats
- **WHEN** the profile arrives with an empty `stats`
- **THEN** the metrics tab shows the player's band and "Sem estatísticas publicadas para este jogador."
- **AND** no metrics request is made

#### Scenario: Empty stats on the comparison
- **WHEN** the profile arrives with an empty `stats` and the scout opens "Comparação"
- **THEN** the tab shows "Sem estatísticas publicadas para este jogador." without the search
- **AND** no comparison request is made

#### Scenario: Empty stats on a player not tracked
- **WHEN** the profile arrives with an empty `stats`, the scout opens "Acompanhamento" and the player has no active acompanhamento
- **THEN** the tab shows "Sem estatísticas publicadas para este jogador." without the selector or the "Acompanhar" button

#### Scenario: Empty stats on a tracked player
- **WHEN** the profile of player 1003 arrives with an empty `stats` and the player has an active acompanhamento
- **THEN** the tab shows the panel with the janela and the three aferições
