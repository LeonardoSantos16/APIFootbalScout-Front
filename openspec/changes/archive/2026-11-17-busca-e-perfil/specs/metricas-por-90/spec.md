# Spec Delta

## MODIFIED Requirements

### Requirement: Metrics loading
While the profile loads, the metrics tab SHALL show the selector and the seven rows as placeholders below the player layout's placeholders. While the recorte's metrics load, the grid SHALL show the seven rows with the label and a block in place of the value, in the final layout, and the footer with only the minimum rule. When the recorte changes, the previous recorte's numbers MUST NOT stay on screen.

#### Scenario: Screen opening
- **WHEN** the profile and the metrics have not arrived yet
- **THEN** the screen shows blocks in place of the band, the selector and the seven values

#### Scenario: Recorte change
- **WHEN** the scout picks another recorte
- **THEN** the band, the tabs and the selector stay visible and only the seven values turn back into blocks until the new response

## REMOVED Requirements

### Requirement: Player header
**Reason**: The player's name and support line now belong to the club band of the player layout, shared by the profile and the metrics.
**Migration**: See "Club band" in the `perfil-do-jogador` capability; the support line rule is the same.

### Requirement: Player tabs
**Reason**: The metrics screen no longer has its own single "Métricas por 90" tab; the player layout shows the "Perfil" and "Métricas" tabs for every player screen.
**Migration**: See "Player layout" in the `perfil-do-jogador` capability.
