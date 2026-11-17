# Divida tecnica

Pendencias conhecidas que o front contorna hoje e que precisam de correcao em outro lugar. Cada item diz o contorno atual, para que ele seja removido quando a correcao chegar.

## API (back-end, `../APIFootbalScout`)

### Erros do `PlayersController` e do `TournamentController` sem `ProblemDetails`

- **Problema:** `GET /api/Players/{id}/profile` responde 404 com texto puro (`NotFound($"Player with ID {id} not found")`), e `GET /api/Players/search` responde 400 da mesma forma (`BadRequest("Name is required")`). Esses erros nao tem `code`, ao contrario do resto da API, que passa pelo `ExceptionHandlerGlobal`. O `TournamentController` segue o mesmo padrao. O 502 do SofaScore nao tem o problema: a excecao `FonteExternaIndisponivelException` sobe ate o handler global e sai como `ProblemDetails` com `code`.
- **Correcao esperada:** lancar `RecursoNaoEncontradoException` e `ValorInvalidoException` com codigos proprios (por exemplo `jogador.nao_encontrado` e `busca.termo_obrigatorio`) em vez de devolver `NotFound`/`BadRequest` com string, e acrescentar os codigos em `docs/frontend/erros.md`.
- **Contorno no front:** sem `code`, o erro dos endpoints de texto puro e tratado pelo status (404 = "Jogador nao encontrado.", 502 = "Nao foi possivel carregar o perfil agora.", demais = erro generico). Decidido no grilling da F9 (Q19).
- **Junto:** remover o `Console.WriteLine($"profileprofile")` que ficou em `GetProfile`.

### `contexto` ausente nos itens de `stats` do perfil

- **Problema:** `PlayerFullProfileDto.stats[]` nao informa se o recorte e de `Clube` ou `Selecao`, mas o `contexto` e obrigatorio em metricas, comparacao e acompanhamento.
- **Contorno no front:** o recorte e `Selecao` quando `stats[i].team.id` aparece em `nationalTeamStats[].team.id`; nos outros casos, `Clube` (grilling da F9, Q1 e Q16). Conferida com dados reais na change `sessao` (Neymar, 124712): os itens com o `team.id` da selecao (4748) sao exatamente Copa do Mundo, Eliminatorias, Copa America e amistosos.
- **Correcao esperada:** expor `contexto` em cada item de `stats`; enquanto isso, o contorno vale.

### Cores do clube ausentes no perfil

- **Problema:** o design system manda a `ClubBand` usar `team.teamColors` do perfil, mas o campo nao existe no contrato nem no back-end.
- **Contorno no front:** a `ClubBand` usa sempre o fallback `club` (grilling da F9, Q5).
- **Correcao esperada:** expor as cores do time em `details.team`; reavaliar no item 4 (Busca e perfil).

### `name` ausente em `GET /api/Auth/me`

- **Problema:** `UsuarioAutenticadoDto` traz `userId`, `email` e `roles`, sem o nome, que o header mostra. O nome so chega no `AuthResponseDto`.
- **Contorno no front:** `name` e `email` ficam guardados junto do par de tokens e sao atualizados a cada `AuthResponseDto` (grilling da Sessao, Q5).
- **Correcao esperada:** incluir `name` em `UsuarioAutenticadoDto` (claim no token ou leitura do usuario).

### `sec_stamp` do access token nao e conferido

- **Problema:** `change-password` e `signout-all` trocam o `SecurityStamp` e revogam os refresh tokens, mas a validacao do JWT nao compara o `sec_stamp`. As outras sessoes seguem com acesso ate o access token vencer (ate 15 min).
- **Contorno no front:** os avisos dizem "As outras sessões encerram em até 15 minutos." (grilling da Sessao, Q10 e Q11).
- **Correcao esperada:** conferir o `sec_stamp` no `OnTokenValidated`; depois disso, o aviso pode dizer que as outras sessoes ja foram encerradas.

### Status de `usuario.*` divergente em `docs/frontend/erros.md`

- **Problema:** o doc do back-end diz que `usuario.senha_atual_invalida` responde 401 e `usuario.nao_encontrado` 404. O codigo responde 400 (`ValorInvalidoException`) e, em `change-password`, 401 (`NaoAutenticadoException`).
- **Contorno no front:** a copia local de `erros.md` ja traz os status reais.
- **Correcao esperada:** corrigir a tabela em `docs/frontend/erros.md` do back-end.

## Front

### Pagina inicial provisoria

- **Problema:** a busca so chega no item 4 e a pagina inicial no item 9, mas o olheiro precisa cair em algum lugar depois de entrar.
- **Contorno:** `/` mostra "Olá, {nome}." e, no `dev:mock`, links para as metricas dos jogadores 1001 a 1005 (grilling da Sessao, Q16).
- **Correcao esperada:** substituir no item 9 (Navegacao e acessibilidade).

### Recorte padrao pelo maior `season.id`

- **Problema:** o `season.id` do SofaScore nao e cronologico entre competicoes. Com dados reais (Neymar, 124712), o Trophee des Champions 20/21 tem id 92399 e o Brasileirao 2026 tem 87678, entao a tela de metricas abre numa temporada de 2020. A lista `stats` da fonte ja vem da mais recente para a mais antiga.
- **Origem:** regra da F9 (grilling Q2, emenda do ADR 0003), achada na conferencia da change `sessao` contra a API real.
- **Correcao esperada:** ordenar pelo ano da temporada ou manter a ordem de `stats` da fonte, com nova emenda no ADR 0003. Fica para o item 4 (Busca e perfil), que ja revisa o seletor de recorte.
