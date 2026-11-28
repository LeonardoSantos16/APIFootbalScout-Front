# shortlist-priorizada Specification

## Purpose

Lets the scout keep named shortlists of alvos in a total prioridade order, with a custo estimado per alvo in the moeda da lista, add alvos from the player, repriorizar and remove them, always showing what the server answered.

## Requirements

### Requirement: Shortlists page
`/shortlists` SHALL list the scout's shortlists in alphabetical order of name, each row a link to its shortlist with the name, "<n> de <limiteDeAlvos> alvos" and the custo total of the answer, or "Sem alvos" when the shortlist has no custo total.

#### Scenario: Ana's shortlists
- **WHEN** Ana opens `/shortlists`
- **THEN** the rows read "Atacantes" with "25 de 25 alvos", "Conflito", "Laterais 2027" with "4 de 25 alvos" and "€47M", and "Meias para janeiro" with "0 de 25 alvos" and "Sem alvos", in this order

#### Scenario: Opening a shortlist
- **WHEN** the scout clicks "Laterais 2027"
- **THEN** `/shortlists/<id>` opens with the alvos of "Laterais 2027"

#### Scenario: Limit from the answer
- **WHEN** the answer brings `limiteDeAlvos` 30 for a shortlist with 4 alvos
- **THEN** its row reads "4 de 30 alvos"

### Requirement: Browser tab title of the shortlists
The browser tab title SHALL be "Shortlists" on `/shortlists` and "Shortlist · <nome>" on a shortlist, and "Shortlist" alone while the shortlist loads or fails.

#### Scenario: Shortlist loaded
- **WHEN** "Laterais 2027" arrives
- **THEN** the tab title is "Shortlist · Laterais 2027"

#### Scenario: Shortlists page
- **WHEN** the scout opens `/shortlists`
- **THEN** the tab title is "Shortlists"

### Requirement: Shortlists page loading
While the shortlists load, the page SHALL show three skeleton rows, with the creation field already usable.

#### Scenario: Pending list
- **WHEN** the shortlists have not arrived
- **THEN** three skeleton rows appear below "Nome da shortlist" and "Criar shortlist"

### Requirement: No shortlist yet
A scout without shortlists SHALL see "Nenhuma shortlist ainda." below the creation field.

#### Scenario: Empty list
- **WHEN** the scout has no shortlist
- **THEN** the page shows "Nenhuma shortlist ainda." and the field "Nome da shortlist"

### Requirement: Shortlists page error
When the list fails, the page SHALL show the message of the error in place of the list, without "Tentar de novo", with the creation field still usable.

#### Scenario: Unknown error
- **WHEN** the list answers 500 without `code`
- **THEN** the page shows "Não foi possível concluir agora." in place of the list

### Requirement: Creating a shortlist
"Criar shortlist" SHALL send the name of "Nome da shortlist" trimmed and, on success, open the new shortlist. An empty or blank name SHALL show "Dê um nome à shortlist." below the field without sending anything. While the request is in flight, the field and the button SHALL be disabled and the button SHALL read "Criando…".

#### Scenario: New shortlist
- **WHEN** the scout types "  Volantes 2027 " and clicks "Criar shortlist"
- **THEN** the shortlist "Volantes 2027" is created and its page opens with "0 de 25"

#### Scenario: Blank name
- **WHEN** the scout types only spaces and clicks "Criar shortlist"
- **THEN** "Dê um nome à shortlist." appears below the field and no request is sent

#### Scenario: Creating
- **WHEN** the creation request is in flight
- **THEN** the button reads "Criando…" and the field is disabled

#### Scenario: Creation fails
- **WHEN** the creation answers 500 without `code`
- **THEN** "Não foi possível concluir agora." appears below the field and the typed name stays

### Requirement: Shortlist header
The shortlist page SHALL open with a back link "Shortlists", the name as title and, from the answer, the alvos as "<n> de <limiteDeAlvos>" labelled "Alvos", the custo total labelled "Custo total" and the moeda da lista labelled "Moeda da lista", each value above its label. Without a custo total, only the alvos SHALL appear.

