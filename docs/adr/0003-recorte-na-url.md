---
status: accepted
---

# Recorte na URL

O recorte selecionado vive nos search params (`?competicao=&temporada=&contexto=`), tipados pelo TanStack Router, e nao num store global. Assim ele sobrevive ao reload, o link pode ser compartilhado e metricas, comparacao e abertura de acompanhamento leem o mesmo recorte sem sincronizar estado. Um store global teria a mesma reutilizacao, mas se perderia no reload e criaria duas fontes da verdade com a URL.

## Consequencias

- O recorte so e valido se existir em `stats` do perfil do jogador. Recorte ausente ou fora de `stats` e substituido (`replace`, sem nova entrada no historico) pela temporada mais recente disponivel em `stats`.
- "Mais recente" e o recorte de maior `season.id`; entre recortes da mesma temporada, vence o de mais `statistics.minutesPlayed`. Search params malformados contam como recorte ausente.
- A correcao automatica usa `replace`; a troca feita pelo olheiro no seletor usa `push`, para o Voltar do navegador retornar ao recorte anterior.
- Na comparacao, o recorte e um so para os dois jogadores; se nao existir para o segundo, a API responde `RecorteDivergente` e a tela mostra o motivo, sem trocar o recorte sozinha.
- Trocar de jogador mantem o recorte na URL quando ele tambem existe no novo perfil.
