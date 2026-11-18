## Purpose

Lets the scout put the page player side by side with a second player in the same recorte, attribute by attribute, and makes clear when the comparison, or one attribute of one side, cannot be made and why.

## ADDED Requirements

### Requirement: Comparison tab
The player layout SHALL have a "Comparação" tab at `/jogadores/$jogadorId/comparacao`, inside a card titled "Comparação" with the "Competição e temporada" selector. The page player SHALL be the first player of the comparison, and the second player SHALL live in the `com` search param.

#### Scenario: Opening the tab without a second player
- **WHEN** the scout opens `/jogadores/1001/comparacao` without `com`
- **THEN** the "Comparação" tab is selected and the card shows the selector and the search for the second player
- **AND** no comparison request is made

#### Scenario: Opening a shared comparison
- **WHEN** the scout opens `/jogadores/1001/comparacao` with a recorte and `com=1006`
- **THEN** the comparison of Rafael Montes and Diego Albuquerque in that recorte is requested and shown

### Requirement: Browser tab title of the comparison
The tab title SHALL be "Comparação · <page player name>" once the profile loads, and "Comparação" while it loads or when it fails.

#### Scenario: Profile loaded
- **WHEN** Rafael Montes's profile arrives on the comparison tab
- **THEN** the tab title is "Comparação · Rafael Montes"

### Requirement: Second player search
Without `com`, the card SHALL show "Escolha com quem comparar <page player name> nesta competição e temporada." and a search field that searches only on submit, with the minimum length, the loading rows, the empty text and the source-down message of the players search, inside the card. The term MUST NOT go to the URL.

#### Scenario: Searching
- **WHEN** the scout types "atlético" and presses Enter
- **THEN** the results appear below the field and the URL keeps no term

#### Scenario: Short term
- **WHEN** the scout submits "s"
- **THEN** the field shows "Digite pelo menos 2 letras do nome." and no request is made

#### Scenario: Typing without submitting
- **WHEN** the scout types without submitting
- **THEN** no search request is made

### Requirement: Only comparable players in the results
The results SHALL keep only players whose source position letter is compatible with the page player's position: each position with itself, `M` with `D` and with `F`, and `G` only with `G`. The page player and players without a known position letter MUST be left out. Above the results the card SHALL show "Mostrando só jogadores comparáveis com <position in lower case>.".

#### Scenario: Midfielder page player
- **WHEN** the page player is "M" and the search returns players with "F", "M", "D", "G" and no position
- **THEN** only the "F", "M" and "D" players are listed, under "Mostrando só jogadores comparáveis com meio-campo."

#### Scenario: Goalkeeper page player
- **WHEN** the page player is "G" and the search returns "G" and "D" players
- **THEN** only the "G" player is listed

#### Scenario: Page player in the results
- **WHEN** the search returns the page player
- **THEN** the page player is not listed

### Requirement: No comparable player found
When the search returns players but none of them is comparable, the card SHALL show "Nenhum jogador comparável com <position in lower case> para "<term>"." When the search returns no player at all, it SHALL show the players search empty text.

#### Scenario: Only a goalkeeper found
- **WHEN** the page player is "M" and the search for "pedro" returns only a "G" player
- **THEN** the card shows "Nenhum jogador comparável com meio-campo para "pedro"."

#### Scenario: Nothing found
- **WHEN** the search for "xyzabc" returns no player
- **THEN** the card shows "Nenhum jogador encontrado para "xyzabc". Confira a grafia ou busque pelo sobrenome."

### Requirement: Choosing the second player
Clicking a result SHALL write its id to `com`, adding a history entry, and request the comparison. The browser's Back SHALL return to the search without a second player.

#### Scenario: Choosing Diego
- **WHEN** the scout clicks "Diego Albuquerque" in the results
- **THEN** the URL gets `com=1006` and the comparison is requested

#### Scenario: Back after choosing
- **WHEN** the scout chooses a player and then uses the browser's Back
- **THEN** the card shows the search again, without `com`

### Requirement: Invalid second player in the URL
A `com` that is not a positive integer, or that equals the page player's id, SHALL be dropped from the URL without a history entry and without a message, and the card SHALL show the search.

#### Scenario: Same player twice
- **WHEN** the scout opens `/jogadores/1001/comparacao?com=1001`
- **THEN** `com` leaves the URL, the search appears and no comparison request is made

