# ClubBand

Faixa no topo do cartão de perfil, pintada com a cor do clube do jogador, com nome, linha de apoio e uma ação.

- **O consumidor fornece:** `name`, `subtitle` (posição, idade e clube), `color` e `secondaryColor` em hex, vindos de `team.teamColors.primary` e `team.teamColors.secondary` do perfil, `photo` opcional (um `PlayerPhoto`), `crest` opcional (URL do escudo), `action` opcional (um `Button` principal ou secundário, como "Adicionar à shortlist") e `loading`.
- Com `loading`, a faixa fica em `surface`, sem a cor do clube, com a foto, o nome e a linha de apoio em skeleton.
- A faixa usa a primária. Se ela for quase branca (luminância acima de 0,8) ou quase preta (abaixo de 0,02), usa a secundária; se a secundária também não servir, usa o token `club`. Uma faixa branca sobre `ground` vira um bloco de luz e uma preta desaparece.
- O texto troca sozinho para preto quando a cor escolhida é clara (luminância acima de 0,4).
- Enquanto o contrato não expuser `teamColors`, o consumidor não passa `color` nem `secondaryColor` e a faixa usa `club`.
- Não use `teamColors.text`: o significado dele na fonte não está documentado.
- Coloque a faixa como `header` de um `Card`, para herdar os cantos superiores.
- Nada além da foto, do nome, da linha de apoio e de um botão.
