# Grilling: F10 Comparacao direta

Decisoes fechadas no grilling do item 5 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `f10-comparacao-direta` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- `GET /api/Analise/comparacao?JogadorA=&JogadorB=&CompeticaoId=&TemporadaId=&Contexto=` recebe um recorte so, que vale para os dois jogadores.
- A posicao da analise sai da mesma letra da busca: o `SofascoreTradutor` traduz `G` para `Goleiro`, `D` para `Defesa`, `M` para `MeioCampo` e `F` para `Ataque`; qualquer outra vira `null`. Da para filtrar a busca pela letra.
- Posicoes compativeis (`ScoutConfig.PosicoesCompativeis`): `Ataque` com `MeioCampo`, `Defesa` com `MeioCampo`, e cada posicao consigo mesma. Posicao ausente nao e compativel com nada e recusa com `PosicaoDesconhecida`.
- Nao ha recusa por contagem de atributos (R10.4): a comparacao inteira so e recusada por amostra quando um lado tem menos de 450 min no recorte. `FonteNaoAtribuiu` recusa o atributo de um lado so e a comparacao segue. `RecorteDivergente` nao tem como acontecer hoje.
- Na recusa, `jogadores` traz so nome e posicao por id, sem minutos: a resposta nao diz qual lado ficou sem amostra.
- Jogador sem estatisticas no recorte responde 404 `jogador.estatisticas_nao_encontradas`; id inexistente, 404 `jogador.perfil_nao_encontrado`; o mesmo jogador dos dois lados, 400 `comparacao.jogador_consigo_mesmo`.
- `valores` e `jogadores` sao mapas por id, sem lado esquerdo ou direito (R10.7).
- Os sete atributos sao todos "maior e melhor".

## Nome

- **Q1.** Change `f10-comparacao-direta`, branch `feat/f10-comparacao-direta`, capability `comparacao-direta`.

## Tela

- **Q2. Onde mora:** aba "Comparação" no layout do jogador, em `/jogadores/$jogadorId/comparacao?competicao=&temporada=&contexto=&com=<idB>`. O jogador A e o da pagina; o recorte vem do layout.
- **Q16. Textos fixos:** aba "Comparação", titulo da pagina "Comparação". A faixa do clube ja mostra A; o cabecalho da tabela repete so nome, posicao e amostra.
- **Q9. Recorte:** o mesmo `Select` de recorte das Metricas, no topo da aba. Mudar o recorte com B escolhido mantem `com` e compara de novo, o que pode cair no 404 da Q4. `SliceSelect`, a derivacao do recorte e os formatadores de metrica (valor, unidade, recusa) saem de `src/pages/metrics/` para `src/components/` e `src/utils/`, num commit `refactor:` antes do primeiro grupo de TDD.
- **Q11. Atalho no perfil:** nenhum. A aba basta; a area de acoes segue escondida ate o "Acompanhar" (F1/F2).

## Segundo jogador

- **Q3. Escolha:** sem `com`, a area principal mostra um campo de busca com o comportamento de `/busca` (ao enviar, minimo de 2 caracteres). Clicar num resultado grava `com=<id>`. A lista mostra so posicoes compativeis pela letra e esconde o jogador A e quem nao tem posicao, com a linha "Mostrando só jogadores comparáveis com meio-campo.". Se a busca so trouxer incompativeis: "Nenhum jogador comparável com meio-campo para "<termo>"."
- **Q10. Trocar:** com B escolhido, o botao de texto "Trocar jogador" no topo da tabela (e "Escolher outro jogador" nos estados de recusa e de 404) tira `com` da URL e volta para a busca. O termo da busca e estado local, fora da URL; o voltar do navegador desfaz a escolha.
- **Q12. URL invalida:** o schema da rota descarta em silencio `com` igual ao jogador da pagina ou nao numerico, e a aba abre na busca; o 400 `comparacao.jogador_consigo_mesmo` nunca chega. `com` com id inexistente cai no 404 `jogador.perfil_nao_encontrado`, no estado da Q4 com "O jogador escolhido não foi encontrado."

## Resultado