#### Scenario: Malformed id
- **WHEN** the scout opens the tab with `com=abc`
- **THEN** `com` leaves the URL and the search appears

### Requirement: Changing the second player
With a second player chosen, the card SHALL offer "Trocar jogador" below the table, and "Escolher outro jogador" in the refused and not-found states. Both SHALL remove `com`, adding a history entry, and show the search with an empty field.

#### Scenario: Trocar jogador
- **WHEN** the scout clicks "Trocar jogador"
- **THEN** `com` leaves the URL and the card shows the search

### Requirement: Recorte change with a second player
When the scout picks another recorte with a second player chosen, `com` SHALL stay in the URL and the comparison SHALL be requested in the new recorte.

#### Scenario: Switching to the cup
- **WHEN** the scout compares Rafael Montes and Diego Albuquerque and picks "Copa do Brasil · 2025"
- **THEN** `com=1006` stays and the comparison is requested with the Copa do Brasil recorte

### Requirement: Comparison table
A "Realizada" comparison SHALL show a table with the seven attributes in the per-90 metrics order and labels, one row each, and one column per player: the page player on the left and the second player on the right, whatever the order of the response. Each value SHALL use the per-90 metrics format, unit included.

#### Scenario: Realizada
- **WHEN** the comparison of 1001 and 1006 arrives as "Realizada" with all attributes calculated
- **THEN** the table shows the seven rows from "Gols, por 90" to "Precisão de passe", with Rafael Montes's values on the left and Diego Albuquerque's on the right

#### Scenario: Response keyed by id
- **WHEN** the response's `jogadores` and `valores` list the second player's id first
- **THEN** the page player still appears on the left

### Requirement: Player column header
Each column header SHALL show the player's name, and below it the position and the sample in minutes of that player ("Meio-campo · 1.920 min"), the sample being the one most of that player's attributes declare. A missing part SHALL be left out.

#### Scenario: Header of both players
- **WHEN** Rafael Montes has 1920 min and Diego Albuquerque 2340 min in the recorte
- **THEN** the headers read "Meio-campo · 1.920 min" and "Ataque · 2.340 min"

### Requirement: Highlight of the higher value
In each row where both values are calculated and differ, the higher value SHALL be highlighted with the strong text color and weight, and the lower one SHALL use the muted text color. A tie SHALL have no highlight. The highlight MUST NOT use the `pitch` color.

#### Scenario: Rafael ahead
- **WHEN** Rafael Montes has 2,10 and Diego Albuquerque 0,73 in "Desarmes, por 90"
- **THEN** 2,10 is highlighted and 0,73 is muted

#### Scenario: Tie
- **WHEN** both have 0,94 in "Interceptações, por 90"
- **THEN** neither value is highlighted or muted

### Requirement: Attribute refused for one side
An attribute refused for one player inside a "Realizada" comparison SHALL show that player's reason in the cell, muted, with the per-90 metrics refusal text ("Não publicado pela fonte"), and the row SHALL have no highlight: the other player's value is shown without highlight or mute.

#### Scenario: Pass accuracy not published for Bruno
- **WHEN** "PrecisaoDePasse" arrives refused with "FonteNaoAtribuiu" for Bruno Lacerda and calculated as 87.4 for Rafael Montes
- **THEN** Bruno's cell shows "Não publicado pela fonte" and "87,4%" is neither highlighted nor muted

### Requirement: Refused comparison
A "Recusada" comparison SHALL show, instead of the table, both players side by side with name and position ("Posição não informada" when the position is missing), the text of the reason and "Escolher outro jogador". The enum name MUST NOT appear on screen, and the case MUST NOT be treated as an error.

#### Scenario: Incompatible positions
- **WHEN** the comparison of Rafael Montes ("MeioCampo") and Pedro Nunes ("Goleiro") arrives refused with "PosicoesIncompativeis"
- **THEN** the card shows both players and "Goleiro e meio-campo não são comparáveis."

#### Scenario: Unknown position of one player
- **WHEN** the comparison arrives refused with "PosicaoDesconhecida" and Miguel Torres without `posicao`
- **THEN** Miguel Torres shows "Posição não informada" and the card shows "A fonte não informou a posição de Miguel Torres."

#### Scenario: Unknown position of both players
- **WHEN** the comparison arrives refused with "PosicaoDesconhecida" and both players without `posicao`
- **THEN** the card shows "A fonte não informou a posição dos dois jogadores."

