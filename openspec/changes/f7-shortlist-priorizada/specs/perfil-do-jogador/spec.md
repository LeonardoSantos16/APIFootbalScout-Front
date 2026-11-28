# Spec Delta

## MODIFIED Requirements

### Requirement: Club band
The band SHALL show the player's photo, the name and a support line with the position, age and current club ("Meio-campo, 24 anos, Atlético Serrano"), following the position letters `G` Goleiro, `D` Defesa, `M` Meio-campo, `F` Ataque. A missing part SHALL be left out of the line. The band SHALL use the `club` color while the contract has no club colors. Once the profile has arrived, the band SHALL carry the secondary button "Adicionar à shortlist" on every player tab, to the right of the name on desktop and below it under 720px.

#### Scenario: Complete band
- **WHEN** the profile has `position` "M", 24 full years and the club "Atlético Serrano"
- **THEN** the band shows the name and "Meio-campo, 24 anos, Atlético Serrano"

#### Scenario: Without a birth date
- **WHEN** the profile has no `dateOfBirth`
- **THEN** the support line shows only the position and the club

#### Scenario: Shortlist action on every tab
- **WHEN** the scout opens the "Perfil", "Métricas", "Comparação", "Acompanhamento" or "Relatórios" tab of Rafael Montes
- **THEN** the band shows "Adicionar à shortlist"

#### Scenario: Band loading
- **WHEN** the profile is still loading
- **THEN** the band in skeleton shows no "Adicionar à shortlist"
