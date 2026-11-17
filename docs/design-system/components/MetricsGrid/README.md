# MetricsGrid

A grade das sete métricas por 90 de um recorte, com a nota da amostra no rodapé.

- **O consumidor fornece:** `metrics`, as sete métricas na ordem fixa do front (Gols, Assistências, Passes decisivos, Desarmes, Interceptações, Nota, Precisão de passe), cada uma no formato de `StatCell`, e `footnote` com a amostra mais comum entre as métricas e a regra do mínimo ("Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.").
- A amostra aparece uma vez, no rodapé. Uma métrica com amostra diferente mostra a própria em `sample`.
- Sempre sete linhas, nunca filtradas. Quando o recorte tem menos de 450 min, todas vêm recusadas, cada uma com "Amostra insuficiente: 312 de 450 min".
- Coloque dentro de um `Card` com o recorte no `subtitle`.
- Para comparação lado a lado, use uma tabela em vez desta grade.
