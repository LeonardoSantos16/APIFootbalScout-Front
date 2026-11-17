# Spec Delta

## Purpose

Defines how the scout gets into the tool and stays in it: creating an account, signing in, keeping and renewing the token pair, protected routes, the expired session, signing out, changing the password and deleting the account.

## ADDED Requirements

### Requirement: Creating an account
The "Criar conta" page SHALL ask for name, e-mail and password and, when the API creates the account, SHALL open the session with the returned pair and take the scout to the destination in `redirecionar`, or to `/` without one. The page title SHALL be "Criar conta".

#### Scenario: Account created
- **WHEN** the scout fills "Nome", "E-mail" and "Senha" with valid values and clicks "Criar conta"
- **THEN** the scout is signed in and lands on `/`, with the name in the top navigation

#### Scenario: E-mail already used
- **WHEN** the API responds 409 with `code` "usuario.email_ja_cadastrado"
- **THEN** the "E-mail" field shows "Este e-mail já está cadastrado." and the scout stays on the page

#### Scenario: Link to sign in
- **WHEN** the scout clicks "Entrar" below the form
- **THEN** the "Entrar" page opens

### Requirement: Signing in
The "Entrar" page SHALL ask for e-mail and password and, when the API accepts them, SHALL open the session and take the scout to the destination in `redirecionar`, or to `/` without one. The page title SHALL be "Entrar".

#### Scenario: Signed in with a destination
- **WHEN** the scout signs in from `/entrar?redirecionar=/jogadores/1001/metricas`
- **THEN** the per-90 metrics screen of player 1001 opens

#### Scenario: Wrong credentials
- **WHEN** the API responds 401 with `code` "usuario.credenciais_invalidas"
- **THEN** the "Senha" field shows "E-mail ou senha incorretos.", the session is not renewed and the scout stays on the page

#### Scenario: Link to create an account
- **WHEN** the scout clicks "Criar conta" below the form
- **THEN** the "Criar conta" page opens

### Requirement: Form validation
Forms SHALL check the contract limits before sending: name with 2 to 120 characters, e-mail with an "@" and up to 254 characters, password with 8 to 72 characters, and the new password confirmation equal to the new password. No error SHALL appear before the first submit; after it, each field with an error SHALL be checked again on every change.

#### Scenario: Nothing before the first submit
- **WHEN** the scout types "ana.ribeiro" in "E-mail" without submitting
- **THEN** no error appears

#### Scenario: Invalid e-mail
- **WHEN** the scout submits with "ana.ribeiro" in "E-mail"
- **THEN** the field shows "Informe um e-mail válido." and nothing is sent to the API

#### Scenario: Empty password on sign in
- **WHEN** the scout submits "Entrar" with "Senha" empty
- **THEN** the field shows "Informe a senha."

#### Scenario: Short name
- **WHEN** the scout submits "Criar conta" with "A" in "Nome"
- **THEN** the field shows "O nome precisa ter de 2 a 120 caracteres."

#### Scenario: Short password
- **WHEN** the scout submits "Criar conta" with a 4-character password
- **THEN** the field shows "A senha precisa ter de 8 a 72 caracteres."

#### Scenario: Confirmation differs
- **WHEN** the scout submits "Alterar senha" with a confirmation different from the new password
- **THEN** "Confirme a nova senha" shows "As senhas não conferem."

#### Scenario: Error fixed while typing
- **WHEN** after a failed submit the scout fixes the e-mail to "ana.ribeiro@exemplo.com"
- **THEN** the error under "E-mail" disappears without a new submit

### Requirement: Password hint and visibility
The new password fields SHALL show the hint "De 8 a 72 caracteres.". Every password field SHALL offer "Mostrar", which shows the typed text and becomes "Ocultar".

#### Scenario: Showing the password
- **WHEN** the scout clicks "Mostrar" in "Senha"
- **THEN** the password is shown as text and the button reads "Ocultar"

### Requirement: Sending state
While a form is being sent, its fields and buttons SHALL be disabled and the main button SHALL read "Entrando…", "Criando conta…", "Alterando senha…" or "Excluindo conta…".

#### Scenario: Signing in
- **WHEN** the scout submits "Entrar" and the API has not responded yet
- **THEN** the button reads "Entrando…" and the fields are disabled

### Requirement: Form errors without a field
A form error that does not belong to a field SHALL appear above the main button with the message from the `code`, following the error handling rules, and "Tentar de novo" only where those rules allow it.

#### Scenario: Unknown error on sign in
- **WHEN** the sign in responds 500 without `code`
- **THEN** "Não foi possível concluir agora." appears above "Entrar"

