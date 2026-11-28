# Spec Delta

## ADDED Requirements

### Requirement: Shortlist action in the club band
Once the profile has arrived, the club band SHALL carry the secondary button "Adicionar à shortlist" on every player tab, to the right of the name on desktop and below it under 720px. While the profile loads, the band SHALL show no action.

#### Scenario: Shortlist action on every tab
- **WHEN** the scout opens the "Perfil", "Métricas", "Comparação", "Acompanhamento" or "Relatórios" tab of Rafael Montes
- **THEN** the band shows "Adicionar à shortlist"

#### Scenario: Band loading
- **WHEN** the profile is still loading
- **THEN** the band in skeleton shows no "Adicionar à shortlist"
