---
status: accepted
---

# Escritas com If-Match a partir da version do corpo

O back-end protege relatorio e shortlist com concorrencia otimista (ADR 0005 de la): `PUT` de relatorio e as escritas de alvo da shortlist exigem `If-Match: "<version>"`, respondem `428` sem o header e `412` quando a versao nao confere. O front monta o `If-Match` com a `version` do corpo da ultima resposta do recurso, e nao com o header `ETag`, porque a listagem traz varios recursos num corpo so e a `version` de cada item basta para editar sem um `GET` extra. Ha uma escrita em voo por vez por recurso: a proxima so sai com a `version` que a anterior devolveu.

No `412`, o servidor vence. A tela mantem as edicoes locais visiveis, avisa que o recurso mudou em outra aba e oferece carregar a versao atual, que descarta as edicoes locais; nao ha merge automatico. Ate isso, as escritas ficam desabilitadas, porque a mesma `version` responderia `412` de novo.

## Consideradas

- **Ler o `ETag` do header.** Rejeitado: a listagem nao tem um `ETag` por item, e o corpo ja traz a `version`.
- **Salvamento automatico com fila de escritas.** Rejeitado para o relatorio (grilling da F5, Q4): cada escrita depende da `version` da anterior, e um `412` no meio da fila nao diz ao olheiro qual edicao se perdeu.
- **Merge das edicoes locais com a versao nova.** Rejeitado: conflitos sao raros (cada olheiro so escreve no que e dele) e o merge de listas substituidas por inteiro nao tem resposta obvia.

## Consequencias

- Complementa o ADR 0004: a resposta de cada escrita substitui o estado salvo, sem atualizacao otimista.
- `428` indica bug do front e cai no erro generico.
- A correcao de relatorio (`POST /correcoes`) e as criacoes nao usam `If-Match`.
- Vale tambem para a shortlist (item 8).