### Requirement: Session kept across reloads
The session SHALL survive a reload and a new tab: the token pair, the scout's name and e-mail are kept on the device and replaced by every pair the API returns. Signing out, an expired session and deleting the account SHALL remove them.

#### Scenario: Reload
- **WHEN** a signed-in scout reloads the metrics screen
- **THEN** the screen opens again without asking for sign in, with the scout's name in the top navigation

### Requirement: Confirming the session on boot
On opening a protected route with a kept session, the system SHALL confirm it with `GET /api/Auth/me` before showing the page, showing the top navigation as a skeleton and an empty body meanwhile. Without a kept pair, or with the refresh token already expired, the scout SHALL go straight to "Entrar" without calling the API.

#### Scenario: Confirming
- **WHEN** a scout with a kept session opens `/` and `me` has not responded yet
- **THEN** the top navigation shows skeleton blocks in place of the search, the links and the account, and the body is empty

#### Scenario: Refresh token expired
- **WHEN** the kept `refreshTokenExpiresAtUtc` is in the past
- **THEN** the scout lands on "Entrar" without any API call

### Requirement: Protected routes
Every route except "Entrar" and "Criar conta" SHALL require a session. Without one, the scout SHALL be taken to `/entrar` with the requested path and query in `redirecionar`. A signed-in scout who opens "Entrar" or "Criar conta" SHALL be taken to `/`.

#### Scenario: Opening a screen signed out
- **WHEN** a scout without a session opens `/jogadores/1001/metricas?competicao=325&temporada=58766&contexto=Clube`
- **THEN** the URL becomes `/entrar?redirecionar=` with that path and query

#### Scenario: Signed in opening Entrar
- **WHEN** a signed-in scout opens `/entrar`
- **THEN** the scout lands on `/`

### Requirement: Only internal destinations
The `redirecionar` destination SHALL be followed only when it starts with "/" and not with "//"; any other value SHALL be ignored and the scout SHALL land on `/`.

#### Scenario: External destination
- **WHEN** the scout signs in from `/entrar?redirecionar=//exemplo.com`
- **THEN** the scout lands on `/`

### Requirement: Authenticated requests
Every API call outside "Entrar", "Criar conta" and the renewal SHALL carry the access token of the session.

#### Scenario: Metrics with a session
- **WHEN** the metrics screen loads the profile and the metrics
- **THEN** both calls carry the access token

### Requirement: Renewal on an expired access token
On the first `401` of a call, the system SHALL renew the session once and repeat that call once with the new access token. Calls that fail while the renewal is in progress SHALL wait for it and be repeated, without a second renewal. A `401` on the repeated call SHALL end the session.

#### Scenario: Access token expired mid-screen
- **WHEN** the metrics respond 401 and the renewal succeeds
- **THEN** the metrics are requested again with the new token and the scout sees them without any message

#### Scenario: Concurrent calls
- **WHEN** the profile and the metrics both respond 401 at the same time
- **THEN** exactly one renewal is made and both calls are repeated with the new token

#### Scenario: Repeated call fails again
- **WHEN** the repeated call responds 401 again
- **THEN** the session ends as an expired session

### Requirement: Renewal before sending
When the kept access token is already past `accessTokenExpiresAtUtc` as a call is about to go out, the system SHALL renew first and send the call with the new token. There SHALL be no renewal on a timer.

#### Scenario: Tab reopened after an hour
- **WHEN** a call goes out with the access token expired for an hour and the refresh token still valid
- **THEN** the renewal is made first and the call goes out once, with the new token

### Requirement: One renewal across tabs
Two tabs of the same browser MUST NOT renew the same refresh token. A tab that waits for another tab's renewal SHALL use the pair that tab kept instead of renewing again.

#### Scenario: Other tab already renewed
- **WHEN** a tab needs to renew and another tab has just kept a new pair
- **THEN** the tab uses the new pair and no second renewal is made

### Requirement: Expired session
When the renewal is refused, the system SHALL fail every waiting call together, remove the session, discard the loaded data and take the scout to `/entrar` with the current path in `redirecionar` and a notice with the message from the `code`, or "Sua sessão expirou. Entre novamente." without one.

#### Scenario: Refresh token refused
- **WHEN** the renewal responds 401 with `code` "usuario.refresh_token_invalido"
- **THEN** the scout lands on "Entrar" with the notice "Sua sessão expirou. Entre novamente."

