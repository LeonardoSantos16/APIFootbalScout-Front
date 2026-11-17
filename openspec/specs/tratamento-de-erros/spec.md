# tratamento-de-erros Specification

## Purpose

Defines how the screen turns an API failure into a message and a behavior for the scout, based on the `code` of the `ProblemDetails`, and what never reaches the screen.

## Requirements

### Requirement: Message from the code
The error message SHALL come from the `code` in the `ProblemDetails` body, following the table in `docs/erros.md` written in pt-BR with accents and without the word "recorte", which never appears on screen. The `detail`, the `title` and a plain-text body MUST NOT appear on screen.

#### Scenario: Source down on metrics
- **WHEN** the metrics respond 502 with `code` "sofascore.estatisticas_do_jogador_indisponiveis"
- **THEN** the screen shows "Estatísticas indisponíveis no momento." with "Tentar de novo"

#### Scenario: Source down on the profile
- **WHEN** the profile responds 502 with `code` "sofascore.perfil_do_jogador_indisponivel"
- **THEN** the screen shows "Não foi possível carregar o perfil agora." with "Tentar de novo"

#### Scenario: Statistics not found
- **WHEN** the metrics respond 404 with `code` "jogador.estatisticas_nao_encontradas"
- **THEN** the screen shows "Sem estatísticas para esta competição e temporada." without "Tentar de novo"

#### Scenario: Profile not found in the recorte
- **WHEN** the metrics respond 404 with `code` "jogador.perfil_nao_encontrado"
- **THEN** the screen shows "Não há dados deste jogador para a competição e temporada escolhidas." without "Tentar de novo"

#### Scenario: Internal inconsistency code
- **WHEN** the response has a `code` starting with `atributo.`, `afericao.`, `estatistica_acumulavel.` or `valor_derivado.`
- **THEN** the screen shows the generic error

### Requirement: Error without a code
On the endpoints that respond plain text (`Players` and `Tournament`), without a `code` the system SHALL decide by status: 404 shows "Jogador não encontrado.", 502 shows "Não foi possível carregar o perfil agora.", any other the generic error. On `ProblemDetails` endpoints, a missing `code` SHALL be treated as an unknown error.

#### Scenario: Nonexistent profile
- **WHEN** the profile responds 404 with the text "Player with ID 12 not found"
- **THEN** the screen shows "Jogador não encontrado." without "Tentar de novo"

#### Scenario: Metrics without a code
- **WHEN** the metrics respond 500 with a `ProblemDetails` without `code`
- **THEN** the screen shows "Não foi possível concluir agora." with "Tentar de novo"

### Requirement: Generic error
An unknown error SHALL show "Não foi possível concluir agora." with "Tentar de novo" and log the `instance` to the console, when present.

#### Scenario: Unknown code
- **WHEN** the response has a `code` the table does not know
- **THEN** the screen shows "Não foi possível concluir agora."

### Requirement: Retry
A 502 SHALL be retried automatically once, about 2 s later, before the screen shows the error. "Tentar de novo" SHALL appear on a 502 and on an unknown error and MUST NOT appear on 4xx responses, which are never retried.

#### Scenario: 502 that resolves itself
- **WHEN** the first call responds 502 and the retry responds 200
- **THEN** the scout sees the metrics without having seen an error message

#### Scenario: Tentar de novo
- **WHEN** the scout clicks "Tentar de novo" after a 502
- **THEN** the call is made again and the area goes back to loading

#### Scenario: 404 is not retried
- **WHEN** a call responds 404
- **THEN** it is not retried and the screen does not offer "Tentar de novo"

### Requirement: Where the error appears
A profile failure SHALL take the whole card, without the header or the selector. A metrics failure SHALL appear in place of the grid, with the header and the selector visible.

#### Scenario: Profile failure
- **WHEN** the profile fails
- **THEN** the card shows only the title "Métricas por 90" and the message

#### Scenario: Metrics failure
- **WHEN** the metrics fail
- **THEN** the player's name and the selector stay on screen, with the message in place of the grid

### Requirement: A refusal is not an error
A refused attribute that arrives with 200 OK MUST NOT be shown as an error: it stays in the grid with its reason.

#### Scenario: Whole grid refused
- **WHEN** the metrics arrive with 200 OK and all seven attributes refused
- **THEN** the screen shows the grid with the reasons and no error message
