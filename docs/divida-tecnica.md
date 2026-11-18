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

### Busca devolve lista vazia quando a fonte falha

- **Problema:** `SofascorePlayerReader.SearchPlayersAsync` devolve `response.Content ?? new SofaSearchResponse([])`. Quando o SofaScore falha, `GET /api/Players/search` responde `200` com `results` vazio, e o olheiro ve "Nenhum jogador encontrado…" em vez de um erro com nova tentativa.
- **Contorno no front:** nenhum possivel, porque a resposta e igual a uma busca sem resultado. A tela ja trata o `502` ("Não foi possível buscar agora." com "Tentar de novo") para quando o back-end for corrigido (grilling da Busca e perfil, Q5).
- **Correcao esperada:** conferir `IsSuccessStatusCode` da resposta e lancar `FonteExternaIndisponivelException`, que o `ExceptionHandlerGlobal` ja converte em `502` com `code`; acrescentar o codigo em `docs/frontend/erros.md`.

### Textos da fonte em ingles na busca e no perfil

- **Problema:** o SofaScore manda o nome do pais em ingles ("Brazil", "Colombia") na busca e em `nationalTeamStats`, e usa o texto "No team" como clube de jogador sem clube. Achado na conferencia da change `busca-e-perfil` contra a API real.
- **Contorno no front:** nenhum; os textos aparecem como a fonte manda ("Ataque, No team, Colombia", "Brazil, 130 jogos, 80 gols").
- **Correcao esperada:** decidir se o front traduz os paises (tabela por `alpha2`) e esconde "No team", ou se o back-end entrega os nomes ja traduzidos.

### Cores do clube ausentes no perfil

- **Problema:** o design system manda a `ClubBand` usar `team.teamColors` do perfil, mas o campo nao existe no contrato nem no back-end.
- **Contorno no front:** a `ClubBand` usa sempre o fallback `club` (grilling da F9, Q5).
- **Correcao esperada:** expor as cores do time em `details.team`. Reavaliado no item 4 (Busca e perfil, Q9): o contorno continua.

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

### Recusa da comparacao por amostra nao diz de quem e a falta

- **Problema:** `GET /api/Analise/comparacao` recusada por `AmostraInsuficiente` traz em `jogadores` so nome e posicao, sem os minutos. O front nao sabe qual dos dois jogadores ficou abaixo de 450 min nem quantos minutos ele tem.
- **Contorno no front:** os minutos do jogador da pagina vem de `stats[].statistics.minutesPlayed` do perfil, no recorte. Abaixo de 450, a falta e dele ("<Nome A> tem 312 de 450 min…"); senao, e do outro, sem o numero (grilling da F10, Q6).
- **Correcao esperada:** expor `amostraEmMinutos` por jogador em `JogadorNaComparacaoDto`; o texto passa a ter os minutos dos dois.

### Jogador fora do recorte responde 500 em vez de 404

- **Problema:** `GET /api/Analise/comparacao` e `GET /api/Analise/{jogadorId}/metricas-por-90` com um jogador que nao jogou a competicao e temporada pedidas respondem `500` sem `code` ("An unexpected error occurred while processing the request."), e nao o `404` `jogador.estatisticas_nao_encontradas` que o `ComparacaoDiretaUseCase` e o `FonteDeDadosSofascore` preveem. Achado na conferencia da change `f10-comparacao-direta` contra a API real: Bruno Guimaraes (866469) contra Neymar (124712) na Premier League 25/26 (`CompeticaoId=17`, `TemporadaId=76986`). A fonte provavelmente responde algo diferente de `404` para o jogador fora do torneio, e a excecao nao e mapeada.
- **Contorno no front:** nenhum; a tela mostra o erro generico ("Não foi possível concluir agora.") com "Tentar de novo" e "Trocar jogador". O estado "<Nome> não tem estatísticas em <competição> · <temporada>." ja existe e passa a aparecer quando o back-end devolver o `404` (grilling da F10, Q4).
- **Correcao esperada:** tratar a resposta da fonte para jogador fora do torneio como `null` em `ObterEstatisticas` e `ObterPerfilDoJogador`, para que o use case lance `RecursoNaoEncontradoException` com `jogador.estatisticas_nao_encontradas`.

### Comparacao lenta na primeira chamada

- **Problema:** contra a API real, a primeira comparacao de um par leva cerca de um minuto (dois perfis e duas leituras de estatisticas no SofaScore), e a busca de jogadores de 20 a 40 s.
- **Contorno no front:** a tabela fica em skeleton no formato final enquanto isso; a comparacao fica 5 min no cache do front.
- **Correcao esperada:** cache das leituras da fonte no back-end, ou leituras em paralelo no `ComparacaoDiretaUseCase`.

## Front

### Pagina inicial provisoria

- **Problema:** a pagina inicial de verdade so chega no item 9, mas o olheiro precisa cair em algum lugar depois de entrar.
- **Contorno:** `/` mostra "Olá, {nome}." e o campo de busca (grilling da Busca e perfil, Q13). No `dev:mock`, os jogadores de teste sao achados pelo nome na busca.
- **Correcao esperada:** substituir no item 9 (Navegacao e acessibilidade).