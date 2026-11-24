# perfil-do-jogador Specification

## Purpose

Shows the scout a player's profile as the source publishes it, and gives every player screen a shared header and tabs, so the profile is the entry point to the player's analysis.

## Requirements

### Requirement: Player layout
Every player screen (`/jogadores/$jogadorId` and its sub-pages) SHALL open with the club band and the player tabs, loaded from a single profile request shared by every tab. The tabs SHALL be "Perfil", "Métricas", "Comparação" and "Acompanhamento", each one a link to its page, with the current one marked as selected.

#### Scenario: Opening the profile
- **WHEN** the scout opens `/jogadores/1001`
- **THEN** the band and the tabs appear with "Perfil" selected

#### Scenario: Switching tabs
- **WHEN** the scout is on "Perfil" and clicks "Métricas"
- **THEN** the per-90 metrics open with "Métricas" selected and the profile is not requested again

#### Scenario: Opening the comparison
- **WHEN** the scout is on "Perfil" and clicks "Comparação"
- **THEN** the comparison opens with "Comparação" selected and the profile is not requested again

#### Scenario: Opening the acompanhamento
- **WHEN** the scout is on "Perfil" and clicks "Acompanhamento"
- **THEN** the acompanhamento opens with "Acompanhamento" selected and the profile is not requested again

### Requirement: Recorte kept across tabs
The recorte search params and the second player of the comparison (`com`) SHALL be kept when the scout switches between the player tabs. The "Perfil" tab SHALL ignore them, the "Métricas" and "Acompanhamento" tabs SHALL ignore `com`, and the "Acompanhamento" tab SHALL use the recorte only while the player is not tracked.

#### Scenario: Back to the profile and to the metrics
- **WHEN** the scout is on the metrics of a chosen recorte, clicks "Perfil" and then "Métricas"
- **THEN** the metrics open in the same recorte

#### Scenario: Metrics without a recorte
- **WHEN** the scout opens "Métricas" from a profile URL without a recorte
- **THEN** the metrics open in the first recorte of `stats`

#### Scenario: Back to the comparison
- **WHEN** the scout compares with `com=1006`, clicks "Métricas" and then "Comparação"
- **THEN** the comparison opens with the same recorte and the same second player

#### Scenario: Through the acompanhamento
- **WHEN** the scout compares with `com=1006`, clicks "Acompanhamento" and then "Comparação"
- **THEN** the comparison opens with the same recorte and the same second player

### Requirement: Club band
The band SHALL show the player's photo, the name and a support line with the position, age and current club ("Meio-campo, 24 anos, Atlético Serrano"), following the position letters `G` Goleiro, `D` Defesa, `M` Meio-campo, `F` Ataque. A missing part SHALL be left out of the line. The band SHALL use the `club` color while the contract has no club colors.

#### Scenario: Complete band
- **WHEN** the profile has `position` "M", 24 full years and the club "Atlético Serrano"
- **THEN** the band shows the name and "Meio-campo, 24 anos, Atlético Serrano"

#### Scenario: Without a birth date
- **WHEN** the profile has no `dateOfBirth`
- **THEN** the support line shows only the position and the club

### Requirement: Player photo
The band SHALL show the image from `playerImage`. When the profile has no `playerImage` or the image fails to load, the band SHALL show the initials of the first and last names in its place, announced with the player's name.

#### Scenario: Photo blocked by the source
- **WHEN** the image of "Rafael Silva" fails to load
- **THEN** the band shows "RS" in place of the photo

### Requirement: Player layout loading
While the profile loads, the band SHALL show placeholders in place of the photo, the name and the support line, without the club color, and the tabs SHALL stay visible and disabled.

#### Scenario: Waiting for the profile
- **WHEN** the scout opens a profile and the response has not arrived
- **THEN** the band shows placeholders and the "Perfil" and "Métricas" tabs cannot be clicked

### Requirement: Player not found
A 404 on the profile SHALL show "Jogador não encontrado." with a "Buscar jogador" button that opens `/busca`, without the band or the tabs, on every player tab. The browser tab title SHALL be "Jogador não encontrado".

#### Scenario: Nonexistent player
- **WHEN** the scout opens `/jogadores/1004` and the profile responds 404 with the text "Player with ID 1004 not found"
- **THEN** the page shows "Jogador não encontrado." and "Buscar jogador", without "Tentar de novo"

