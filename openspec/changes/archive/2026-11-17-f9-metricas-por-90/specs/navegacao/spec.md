# Spec Delta

## Purpose

Defines the common skeleton of the scout's pages: the top navigation, the account and the two-column body, which later features fill in.

## ADDED Requirements

### Requirement: Top navigation
Every scout page SHALL have at the top the app name, the "Buscar jogador" field, the links "Acompanhamentos", "Shortlists" and "Relatórios" and, on the right, "Sair". While the features behind those destinations do not exist, the items lead nowhere; the scout's name goes next to "Sair" with the session (item 3).

#### Scenario: Metrics page
- **WHEN** the scout opens the per-90 metrics screen
- **THEN** the top shows "Buscar jogador", "Acompanhamentos", "Shortlists", "Relatórios" and "Sair"

### Requirement: Two-column body
On desktop, the player page body SHALL have the main card at about two thirds of the width and a support column on the right. Below 720px, it SHALL become a single column, with the support below the card.

#### Scenario: Phone width
- **WHEN** the page is opened at 375px wide
- **THEN** the card takes the full width and the support column sits below it

### Requirement: Navigation on phones
Below 720px, the top SHALL show the app name and a "Menu" button instead of the search and the links.

#### Scenario: Top on a phone
- **WHEN** the page is opened at 375px wide
- **THEN** the top shows the app name and the "Menu" button
