# StatusBadge

Etiqueta do estado de um relatório: rascunho, finalizado ou vigente.

- **O consumidor fornece:** `tone` (`draft`, `finalized` ou `current`) e, se quiser outro texto, `children`. Sem `children`, os textos são "Rascunho", "Finalizado" e "Vigente".
- `radius-sm`, como os chips. Rascunho: contorno tracejado `line-strong` e `ink-soft`, sem fundo, porque ainda não fechou. Finalizado: `surface-raised` e `ink-muted`. Vigente: `surface-strong` e `ink`, com o ponto de estado ativo em `pitch`.
- Não é botão nem link e não usa `up` nem `down`.
