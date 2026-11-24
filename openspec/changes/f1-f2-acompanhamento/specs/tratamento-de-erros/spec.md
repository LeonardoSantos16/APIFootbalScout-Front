# Spec Delta

## MODIFIED Requirements

### Requirement: Where the error appears
A profile failure SHALL replace the player layout on every player tab, without the band, the tabs or the selector. A metrics failure SHALL appear in place of the grid, with the band, the tabs and the selector visible. A comparison failure SHALL appear in place of the table, with the band, the tabs and the selector visible. An acompanhamento leitura failure SHALL appear in place of the aferições, with the band and the tabs visible. A failure to open an acompanhamento SHALL appear in place of the "Acompanhar" button, with the selector visible. A search failure SHALL appear in place of the results, with the field visible.

#### Scenario: Profile failure
- **WHEN** the profile fails on the metrics tab
- **THEN** the page shows only the message, without the band or the tabs

#### Scenario: Metrics failure
- **WHEN** the metrics fail
- **THEN** the band, the tabs and the selector stay on screen, with the message in place of the grid

#### Scenario: Comparison failure
- **WHEN** the comparison fails
- **THEN** the band, the tabs and the selector stay on screen, with the message in place of the table

#### Scenario: Leitura failure
- **WHEN** the acompanhamento leitura fails
- **THEN** the band and the tabs stay on screen, with the message in place of the janela and the aferições

#### Scenario: Opening failure
- **WHEN** opening an acompanhamento fails with 502
- **THEN** the band, the tabs and the selector stay on screen, with the message in place of the "Acompanhar" button

#### Scenario: Search failure
- **WHEN** the search fails
- **THEN** the field keeps the term and the message takes the place of the results