#### Scenario: Back to the search
- **WHEN** the scout clicks "Buscar jogador" on that page
- **THEN** the `/busca` page opens

### Requirement: Profile source down
A 502 on the profile SHALL show "Não foi possível carregar o perfil agora." with "Tentar de novo", without the band or the tabs, on every player tab.

#### Scenario: Source down on the profile tab
- **WHEN** the profile responds 502 with `code` "sofascore.perfil_do_jogador_indisponivel" twice in a row
- **THEN** the page shows "Não foi possível carregar o perfil agora." with "Tentar de novo"

#### Scenario: Source down on the metrics tab
- **WHEN** the scout opens the metrics of a player whose profile responds 502 twice in a row
- **THEN** the page shows "Não foi possível carregar o perfil agora." with "Tentar de novo", and the metrics are not requested

### Requirement: Profile tab title
The browser tab title of the profile page SHALL be the player's name once the profile loads, and "Perfil" while it loads or when it fails with a 502.

#### Scenario: Profile loaded
- **WHEN** the profile of "Rafael Silva" arrives
- **THEN** the tab title is "Rafael Silva"

### Requirement: Player data
The "Dados" card SHALL show, each value above its label: the position ("Posição"), the birth date with the age ("14/03/2001 (24 anos)", "Nascimento"), the height ("178 cm", "Altura"), the preferred foot ("Direito", "Esquerdo" or "Ambos", "Pé preferido"), the shirt number ("Camisa") and, for each national team in `nationalTeamStats`, its name with games and goals ("Brasil, 12 jogos, 2 gols", "Seleção").

#### Scenario: Complete data
- **WHEN** the profile has every field
- **THEN** the card shows "Meio-campo", "14/03/2001 (24 anos)", "178 cm", "Direito", "8" and "Brasil, 12 jogos, 2 gols"

#### Scenario: Singular counts
- **WHEN** the national team item has 1 appearance and 1 goal
- **THEN** the value is "Brasil, 1 jogo, 1 gol"

### Requirement: Detailed positions
When the profile has `positionsDetailed`, the position label SHALL be "Posição · " followed by the codes as the source sends them, separated by commas.

#### Scenario: Two detailed positions
- **WHEN** the profile has `positionsDetailed` ["MC", "ME"]
- **THEN** the position label is "Posição · MC, ME"

### Requirement: Missing data left out
A missing field, an unknown position letter, an unknown preferred foot and a height of 0 SHALL be left out of the "Dados" card, without a placeholder. When no field is left, the card SHALL be hidden.

#### Scenario: Height zero and no shirt
- **WHEN** the profile has `height` 0 and no `jerseyNumber`
- **THEN** the card has no "Altura" and no "Camisa"

#### Scenario: Unknown foot
- **WHEN** the profile has `preferredFoot` "Unknown"
- **THEN** the card has no "Pé preferido"

### Requirement: Recortes list
The "Recortes" card SHALL list one row per `stats` item, in source order, with the recorte text of the selector ("Clube · Brasileirão Série A · 2025" when the player has national team recortes, "Brasileirão Série A · 2025" otherwise) and the games, minutes, goals, assists and Nota ("24", "1.920", "4", "3", "7,12"). Zero counts SHALL be shown as 0.

#### Scenario: Recortes table
- **WHEN** the profile has club and national team items in `stats`
- **THEN** the card shows the columns "Jogos", "Minutos", "Gols", "Assist." and "Nota" and one row per item, in source order

#### Scenario: Phone width
- **WHEN** the profile is opened at 375px wide
- **THEN** each row shows the recorte and, below it, "24 jogos · 1.920 min · 4 gols · 3 assist. · nota 7,12"

#### Scenario: Screen reader on a recorte row
- **WHEN** focus reaches a recorte row on desktop, where the columns have a header
- **THEN** the row is announced with each number and its unit ("24 jogos", "1.920 min", "nota 7,12"), not the bare numbers

### Requirement: Recorte row opens the metrics
Each row of the "Recortes" card SHALL be a link to the per-90 metrics of the player in that recorte.

#### Scenario: Opening a recorte
- **WHEN** the scout clicks the row "Clube · Copa do Brasil · 2025"
- **THEN** the metrics open with "Métricas" selected and that recorte in the URL

