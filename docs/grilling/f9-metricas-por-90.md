# Grilling: F9 Metricas por 90

Decisoes fechadas no grilling do item 2 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `f9-metricas-por-90` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Recorte

- **Q1, Q16. Contexto:** `Selecao` quando `stats[i].team.id` aparece em `nationalTeamStats[].team.id`; nos outros casos, `Clube`. Sem `nationalTeamStats`, tudo e `Clube`. Funcao pura e testada. A regra nao foi conferida com dados reais: a conferencia e a primeira tarefa do item 3, e a suposicao vai para o `design.md` da change.
- **Q2. Recorte padrao:** maior `season.id`; na mesma temporada, mais `statistics.minutesPlayed` (emenda no ADR 0003).
- **Q15. Historico:** correcao automatica com `replace`; troca pelo olheiro com `push`. Search params malformados contam como recorte ausente.
- **Q4, Q10, Q22. Seletor:** um `<select>` nativo, com tokens e `color-scheme: dark`, que entra antes no design system. Rotulo "Competicao e temporada". Cada opcao e `uniqueTournament.name` + `year` ("Brasileirao Serie A · 2024"), na ordem da Q2. Quando o jogador tem recortes de selecao, todas as opcoes comecam pelo contexto ("Selecao · Eliminatorias Sul-Americanas · 2025"), para o corte do select no celular cair no fim do nome da competicao (revisto no esboco). A seta e o `caret-down` do Phosphor, que entra na lista de icones. O termo "recorte" nao aparece na tela.
- Nomes de competicao e temporada saem de `stats`, sem `GET /api/Tournament/tournament`.

## Pagina

- **Navegacao no topo** (decidido no wireframe): barra com o nome do app, campo "Buscar jogador", links para Acompanhamentos, Shortlists e Relatorios (icones `magnifying-glass`, `eye`, `list-numbers`, `note-pencil`) e, a direita, o nome do olheiro com "Sair" (`sign-out`). O menu lateral foi descartado: o app tem tres secoes e a busca, e o topo deixa mais largura para a grade.
- **Esqueleto minimo na F9:** o header entra ja nesta feature, com a busca e os links sem destino ainda. A navegacao de verdade e a acessibilidade continuam no item 9.
- **Corpo:** cartao do jogador em cerca de 2/3 da largura e uma coluna de apoio a direita, vazia na F9 (acompanhamento, shortlist e relatorios do jogador, itens 6 a 8). Abaixo de 720px, uma coluna, com o apoio embaixo do cartao.
- **Abas do jogador** dentro do cartao, abaixo da `ClubBand`: Perfil, Metricas por 90 e Relatorios. Na F9 so Metricas por 90 aparece; as outras entram com os itens 4 e 7.
- **Celular:** barra com o nome do app e um botao de texto "Menu" (sem icone de menu; icone sozinho so em fechar e arrastar), que abre a busca e os links.

## Tela

- **Q3. Rota:** `/jogadores/$jogadorId/metricas?competicao=&temporada=&contexto=`, aberta pela URL direta ate o item 4, quando `/jogadores/$jogadorId` vira o pai.
- **Q5. Cabecalho:** `ClubBand` sempre com o fallback `club` (o contrato nao tem `teamColors`), com nome, clube atual, posicao e idade. Sem foto.
- **Q13, Q14. Linhas:** sete, na ordem fixa do front: Gols, Assistencias, Passes decisivos, Desarmes, Interceptacoes, Nota (`Rating`), Precisao de passe. Atributo faltando na resposta = erro generico no lugar da grade. `tipo` desconhecido e ignorado.
- **Q7. Formatos** (`Intl.NumberFormat('pt-BR')`):

  | Atributo | Casas | Unidade | Exemplo |
  | --- | --- | --- | --- |
  | Gols, Assistencias, Passes decisivos, Desarmes, Interceptacoes | 2 | por 90 min | `0,45` |
  | Nota | 2 | media | `7,12` |
  | Precisao de passe | 1 | % | `84,3%` |

  A amostra mais comum entre os atributos vai uma vez no rodape; a linha so mostra a propria amostra ("1.190 min jogados") quando ela difere da do rodape (revisto no esboco).
