# TextArea

Campo de texto de várias linhas com rótulo, dica e erro, usado no relato do relatório.

- **O consumidor fornece:** `label`, os atributos normais de `<textarea>` (`value`, `onChange`, `rows`, `disabled`), `hint` quando há uma regra a antecipar e `error` com a mensagem já escolhida.
- Mesma moldura do `TextField`: `surface-raised`, borda `line-strong`, `radius-md`, rótulo em `label`, `ink-muted`, em cima e dica ou erro embaixo, ligados por `aria-describedby`.
- Começa com 6 linhas (132px) e cresce só pelo puxador vertical, nunca na horizontal.
- Erro em `down`, na borda e na frase, depois do primeiro envio: "Escreva o relato."
