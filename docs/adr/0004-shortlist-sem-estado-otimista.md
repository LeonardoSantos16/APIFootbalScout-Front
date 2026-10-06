---
status: accepted
---

# Shortlist sem estado otimista

Toda operacao na shortlist (incluir, repriorizar, remover) substitui o estado local pela shortlist inteira que volta na resposta, sem atualizacao otimista. A API renumera as prioridades em `1..n` e uma insercao no meio muda o numero de varios alvos; reproduzir essa regra no front duplicaria a logica do back-end e qualquer divergencia apareceria como alvo pulando de posicao. O custo e a latencia visivel no drag-and-drop, aceito porque reordenar e uma acao rara e deliberada.

## Consequencias

- Durante a requisicao a lista fica na ordem do servidor, o alvo arrastado aparece como pendente e o arrasto fica desabilitado. Com a resposta, os alvos vao para a nova posicao em 150ms, como manda o design system.
- `custoTotal`, `limiteDeAlvos` e as prioridades sao sempre lidos da resposta, nunca calculados.
- Um erro (`422`, `502`) mantem a lista como estava e mostra a mensagem do `code`.