### Requirement: Long recortes list
When the player has more than 10 recortes, the card SHALL show the first 10 and the button "Mostrar todos os recortes (<total>)", which shows the rest on the same page.

#### Scenario: Fourteen recortes
- **WHEN** the profile has 14 items in `stats`
- **THEN** the card shows 10 rows and "Mostrar todos os recortes (14)"

#### Scenario: Expanding
- **WHEN** the scout clicks "Mostrar todos os recortes (14)"
- **THEN** the card shows the 14 rows and the button disappears, without leaving the page

### Requirement: Profile without statistics
When the profile has no `stats`, or an empty `stats`, the "Recortes" card SHALL show "Sem estatísticas publicadas para este jogador." and the rest of the profile SHALL stay on screen.

#### Scenario: Empty stats
- **WHEN** the profile arrives with an empty `stats`
- **THEN** the "Recortes" card shows "Sem estatísticas publicadas para este jogador." and the "Dados" card is still shown

### Requirement: Market value
The "Valor de mercado" card SHALL show `proposedMarketValueRaw` in the Brazilian format with the currency ("€12,5M", "€850 mil") and the label "Estimativa da fonte". Without `proposedMarketValueRaw`, or with a value of 0, the card SHALL be hidden.

#### Scenario: Value in millions
- **WHEN** the profile has `proposedMarketValueRaw` with `value` 12500000 and `currency` "EUR"
- **THEN** the card shows "€12,5M" and "Estimativa da fonte"

#### Scenario: Value in thousands
- **WHEN** the value is 850000 in "EUR"
- **THEN** the card shows "€850 mil"

#### Scenario: Without a market value
- **WHEN** the profile has no `proposedMarketValueRaw`
- **THEN** there is no "Valor de mercado" card

### Requirement: Transfers
The "Transferências" card SHALL list the transfers from the most recent to the oldest, each with "<origin> → <destination>" and, below it, the month and year ("jan. 2024") and the fee. Without transfers, the card SHALL be hidden.

#### Scenario: Transfer with a fee
- **WHEN** a transfer from "Serra Azul" to "Atlético Serrano" in January 2024 has `transferFeeRaw` 3200000 "EUR"
- **THEN** the row shows "Serra Azul → Atlético Serrano" and "jan. 2024 · €3,2M"

#### Scenario: No transfers
- **WHEN** the profile has no `historyTransfer`
- **THEN** there is no "Transferências" card

### Requirement: Transfer fee text
A fee SHALL come from `transferFeeRaw` when its value is above 0. Otherwise, the known descriptions SHALL be translated ("Free" and "Free transfer" to "Livre", "Loan" to "Empréstimo", "End of loan" to "Fim de empréstimo") and any other description SHALL be left out, leaving only the date.

#### Scenario: Loan
- **WHEN** a transfer has no fee and `transferFeeDescription` "Loan"
- **THEN** the row's detail is "jul. 2022 · Empréstimo"

#### Scenario: Unknown description
- **WHEN** a transfer has no fee and `transferFeeDescription` "-"
- **THEN** the row's detail is only "jan. 2020"

### Requirement: Long transfers list
When the player has more than 5 transfers, the card SHALL show the 5 most recent and the button "Mostrar todas as transferências (<total>)", which shows the rest on the same page.

#### Scenario: Eight transfers
- **WHEN** the profile has 8 transfers
- **THEN** the card shows 5 rows and "Mostrar todas as transferências (8)"

### Requirement: Profile reused
A loaded profile SHALL be reused for 30 minutes on every screen that shows it, without a new request.

#### Scenario: Reopening a profile
- **WHEN** the scout opens the profile of player 1001, goes to the search and opens it again within 30 minutes
- **THEN** the profile appears without placeholders and without a new profile request

### Requirement: Player tabs on phones
Below 720px, the player tabs SHALL stay on one line, spread across the width with at least 12px between them, with no horizontal scrolling. They SHALL wrap only when they do not fit.

#### Scenario: Four tabs at 375px
- **WHEN** the scout opens a player screen at 375px
- **THEN** "Perfil", "Métricas", "Comparação" and "Acompanhamento" appear on one line across the width, without a scroll bar
