Scout Vestiário é a interface escura do APIFootballScout, uma ferramenta para o olheiro buscar jogadores, ler métricas por 90, comparar dois jogadores, acompanhar mudanças e manter relatórios e shortlists. Tem cara de app de futebol à noite: fundo preto, cartões grafite, a cor do clube do jogador no topo e números grandes o bastante para ler de relance.

## Conteúdo e linguagem

- Escreva em português do Brasil, com só a primeira letra maiúscula, tratando o olheiro por "você". Sem emoji.
- Use os nomes que o olheiro usa: recorte, acompanhamento, relatório, shortlist, alvo. Nunca mostre termos da API como `Recusada` ou `FonteNaoAtribuiu` em texto cru.
- Formate números no padrão brasileiro: `2,10`, `1.284 min`, `86,4%`, `€12,5M`. Toda métrica diz a unidade: "por 90", "média" ou "%".
- Recusa é resultado, não erro. Diga o motivo com os números: "Amostra insuficiente: 312 de 450 min", "Não publicado pela fonte", "A fonte passou a publicar o valor em outra moeda".
- Erros dizem o que aconteceu e o que fazer: "Não foi possível carregar o perfil agora. Tente de novo." Sem pedir desculpas.
- Botões dizem a ação: "Acompanhar", "Finalizar relatório", "Criar correção", "Tentar de novo". Sem seta no fim.

## Fundamentos visuais

### Cor

- Pinte a página com `ground` e coloque todo bloco de conteúdo num cartão `surface`. Campos e linhas em hover usam `surface-raised`; segmentos selecionados e skeletons de carregamento usam `surface-strong`.
- Texto principal e valores em `ink`, valores secundários em `ink-soft`, rótulos e unidades em `ink-muted`.
- `pitch` é o único acento: sublinhado da aba selecionada, anel de foco e pontos de estado ativo. Nunca como decoração, nunca como área grande.
- Mudanças no acompanhamento usam `up` sobre `up-tint` e `down` sobre `down-tint`, sempre com sinal e uma palavra ("+12% valor de mercado"). Verde e vermelho sozinhos não carregam o significado.
- "Sem mudança relevante" fica neutro: texto `ink-soft` sobre `surface`, sem fundo colorido.

### A faixa do clube

- O cartão de perfil abre com uma faixa na cor do clube do jogador, com o nome em `player-name` e posição e idade em `on-club-soft`. A cor vem de `team.teamColors` no perfil: use a primária, troque pela secundária quando a primária for quase branca ou quase preta, e use `club` quando nenhuma servir. A regra está na `ClubBand`.
- Escolha `on-club` (branco) ou `on-light` (preto) pela luminância da cor do clube. A faixa leva no máximo a linha do nome, a linha de apoio e um botão pílula branco.

### Estados

| Estado | Tratamento |
| --- | --- |
| Métrica calculada | valor em `stat-value`, `ink`; rótulo em `label`, `ink-muted` |
| Métrica recusada | o motivo substitui o valor, em `body` peso 500, `ink-subtle`; o rótulo continua. Nunca esconda a linha |
| Aferição indisponível | igual à recusada, com frase própria (moeda mudou, temporada virou) |
| Com mudança | valor em `up` ou `down`, com o chip colorido e `anterior → atual` |
| Sem mudança relevante | `ink-soft`, sem chip |
| Carregando | blocos skeleton em `surface-strong` no formato do layout final; a fonte é lenta, então o layout não pode pular |
| Erro (4xx/5xx) | mensagem no próprio cartão em `ink-soft` com uma pílula "Tentar de novo"; todo 502 oferece nova tentativa |

### Tipografia

- Nomes, títulos de cartão e números na família display (Archivo); todo o resto na família body (Figtree). As duas vêm do Google Fonts.
- `player-name` usa `font-stretch: 112%`. Números (`stat-hero`, `stat-value`) usam largura normal e `font-variant-numeric: tabular-nums`.
- O rótulo fica embaixo do valor, não em cima: primeiro o valor, depois `label` em `ink-muted`. Sem rótulos em caixa alta.

### Layout e espaçamento

- No desktop, página em duas colunas: o cartão principal à esquerda (cerca de dois terços) e os de apoio à direita. Uma coluna abaixo de 720px.
- Cartões: `radius-lg`, padding interno `space-5`, espaço entre cartões `space-3`. Sem sombra; a elevação é o degrau de `ground` para `surface`.
- As métricas formam uma grade de pares rótulo/valor separados por linhas `line`, com `space-4` de padding vertical por par. Sete linhas fixas, nunca filtradas.
- Listas de linhas (carreira, alvos da shortlist, relatórios) usam `line` entre as linhas e `space-3` de padding vertical.
- Margem lateral da página de pelo menos `space-4`; espaço entre regiões `space-6`.

### Forma e controles

- Botões e o campo de busca são pílulas (`radius-pill`). O botão principal é branco com texto `on-light`; os secundários são `surface-raised` com borda `line-strong`.
- Abas são texto, com sublinhado de 2px em `pitch` na selecionada; `ink` na selecionada, `ink-muted` nas demais.
- Chips e etiquetas de posição usam `radius-sm`.
- Foco: anel sólido de 2px em `pitch` com 2px de afastamento em todo elemento interativo.

### Movimento

- Sem animação de entrada. Movimento só responde a uma ação: o sublinhado da aba desliza, um alvo repriorizado na shortlist vai para a nova posição em 150ms. Respeite `prefers-reduced-motion`.

### Estados vazios

- Um estado vazio diz o que vai aparecer ali e oferece a ação que preenche a tela. Uma frase em `ink-soft` e um `Button` dentro do próprio `Card`, sem ilustração.
- Nenhum acompanhamento: "Você ainda não acompanha nenhum jogador. Abra o perfil de um jogador e escolha Acompanhar." com o botão "Buscar jogador".
- Shortlist sem alvos: "Esta shortlist ainda não tem alvos. O primeiro alvo define a moeda da lista." com o botão "Adicionar alvo".
- Nenhum relatório do jogador: "Nenhum relatório sobre este jogador." com o botão "Escrever relatório".
- Busca sem resultado: "Nenhum jogador encontrado para "<termo>". Confira a grafia ou busque pelo sobrenome." Sem botão.
- Vazio não é recusa: uma métrica recusada continua na grade com o motivo (`StatCell`), não vira estado vazio.

## Ícones

- Use o Phosphor, estilo regular, em 20px. Os ícones aprovados estão no grupo Icons, cada um com seu uso; não misture outro conjunto.
- No código, use `@phosphor-icons/react` com `currentColor`: o ícone fica em `ink-muted` por padrão e em `ink` quando acompanha um texto em `ink`.
- Ícone acompanha texto; sozinho, só em botões compactos de fechar (`x`) e na alça de arrastar (`dots-six-vertical`), sempre com `aria-label`.
- Sem emoji. O escudo do clube vem da fonte e não é ícone.