#### Scenario: Shortlist with alvos
- **WHEN** the scout opens "Laterais 2027"
- **THEN** the header shows "Laterais 2027", "4 de 25" above "Alvos", "€47M" above "Custo total" and "EUR" above "Moeda da lista"

#### Scenario: Empty shortlist header
- **WHEN** the scout opens "Meias para janeiro"
- **THEN** the header shows "0 de 25" above "Alvos" and no custo total or moeda

### Requirement: Alvos in prioridade order
The alvos SHALL appear in the order of their prioridade, each row with the prioridade, the photo, the name as a link to the player's profile, the position and club from the player's profile, and the custo estimado of the shortlist labelled "Custo estimado". The prioridade and the cost SHALL be shown before the profile arrives.

#### Scenario: Laterais 2027
- **WHEN** "Laterais 2027" arrives
- **THEN** the rows read 1 "Miguel Torres" "Defesa, Atlético Serrano" "€8M", 2 "Rafael Montes" "€12,5M", 3 "Diego Albuquerque" "€22M" and 4 "Jogador #1009" "€4,5M"

#### Scenario: Name opens the profile
- **WHEN** the scout clicks "Rafael Montes" in the shortlist
- **THEN** `/jogadores/1001` opens

#### Scenario: Profile reused
- **WHEN** the scout opened Rafael Montes's profile less than 30 minutes ago and then opens the shortlist
- **THEN** his row shows the name without requesting the profile again

### Requirement: Alvo profile loading
While an alvo's profile loads, its row SHALL show the photo, the name and the support line in skeleton, with the prioridade, the cost and the actions already shown and usable.

#### Scenario: Row waiting for the profile
- **WHEN** the shortlist has arrived and Rafael Montes's profile has not
- **THEN** row 2 shows "€12,5M" and the actions with the name in skeleton

### Requirement: Alvo profile unavailable
When an alvo's profile fails, its row SHALL show "Jogador #<jogadorId>" without a link and keep its prioridade, cost and actions. A `502` SHALL show "Não foi possível carregar o perfil agora." with "Tentar de novo"; a `404` SHALL show "Perfil não encontrado." without retry.

#### Scenario: Source down for one alvo
- **WHEN** the profile of 1009 answers 502
- **THEN** row 4 shows "Jogador #1009", "Não foi possível carregar o perfil agora." and "Tentar de novo", and "Subir" and "Remover" stay enabled

#### Scenario: Retrying the profile
- **WHEN** the scout clicks "Tentar de novo" on row 4 and the profile answers
- **THEN** the row shows the player's name and club

#### Scenario: Profile not found
- **WHEN** the profile of 2017 answers 404
- **THEN** its row shows "Jogador #2017" and "Perfil não encontrado." without "Tentar de novo"

### Requirement: Shortlist without alvos
A shortlist without alvos SHALL show "Nenhum alvo ainda. Adicione jogadores pelo perfil." with the button "Buscar jogador", which leads to `/busca`.

#### Scenario: Meias para janeiro
- **WHEN** the scout opens "Meias para janeiro"
- **THEN** the page shows "Nenhum alvo ainda. Adicione jogadores pelo perfil." and "Buscar jogador"

### Requirement: Full shortlist
A shortlist with as many alvos as `limiteDeAlvos` SHALL show the notice "A shortlist atingiu o limite de 25 alvos." between the header and the alvos, with the actions still enabled.

#### Scenario: Atacantes
- **WHEN** the scout opens "Atacantes" with 25 of 25 alvos
- **THEN** the notice "A shortlist atingiu o limite de 25 alvos." appears and "Remover" stays enabled

### Requirement: Shortlist loading
While the shortlist loads, the page SHALL show the header and five alvo rows in skeleton.

#### Scenario: Pending shortlist
- **WHEN** the shortlist has not arrived
- **THEN** the header and five rows appear in skeleton

### Requirement: Shortlist not found
A shortlist that does not exist or belongs to another scout (`404 shortlist.nao_encontrada`) SHALL show "Shortlist não encontrada." with "Voltar às shortlists", which leads to `/shortlists`.