- **Posicao:** `details.position` do SofaScore vira texto: `G` Goleiro, `D` Defesa, `M` Meio-campo, `F` Ataque. Letra desconhecida nao aparece.
- **Q6. Recusa:** `AmostraInsuficiente` com amostra mostra "Amostra insuficiente: 312 de 450 min"; sem amostra, "Amostra insuficiente: minimo de 450 min". `FonteNaoAtribuiu` mostra "Nao publicado pela fonte". O 450 e uma constante unica do `ScoutConfig` (`AmostraMinimaDeMinutos`, `docs/README.md`).
- **Q23. Rodape da grade:** "Amostra: 1.284 min jogados. Contagens por 90 minutos; metricas com menos de 450 min ficam sem valor." Sem amostra (carregando), so a segunda frase.
- **Q24. Titulo da aba:** "Metricas por 90 · {nome}"; so "Metricas por 90" enquanto o perfil carrega ou se ele falhar.
- **Q12. Carregamento:** na abertura, skeleton do cabecalho, do seletor e das sete `StatCell` em `carregando`. Na troca de recorte, so a grade volta ao skeleton, sem manter numeros do recorte anterior.
- **Q9. Sem `stats`:** cabecalho e "Sem estatisticas publicadas para este jogador", sem seletor e sem grade.

## Erros

- **Q20. Mapa `code -> mensagem`:** a tabela inteira de `erros.md`, com acentos, num modulo unico da capability `tratamento-de-erros`. `atributo.*`, `afericao.*` e similares caem no erro generico.
- **Q19. Sem `code`:** nos endpoints de texto puro (`Players`, `Tournament`), decide o status: 404 = "Jogador nao encontrado.", 502 = "Nao foi possivel carregar o perfil agora.", demais = generico. Nos endpoints de `ProblemDetails`, sem `code` = erro desconhecido.
- **Q8. Onde aparece:** falha do perfil ocupa a tela inteira; falha das metricas aparece com `InlineError` no lugar da grade, com cabecalho e seletor visiveis.
- **Q8, Q21. Nova tentativa:** no 502, o React Query repete 1 vez apos 2s. "Tentar de novo" aparece no 502 e no erro desconhecido; nunca nos 4xx. Texto generico: "Nao foi possivel concluir agora."; o `instance` vai para o console.

## Componentes, mocks e testes

- **Q11. Componentes de producao agora:** `ClubBand`, `Card`, `StatCell`, `MetricsGrid`, `InlineError`, `Button` e o seletor novo. `Tabs`, `ChangeChip`, `MeasurementCard` e `Cover` esperam.
- **Q17. Mocks:** fixtures em `src/mocks/fixtures/`, com handlers por `jogadorId`: completo (clube e selecao, linhas calculadas e os dois motivos de recusa), so selecao, sem `stats`, perfil 404, metricas 502.
- **Q18. Testes:** unitarios para formatadores, derivacao dos recortes, recorte padrao, validacao do recorte da URL e mapa de `code`; testes da rota com RTL e MSW para abertura com `replace`, troca de recorte, linha recusada, sem `stats`, 404 e 502 com "Tentar de novo"; stories por componente e estado e uma da tela por cenario.

## Wireframe

- Wireframe aprovado: https://claude.ai/artifact/SfHiMqyk6vuFgr79WqHnkD (pagina inteira com a navegacao no topo e o celular; estados do cartao numa segunda pagina).
- **Q25:** estados do cartao, em desktop e em 375px: abertura carregando, sucesso com clube e selecao, troca de recorte carregando, so selecao, sem `stats`, perfil 404, perfil 502, metricas 502 e erro generico. O `Select` e a `sample` da `StatCell` ja entraram no design system, a partir de um esboco anterior (as revisoes marcadas como "revisto no esboco").
