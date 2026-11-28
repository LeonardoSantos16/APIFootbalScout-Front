# Spec Delta

## ADDED Requirements

### Requirement: Shortlists link
The top "Shortlists" link SHALL lead to `/shortlists` and SHALL be marked as current on `/shortlists` and on every shortlist page; on any other page no top link is marked as current.

#### Scenario: Shortlists link
- **WHEN** the scout clicks "Shortlists" at the top
- **THEN** `/shortlists` opens with "Shortlists" marked as current

#### Scenario: Inside a shortlist
- **WHEN** the scout opens `/shortlists/<id>`
- **THEN** "Shortlists" is marked as current at the top

#### Scenario: Other pages
- **WHEN** the scout opens a player's profile
- **THEN** no top link is marked as current
