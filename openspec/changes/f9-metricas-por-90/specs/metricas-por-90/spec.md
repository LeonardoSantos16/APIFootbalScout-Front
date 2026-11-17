# Spec Delta

## Purpose

Shows the scout a player's seven per-90 metrics in the selected recorte, making clear the value, the unit, the sample and, when there is no value, the refusal reason.

## ADDED Requirements

### Requirement: Seven fixed rows
The grid SHALL always have seven rows, in this order: Gols, Assistências, Passes decisivos, Desarmes, Interceptações, Nota and Precisão de passe. No row MUST be hidden, not even when all of them are refused.

#### Scenario: All metrics calculated
- **WHEN** the response has the seven attributes calculated
- **THEN** the grid shows the seven rows in the fixed order

#### Scenario: All metrics refused
- **WHEN** the response has the seven attributes refused
- **THEN** the grid still has seven rows, each with its reason

#### Scenario: Attribute missing from the response
- **WHEN** the response has fewer than seven attributes
- **THEN** the grid gives way to the error "Não foi possível concluir agora." with "Tentar de novo"

#### Scenario: Attribute of an unknown type
- **WHEN** the response has the seven attributes plus one of a type the screen does not know
- **THEN** the grid shows the seven rows and ignores the unknown attribute

### Requirement: Label and unit of each row
Each row SHALL have its label below the value. The five counts carry "por 90" in the label ("Gols, por 90"), the Nota carries "média" ("Nota, média") and Precisão de passe has "%" appended to the value.

#### Scenario: Labels with units
- **WHEN** the grid is shown
- **THEN** the labels are "Gols, por 90", "Assistências, por 90", "Passes decisivos, por 90", "Desarmes, por 90", "Interceptações, por 90", "Nota, média" and "Precisão de passe"

### Requirement: Format of calculated values
A calculated value SHALL follow the Brazilian format: two decimal places for the counts and the Nota, one decimal place with "%" for Precisão de passe.

#### Scenario: Per-90 count
- **WHEN** `Desarmes` arrives calculated with `valor` 2.1
- **THEN** the row shows "2,10"

#### Scenario: Nota
- **WHEN** `Rating` arrives calculated with `valor` 7.123
- **THEN** the row shows "7,12"

#### Scenario: Precisão de passe
- **WHEN** `PrecisaoDePasse` arrives calculated with `valor` 86.43
- **THEN** the row shows "86,4%"

### Requirement: Sample
The grid footer SHALL show the most common sample among the attributes and the minimum rule: "Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor." A calculated row SHALL show its own sample only when it differs from the footer sample.

#### Scenario: Equal samples
- **WHEN** every attribute arrives with `amostraEmMinutos` 1284
- **THEN** the footer reads "Amostra: 1.284 min jogados." and no row repeats the sample

#### Scenario: One different sample
- **WHEN** six attributes have 1284 min and Precisão de passe has 1190 min
- **THEN** only the Precisão de passe row shows "1.190 min jogados"

### Requirement: Refusal for insufficient sample
An attribute refused with `AmostraInsuficiente` SHALL show, in place of the value, "Amostra insuficiente: <sample> de 450 min", or "Amostra insuficiente: mínimo de 450 min" when the sample is absent. The label stays visible.

#### Scenario: Refusal with sample
- **WHEN** `Gols` arrives refused with `AmostraInsuficiente` and `amostraEmMinutos` 312
- **THEN** the row shows "Amostra insuficiente: 312 de 450 min" above "Gols, por 90"

#### Scenario: Refusal without sample
- **WHEN** `Gols` arrives refused with `AmostraInsuficiente` without `amostraEmMinutos`
- **THEN** the row shows "Amostra insuficiente: mínimo de 450 min"

### Requirement: Refusal because the source did not attribute
An attribute refused with `FonteNaoAtribuiu` SHALL show "Não publicado pela fonte" in place of the value, with the label visible. The enum name MUST NOT appear on screen.

#### Scenario: Interceptações not published
- **WHEN** `Interceptacoes` arrives refused with `FonteNaoAtribuiu`
- **THEN** the row shows "Não publicado pela fonte" above "Interceptações, por 90"

### Requirement: Metrics loading
While the recorte's metrics load, the grid SHALL show the seven rows with the label and a block in place of the value, in the final layout, and the footer with only the minimum rule. When the recorte changes, the previous recorte's numbers MUST NOT stay on screen.

#### Scenario: Screen opening
- **WHEN** the profile and the metrics have not arrived yet
- **THEN** the screen shows blocks in place of the header, the selector and the seven values

#### Scenario: Recorte change
- **WHEN** the scout picks another recorte
- **THEN** the header and the selector stay visible and only the seven values turn back into blocks until the new response

### Requirement: Player header
The card SHALL open with the player's name and a line with position, age and current club ("Meio-campo, 27 anos, Atlético Serrano"). The position comes from the source's letter: `G` Goleiro, `D` Defesa, `M` Meio-campo, `F` Ataque; an unknown letter is left out.

#### Scenario: Midfielder
- **WHEN** the profile has `position` "M", 27 full years and the club "Atlético Serrano"
- **THEN** the support line is "Meio-campo, 27 anos, Atlético Serrano"

#### Scenario: Unknown position
- **WHEN** the profile has `position` "X"
- **THEN** the support line shows only the age and the club

### Requirement: Browser tab title
The tab title SHALL be "Métricas por 90 · <player name>" once the profile loads, and "Métricas por 90" while it loads or when it fails.

#### Scenario: Profile loaded
- **WHEN** Rafael Montes's profile arrives
- **THEN** the tab title is "Métricas por 90 · Rafael Montes"

### Requirement: Player tabs
The card SHALL have the player tabs below the header, with "Métricas por 90" selected. In F9 that is the only tab.

#### Scenario: Selected tab
- **WHEN** the screen is shown
- **THEN** the "Métricas por 90" tab appears selected
