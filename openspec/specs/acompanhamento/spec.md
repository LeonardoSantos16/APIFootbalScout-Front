# acompanhamento Specification

## Purpose

Lets the scout start tracking a player in a recorte and then see, on every visit, what changed in the player's club, market value and minutagem since the linha de base, inside a stated janela, with aferições that cannot be made shown as such and never as "no change".

## Requirements

### Requirement: Acompanhamento tab
The player layout SHALL have an "Acompanhamento" tab at `/jogadores/$jogadorId/acompanhamento`, titled "Acompanhamento". Opening the tab SHALL read the player's acompanhamento; the tab SHALL show the not-tracked state when there is no active acompanhamento and the panel when there is one.

#### Scenario: Tracked player
- **WHEN** the scout opens `/jogadores/1001/acompanhamento` and the leitura of player 1001 arrives
- **THEN** the "Acompanhamento" tab is selected and the panel shows the janela and the three aferições

#### Scenario: Player not tracked
- **WHEN** the leitura answers 404 with the code `acompanhamento.dossie_nao_encontrado`
- **THEN** the tab shows the not-tracked state, with no error message

### Requirement: Browser tab title of the acompanhamento
The tab title SHALL be "Acompanhamento · <player name>" once the profile loads, and "Acompanhamento" while it loads or when it fails.

#### Scenario: Profile loaded
- **WHEN** Rafael Montes's profile arrives on the acompanhamento tab
- **THEN** the tab title is "Acompanhamento · Rafael Montes"

### Requirement: Not-tracked state
When the player has no active acompanhamento, the tab SHALL show "Você não acompanha este jogador.", below it "Ao acompanhar, o clube, o valor de mercado e a minutagem de hoje viram a linha de base.", the "Competição e temporada" selector with the recorte from the URL, and the "Acompanhar" button.

#### Scenario: Not tracked with recortes
- **WHEN** the scout opens the acompanhamento tab of a player without an active acompanhamento
- **THEN** the tab shows both texts, the selector on the recorte of the URL and the "Acompanhar" button

#### Scenario: Changing the recorte before tracking
- **WHEN** the scout picks another recorte in the selector
- **THEN** the URL takes the new recorte and the leitura is not requested again

### Requirement: Opening an acompanhamento
"Acompanhar" SHALL open the acompanhamento in the selected recorte and then read it again. From the click until the new leitura arrives, the selector and the button MUST be disabled and the button SHALL read "Acompanhando…". The panel SHALL replace the not-tracked state when the leitura arrives.

#### Scenario: Opening succeeds
- **WHEN** the scout clicks "Acompanhar" on player 1008 in "Clube · Brasileirão Série A · 2025"
- **THEN** the acompanhamento is opened with that competição, temporada and contexto
- **AND** the button reads "Acompanhando…" until the panel appears with "Linha de base medida hoje"

#### Scenario: Already tracked elsewhere
- **WHEN** opening answers 409 with the code `acompanhamento.jogador_ja_acompanhado`
- **THEN** the tab reads the acompanhamento again and shows the panel, with no message

### Requirement: Acompanhamento limit
When opening answers 422 with the code `acompanhamento.limite_atingido`, the tab SHALL show "Limite de 10 acompanhamentos atingido." below the button, with the number taken from the configured limit. The button SHALL stay enabled and the message MUST NOT suggest closing an acompanhamento.

#### Scenario: Limit reached
- **WHEN** the scout clicks "Acompanhar" on player 1005 and opening answers 422 `acompanhamento.limite_atingido`
- **THEN** "Limite de 10 acompanhamentos atingido." appears below the button and the button is enabled again

### Requirement: Player without a comparable base
When opening answers 422 with the code `jogador.informacoes_insuficientes`, the tab SHALL show "O jogador não tem dados suficientes para servir de linha de base." below the button, and the button SHALL stay enabled.

#### Scenario: Insufficient information
- **WHEN** the scout clicks "Acompanhar" on player 1006 and opening answers 422 `jogador.informacoes_insuficientes`
- **THEN** "O jogador não tem dados suficientes para servir de linha de base." appears below the button

### Requirement: Source down when opening
When opening answers 502, the tab SHALL show "Não foi possível acompanhar agora." with "Tentar de novo" in place of the button, and "Tentar de novo" SHALL open the acompanhamento again in the same recorte. Other opening errors SHALL show the message of their `code` in the same place, without "Tentar de novo".

#### Scenario: Opening with the source down
- **WHEN** opening answers 502
- **THEN** the tab shows "Não foi possível acompanhar agora." and "Tentar de novo"

#### Scenario: Trying again
- **WHEN** the scout clicks "Tentar de novo" after the 502
- **THEN** the acompanhamento is opened again with the same recorte

### Requirement: Janela of the leitura
The panel SHALL open with "Linha de base de <date of the linha de base> · comparando os últimos <days> dias", with the date as `dd/mm/aaaa` and the elapsed days rounded down. With exactly one day it SHALL read "comparando o último dia", and with less than one day the line SHALL read "Linha de base medida hoje".

#### Scenario: Twenty-seven days
- **WHEN** the janela starts on 2026-10-22 and lasts 27.4 days
- **THEN** the line reads "Linha de base de 22/10/2026 · comparando os últimos 27 dias"

#### Scenario: One day
- **WHEN** the janela lasts 1.6 days from 2026-11-17
- **THEN** the line reads "Linha de base de 17/11/2026 · comparando o último dia"

