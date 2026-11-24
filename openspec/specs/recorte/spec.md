# recorte Specification

## Purpose

Defines how an analysis screen finds the recortes in which a player has statistics, which recorte is selected and how the recorte lives in the URL.

## Requirements

### Requirement: Recortes derived from the profile
The system SHALL build the player's list of recortes from the profile's `stats`, one recorte per item, with the competition (`uniqueTournament.id` and `uniqueTournament.name`), the season (`season.id` and `year`) and the contexto. No other source of competitions or seasons MUST be queried.

#### Scenario: Profile with three items in stats
- **WHEN** the profile has three items in `stats`
- **THEN** the "Competição e temporada" selector offers three options, one per item

### Requirement: Contexto of the recorte
The system SHALL treat a recorte as `Selecao` when the `team.id` of the `stats` item matches some `team.id` in the profile's `nationalTeamStats`, and as `Clube` in every other case.

#### Scenario: Stats item with a national team
- **WHEN** a `stats` item has a `team.id` equal to the `team.id` of a `nationalTeamStats` item
- **THEN** that item's recorte has contexto `Selecao`

#### Scenario: Profile without nationalTeamStats
- **WHEN** the profile has no `nationalTeamStats`
- **THEN** every recorte has contexto `Clube`

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

### Requirement: Recorte in the URL
The selected recorte SHALL live in the screen's search params (`competicao`, `temporada` and `contexto`), so that reloading the page or opening a shared link shows the same recorte.

#### Scenario: Link with a valid recorte
- **WHEN** the scout opens the screen with `competicao`, `temporada` and `contexto` of a recorte that exists in `stats`
- **THEN** that recorte is selected and its metrics are requested

### Requirement: Correction of a missing or invalid recorte
When the URL has no recorte, has malformed params or has a recorte that does not exist in `stats`, the system SHALL select the first recorte in the order, replacing the URL without adding a history entry and without notifying the scout.

#### Scenario: URL without a recorte
- **WHEN** the scout opens the screen without search params
- **THEN** the URL gets the first recorte in the order and the browser's Back does not return to the URL without a recorte

#### Scenario: Recorte not in the profile
- **WHEN** the URL has a recorte that does not appear in `stats`
- **THEN** the URL is replaced with the first recorte in the order, without a message

#### Scenario: Malformed param
- **WHEN** the URL has `contexto=foo` or `competicao=abc`
- **THEN** the recorte is treated as missing and corrected to the first in the order

### Requirement: Recorte change by the scout
When the scout picks another option in the selector, the system SHALL write the new recorte to the URL, adding a history entry.

#### Scenario: Back after a change
- **WHEN** the scout changes the recorte and then uses the browser's Back
- **THEN** the previous recorte is selected again

### Requirement: Selector label
The selector SHALL have the label "Competição e temporada"; the word "recorte" MUST NOT appear on screen.

#### Scenario: Screen reader on the selector
- **WHEN** focus reaches the selector
- **THEN** it is announced as "Competição e temporada"

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
