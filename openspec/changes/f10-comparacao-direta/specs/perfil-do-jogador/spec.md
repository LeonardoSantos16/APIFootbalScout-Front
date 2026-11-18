# Spec Delta

## MODIFIED Requirements

### Requirement: Player layout
Every player screen (`/jogadores/$jogadorId` and its sub-pages) SHALL open with the club band and the player tabs, loaded from a single profile request shared by every tab. The tabs SHALL be "Perfil", "Métricas" and "Comparação", each one a link to its page, with the current one marked as selected.

#### Scenario: Opening the profile
- **WHEN** the scout opens `/jogadores/1001`
- **THEN** the band and the tabs appear with "Perfil" selected

#### Scenario: Switching tabs
- **WHEN** the scout is on "Perfil" and clicks "Métricas"
- **THEN** the per-90 metrics open with "Métricas" selected and the profile is not requested again

#### Scenario: Opening the comparison
- **WHEN** the scout is on "Perfil" and clicks "Comparação"
- **THEN** the comparison opens with "Comparação" selected and the profile is not requested again

### Requirement: Recorte kept across tabs
The recorte search params and the second player of the comparison (`com`) SHALL be kept when the scout switches between the player tabs. The "Perfil" tab SHALL ignore them, and the "Métricas" tab SHALL ignore `com`.

#### Scenario: Back to the profile and to the metrics
- **WHEN** the scout is on the metrics of a chosen recorte, clicks "Perfil" and then "Métricas"
- **THEN** the metrics open in the same recorte

#### Scenario: Metrics without a recorte
- **WHEN** the scout opens "Métricas" from a profile URL without a recorte
- **THEN** the metrics open in the first recorte of `stats`

#### Scenario: Back to the comparison
- **WHEN** the scout compares with `com=1006`, clicks "Métricas" and then "Comparação"
- **THEN** the comparison opens with the same recorte and the same second player
