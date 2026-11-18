# Grilling: Busca e perfil

Decisoes fechadas no grilling do item 4 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `busca-e-perfil` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- `GET /api/Players/search?q=` so recusa termo vazio (400 em texto puro, sem `code`). Nao ha tamanho minimo, e cada chamada vai direto ao SofaScore.
- `SofaEntity` da busca traz `id`, `name`, `shortName`, `team?`, `country?`, `position?` (letra: `G`, `D`, `M`, `F`) e `jerseyNumber?`. Sem foto e sem idade.
- O perfil traz `details` (posicao, `positionsDetailed`, camisa, altura, nascimento, pe preferido, clube, `proposedMarketValueRaw` com moeda), `stats`, `historyTransfer` (de/para, `transferDateTimestamp` em segundos, `transferFeeDescription`, `transferFeeRaw`), `nationalTeamStats` (jogos e gols pela selecao) e `playerImage`.
- `playerImage` e um link direto para `https://api.sofascore.app/api/v1/player/{id}/image`, que pode ser bloqueado fora do site da fonte.
- `teamColors` continua fora do contrato.
- `height` e `proposedMarketValue` nao sao anulaveis e podem chegar `0` quando a fonte nao tem o dado.
- O `QueryClient` usa `staleTime` 0: o perfil e buscado de novo toda vez que a tela monta.

## Nome

- **Q1.** Change `busca-e-perfil`, branch `feat/busca-e-perfil`, capabilities `busca-de-jogadores` e `perfil-do-jogador`. Sem identificador: o `features.md` do back-end nao numera essas funcoes.

## Busca

- **Q2. Onde mora:** um campo no header que leva para a pagina `/busca`, com os resultados em lista. A pagina tem o proprio campo, preenchido com o termo. Abaixo de 720px, o header mostra o botao de texto "Buscar", que leva para `/busca` (icone sozinho so em fechar e arrastar). Sem combobox.
- **Q15. URL:** `/busca?termo=`. Termo vazio ou so com espacos conta como sem termo; sem termo, a pagina mostra so o campo.
- **Q16. Campo do header:** vazio em todas as rotas e ausente em `/busca`, onde o campo do corpo ja tem o termo. Nunca dois campos com valores diferentes na tela.
- **Q3. Quando buscar:** ao enviar (Enter ou botao "Buscar"), nunca enquanto digita. Minimo de 2 caracteres depois do `trim`, checado no front, com o erro embaixo do campo, como nos formularios da sessao. O 400 do back-end nunca chega.
- **Q4. Resultado:** so `type === 'player'`, na ordem da fonte (relevancia). Cada linha e um link para o perfil, com o nome em Archivo e, embaixo, "Meio-campo, Atlético Serrano, Brasil" (posicao pela letra, `team.name`, `country.name`); o campo que faltar sai da frase. Sem foto e sem camisa.
- **Q5. Estados:** carregando com 5 linhas em skeleton (duas linhas de texto cada). Sem resultado, inclusive quando so vieram outros tipos: "Nenhum jogador encontrado para "<termo>". Confira a grafia ou busque pelo sobrenome.", sem botao. 502: "Não foi possível buscar agora." com "Tentar de novo". Sem paginacao.

## Perfil

- **Q6. Rota:** `/jogadores/$jogadorId`, com o nome do jogador no titulo da aba. 404: "Jogador não encontrado."; 502: "Não foi possível carregar o perfil agora." com "Tentar de novo" (contorno por status da F9, Q19).
- **Q17. Layout do jogador:** a rota `/jogadores/$jogadorId` vira layout. Ela carrega o perfil uma vez e mostra a faixa do clube e as abas "Perfil | Métricas" (`Tabs` com links), e as filhas renderizam embaixo. As metricas perdem o cabecalho minimo proprio. Comparacao, acompanhamento e relatorio entram depois como abas novas.
- **Q26. Recorte entre as abas:** a aba Perfil mantem `competicao`, `temporada` e `contexto` na URL e os ignora; ir e voltar nao perde o recorte escolhido. Indo para Metricas sem recorte, vale o padrao da Q11.
- **Q7. Conteudo**, nas duas colunas do design system:
  - **Faixa do clube** (`ClubBand`): foto, nome e "Meio-campo, 24 anos, Atlético Serrano".
  - **Dados** (principal): posicao, posicoes detalhadas quando vierem, nascimento com idade, altura ("178 cm"), pe preferido ("Direito", "Esquerdo", "Ambos"), camisa e selecao ("Brasil, 34 jogos, 8 gols", de `nationalTeamStats`).
  - **Recortes** (principal): uma linha por item de `stats`, com competicao · temporada, jogos, minutos, gols, assistencias e nota; cada linha e um link para as metricas daquele recorte.
  - **Valor de mercado** (apoio): "€12,5M" a partir de `proposedMarketValueRaw`, com a moeda.
  - **Transferencias** (apoio): data, "De → Para" e valor.
  - Campo ausente some, porque ausente e "nao se aplica". Sem valor de mercado, o cartao inteiro some.