- **Q7. Realizada:** sete linhas fixas na ordem da F9; colunas atributo com unidade | A | B. Cabecalho de cada jogador com nome em Archivo, posicao e amostra ("1.240 min", de `amostraEmMinutos`). A sempre a esquerda. A 375px as tres colunas cabem, com o atributo quebrando linha. Sem radar.
- **Q5. Destaque:** o valor maior em `text` e peso forte, o menor em `text-muted`; nunca `pitch`. Empate sem destaque. Atributo recusado de um lado nao tem destaque, e o valor calculado do outro fica neutro (R10.3).
- **Q8. Celula recusada:** "Não publicado pela fonte", atenuada, com o texto e o estilo da linha recusada da F9.
- **Q6. Recusada:** estado proprio com os dois jogadores (nome e posicao de `jogadores`), o texto do motivo e "Escolher outro jogador":
  - `PosicoesIncompativeis`: "Goleiro e meio-campo não são comparáveis."
  - `PosicaoDesconhecida`: "A fonte não informou a posição de <Nome>.", pelo `posicao` ausente.
  - `AmostraInsuficiente`: pelos minutos de A no recorte (`stats[].statistics.minutesPlayed`). A abaixo de 450: "<Nome A> tem 312 de 450 min nesta competição e temporada."; senao: "<Nome B> não tem minutos suficientes nesta competição e temporada (mínimo 450 min)." Sem antecipar a recusa antes da chamada. Item na divida tecnica.
  - `RecorteDivergente`: "Os dados dos dois jogadores não são da mesma competição e temporada."
- **Q4. B sem dados no recorte:** a comparacao e chamada direto; o 404 `jogador.estatisticas_nao_encontradas` e estado proprio, nao erro generico: "<Nome B> não tem estatísticas em <Competição · Temporada>.", com "Escolher outro jogador". O nome vem da linha da busca clicada; sem ele (URL colada): "O jogador escolhido não tem estatísticas em <Competição · Temporada>."
- **Q13. Demais estados:** carregando com a tabela em skeleton no formato final (7 linhas, 3 colunas, cabecalho de B em skeleton). 502: "Não foi possível comparar agora." com "Tentar de novo". Outros erros pelo `code`, com `describeError`. Perfil de A sem recortes: o mesmo estado vazio das Metricas, sem busca.

## Cache

- **Q17.** Comparacao com `staleTime` de 5 min, definido so no hook dela.

## Design system

- **Q15.** Sem componente novo no design system: a tabela fica em `src/pages/comparison/components/ComparisonGrid`, reaproveitando o `MetricCell`. A regra do destaque (Q5) entra no `docs/design-system/README.md`.

## Mock

- **Q14.** O handler responde pelo par, com A = 1001 Rafael (M):
  - 1006 Diego (F): `Realizada`, todos calculados, com vitorias dos dois lados e um empate.
  - 1005 Bruno (M): `Realizada` com `PrecisaoDePasse` recusada so para Bruno (`FonteNaoAtribuiu`).
  - 1003 Lucas (D): `Recusada` por `AmostraInsuficiente` (falta de Lucas).
  - 1004 Pedro (G), so pela URL: `PosicoesIncompativeis`.
  - 1007 Miguel, so pela URL: `PosicaoDesconhecida`.
  - 1002 Caio (F): 404 `jogador.estatisticas_nao_encontradas`.
  - Outros pares: `Realizada` generica. A busca da aba reaproveita o handler de busca, com "erro" e "vazio".

## Wireframe

Aprovado em https://claude.ai/artifact/F34DYWNWTip2ERRdorhcLq. Decisoes que sairam dele:

- **W1.** Acima da busca do segundo jogador: "Escolha com quem comparar <Nome A> nesta competição e temporada."
- **W2.** Empate e valor calculado ao lado de celula recusada: os dois em `ink-soft`, peso 500, sem `ink-muted`. Mudou na implementacao: em `ink` com peso 500 o empate parecia destaque, porque o Archivo carregado vai de 500 a 800.
- **W3.** Jogador sem posicao no cabecalho da recusa: "Posição não informada". Sem posicao nos dois: "A fonte não informou a posição dos dois jogadores."
- **W4.** O 502 tem "Tentar de novo" e "Trocar jogador".
- **W5.** `RecorteDivergente` fica em teste de unidade e story, fora do `dev:mock`.
- **W6.** Abaixo de 720px o seletor de recorte desce para baixo do titulo e ocupa a largura toda; a tabela mantem as tres colunas, com os nomes quebrando linha.
- **W7.** Perfil sem recortes reaproveita o texto do estado vazio das Metricas.

## Glossario e divida tecnica

- **Q18.** "Comparação" (`Comparison`, `ComparisonPage`) e "Posições compatíveis" (`compatiblePositions`) entram em "Nomes no código". A recusa por amostra sem o lado da falta entra na divida tecnica.
