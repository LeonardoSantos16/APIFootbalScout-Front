# Spec Delta

## Purpose

Lets the scout write relatórios about a player: open a rascunho from an observação, edit it in parts, finalize it once it has the minimum content, fix a finalizado only through a correção, and read every relatório about the player in a linha do tempo grouped by correção chain.

## ADDED Requirements

### Requirement: Relatórios tab
The player layout SHALL have a "Relatórios" tab at `/jogadores/$jogadorId/relatorios`, showing the linha do tempo of the scout's relatórios about the player and the "Escrever relatório" action. The tab SHALL not use the recorte.

#### Scenario: Player with relatórios
- **WHEN** the scout opens `/jogadores/1001/relatorios` and the list arrives
- **THEN** the "Relatórios" tab is selected and the card "Relatórios" shows the linha do tempo with "Escrever relatório" in its header

#### Scenario: No recorte selector
- **WHEN** the scout opens the relatórios tab with a recorte in the URL
- **THEN** no "Competição e temporada" selector appears

### Requirement: Browser tab title of the relatórios
The browser tab title SHALL be "Relatórios · <player name>" on the tab, "Relatório · <player name>" in the editor of a relatório and "Correção · <player name>" in the editor of a correção, and the part before " · " alone while the profile loads or fails.

#### Scenario: Tab loaded
- **WHEN** Rafael Montes's profile arrives on the relatórios tab
- **THEN** the tab title is "Relatórios · Rafael Montes"

#### Scenario: Correção loaded
- **WHEN** Rafael Montes's profile arrives in the editor of a correção
- **THEN** the tab title is "Correção · Rafael Montes"

### Requirement: Linha do tempo loading
While the list is loading, the card SHALL show three skeleton rows in the shape of the linha do tempo, and "Escrever relatório" SHALL stay enabled.

#### Scenario: List pending
- **WHEN** the list of relatórios has not arrived yet
- **THEN** the card shows three skeleton rows and an enabled "Escrever relatório"

### Requirement: No relatórios
When the scout has no relatório about the player, the card SHALL show "Nenhum relatório sobre este jogador." and the primary button "Escrever relatório" below it.

#### Scenario: Empty list
- **WHEN** the list of player 1003 arrives empty
- **THEN** the card shows "Nenhum relatório sobre este jogador." and "Escrever relatório"

### Requirement: Linha do tempo error
When the list fails, the card SHALL show the message chosen by the error `code` with "Tentar de novo", which SHALL request the list again; "Escrever relatório" SHALL stay available.

#### Scenario: Unknown error
- **WHEN** the list answers 500 without a `code`
- **THEN** the card shows "Não foi possível concluir agora." with "Tentar de novo" and "Escrever relatório"

#### Scenario: Retrying
- **WHEN** the scout clicks "Tentar de novo" and the list answers
- **THEN** the linha do tempo appears

### Requirement: Correção chains
The linha do tempo SHALL group each relatório with the correções that descend from it, following the referenced relatório up to the one without a reference. A correção whose referenced relatório is not in the list SHALL start its own group.

#### Scenario: Chain of three
- **WHEN** a finalizado has a correção, and that correção has a correção of its own
- **THEN** the three appear in the same group, the original first

#### Scenario: Referenced relatório missing
- **WHEN** a correção references a relatório that is not in the list
- **THEN** the correção starts its own group

### Requirement: Linha do tempo order
Groups SHALL be ordered from the most recent to the oldest data da observação. Inside a group, relatórios SHALL be ordered by writing date, oldest first, and the correções SHALL be indented under the original.

#### Scenario: Two groups
- **WHEN** the scout has a rascunho observed on 20/11/2026 and a chain observed on 02/11/2026
- **THEN** the 20/11/2026 group comes first

### Requirement: Linha do tempo row
Each row SHALL be a link to its relatório, titled "Observado em <data>" for the original and "Correção de <writing date>" for a correção, with "<nota> de 10 · <parecer>" below, or "Sem nota" and "Sem parecer" for what is missing, and its status.

#### Scenario: Finalizado row
- **WHEN** an original has nota 6.5 and parecer `Monitorar`
- **THEN** the row reads "Observado em 02/11/2026" and "6,5 de 10 · Monitorar"

#### Scenario: Empty rascunho row
- **WHEN** a rascunho has neither nota nor parecer
- **THEN** the row reads "Sem nota · Sem parecer", with "Rascunho" and "Continuar"

