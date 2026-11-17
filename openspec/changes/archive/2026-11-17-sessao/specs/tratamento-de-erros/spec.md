# Spec Delta

## MODIFIED Requirements

### Requirement: Retry
A 502 SHALL be retried automatically once, about 2 s later, before the screen shows the error. "Tentar de novo" SHALL appear on a 502 and on an unknown error and MUST NOT appear on 4xx responses, which are never retried. The only exception is a `401` outside creating an account, signing in, changing the password and signing out, which is repeated once after the session renewal and never reaches the screen as an error.

#### Scenario: 502 that resolves itself
- **WHEN** the first call responds 502 and the retry responds 200
- **THEN** the scout sees the metrics without having seen an error message

#### Scenario: Tentar de novo
- **WHEN** the scout clicks "Tentar de novo" after a 502
- **THEN** the call is made again and the area goes back to loading

#### Scenario: 404 is not retried
- **WHEN** a call responds 404
- **THEN** it is not retried and the screen does not offer "Tentar de novo"

#### Scenario: 401 repeated after the renewal
- **WHEN** the metrics respond 401 and the session renewal succeeds
- **THEN** the metrics are requested once more and no error message appears

#### Scenario: 401 on sign in is not renewed
- **WHEN** the sign in responds 401 with `code` "usuario.credenciais_invalidas"
- **THEN** no renewal is made and the error appears on the form
