# Notice

Aviso neutro dentro de um cartão ou formulário: informa o que aconteceu, sem ser erro e sem pedir ação.

- **O consumidor fornece:** o texto como `children`.
- Frase em `ink-soft` sobre `surface-raised`, `radius-md`, com `role="status"` para o leitor de tela anunciar.
- Usos: "Sua sessão expirou. Entre novamente." e "Conta excluída." no topo do formulário de entrar; "Senha alterada. As outras sessões encerram em até 15 minutos." no cartão de senha.
- Falha usa `InlineError`, erro de campo usa o `TextField`. O `Notice` nunca usa `down`, `pitch` nem botão.