#### Scenario: Token without identification
- **WHEN** the renewal responds 401 with `code` "usuario.token_sem_identificacao"
- **THEN** the scout lands on "Entrar" with the notice "Sessão inválida. Entre novamente."

#### Scenario: Back where the scout was
- **WHEN** the session expired on the metrics screen and the scout signs in again
- **THEN** the same metrics screen opens

### Requirement: Renewal unavailable
When the renewal fails for a reason other than a refusal (no network, 502, 500), the session SHALL be kept and the waiting calls SHALL fail with the renewal's error, so a 502 offers "Tentar de novo".

#### Scenario: API down during renewal
- **WHEN** the renewal responds 502
- **THEN** the scout stays on the screen with its error and the session is still kept

#### Scenario: API down on boot
- **WHEN** a scout with an expired access token opens `/` and the renewal responds 502
- **THEN** the page shows "Não foi possível concluir agora." with "Tentar de novo" inside the top navigation, and the session is still kept

### Requirement: Session ended in another tab
When the session is removed in another tab, the current tab SHALL go to "Entrar". When another tab signs in with a different account, the current tab SHALL reload.

#### Scenario: Signed out in another tab
- **WHEN** the scout clicks "Sair" in another tab
- **THEN** the current tab shows "Entrar"

### Requirement: Signing out
"Sair" in the top navigation SHALL end the session of this device, sending its refresh token, and take the scout to "Entrar". The local session SHALL be removed and the data discarded even when the call fails, and a `401` on the sign out MUST NOT renew the session.

#### Scenario: Sair
- **WHEN** the scout clicks "Sair"
- **THEN** the scout lands on "Entrar" and reloading the page does not bring the session back

#### Scenario: Sair without network
- **WHEN** the sign out call fails
- **THEN** the scout lands on "Entrar" just the same

### Requirement: Account page
The "Conta" page SHALL show the scout's name and e-mail and the cards "Alterar senha", "Sessões" and "Excluir conta". The page title SHALL be "Conta". The scout's name in the top navigation SHALL lead to it.

#### Scenario: Opening the account
- **WHEN** the scout clicks their name in the top navigation
- **THEN** the "Conta" page shows "Ana Ribeiro · ana.ribeiro@exemplo.com"

### Requirement: Signing out of all devices
"Sair de todos os dispositivos" SHALL end every session of the scout, this one included, and take the scout to "Entrar", even when the call fails. The card SHALL say "Sair de todos os dispositivos encerra esta sessão agora. As outras sessões encerram em até 15 minutos.".

#### Scenario: Sair de todos
- **WHEN** the scout clicks "Sair de todos os dispositivos"
- **THEN** the scout lands on "Entrar" without a notice

### Requirement: Changing the password
"Alterar senha" SHALL ask for the current password, the new password and its confirmation. On success, the returned pair SHALL replace the kept one, the session SHALL continue, the fields SHALL be cleared and the notice "Senha alterada. As outras sessões encerram em até 15 minutos." SHALL appear.

#### Scenario: Password changed
- **WHEN** the API accepts the new password
- **THEN** the notice appears, the fields are empty and the next calls use the new pair

#### Scenario: Wrong current password
- **WHEN** the API responds 400 with `code` "usuario.senha_atual_invalida"
- **THEN** "Senha atual" shows "A senha atual está incorreta."

#### Scenario: Same password
- **WHEN** the API responds 422 with `code` "usuario.senha_igual_a_atual"
- **THEN** "Nova senha" shows "A nova senha precisa ser diferente da atual."

### Requirement: Deleting the account
"Excluir conta" SHALL open a confirmation dialog saying that the account will be erased with its reports, shortlists and follow-ups. The dialog's "Excluir conta" SHALL stay disabled until the scout types their own e-mail. After the deletion, the session SHALL be removed and the scout SHALL land on "Entrar" with the notice "Conta excluída.".

#### Scenario: E-mail not typed
- **WHEN** the dialog is open and the confirmation field holds "ana.ribeiro@"
- **THEN** the dialog's "Excluir conta" is disabled

#### Scenario: Account deleted
- **WHEN** the scout types "ana.ribeiro@exemplo.com" and clicks "Excluir conta"
- **THEN** the scout lands on "Entrar" with the notice "Conta excluída."

#### Scenario: E-mail typed in another case
- **WHEN** the scout types "Ana.Ribeiro@Exemplo.com " with other capitals and a trailing space
- **THEN** the dialog's "Excluir conta" is enabled

#### Scenario: Cancelling
- **WHEN** the scout clicks "Cancelar" or the close button
- **THEN** the dialog closes and nothing is sent to the API