#### Scenario: Unknown id
- **WHEN** the scout opens `/shortlists/<id>` for an id that is not theirs
- **THEN** the page shows "Shortlist não encontrada." and "Voltar às shortlists"

### Requirement: Shortlist error
When the shortlist fails for another reason, the page SHALL show the message of the error without "Tentar de novo".

#### Scenario: Unknown error on the shortlist
- **WHEN** the shortlist answers 500 without `code`
- **THEN** the page shows "Não foi possível concluir agora."

### Requirement: Subir and Descer
"Subir" SHALL ask the server for the alvo's prioridade minus one and "Descer" for plus one. On desktop, "Subir" SHALL be disabled on prioridade 1 and "Descer" on the last alvo; every action button SHALL have an accessible name with the player's name ("Subir Rafael Montes").

#### Scenario: Moving up
- **WHEN** the scout clicks "Subir" on Rafael Montes at prioridade 2
- **THEN** the server is asked for prioridade 1 and, with the answer, Rafael Montes is 1 and Miguel Torres is 2

#### Scenario: Edges
- **WHEN** "Laterais 2027" is shown on desktop
- **THEN** "Subir" is disabled on prioridade 1 and "Descer" on prioridade 4

### Requirement: Dragging an alvo
The scout SHALL be able to drag an alvo by its handle, with a pointer or with the keyboard (Space picks up, arrows move, Space drops, Escape cancels), and dropping SHALL ask the server once for the final prioridade. Dropping at the original place SHALL send nothing. The keyboard SHALL be announced in pt-BR: "<nome> pego, prioridade 3 de 4", "movido para a prioridade 1", "solto na prioridade 1", "cancelado".

#### Scenario: Dragging Diego to the top
- **WHEN** the scout drags Diego Albuquerque from prioridade 3 to the top and drops him
- **THEN** one request asks for prioridade 1 and, with the answer, the order is Diego Albuquerque, Miguel Torres, Rafael Montes, Jogador #1009

#### Scenario: Keyboard
- **WHEN** the scout focuses Diego Albuquerque's handle, presses Space, the up arrow twice and Space
- **THEN** "Diego Albuquerque pego, prioridade 3 de 4" and "solto na prioridade 1" are announced and one request asks for prioridade 1

#### Scenario: Cancelled drag
- **WHEN** the scout picks up an alvo with Space and presses Escape
- **THEN** "cancelado" is announced and nothing is sent

#### Scenario: Dragging state
- **WHEN** an alvo is being dragged
- **THEN** its row shows the focus outline and the prioridade numbers do not change until the answer

### Requirement: Write in flight
While a repriorização or a remoção is in flight, the list SHALL keep the order of the last answer, the affected row SHALL be dimmed with "Movendo para a prioridade <n>…" or "Removendo…", and every handle, "Subir", "Descer" and "Remover" SHALL be disabled. The answer SHALL replace the whole list, prioridades, custo total and alvos count included.

#### Scenario: Moving
- **WHEN** the request to move Diego Albuquerque to prioridade 1 is in flight
- **THEN** Diego Albuquerque stays at 3 with "Movendo para a prioridade 1…" and every action is disabled

#### Scenario: Answer arrives
- **WHEN** the answer of a remoção arrives
- **THEN** the list, the prioridades, "3 de 25" and the custo total come from the answer

### Requirement: Removing an alvo
"Remover" SHALL remove the alvo without asking for confirmation, and the answer SHALL renumber the remaining alvos.

#### Scenario: Removing Miguel
- **WHEN** the scout clicks "Remover" on Miguel Torres at prioridade 1
- **THEN** with the answer, Rafael Montes is 1, Diego Albuquerque 2 and Jogador #1009 3, and the header reads "3 de 25" and "€39M"

### Requirement: Alvo write refused
When a repriorização or a remoção fails other than by a conflict, the list SHALL stay as it was and a notice between the header and the alvos SHALL show the message of the `code`, without "Tentar de novo". The notice SHALL go away on the next successful write.

#### Scenario: Prioridade out of order
- **WHEN** a repriorização answers `422 shortlist.prioridade_fora_da_ordem`
- **THEN** the notice shows "Prioridade fora da ordem da lista." and the order is unchanged