#### Scenario: Opened today
- **WHEN** the janela lasts 0.2 days
- **THEN** the line reads "Linha de base medida hoje"

### Requirement: Independent aferições
The panel SHALL show three aferições in this order: "Clube", "Valor de mercado" and "Minutagem", side by side on desktop and stacked below 720px. Each aferição SHALL show its own state, and an aferição in one state MUST NOT hide or change the others.

#### Scenario: Mixed states
- **WHEN** the leitura of player 1003 brings the club with a change and market value and minutagem unavailable
- **THEN** the three aferições appear, the club with its change and the other two with their reasons

#### Scenario: Phone width
- **WHEN** the panel is shown at 375px
- **THEN** the three aferições are stacked in the same order

### Requirement: Club change
A club aferição `ComMudanca` SHALL show "<previous club> → <current club>", with no signed change.

#### Scenario: New club
- **WHEN** the club changed from "Vila Nova Paulista" to "Atlético Serrano"
- **THEN** the "Clube" aferição reads "Vila Nova Paulista → Atlético Serrano"

### Requirement: Market value change
A market value aferição `ComMudanca` SHALL show "<previous> → <current>" in the market value format and, below, the percentage with one decimal and its sign: "+20,0% alta" when the current value is higher and "−20,0% queda" when it is lower.

#### Scenario: Value up
- **WHEN** the market value went from €8.0M to €9.6M with a variation of 20
- **THEN** the aferição reads "€8M → €9,6M" and "+20,0% alta"

#### Scenario: Value down
- **WHEN** the market value went from €12.5M to €10.0M with a variation of 20
- **THEN** the aferição reads "€12,5M → €10M" and "−20,0% queda"

### Requirement: Minutagem change
A minutagem aferição `ComMudanca` SHALL show "<previous> → <current> min" in the Brazilian number format and, below, "+<difference> min a mais".

#### Scenario: More minutes
- **WHEN** the minutagem went from 820 to 1240 with a difference of 420
- **THEN** the aferição reads "820 → 1.240 min" and "+420 min a mais"

### Requirement: No relevant change
An aferição `SemMudancaRelevante` SHALL show the current value muted and "Sem mudança relevante", with no signed change and no threshold. When the current value is absent, it SHALL show only "Sem mudança relevante".

#### Scenario: Nothing relevant
- **WHEN** the leitura of player 1002 brings the three aferições `SemMudancaRelevante`
- **THEN** each aferição shows its current value ("Atlético Serrano", "€4,5M", "1.410 min") and "Sem mudança relevante"

#### Scenario: No relevant change without values
- **WHEN** the leitura brings an aferição `SemMudancaRelevante` with only its `resultado`, as the real API answers today
- **THEN** the aferição shows only "Sem mudança relevante", with no value and no error

### Requirement: Unavailable aferição
An aferição `Indisponivel` SHALL show no values and the reason in full: "A fonte passou a publicar o valor em outra moeda; comparar seria enganoso." for `MoedaInesperada` and "A temporada virou e a minutagem zerou. A leitura antiga não é comparável." for `TemporadaVirada`. It MUST NOT read "Sem mudança relevante" nor appear as an error.

#### Scenario: Currency changed
- **WHEN** the market value aferição is `Indisponivel` with `MoedaInesperada`
- **THEN** the aferição reads "A fonte passou a publicar o valor em outra moeda; comparar seria enganoso."

#### Scenario: Season turned
- **WHEN** the minutagem aferição is `Indisponivel` with `TemporadaVirada`
- **THEN** the aferição reads "A temporada virou e a minutagem zerou. A leitura antiga não é comparável."

### Requirement: Tracked panel ignores the recorte
When the player is tracked, the tab MUST NOT show the recorte selector nor a recorte text, and changing the recorte in the URL MUST NOT change the panel.

#### Scenario: Another recorte in the URL
- **WHEN** the scout opens the acompanhamento of player 1001 with a recorte different from the one it was opened in
- **THEN** the panel shows the same janela and aferições, with no selector

### Requirement: Leitura loading
While the leitura loads, the tab SHALL show the janela line and the three aferições in skeleton, in their final layout, below the band and the tabs.

#### Scenario: Waiting for the leitura
- **WHEN** the leitura has not answered yet
- **THEN** the janela and the three aferições appear in skeleton

### Requirement: Leitura failure
When the leitura answers 502, the tab SHALL show "Não foi possível ler o acompanhamento agora." with "Tentar de novo". Other leitura errors SHALL show the message of their `code`, without "Tentar de novo".

#### Scenario: Source down on the leitura
- **WHEN** the leitura of player 1007 answers 502 after the automatic retry
- **THEN** the tab shows "Não foi possível ler o acompanhamento agora." and "Tentar de novo"

#### Scenario: Unknown code on the leitura
- **WHEN** the leitura answers 500 without a code
- **THEN** the tab shows "Não foi possível concluir agora."

### Requirement: Leitura reused
A leitura, including the not-tracked answer, SHALL be reused for 5 minutes when the scout leaves the tab and comes back. Opening an acompanhamento MUST replace the reused answer with a new leitura.

#### Scenario: Back to the tab
- **WHEN** the scout reads the acompanhamento, clicks "Métricas" and comes back within 5 minutes
- **THEN** the panel appears without a new leitura request
