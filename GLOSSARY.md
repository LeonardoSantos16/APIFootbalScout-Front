# APIFootballScout

Ferramenta do olheiro para buscar jogadores, ler métricas por 90, comparar dois jogadores, acompanhar mudanças e manter relatórios e shortlists. Este glossário fixa as palavras que a interface e o código usam para cada conceito, alinhadas ao back-end.

## Linguagem

### Pessoas e fonte

**Olheiro**:
Quem usa a ferramenta e é dono de tudo o que cria nela: acompanhamentos, relatórios e shortlists.
_Evitar_: usuário, scout, analista

**Jogador**:
O atleta como a fonte o publica, identificado pelo id da fonte.
_Evitar_: atleta, player

**Fonte**:
O provedor externo de dados dos jogadores, hoje o SofaScore. Tudo o que a ferramenta sabe sobre um jogador vem dela.
_Evitar_: API externa, provedor

**Perfil**:
O retrato atual de um jogador na fonte: dados cadastrais, clube, valor de mercado e os recortes em que ele tem estatísticas.
_Evitar_: ficha, cadastro

**Posição**:
A macroposição do jogador: goleiro, defesa, meio-campo ou ataque.
_Evitar_: função

### Recorte e estatística

**Recorte**:
A combinação de competição, temporada e contexto que delimita um conjunto de estatísticas. Métricas, comparação e acompanhamento sempre valem dentro de um recorte.
_Evitar_: filtro, período, escopo

**Contexto**:
Se as estatísticas do recorte são do jogador pelo clube ou pela seleção.
_Evitar_: tipo de competição

**Amostra**:
Os minutos jogados no recorte que sustentam uma métrica.
_Evitar_: minutagem (quando o assunto é a base do cálculo)

**Métrica por 90**:
Um atributo do jogador no recorte, normalizado por 90 minutos quando é contagem, ou informado como está quando é média ou percentual. É sempre calculada ou recusada.
_Evitar_: estatística, stat, indicador

**Recusa**:
O resultado de uma métrica ou de uma comparação que não pode ser calculada, acompanhado do motivo. É resposta, não falha.
_Evitar_: erro, falha, dado faltante

**Comparação**:
O confronto de dois jogadores no mesmo recorte, atributo por atributo. É realizada ou recusada como um todo, e cada atributo dentro dela também pode ser recusado para um dos lados.
_Evitar_: duelo, versus, comparativo

**Posições compatíveis**:
Pares de posição que podem ser comparados: cada posição consigo mesma, meio-campo com defesa e meio-campo com ataque.
_Evitar_: mesma posição

### Acompanhamento

**Acompanhamento**:
O registro de que o olheiro quer saber o que mudou num jogador desde um momento escolhido. Está ativo até ser encerrado; reacompanhar começa um novo.
_Evitar_: dossiê, observação, monitoramento, seguir

**Linha de base**:
O estado do jogador congelado na abertura do acompanhamento: clube, valor de mercado e minutagem, com a data em que foi medido.
_Evitar_: snapshot, estado inicial

**Leitura**:
Uma medição automática do estado atual do jogador na fonte, confrontada com a linha de base.
_Evitar_: observação, consulta

**Janela**:
O intervalo entre a medição da linha de base e a leitura atual. Toda mudança é dita dentro de uma janela.
_Evitar_: período

**Aferição**:
O resultado da leitura para um tipo de mudança: com mudança, sem mudança relevante ou indisponível.
_Evitar_: variação, diff

**Mudança relevante**:
Uma diferença que merece ser mostrada: no valor de mercado ou na minutagem, quando passa do limiar; no clube, sempre.
_Evitar_: alteração, alerta

**Indisponível**:
A aferição que não pode ser feita, com o motivo: a moeda do valor mudou ou a temporada virou. Nunca significa "sem mudança".
_Evitar_: recusada, erro, sem dado

### Relatório

**Relatório**:
O parecer escrito de um olheiro sobre um jogador, a partir de uma observação. É o produto central da ferramenta.
_Evitar_: avaliação, review, nota de scouting

**Observação**:
O ato humano de assistir ao jogador, que embasa um relatório.
_Evitar_: acompanhamento, leitura

**Rascunho**:
Um relatório ainda editável.
_Evitar_: pendente, em edição

**Finalizado**:
Um relatório fechado, que não muda mais.
_Evitar_: publicado, enviado, concluído

**Correção**:
Um novo relatório que corrige um finalizado e o referencia, sem alterá-lo.
_Evitar_: edição, revisão, nova versão

**Parecer**:
A conclusão do relatório: contratar, monitorar, reavaliar ou descartar.
_Evitar_: veredito, recomendação, decisão

**Nota**:
A avaliação numérica do jogador no relatório.
_Evitar_: score, rating (rating é uma métrica da fonte)

**Pontos positivos** e **pontos negativos**:
As qualidades e os defeitos do jogador listados no relatório.
_Evitar_: prós e contras, forças e fraquezas

### Shortlist

**Shortlist**:
Uma lista nomeada e ordenada de jogadores que o olheiro quer contratar.
_Evitar_: lista de desejos, watchlist, lista de alvos

**Alvo**:
Um jogador dentro de uma shortlist, com prioridade e custo estimado.
_Evitar_: candidato, item

**Prioridade**:
A posição do alvo na shortlist, de 1 até o número de alvos, sem empate nem lacuna.
_Evitar_: ranking, ordem, posição (posição é do jogador em campo)

**Custo estimado**:
Quanto o olheiro estima que custa contratar o alvo.
_Evitar_: preço, valor (valor de mercado é outra coisa)

**Valor de mercado**:
O valor que a fonte publica para o jogador.
_Evitar_: preço, custo

**Moeda da lista**:
A moeda definida pelo primeiro alvo, que todos os outros custos da shortlist precisam usar.
_Evitar_: câmbio
