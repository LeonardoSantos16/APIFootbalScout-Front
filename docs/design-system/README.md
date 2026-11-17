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
- `down` também marca o erro de um campo de formulário (borda e frase embaixo). A frase carrega o significado; a cor só reforça.
- "Sem mudança relevante" fica neutro: texto `ink-soft` sobre `surface`, sem fundo colorido.

### A faixa do clube

- O cartão de perfil abre com uma faixa na cor do clube do jogador, com o nome em `player-name` e posição e idade em `on-club-soft`. A cor vem de `team.teamColors` no perfil: use a primária, troque pela secundária quando a primária for quase branca ou quase preta, e use `club` quando nenhuma servir. A regra está na `ClubBand`. O contrato da API ainda não expõe `teamColors`; até expor, a faixa usa sempre `club`.
- Escolha `on-club` (branco) ou `on-light` (preto) pela luminância da cor do clube. A faixa leva no máximo a foto do jogador (`PlayerPhoto`, com as iniciais quando a imagem falha), a linha do nome, a linha de apoio e um botão pílula branco. Carregando, a faixa fica em `surface`, sem a cor do clube.

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
| Erro de campo | borda do campo e frase embaixo dele em `down`, ligada por `aria-describedby`; aparece só depois do primeiro envio |
| Aviso | `Notice`: frase em `ink-soft` sobre `surface-raised`, com `role="status"` ("Sua sessão expirou. Entre novamente.", "Senha alterada."); não é erro e não tem botão |
| Enviando | campos e botões desabilitados; o botão principal troca o texto pelo gerúndio ("Entrando…") |

### Tipografia

- Nomes, títulos de cartão e números na família display (Archivo); todo o resto na família body (Figtree). As duas vêm do Google Fonts.
- `player-name` usa `font-stretch: 112%`. Números (`stat-hero`, `stat-value`) usam largura normal e `font-variant-numeric: tabular-nums`.
- O rótulo fica embaixo do valor, não em cima: primeiro o valor, depois `label` em `ink-muted`. Sem rótulos em caixa alta.

### Layout e espaçamento

- No desktop, página em duas colunas: o cartão principal à esquerda (cerca de dois terços) e os de apoio à direita. Uma coluna abaixo de 720px.
- Cartões: `radius-lg`, padding interno `space-5`, espaço entre cartões `space-3`. Sem sombra; a elevação é o degrau de `ground` para `surface`.
- As métricas formam uma grade de pares rótulo/valor separados por linhas `line`, com `space-4` de padding vertical por par. Sete linhas fixas, nunca filtradas.
- Listas de linhas (resultados da busca, recortes, transferências, alvos da shortlist, relatórios) usam a `RowList`: `line` entre as linhas e `space-3` de padding vertical. Uma linha com destino é um link inteiro. Números em colunas viram uma linha de apoio abaixo de 720px.
- Margem lateral da página de pelo menos `space-4`; espaço entre regiões `space-6`.

### Forma e controles

- Botões, o campo de busca e o `Select` são pílulas (`radius-pill`). O `Select` é um `<select>` nativo em `surface-raised` com borda `line-strong` e a seta `caret-down`; a parte que diferencia as opções vem no começo do texto, porque o corte no celular come o fim. O botão principal é branco com texto `on-light`; os secundários são `surface-raised` com borda `line-strong`.
- Campos de texto (`TextField`, `PasswordField`) têm 44px de altura, `surface-raised` com borda `line-strong` e `radius-md`, com o rótulo em `label`, `ink-muted`, em cima e a dica ou o erro embaixo. O campo de senha mostra e oculta com o texto "Mostrar"/"Ocultar", sem ícone.
- Botão desabilitado: `surface-strong` com texto `ink-soft`, em qualquer variante; o `ghost` desabilitado fica só com o texto em `ink-subtle`. Não há variante destrutiva: a confirmação de uma ação irreversível fica num `Dialog` que só habilita o botão depois que o olheiro confirma.
- Diálogos (`Dialog`) ficam centralizados sobre um fundo preto translúcido, em `surface` com borda `line` e `radius-lg`, com título em `section-title` e `x` para fechar. Os botões ficam à direita; abaixo de 480px, empilhados com a ação principal em cima.
- O campo de busca (`SearchField`) é uma pílula em `surface-raised` com a lupa e o botão principal "Buscar"; no header, a versão compacta envia com Enter. Busca só no envio.
- Abas são texto, com sublinhado de 2px em `pitch` na selecionada; `ink` na selecionada, `ink-muted` nas demais. Quando cada aba é uma rota (Perfil, Métricas), as abas são links.
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
