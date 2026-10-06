# InlineError

Mensagem de erro dentro do próprio cartão, com botão para tentar de novo.

- **O consumidor fornece:** `message` (escolhida pelo `code` do ProblemDetails, nunca pelo `detail`), `onRetry` e, se precisar, `retryLabel`.
- Todo 502 da fonte externa oferece "Tentar de novo".
- Use só para falhas. Recusas e indisponibilidades são resultados e usam `StatCell` e `MeasurementCard`.
- A mensagem diz o que aconteceu e o que fazer, sem pedir desculpas.