### Requirement: Vigente
In each group, the most recent finalizado SHALL be marked "Vigente"; the other finalizados SHALL be marked "Finalizado" and rascunhos "Rascunho". A correção rascunho SHALL not take "Vigente" from the relatório it corrects.

#### Scenario: Vigente with a correção in rascunho
- **WHEN** the original and its correção are finalizados and the correção of the correção is a rascunho
- **THEN** the correção is "Vigente", the original "Finalizado" and the last one "Rascunho"

### Requirement: Replaced relatório note
A finalizado replaced by a finalizado correção SHALL show "Corrigido pela correção de <writing date of the correção>" in the linha do tempo and in its reading.

#### Scenario: Replaced original
- **WHEN** the original was corrected by a correção finalized and written on 05/11/2026
- **THEN** the original shows "Corrigido pela correção de 05/11/2026"

### Requirement: Writing a new relatório
"Escrever relatório" SHALL open the editor at `/jogadores/$jogadorId/relatorios/novo`, titled "Relatório", with every field empty except the data da observação, set to today. Nothing SHALL be created on the server before the first save. Several rascunhos of the same player MUST be allowed.

#### Scenario: Opening the editor
- **WHEN** the scout clicks "Escrever relatório" on 24/11/2026
- **THEN** the editor opens with the data da observação 24/11/2026, the other fields empty and no request to create a relatório

### Requirement: Data da observação
Before the first save, the data da observação SHALL accept only dates up to today, in the scout's time zone. After the first save, it SHALL be read-only, shown as "24/11/2026", with the hint "A data da observação não muda depois de salvar.".

#### Scenario: Saved rascunho
- **WHEN** the scout opens a rascunho that was already saved
- **THEN** the data da observação appears as text with "A data da observação não muda depois de salvar."

#### Scenario: Future date refused by the server
- **WHEN** the first save answers 409 with the code `relatorio.observacao_futura`
- **THEN** the editor shows "A data da observação não pode estar no futuro." above the buttons

### Requirement: Relato
The "Relato" field SHALL be required. Saving with an empty relato, or one with only spaces, MUST NOT send any request and SHALL show "Escreva o relato." under the field.

#### Scenario: Empty relato
- **WHEN** the scout clicks "Salvar rascunho" with an empty relato
- **THEN** "Escreva o relato." appears under the field and no request is made

### Requirement: Nota
The "Nota" field SHALL accept a number from 0 to 10 with at most one decimal, with a comma or a dot, and show "De 0 a 10, com uma casa decimal." as a hint. An invalid nota MUST block the save and show its message under the field.

#### Scenario: Comma decimal
- **WHEN** the scout types "7,5" and saves
- **THEN** the nota is sent as 7.5

#### Scenario: Out of range
- **WHEN** the scout types "11" and saves
- **THEN** "A nota deve estar entre 0 e 10." appears under the field and no request is made

#### Scenario: Two decimals
- **WHEN** the scout types "7,25" and saves
- **THEN** "A nota aceita no máximo uma casa decimal." appears under the field and no request is made

### Requirement: Nota and parecer kept once saved
Once a nota or a parecer is saved, the editor SHALL not offer to leave it empty again; the scout can only change it.

#### Scenario: Clearing a saved nota
- **WHEN** the scout erases a saved nota and saves
- **THEN** "Informe a nota." appears under the field and no request is made

### Requirement: Parecer
The "Parecer" field SHALL offer "Contratar", "Monitorar", "Reavaliar" and "Descartar" as a single choice, with no color per option.

#### Scenario: Choosing a parecer
- **WHEN** the scout picks "Monitorar" and saves
- **THEN** the parecer is sent as `Monitorar`

### Requirement: Pontos positivos and pontos negativos
Each list SHALL show one field per ponto with "Remover", "Adicionar ponto" at the end and the count "<filled> de 2". Saving SHALL send each list whole, every ponto trimmed and the empty ones left out.

#### Scenario: Empty ponto left out
- **WHEN** the pontos positivos are "Recebe de costas e gira rápido" and an empty field, and the scout saves
- **THEN** the request carries only "Recebe de costas e gira rápido" and the count reads "1 de 2"

#### Scenario: Removing a ponto
- **WHEN** the scout removes the first of two pontos negativos and saves
- **THEN** the request carries the remaining ponto only

### Requirement: First save
The first "Salvar rascunho" of a new relatório SHALL create the rascunho with the relato and the data da observação and then, when nota, parecer or pontos are filled, save them in a second request. The URL SHALL then change to `/jogadores/$jogadorId/relatorios/<id>`, replacing the `novo` entry in the history.