#### Scenario: Alvo no longer in the shortlist
- **WHEN** a remoção answers `404 shortlist.alvo_nao_encontrado`
- **THEN** the notice shows "Este jogador não está na shortlist."

#### Scenario: Unknown write error
- **WHEN** a repriorização answers 500 without `code`
- **THEN** the notice shows "Não foi possível concluir agora." and the order is unchanged

### Requirement: Shortlist changed elsewhere
When a write on the shortlist page answers `412 shortlist.alterada_por_outra_requisicao`, the page SHALL read the shortlist again, replace the list and show the notice "Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança.", without repeating the write.

#### Scenario: Conflito
- **WHEN** the scout clicks "Descer" on the first alvo of "Conflito"
- **THEN** the shortlist is read again, the order is the server's and the notice "Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança." appears

### Requirement: Alvo actions on phones
Below 720px, each alvo row SHALL put its actions on a second line as text buttons "Subir", "Descer" and "Remover", without the drag handle; the action that does not apply SHALL be hidden instead of disabled, and the "Custo estimado" label SHALL be kept only for assistive technology.

#### Scenario: First row on a phone
- **WHEN** "Laterais 2027" is opened at 375px wide
- **THEN** row 1 shows "Descer" and "Remover" on its second line, without "Subir" and without a handle

### Requirement: Adding to a shortlist from the player
Every player tab SHALL offer "Adicionar à shortlist" in the club band. It SHALL request nothing until clicked; clicking SHALL open the dialog "Adicionar à shortlist" with the player's name and read the scout's shortlists anew.

#### Scenario: Opening the dialog
- **WHEN** the scout clicks "Adicionar à shortlist" on Rafael Montes's metrics
- **THEN** the dialog "Adicionar à shortlist" opens with "Rafael Montes" and the shortlists are requested

#### Scenario: Not requested before
- **WHEN** the scout opens Rafael Montes's profile
- **THEN** no shortlist request is sent

### Requirement: Choosing the shortlist
The dialog SHALL list the shortlists in alphabetical order, each with "<n> de <limiteDeAlvos> alvos", and SHALL select the first one that accepts the player. A shortlist that already holds the player SHALL be disabled with "Já está nesta shortlist" and a full one with "Cheia (25 de 25)".

#### Scenario: Rafael Montes
- **WHEN** the dialog opens for Rafael Montes
- **THEN** "Atacantes" is disabled with "Cheia (25 de 25)", "Laterais 2027" with "Já está nesta shortlist", and "Conflito" is selected

#### Scenario: Loading the shortlists
- **WHEN** the shortlists have not arrived in the dialog
- **THEN** the fields appear in skeleton

#### Scenario: No shortlist accepts the player
- **WHEN** every shortlist holds the player or is full
- **THEN** every option is disabled and "Adicionar" is disabled

### Requirement: First shortlist from the dialog
A scout without shortlists SHALL see in the dialog "Você ainda não tem shortlist. Crie uma para adicionar <nome>." with "Nome da shortlist" and "Criar shortlist"; once created, the dialog SHALL continue with it selected, following the creation rules.

#### Scenario: Creating inside the dialog
- **WHEN** a scout without shortlists types "Meias para janeiro" and clicks "Criar shortlist" in the dialog
- **THEN** the dialog shows the cost and the prioridade for "Meias para janeiro"

### Requirement: Custo estimado
The custo estimado SHALL be typed in millions next to the suffix "M", accepting a comma and up to two decimals ("12,5" is €12,5M, "0,85" is €850 mil), and SHALL be greater than zero. It SHALL come prefilled with the player's market value when the currency fits the shortlist, and empty otherwise.

#### Scenario: Prefilled
- **WHEN** the dialog opens for Rafael Montes, whose market value is €12,5M, on "Conflito" in EUR
- **THEN** the cost field shows "12,5" with "EUR"

#### Scenario: Market value in another currency
- **WHEN** the player's market value is in BRL and the shortlist is in EUR
- **THEN** the cost field is empty

#### Scenario: Zero
- **WHEN** the scout types "0" and clicks "Adicionar"
- **THEN** "Informe um custo maior que zero." appears below the field and nothing is sent

