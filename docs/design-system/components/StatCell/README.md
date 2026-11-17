# StatCell

Um par valor e rótulo de métrica, em um de três estados: calculada, recusada ou carregando.

- **O consumidor fornece:** `label`, `unit` (`por 90`, `média` ou `%`), `state`, e `value` já formatado em pt-BR ou `reason` quando recusada. `sample` é opcional ("1.190 min jogados"): só quando a amostra da métrica difere da que o `MetricsGrid` mostra no rodapé.
- Na recusa, o motivo substitui o valor e o rótulo continua visível. Nunca esconda a célula: o motivo é a informação.
- Textos de motivo: "Amostra insuficiente: 312 de 450 min" e "Não publicado pela fonte".
- `%` é anexado ao valor; as outras unidades vão no rótulo ("Desarmes, por 90").
