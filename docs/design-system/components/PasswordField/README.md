# PasswordField

O `TextField` de senha, com um botão de texto para mostrar e ocultar o que foi digitado.

- **O consumidor fornece:** o mesmo que no `TextField`, menos `type` e `trailing`. Use `autoComplete="current-password"` para entrar e para a senha atual, e `"new-password"` para criar conta e para a nova senha.
- O botão diz "Mostrar" ou "Ocultar", com `aria-pressed`. Sem os ícones `eye`/`eye-slash`: ícone sozinho só em fechar e arrastar.
- A dica da senha nova é "De 8 a 72 caracteres.", os limites do contrato.
- Desabilitado, o botão também desabilita.