#### Scenario: Three decimals
- **WHEN** the scout types "12,555" and clicks "Adicionar"
- **THEN** "Use no máximo duas casas decimais." appears below the field and nothing is sent

#### Scenario: Below one million
- **WHEN** the scout types "0,85" in EUR and adds the alvo
- **THEN** the request carries 85000000 centavos in EUR and the shortlist shows "€850 mil"

### Requirement: Moeda da lista
On a shortlist with alvos, the currency SHALL be fixed to the moeda da lista with the hint "A moeda da lista é <moeda>."; on an empty shortlist, the scout SHALL choose among EUR, BRL, USD and GBP, with the hint "O primeiro alvo define a moeda da lista.".

#### Scenario: Locked currency
- **WHEN** the selected shortlist is "Conflito", in EUR
- **THEN** the currency shows "EUR" without a selector and "A moeda da lista é EUR."

#### Scenario: Free currency
- **WHEN** the selected shortlist is "Meias para janeiro", without alvos
- **THEN** the currency selector offers EUR, BRL, USD and GBP

### Requirement: Prioridade of the new alvo
The dialog SHALL offer the prioridade from 1 to the alvos count plus one, labelled "1 — no topo" for the first and "<n+1> — no fim" for the last, with the last selected.

#### Scenario: Conflito with two alvos
- **WHEN** "Conflito" with 2 alvos is selected
- **THEN** the prioridade offers "1 — no topo", "2" and "3 — no fim", with "3 — no fim" selected

#### Scenario: Empty shortlist
- **WHEN** "Meias para janeiro" is selected
- **THEN** the prioridade offers only "1 — no topo"

### Requirement: Alvo added
"Adicionar" SHALL send the player, the prioridade and the cost with the `version` of the selected shortlist, read "Adicionando…" while in flight, and on success replace the form with "Adicionado a <nome>, na prioridade <n>." with "Ver shortlist" and "Fechar". The shortlists and the affected shortlist SHALL then be read again when shown.

#### Scenario: Adding Rafael Montes to Meias para janeiro
- **WHEN** the scout selects "Meias para janeiro", keeps "12,5" in EUR and clicks "Adicionar"
- **THEN** the dialog shows "Adicionado a Meias para janeiro, na prioridade 1." and "Ver shortlist" opens "Meias para janeiro" with Rafael Montes at 1, "1 de 25" and "€12,5M"

#### Scenario: Adding
- **WHEN** the request is in flight
- **THEN** "Adicionar" reads "Adicionando…" and the fields are disabled

### Requirement: Adding refused
A refused addition SHALL keep the dialog and the typed values and show the message next to the buttons: the `422` codes by their text, and `412 shortlist.alterada_por_outra_requisicao` as "Esta shortlist foi alterada em outra aba. Confira e tente de novo.", after reading the shortlists again.

#### Scenario: Already in the shortlist
- **WHEN** the addition answers `422 shortlist.jogador_ja_na_lista`
- **THEN** the dialog shows "Este jogador já está na shortlist."

#### Scenario: Limit reached
- **WHEN** the addition answers `422 shortlist.limite_de_alvos_atingido`
- **THEN** the dialog shows "A shortlist atingiu o limite de 25 alvos."

#### Scenario: Different currency
- **WHEN** the addition answers `422 shortlist.moeda_divergente`
- **THEN** the dialog shows "Todos os custos da shortlist precisam usar a mesma moeda."

#### Scenario: Conflict when adding
- **WHEN** the scout adds a player to "Conflito"
- **THEN** the shortlists are read again, the typed cost stays and the dialog shows "Esta shortlist foi alterada em outra aba. Confira e tente de novo."

#### Scenario: Unknown error when adding
- **WHEN** the addition answers 500 without `code`
- **THEN** the dialog shows "Não foi possível concluir agora."

### Requirement: Dialog on phones
Below 480px, the dialog SHALL take the full width and its buttons SHALL be stacked with the main action on top.

#### Scenario: Phone width
- **WHEN** the dialog opens at 375px wide
- **THEN** "Adicionar" sits above "Cancelar", both at full width
