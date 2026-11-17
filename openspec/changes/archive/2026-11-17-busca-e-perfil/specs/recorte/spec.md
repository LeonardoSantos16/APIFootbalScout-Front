# Spec Delta

## MODIFIED Requirements

### Requirement: Option order and text
The system SHALL keep the options in the order of `stats` as the source sends it, which lists the most recent recorte first, without reordering them. Each option SHALL show the competition name and the `year`; when any of the player's recortes is a national team one, every option SHALL start with the contexto.

#### Scenario: Player with club recortes only
- **WHEN** the player has only club recortes
- **THEN** the options read "Brasileirão Série A · 2025", without the contexto

#### Scenario: Player with club and national team recortes
- **WHEN** the player has club and national team recortes
- **THEN** the options read "Clube · Brasileirão Série A · 2025" and "Seleção · Eliminatórias Sul-Americanas · 2025"

#### Scenario: Two competitions in the same season
- **WHEN** `stats` lists a 2025 recorte with 312 minutes before another 2025 recorte with 1,284 minutes
- **THEN** the options keep that order, and the recorte with 312 minutes comes first

#### Scenario: Season ids out of chronological order
- **WHEN** `stats` lists "Brasileirão Série A · 2026" with `season.id` 87678 before "Trophée des Champions · 20/21" with `season.id` 92399
- **THEN** "Brasileirão Série A · 2026" is the first option and the default recorte

### Requirement: Profile without statistics
When the profile has no `stats`, or an empty `stats`, the metrics tab SHALL show "Sem estatísticas publicadas para este jogador." below the player band and tabs, without the selector or the grid, and MUST NOT treat the case as an error.

#### Scenario: Empty stats
- **WHEN** the profile arrives with an empty `stats`
- **THEN** the metrics tab shows the player's band and "Sem estatísticas publicadas para este jogador."
- **AND** no metrics request is made
