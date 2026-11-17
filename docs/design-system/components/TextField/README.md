# TextField

Campo de texto com rótulo, dica e erro, usado nos formulários de conta (criar conta, entrar, alterar senha, confirmar exclusão).

- **O consumidor fornece:** `label`, os atributos normais de `<input>` (`type`, `value`, `onChange`, `autoComplete`, `disabled`), `hint` quando há uma regra a antecipar e `error` com a mensagem já escolhida.
- O rótulo fica em cima, em `label` e `ink-muted`, como no `Select`. Dica e erro ficam embaixo e são ligados ao campo por `aria-describedby`; com erro, a dica sai e o campo ganha `aria-invalid`.
- Erro em `down`, na borda e na frase. Só aparece depois do primeiro envio; a partir daí, é revalidado a cada mudança do campo.
- Erro do servidor vai no campo a que se refere ("Este e-mail já está cadastrado."). Erro sem campo vai num `InlineError` acima do botão.
- Desabilitado durante o envio, com borda `line` e texto `ink-muted`.
- `trailing` recebe um botão de texto dentro do campo; é o que o `PasswordField` usa.