#### Scenario: New relatório with every field
- **WHEN** the scout fills every field and clicks "Salvar rascunho"
- **THEN** the rascunho is created, the remaining fields are saved with the version it returned and the URL shows the new id

#### Scenario: Back after the first save
- **WHEN** the scout presses the browser back button after the first save
- **THEN** the browser leaves the editor instead of returning to `novo`

### Requirement: Saving a rascunho
"Salvar rascunho" SHALL send the changed fields with the version of the last answer. While a save or a finalization is in flight, the fields and both buttons MUST be disabled and the button SHALL read "Salvando…". The answer SHALL replace the saved state.

#### Scenario: Saving
- **WHEN** the scout edits the relato of a saved rascunho and clicks "Salvar rascunho"
- **THEN** the button reads "Salvando…" until the answer, and the request carries the version of the last answer

### Requirement: Unsaved changes line
The editor SHALL show "Alterações não salvas" next to the buttons whenever the fields differ from the last saved state, and hide it when they match again.

#### Scenario: Editing and undoing
- **WHEN** the scout changes the relato and then restores the saved text
- **THEN** "Alterações não salvas" appears and then disappears

### Requirement: Save failure
When a save fails for any reason other than a conflict, the editor SHALL keep the fields as they are and show the message chosen by the error `code` next to the buttons, without "Tentar de novo"; "Salvar rascunho" SHALL be the new attempt.

#### Scenario: Server error
- **WHEN** saving answers 500 without a `code`
- **THEN** "Não foi possível concluir agora." appears next to the buttons and the fields keep the scout's text

#### Scenario: Created but not completed
- **WHEN** the first save creates the rascunho and the second request fails
- **THEN** the URL shows the new id, the data da observação is read-only, "Alterações não salvas" stays, and the next "Salvar rascunho" sends only the second request

### Requirement: Changed in another tab
When a write answers 412 with the code `relatorio.alterado_por_outra_requisicao`, the editor SHALL keep the local edits, show "Este relatório foi alterado em outra aba." with "Carregar a versão atual", and disable saving and finalizing until the scout loads it.

#### Scenario: Conflict on save
- **WHEN** saving the rascunho of player 1005 answers 412
- **THEN** the message and "Carregar a versão atual" appear, and "Salvar rascunho" and "Finalizar relatório" are disabled

#### Scenario: Loading the current version
- **WHEN** the scout clicks "Carregar a versão atual"
- **THEN** the relatório is read again, the fields show the saved version and the local edits are discarded

### Requirement: Finalized elsewhere
When a write answers 409 with the code `relatorio.ja_finalizado`, the editor SHALL read the relatório again and show it read-only with "Este relatório já foi finalizado.".

#### Scenario: Finalized in another tab
- **WHEN** saving answers 409 `relatorio.ja_finalizado`
- **THEN** the relatório appears read-only with "Este relatório já foi finalizado."

### Requirement: What is missing to finalize
The editor SHALL always show, under "Para finalizar": "Nota", "Parecer", "2 pontos positivos (<n> de 2)", "2 pontos negativos (<n> de 2)" and "20 caracteres nos pontos (<n> de 20)", counted on the trimmed, non-empty pontos. A missing item MUST look neutral, never as an error.

#### Scenario: Partly filled
- **WHEN** the rascunho has nota, parecer, one ponto positivo of 30 characters and no ponto negativo
- **THEN** "Nota", "Parecer" and "20 caracteres nos pontos (30 de 20)" are met, and "2 pontos positivos (1 de 2)" and "2 pontos negativos (0 de 2)" are missing

### Requirement: Finalizing
"Finalizar relatório" SHALL be enabled only when every item of the checklist is met. It SHALL ask "Finalizar relatório?" with "Depois de finalizado, o relatório não muda mais. Para ajustar, crie uma correção.", "Voltar" and "Finalizar relatório". Confirming SHALL save pending changes first, then finalize.

#### Scenario: Checklist open
- **WHEN** an item of the checklist is missing
- **THEN** "Finalizar relatório" is disabled

#### Scenario: Confirmed with pending changes
- **WHEN** the checklist is met, the relato has an unsaved change and the scout confirms
- **THEN** the change is saved, the relatório is finalized with the version of that save and the editor shows it read-only

#### Scenario: Going back
- **WHEN** the scout clicks "Voltar" in the dialog
- **THEN** the dialog closes and nothing is sent

