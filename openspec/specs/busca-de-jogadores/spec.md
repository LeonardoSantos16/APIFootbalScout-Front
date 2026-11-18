# busca-de-jogadores Specification

## Purpose

Lets the scout find a player by name in the source and open the player's profile, with the search term kept in the URL.

## Requirements

### Requirement: Search page
The search SHALL live at `/busca`, with the term in the `termo` search param. The page SHALL have the title "Buscar jogador", a field labelled "Nome do jogador" holding the term from the URL and a "Buscar" button. The browser tab title SHALL be "Buscar jogador".

#### Scenario: Link with a term
- **WHEN** the scout opens `/busca?termo=silva`
- **THEN** the field shows "silva" and the results for "silva" are requested

#### Scenario: Page without a term
- **WHEN** the scout opens `/busca` without `termo`, or with a `termo` made only of spaces
- **THEN** the page shows only the field and the "Buscar" button, the field has focus and no search request is made

### Requirement: Search on submit
The search SHALL run only when the scout submits the field, with Enter or "Buscar", never while typing. Submitting SHALL write the trimmed term to `termo`, adding a history entry.

#### Scenario: Submitting a term
- **WHEN** the scout types "  silva " and presses Enter
- **THEN** the URL becomes `/busca?termo=silva` and the results for "silva" are requested

#### Scenario: Typing without submitting
- **WHEN** the scout types "silva" and does not submit
- **THEN** no search request is made

#### Scenario: Back after a new search
- **WHEN** the scout searches "silva", then "souza", and uses the browser's Back
- **THEN** the field shows "silva" with its results again

### Requirement: Minimum term length
A term with fewer than 2 characters after trimming SHALL NOT be searched. On submit, the field SHALL show "Digite pelo menos 2 letras do nome." below it, and the message SHALL update on each change of the field after that. A short term arriving in the URL SHALL be treated as no term, without the message.

#### Scenario: One letter submitted
- **WHEN** the scout types "s" and clicks "Buscar"
- **THEN** the field shows "Digite pelo menos 2 letras do nome." and no search request is made

#### Scenario: Fixing the term
- **WHEN** the message is shown and the scout types a second letter
- **THEN** the message disappears

#### Scenario: Short term in the URL
- **WHEN** the scout opens `/busca?termo=s`
- **THEN** the field shows "s", no message appears and no search request is made

### Requirement: Results are players only
The list SHALL show only the results whose `type` is `player`, in the order the source returns them, without pagination.

#### Scenario: Mixed results
- **WHEN** the source returns two players and one team for "flamengo"
- **THEN** the list shows the two players, in the source order, and not the team

### Requirement: Result row
Each result SHALL show the player's name and, below it, a support line with the position from the source's letter (`G` Goleiro, `D` Defesa, `M` Meio-campo, `F` Ataque), the club name and the country name, separated by commas. A missing part or an unknown letter SHALL be left out of the line, and the line SHALL be hidden when nothing is left. The whole row SHALL be a link to the player's profile.

#### Scenario: Complete result
- **WHEN** a result has `position` "M", `team.name` "Atlético Serrano" and `country.name` "Brasil"
- **THEN** the row shows "Rafael Silva" and "Meio-campo, Atlético Serrano, Brasil"

#### Scenario: Result without a club
- **WHEN** a result has `position` "F", no `team` and `country.name` "Brasil"
- **THEN** the support line is "Ataque, Brasil"

#### Scenario: Result with only a name
- **WHEN** a result has no position, no `team` and no `country`
- **THEN** the row shows only the name

#### Scenario: Opening a profile
- **WHEN** the scout clicks the result with `entity.id` 1001
- **THEN** the profile of player 1001 opens at `/jogadores/1001`

### Requirement: Search loading
While the results load, the page SHALL keep the field with the term and show five placeholder rows in the shape of a result.

#### Scenario: Waiting for the source
- **WHEN** the scout submits "silva" and the response has not arrived
- **THEN** the field shows "silva" and the list shows five placeholder rows

### Requirement: Search without results
When no result is a player, the page SHALL show "Nenhum jogador encontrado para "<termo>". Confira a grafia ou busque pelo sobrenome." with the submitted term, without a button.

#### Scenario: No results
- **WHEN** the source returns an empty list for "xyzabc"
- **THEN** the page shows "Nenhum jogador encontrado para "xyzabc". Confira a grafia ou busque pelo sobrenome."

#### Scenario: Only other types
- **WHEN** the source returns only teams and competitions for "flamengo"
- **THEN** the page shows "Nenhum jogador encontrado para "flamengo". Confira a grafia ou busque pelo sobrenome."

### Requirement: Search failure
A 502 on the search SHALL show "Não foi possível buscar agora." with "Tentar de novo" in place of the list, keeping the field. Any other failure SHALL show the generic error. The source's response text MUST NOT appear on screen.

#### Scenario: Source down
- **WHEN** the search responds 502 twice in a row
- **THEN** the page shows "Não foi possível buscar agora." with "Tentar de novo"

#### Scenario: Tentar de novo on the search
- **WHEN** the scout clicks "Tentar de novo"
- **THEN** the search is requested again and the list goes back to the placeholder rows

#### Scenario: Unexpected failure
- **WHEN** the search responds 400 with the text "Name is required"
- **THEN** the page shows "Não foi possível concluir agora." without "Tentar de novo"

### Requirement: Recent search reused
The results of a term SHALL be reused for 5 minutes, so going back from a profile to the search shows them without a new request.

#### Scenario: Back from the profile
- **WHEN** the scout searches "silva", opens a profile and uses the browser's Back within 5 minutes
- **THEN** the results for "silva" appear without placeholder rows and without a new search request