#### Scenario: Divergent recorte
- **WHEN** the comparison arrives refused with "RecorteDivergente"
- **THEN** the card shows "Os dados dos dois jogadores não são da mesma competição e temporada."

### Requirement: Comparison refused for insufficient sample
For "AmostraInsuficiente", the screen SHALL use the page player's minutes in the selected recorte from the profile: below 450 min, "<page player> tem <minutes> de 450 min nesta competição e temporada."; otherwise, "<second player> não tem minutos suficientes nesta competição e temporada (mínimo 450 min)."

#### Scenario: Second player short
- **WHEN** Rafael Montes has 1920 min in the recorte and the comparison with Lucas Prado arrives refused with "AmostraInsuficiente"
- **THEN** the card shows "Lucas Prado não tem minutos suficientes nesta competição e temporada (mínimo 450 min)."

#### Scenario: Page player short
- **WHEN** Rafael Montes has 312 min in the selected recorte and the comparison arrives refused with "AmostraInsuficiente"
- **THEN** the card shows "Rafael Montes tem 312 de 450 min nesta competição e temporada."

### Requirement: Second player without statistics in the recorte
A 404 with `code` "jogador.estatisticas_nao_encontradas" SHALL show "<second player> não tem estatísticas em <competition> · <year>." with "Escolher outro jogador", without "Tentar de novo". The name SHALL come from the clicked result; without it, the text SHALL start with "O jogador escolhido".

#### Scenario: Caio did not play the competition
- **WHEN** the scout chooses Caio Ventura in the results and the comparison responds 404 with "jogador.estatisticas_nao_encontradas"
- **THEN** the card shows "Caio Ventura não tem estatísticas em Brasileirão Série A · 2025." and "Escolher outro jogador"

#### Scenario: Shared link
- **WHEN** the scout opens a URL with `com` and the comparison responds 404 with "jogador.estatisticas_nao_encontradas"
- **THEN** the card shows "O jogador escolhido não tem estatísticas em Brasileirão Série A · 2025."

### Requirement: Unknown second player
A 404 with `code` "jogador.perfil_nao_encontrado" SHALL show "O jogador escolhido não foi encontrado." with "Escolher outro jogador", without "Tentar de novo".

#### Scenario: Nonexistent id
- **WHEN** the comparison responds 404 with "jogador.perfil_nao_encontrado"
- **THEN** the card shows "O jogador escolhido não foi encontrado." and "Escolher outro jogador"

### Requirement: Comparison loading
While the comparison loads, the card SHALL keep the selector and show the table in its final layout as placeholders: the two player headers and the seven rows with blocks in place of the values. The previous comparison's numbers MUST NOT stay on screen.

#### Scenario: Waiting for the comparison
- **WHEN** the scout chooses a second player and the response has not arrived
- **THEN** the card shows the selector and seven placeholder rows with two placeholder headers

#### Scenario: Recorte change
- **WHEN** the scout picks another recorte with a second player chosen
- **THEN** the values turn back into blocks until the new response

### Requirement: Comparison source down
A 502 SHALL show "Não foi possível comparar agora." with "Tentar de novo" and "Trocar jogador", after the automatic retry. Any other error SHALL show the message from its `code`.

#### Scenario: Source down twice
- **WHEN** the comparison responds 502 twice in a row
- **THEN** the card shows "Não foi possível comparar agora.", "Tentar de novo" and "Trocar jogador"

#### Scenario: Same player rejected by the API
- **WHEN** the comparison responds 400 with "comparacao.jogador_consigo_mesmo"
- **THEN** the card shows "Escolha dois jogadores diferentes." without "Tentar de novo"

### Requirement: Comparison reused
The same comparison (both players and recorte) SHALL be reused for 5 minutes, so switching tabs and coming back makes no new request.

#### Scenario: Back from the profile
- **WHEN** the scout opens a comparison, clicks "Perfil" and then "Comparação" within 5 minutes
- **THEN** the table appears without a new comparison request

### Requirement: Comparison on phones
Below 720px, the selector SHALL take the full width below the card title, and the table SHALL keep its three columns, with attribute and player names wrapping instead of being cut. The refused state SHALL keep both players side by side.

#### Scenario: Table at 375px
- **WHEN** the scout opens a "Realizada" comparison at 375px wide
- **THEN** the three columns fit without horizontal scroll and "Diego Albuquerque" wraps onto two lines
