# Spec Delta

## ADDED Requirements

### Requirement: Where the acompanhamento error appears
An acompanhamento leitura failure SHALL appear in place of the janela and the aferições, with the band and the tabs visible. A failure to open an acompanhamento SHALL appear in place of the "Acompanhar" button, with the band, the tabs and the selector visible.

#### Scenario: Leitura failure
- **WHEN** the acompanhamento leitura fails
- **THEN** the band and the tabs stay on screen, with the message in place of the janela and the aferições

#### Scenario: Opening failure
- **WHEN** opening an acompanhamento fails with 502
- **THEN** the band, the tabs and the selector stay on screen, with the message in place of the "Acompanhar" button
