# Grilling: F7 Shortlist priorizada

Decisoes fechadas no grilling do item 8 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `f7-shortlist-priorizada` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md); a regra de nao ter estado otimista no [ADR 0004](../adr/0004-shortlist-sem-estado-otimista.md) e o `If-Match` no [ADR 0006](../adr/0006-escritas-com-if-match.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- Seis endpoints: `POST /api/Shortlist` (criar), `GET /api/Shortlist` (listar), `GET /api/Shortlist/{shortlistId}`, `POST /{shortlistId}/alvos`, `PUT /{shortlistId}/alvos/{jogadorId}` (repriorizar) e `DELETE /{shortlistId}/alvos/{jogadorId}`. Nao ha renomear nem excluir shortlist, nem editar o custo de um alvo.
- Toda escrita de alvo exige `If-Match: "<version>"`: sem o header, `428`; com versao velha, `412 shortlist.alterada_por_outra_requisicao`. Criar a shortlist nao exige.
- Toda resposta traz a shortlist inteira, ja renumerada, com `version`, `limiteDeAlvos` (25) e `custoTotal` (ausente com a lista vazia). Os itens de `GET /api/Shortlist` trazem o mesmo, inclusive `alvos` e `version`.
- Na insercao, a `prioridade` e obrigatoria (`[Range(1, …)]`), de 1 a `alvos.length + 1`; na repriorizacao, de 1 a `alvos.length`. Fora disso, `422 shortlist.prioridade_fora_da_ordem`.
- O `Dinheiro` nao valida quantia nem moeda: aceita zero, negativo e qualquer texto como moeda. A moeda so e conferida contra a do primeiro alvo (`422 shortlist.moeda_divergente`).
- O `jogadorId` nao e conferido na fonte (so `> 0`), e nenhum endpoint da shortlist passa pelo SofaScore.
- O `nome` so tem `[Required]`: vazio responde `400` de validacao, sem `code`. Nao ha limite de tamanho nem unicidade.
- `GET /api/Shortlist` nao garante ordem.
- O `AppShell` ja tem o link "Shortlists" sem destino.

## Nome e escopo

- **Q1.** Change `f7-shortlist-priorizada`, branch `feat/f7-shortlist-priorizada`, capability `shortlist-priorizada`. Entram criar e listar shortlists, ver uma shortlist, adicionar alvo a partir do perfil, repriorizar e remover. Fora, por falta de endpoint e registrados na divida tecnica: renomear e excluir shortlist e editar o custo de um alvo (o olheiro remove e adiciona de novo). Tambem fora: shortlist colaborativa e perfis em lote.

## Onde mora

- **Q2.** `/shortlists` com a lista e "Criar shortlist"; `/shortlists/$shortlistId` com os alvos em ordem. O link "Shortlists" do topo aponta para `/shortlists`, com estado ativo; so ele, os outros seguem para o item 9. `404 shortlist.nao_encontrada` (de outro olheiro ou inexistente) mostra "Shortlist não encontrada." com link para `/shortlists`.

## Lista de shortlists

- **Q3. Criar:** campo "Nome da shortlist" e botao "Criar shortlist" no topo de `/shortlists`, sem `Dialog`. Vazio ou so espacos: "Dê um nome à shortlist." no cliente, o que evita o `400` sem `code`; o nome vai com trim. Sem limite de tamanho nem checagem de duplicado. Ao criar, navega para `/shortlists/$shortlistId`.
- **Q4. Linhas:** nome em Archivo, "12 de 25 alvos" (`limiteDeAlvos` da resposta) e o custo total ("€48,5M"), ou "Sem alvos" quando `custoTotal` vem ausente. Ordem alfabetica pelo nome (`localeCompare` pt-BR). Vazia: "Nenhuma shortlist ainda." junto do formulario de criar. Sem os rostos dos alvos na lista.

## Adicionar a partir do perfil

- **Q5. Gatilho:** botao "Adicionar à shortlist" no cabecalho do `PlayerLayout`, visivel em todas as abas do jogador, que abre um `Dialog` com a shortlist, o custo estimado e a prioridade. O seletor de shortlist vem de `GET /api/Shortlist`; as que ja tem o jogador aparecem desabilitadas com "Já está nesta shortlist", e as cheias com "Cheia (25 de 25)". Sem nenhuma shortlist, o `Dialog` oferece criar uma ali mesmo (so o nome) e segue com ela selecionada. Depois de adicionar: "Adicionado a <nome>" com link para a shortlist.
- **Q6. Custo estimado:** campo com `inputmode="decimal"` em milhoes ("12,5" com o sufixo "M"), convertido para centavos; moeda num seletor fechado de EUR, BRL, USD e GBP. Vem preenchido com `proposedMarketValueRaw` do perfil e a moeda dele, quando existe. Numa shortlist com alvos, a moeda fica travada na moeda da lista, com a dica "A moeda da lista é EUR"; se o valor de mercado estiver em outra moeda, o campo vem vazio. Quantia maior que zero, validada no cliente.
- **Q7. Prioridade:** padrao no fim (`alvos.length + 1`), com o seletor "Prioridade" de 1 a n+1 ("1 — no topo", …, "13 — no fim"). O glossario evita "posição" para a prioridade (posicao e a do jogador em campo).
- **Q15. Versao e erros no `Dialog`:** o `If-Match` usa a `version` do item de `GET /api/Shortlist`, buscado ao abrir o `Dialog` (`staleTime` 0). No `412`, recarrega a lista, mantem o que o olheiro digitou e mostra "Esta shortlist foi alterada em outra aba. Confira e tente de novo." Os `422` (`jogador_ja_na_lista`, `limite_de_alvos_atingido`, `moeda_divergente`) aparecem num `InlineError` no `Dialog`. Depois de adicionar, invalida a lista e a shortlist afetada.
- **Q16.** O botao do perfil e sempre "Adicionar à shortlist" e nao chama nada ate o clique; nao mostra "Em 2 shortlists", que exigiria `GET /api/Shortlist` em toda visita ao perfil.

## Shortlist

- **Q8. Repriorizar:** `@dnd-kit/core` + `@dnd-kit/sortable`, com alca de arrasto e sensor de teclado (espaco pega, setas movem, espaco solta, anuncios em pt-BR), mais os botoes "Subir" e "Descer" em cada linha, que viram `PUT` com prioridade ±1 e sao o caminho principal em 375px. Uma soltura, um `PUT`, com a prioridade final.
- **Q9. Pendente (ADR 0004):** a lista fica na ordem do servidor e a linha movida aparece pendente ("Movendo para a prioridade 3…", em `ink-muted`). Arrastar, subir, descer e remover ficam desabilitados na lista inteira, porque o `If-Match` so aceita uma escrita por versao. Com a resposta, a lista e substituida e os alvos vao para a nova posicao em 150ms; com erro, a lista fica como estava e um `Notice` mostra o texto do `code`.
- **Q10. Perfis dos alvos:** as linhas aparecem ja na ordem, com prioridade e custo da shortlist, e um skeleton no formato final (foto, nome, clube) ate o perfil chegar. `playerProfileQuery` (30 min de cache), sem limite de concorrencia. Perfil com erro (`502` ou `404`): "Jogador #1234", com "Tentar de novo" so no `502`; a linha continua repriorizavel e removivel.
- **Q11. Remover:** "Remover" vai direto ao `DELETE`, sem `Dialog`, com o mesmo estado pendente da Q9.
- **Q12. `412`:** recarrega a shortlist (`GET /{id}`), substitui a lista e mostra "Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança." A operacao nao e repetida sozinha. Codigo `shortlist.alterada_por_outra_requisicao`, acrescentado ao `erros.md`.
- **Q13. Linha do alvo:** a prioridade em Archivo `tabular-nums` a esquerda; foto, nome (link para `/jogadores/$jogadorId`), clube e posicao do perfil em `ink-muted`; o custo estimado a direita ("€12,5M", rotulo "Custo estimado"); a alca, "Subir", "Descer" e "Remover" como botoes de icone com `aria-label` no desktop. Em 375px, as acoes vao para um menu ou segunda linha, decidido no wireframe. "Subir" desabilitado na prioridade 1, "Descer" na ultima.
- **Q14. Cabecalho e estados:** nome como titulo, "12 de 25 alvos", "Custo total €48,5M" e "Moeda da lista: EUR" quando ha alvos, tudo da resposta. Vazia: "Nenhum alvo ainda. Adicione jogadores pelo perfil." com link para `/busca`. Cheia: `Notice` neutro "A shortlist atingiu o limite de 25 alvos." Carregando: skeleton do cabecalho e de cinco linhas. `502` com "Tentar de novo"; `500` com o erro generico.

## Design system e componentes

- **Q17.** Entram antes no design system (README, `bundle.css`/`bundle.js`, artefato): `TargetRow` (linha sortable com os estados padrao, pendente, arrastando e sem perfil) e `MoneyField` (quantia em milhoes com a moeda, que pode vir travada). O resto reaproveita `Select`, `Dialog`, `RowList`, `Notice`, `InlineError`, `TextField` e `PlayerPhoto`. O dnd-kit fica so em producao; no design system o `TargetRow` mostra os estados estaticos.

## Mock

- **Q18.** Shortlists em `src/mocks/shortlistStore.ts`, que replica o agregado (renumeracao, limite, duplicado, moeda, `version`, `428`, `412`), zerado a cada teste e ao recarregar o `dev:mock`. Da Ana:
  - "Laterais 2027": 1001, 1002, 1003 e 1009, em EUR.
  - "Meias para janeiro": vazia.
  - "Atacantes": cheia, com 25 alvos; os ids alem dos oito do mock respondem `404` no perfil ("Jogador #1234").
  - "Conflito": toda escrita responde `412`.
  - "Laterais 2027" tem tambem o 1009, cujo perfil responde `502` (id novo, para nao mudar o perfil dos jogadores que as outras telas usam), para o "Tentar de novo". A lista com `500` fica so em teste e story.

## Wireframe

Aprovado em https://claude.ai/artifact/EA7gt23fXjsSkXdUccK1qD. Decisoes que sairam dele:

- **W1.** Abaixo de 720px a alca de arrasto some (arrastar com o dedo brigaria com a rolagem) e as acoes viram uma segunda linha com texto: "Subir", "Descer", "Remover". Repriorizar no celular e so por Subir e Descer.
- **W2.** No celular, a acao que nao se aplica some (Subir na prioridade 1, Descer na ultima) em vez de ficar desabilitada, para caber o "Tentar de novo" do `502`; no desktop os icones ficam desabilitados, para a coluna nao pular.
- **W3.** Subir e Descer usam `arrow-up` e `arrow-down` do Phosphor, que entram na lista aprovada de icones do design system.
- **W4.** "Adicionar à shortlist" e um botao secundario na faixa do clube (`ClubBand`), com o icone `plus`: a direita do nome no desktop, abaixo dele no celular.
- **W5.** No `Dialog`, as shortlists vem em ordem alfabetica, com a primeira que aceita o jogador ja selecionada; cada opcao mostra "2 de 25 alvos" ou o motivo de estar desabilitada. Depois de adicionar, o `Dialog` troca o formulario por "Adicionado a Conflito, na prioridade 3." (check em `pitch`) com "Ver shortlist" e "Fechar". No celular, o `Dialog` ocupa a largura toda e os botoes empilham.
- **W6.** No arrasto, a linha pega ganha o contorno de foco (`pitch`) e o destino fica tracejado, sem sombra; o numero da prioridade so muda com a resposta. Anuncios do teclado: "<nome> pego, prioridade 3 de 4", "movido para a prioridade 1", "solto na prioridade 1", "cancelado".
- **W7.** Shortlist vazia: o cabecalho mostra so "0 de 25" (sem `custoTotal`, sem custo nem moeda) e o vazio traz o botao "Buscar jogador". Alvo sem perfil com `404`: "Jogador #2017" e "Perfil não encontrado.", sem "Tentar de novo".
- **W8.** O `MoneyField` tem o sufixo "M" fixo: abaixo de 1 milhao o olheiro digita "0,85". Aceita ate duas casas; a exibicao usa o `formatMoney`, com ate uma casa ("€850 mil", "£9,8M").
- **W9.** Falha ao mover ou remover (`422`, `500`): `Notice` com o texto do `describeError` entre o cabecalho e a lista, sem "Tentar de novo"; a propria acao e a nova tentativa. O `Notice` do `412` some na proxima escrita bem-sucedida.