### Requirement: Finalization refused
When finalizing answers 422, the editor SHALL show the message of the `code` above the buttons: "Preencha nota e parecer antes de finalizar." for `relatorio.conclusao_ausente` and "Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total)." for `relatorio.conteudo_minimo_nao_atendido`.

#### Scenario: Minimum content refused
- **WHEN** finalizing answers 422 `relatorio.conteudo_minimo_nao_atendido`
- **THEN** "Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total)." appears above the buttons

#### Scenario: Conclusion missing
- **WHEN** finalizing answers 422 `relatorio.conclusao_ausente`
- **THEN** "Preencha nota e parecer antes de finalizar." appears above the buttons

### Requirement: Reading a finalizado
A finalizado SHALL be read-only: its status, "Observado em <data> · finalizado em <data>", "<nota> de 10" and the parecer above their labels, the relato and both lists of pontos, with no checklist and no save.

#### Scenario: Vigente of player 1002
- **WHEN** the scout opens the vigente of player 1002
- **THEN** the page shows "Vigente", "8,0 de 10", "Contratar", the relato and the pontos, with no field to edit

### Requirement: Creating a correção
"Criar correção" SHALL appear only on the vigente and open `/jogadores/$jogadorId/relatorios/novo?corrige=<id>`. When a correção rascunho of that relatório already exists, the button SHALL read "Continuar correção" and open it instead.

#### Scenario: Vigente without a correção
- **WHEN** the scout opens the vigente of player 1002
- **THEN** "Criar correção" opens the editor of a new correção

#### Scenario: Correção already started
- **WHEN** the vigente already has a correção rascunho
- **THEN** the button reads "Continuar correção" and opens that rascunho

#### Scenario: Replaced finalizado
- **WHEN** the scout opens a finalizado that is not the vigente
- **THEN** there is no "Criar correção" and the page shows "Corrigido pela correção de <data>" with a link

### Requirement: Correção editor
A new correção SHALL open titled "Correção", with the relato of the corrected relatório, nota, parecer and pontos empty, and the data da observação of the corrected relatório read-only with "A correção mantém a data da observação do relatório corrigido.". The first save SHALL create the correção.

#### Scenario: New correção
- **WHEN** the scout clicks "Criar correção" on the vigente of player 1002
- **THEN** the editor shows the relato of that relatório, empty nota, parecer and pontos, and "Alterações não salvas"

### Requirement: Corrected relatório reference
A correção SHALL show which relatório it corrects, with a link, by the title it has in the linha do tempo: "Corrige o relatório observado em <data>" for an original and "Corrige a correção de <writing date>" for a correção.

#### Scenario: Correção of an original
- **WHEN** the scout opens a correção of the original observed on 02/11/2026
- **THEN** the page shows "Corrige o relatório observado em 02/11/2026"

#### Scenario: Correção of a correção
- **WHEN** the scout opens a correção of the correção written on 05/11/2026
- **THEN** the page shows "Corrige a correção de 05/11/2026"

### Requirement: Relatório not found
When the relatório does not exist or belongs to another scout, the editor SHALL show "Relatório não encontrado." with "Voltar aos relatórios".

#### Scenario: Unknown id
- **WHEN** the relatório answers 404 with the code `relatorio.nao_encontrado`
- **THEN** the page shows "Relatório não encontrado." and "Voltar aos relatórios"

### Requirement: Editor loading
While the relatório is loading, the editor SHALL show its fields in skeleton.

#### Scenario: Relatório pending
- **WHEN** the scout opens a relatório that has not arrived yet
- **THEN** the editor shows the fields in skeleton

### Requirement: Leaving with unsaved changes
When the editor has unsaved changes, following a link or switching tabs SHALL ask "Sair sem salvar?" with "As alterações deste relatório serão perdidas.", "Sair" and "Continuar editando". Closing or reloading the window SHALL trigger the browser's own warning. A new relatório or correção left as it opened SHALL not ask.

#### Scenario: Switching tabs with changes
- **WHEN** the scout edits the relato and clicks "Métricas"
- **THEN** the dialog asks "Sair sem salvar?" and the scout stays in the editor on "Continuar editando"

#### Scenario: Leaving without changes
- **WHEN** the editor has no unsaved change and the scout clicks "Métricas"
- **THEN** the metrics open without a dialog

#### Scenario: Leaving an untouched new relatório
- **WHEN** the scout opens "Escrever relatório" and leaves without typing anything
- **THEN** no dialog appears, even though "Alterações não salvas" is shown
