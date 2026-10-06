# MeasurementCard

Um cartão por aferição do acompanhamento (clube, valor de mercado, minutagem), em um de três estados.

- **O consumidor fornece:** `title`, `state` (`ComMudanca`, `SemMudancaRelevante` ou `Indisponivel`, como vem da API) e, conforme o estado, `previous` e `current` já formatados, `change` (`direction` e `text`) ou `reason`.
- Mostre os três cartões lado a lado e independentes; um indisponível não esconde os outros.
- `Indisponivel` não é erro: escreva o motivo por extenso. Para `MoedaInesperada`: "A fonte passou a publicar o valor em outra moeda; comparar seria enganoso." Para `TemporadaVirada`: "A temporada virou e a minutagem zerou. A leitura antiga não é comparável."
- Acima dos cartões, diga a janela: "Comparando os últimos 27 dias com a linha de base".
