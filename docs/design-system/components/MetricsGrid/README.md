# MetricsGrid

A grade das sete métricas por 90 de um recorte, com a nota da amostra no rodapé.

- **O consumidor fornece:** `metrics`, as sete métricas na ordem fixa da API, cada uma no formato de `StatCell`, e `footnote` com a amostra ("Calculado sobre 1.284 min jogados").
- Sempre sete linhas, nunca filtradas. Quando o recorte tem menos de 450 min, todas vêm recusadas e o rodapé diz quantos minutos faltam.
- Coloque dentro de um `Card` com o recorte no `subtitle`.
- Para comparação lado a lado, use uma tabela em vez desta grade.
