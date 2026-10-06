---
status: accepted
---

# Um refresh por vez, com fila

A renovacao e reativa: o primeiro `401` dispara `/api/Auth/refresh` e as requisicoes que chegarem enquanto ele esta em voo esperam na fila e sao repetidas com o token novo. Como cada refresh rotaciona o refresh token, dois refreshes em paralelo fazem o segundo falhar com `usuario.refresh_token_invalido` e derrubam a sessao. Renovar proativamente perto de `accessTokenExpiresAtUtc` foi descartado: exige timer por aba e nao dispensa o caminho reativo, que continua necessario apos suspensao da maquina ou relogio adiantado.

## Consequencias

- Entre abas, o refresh roda dentro de `navigator.locks.request('scout-refresh', ...)`. Ao obter o lock, a aba rele o token do `localStorage`: se outra aba ja renovou, usa o novo e nao chama o refresh.
- Cada requisicao e repetida no maximo uma vez. Um `401` na repeticao, ou o refresh falhando, limpa a sessao e leva ao login, preservando a rota atual para voltar depois.
- `401` de `signin` e `change-password` (`usuario.credenciais_invalidas`, `usuario.senha_atual_invalida`) e erro de formulario e nao passa pelo refresh.
- Esta e uma das partes que o [plano](../plano-de-desenvolvimento.md#7-aprender-com-a-ia) reserva para escrever a mao.