- **Q20. Zero como ausente:** altura 0 e valor de mercado 0 somem. As estatisticas das linhas de recorte nao: 0 gol e 0 gol.
- **Q18. Listas longas:** os 10 primeiros recortes e "Mostrar todos os recortes (34)"; as transferencias a partir de 5, com "Mostrar todas as transferências (8)". Expande na propria pagina, sem rota nova.
- **Q19. Transferencia:** com `transferFeeRaw.value > 0`, o valor formatado ("€50M"). Senao, as descricoes conhecidas traduzidas ("Free" e "Free transfer" viram "Livre", "Loan" vira "Empréstimo", "End of loan" vira "Fim de empréstimo"), e o resto some. Data como "mar. 2020" a partir de `transferDateTimestamp` (segundos). Da mais recente para a mais antiga. O mapa e conferido contra a API real e ajustado se aparecer outro texto.
- **Q8. Foto:** `playerImage` com `onError` caindo para as iniciais num circulo `surface-strong`. Conferida contra a API real; se for sempre bloqueada, vira item da divida tecnica (proxy da imagem no back-end).
- **Q9. Cores do clube:** continua o fallback `club`; o item segue na divida tecnica.
- **Q12, Q25. Acoes:** so as que existem. Com a aba Metricas, o botao "Ver métricas" sai, e a area de acoes nao aparece ate a primeira feature que a preencha ("Acompanhar", "Comparar"...).
- **Q21. Skeleton:** o layout do jogador mostra a faixa em skeleton (nome e linha de apoio) e as abas visiveis e desabilitadas; o perfil mostra os cartoes no formato final. As metricas herdam o mesmo carregamento.

## Recorte

- **Q11. Recorte padrao:** a ordem de `stats` da fonte, sem ordenar, que ja vem da mais recente para a mais antiga. O padrao e o primeiro item. O maior `season.id` deixa de valer (emenda no ADR 0003), e o item sai da divida tecnica.

## Cache

- **Q10.** Perfil com `staleTime` e `gcTime` de 30 min, definidos so em `usePlayerProfile` (`$api.queryOptions`), num lugar unico para a shortlist reaproveitar. Busca com `staleTime` de 5 min, para voltar do perfil a lista sem nova chamada. Nada persistido no `localStorage`.

## Pagina inicial

- **Q13.** `/` fica com "Olá, {nome}." e o campo de busca no corpo. Saem o texto "a busca chega em breve" e os links 1001 a 1005 do `dev:mock`. O item 9 continua dono da pagina inicial definitiva.

## Design system e glossario

- **Q22.** Entram antes no design system: `SearchField` (pilula com a lupa, botao "Buscar" e erro embaixo), `PlayerPhoto` (foto com queda para as iniciais) e `RowList` (linhas separadas por `line`, para recortes, transferencias e resultados). A `ClubBand` ganha o espaco da foto e as `Tabs` passam a aceitar links.
- **Q14.** Entram **Busca** (`search`) e **Transferencia** (`transfer`); **Valor de mercado** ganha o nome de codigo `marketValue`. Paginas `SearchPage` e `ProfilePage`. Para evitar: "pesquisa" e "ficha".

## Specs afetadas

- **Q27.** Alem das capabilities novas, a change leva deltas de `recorte` (padrao pela ordem da fonte), `metricas-por-90` (cabecalho e carregamento passam ao layout do jogador) e `navegacao` (a busca do header ganha destino).

## Decisoes do wireframe

Fechadas na aprovacao do wireframe (link no `design.md` da change):

- **W1.** Termo curto: "Digite pelo menos 2 letras do nome."
- **W2.** 404 do perfil: sem faixa nem abas, com o botao "Buscar jogador", que leva para `/busca`.
- **W3.** A linha de recorte so comeca com "Clube"/"Seleção" quando o jogador tem algum recorte de selecao (a regra do `sliceLabel` da F9).
- **W4.** Posicoes detalhadas no rotulo, como a fonte manda ("Posição · MC, ME").
- **W5.** Nascimento como "14/03/2001 (24 anos)". O valor de mercado leva o rotulo "Estimativa da fonte".
- **W6.** A faixa carregando fica em `surface`, sem a cor do clube.
- **W7.** Perfil sem `stats`: o cartao de recortes e a aba Metricas mostram "Sem estatísticas publicadas para este jogador.", a frase da F9.
- **W8.** No celular, cada recorte vira duas linhas ("24 jogos · 1.920 min · 4 gols · 3 assist. · nota 7,12") e os dados passam a duas colunas. No desktop, os recortes sao uma tabela com cabecalho (Jogos, Minutos, Gols, Assist., Nota).
- **W9.** Abaixo de 720px, o header mostra o link de texto "Buscar" antes de "Menu", exceto em `/busca`. O campo usa fonte de 16px no celular, para o iOS nao dar zoom.

## Mocks e testes

- **Q23. Mocks:** a busca do mock filtra os jogadores 1001 a 1005 pelo nome, sem acento e sem diferenciar maiuscula, e sempre inclui um resultado `type: 'team'` para exercitar o filtro. No `dev:mock`, os termos "erro" e "vazio" forcam 502 e lista vazia. Os perfis ganham transferencias, selecao e o caso sem valor de mercado. Stories por estado com handlers nomeados.
- **Q24. Testes:**
  - Unitarios: filtro e frase do resultado, validacao do termo, formatacao da transferencia e do valor de mercado, campos ausentes e zero, e o recorte padrao pela ordem da fonte.
  - Rota (RTL + MSW): buscar pelo header e cair em `/busca?termo=`, termo curto, sem resultado, 502 com "Tentar de novo", abrir o perfil pelo resultado, perfil completo e com campos ausentes, 404, aba Metricas mantendo o recorte, expandir recortes, e voltar ao perfil sem nova chamada.
